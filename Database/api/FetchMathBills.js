/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: FetchMathBills.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Incremental fetching of math bills with batch processing to avoid timeouts.

import { MongoClient, ServerApiVersion } from "mongodb";

// Import the email alert function
import { sendEmailAlert } from './SendMailchimpEmails.js';

import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file from Vercel
dotenv.config();
const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;

// This is -- I think -- the only good way to organize the API. I was considering using actionDate but 
// given only updateDate lines the bills us by when they are updated in the system, if we use anything 
// else, new bill updates wouldn't necessarily be down.
const sortOrder = "updateDate+asc";

// Compile regex patterns for each keyword to ensure whole-word matching
// Also, math has spaces around it since there were a few bills that had something like /math and it just 
// didn't make sense
const keywords = [
    /\b math \b/i,
    /\bmathematics\b/i,
    /\bstem workforce\b/i,
    /\bstem education\b/i,
    /\bmathematicians\b/i,
];

// Get the info about where to start now, from the most recent update, from MongoDB
async function getLastUpdateInfo(db) {
    const progress = await db.collection("fetch_progress").findOne({ type: "mathBills" });
    return {
        lastUpdateDate: progress?.lastUpdateDate || "2024-12-09T00:00:00Z",
        lastOffset: progress?.lastOffset || 0,
    };
}

// Save progress to MongoDB after processing a batch
async function saveProgress(db, lastUpdateDate, lastOffset) {
    await db.collection("fetch_progress").updateOne(
        { type: "mathBills" },
        { $set: { lastUpdateDate, lastOffset } },
        { upsert: true }
    );
}

// Helper function to fetch sponsor bill data -- can not be accessed with any of the /${} endpoints like
// in helper function "fetchBillDetails"
async function fetchBillSponsor(bill) {
    const billType = bill.type.toLowerCase();
    const { congress, number } = bill;
    const APIurlSponsor = `https://api.congress.gov/v3/bill/${congress}/${billType}/${number}?api_key=${apiKey}`;
    try {
        const response = await fetch(APIurlSponsor);
        if (!response.ok) {
            console.warn(`Failed to fetch ${response.status}`);
            return [];
        }
        const billDetailsData = await response.json();

        // Only send sponsors not other bill endpoint data
        return billDetailsData.bill.sponsors;
    } catch (error) {
        console.error(`Error fetching ${error.message}`);

        // Also return empty array on network or JSON errors
        return [];
    }
}

// Helper function to fetch additional bill data, using endpoints (usable for all but sponsor data)
async function fetchBillDetails(endpoint, bill) {
    const billType = bill.type.toLowerCase();
    const { congress, number } = bill;
    const APIurlOther = `https://api.congress.gov/v3/bill/${congress}/${billType}/${number}/${endpoint}?api_key=${apiKey}`;
    try {
        const response = await fetch(APIurlOther);
        if (!response.ok) {
            console.warn(`Failed to fetch ${endpoint}: ${response.status}`);
            return [];
        }
        const billDetailsDataOther = await response.json();
        return billDetailsDataOther;
    } catch (error) {
        console.error(`Error fetching ${endpoint}: ${error.message}`);

        // Also return empty array on network or JSON errors
        return [];
    }
}

// Fetch a single batch of Congress bills, starting after the update info saved in MongoDB
// Uses the summaries API specifically to get basic data about the bill, see if it matches, our keywords
// add the sponsor, cosponsor, committees, and relatedBills datas via the helper functions from that bill
// and insert it into the MongoDB collection
async function fetchBatch(db) {
    const { lastUpdateDate, lastOffset } = await getLastUpdateInfo(db);
    const limit = 150;
    const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${lastUpdateDate}&sort=${sortOrder}&api_key=${apiKey}&limit=${limit}&offset=${lastOffset}`;

    console.log(`Fetching batch: offset=${lastOffset}, fromDateTime=${lastUpdateDate}`);
    const response = await fetch(APIurl);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.summaries || data.summaries.length === 0) {
        return false;
    }

    for (const bill of data.summaries) {
        const title = (bill.bill?.title || "").toLowerCase();
        const summary = (bill.text || "").toLowerCase();
        const congressYr = bill.bill?.congress || 'N/A';

        const matchedKeywords = keywords
            .filter(kw => kw.test(title) || kw.test(summary))
            .map(kw => kw.source);

        const editedKeywords = matchedKeywords.length > 0 ? matchedKeywords.join(', ') : null;

        if (editedKeywords && parseInt(congressYr) > 114) {
            const sponsors = await fetchBillSponsor(bill.bill);
            const cosponsors = await fetchBillDetails('cosponsors', bill.bill);
            const committees = await fetchBillDetails('committees', bill.bill);
            const relatedBills = await fetchBillDetails('relatedbills', bill.bill);

            const fullBillData = {
                bill,
                sponsors: sponsors || [],
                cosponsors: cosponsors?.cosponsors || [],
                committees: committees?.committees || [],
                relatedBills: relatedBills?.relatedBills || [],
                keywordsMatched: editedKeywords,
            };

            // Insert or update in MongoDB
            const insertResult = await db.collection("thesisdbcollections").insertOne(fullBillData);

            // Send email alert for the new math-related bill
            try {
                // Use MongoDB's insertedId which comes with every insertResult (defined with each insertion) 
                const emailAlertData = {
                    title: bill.bill.title || "Untitled Bill",
                    url: `https://mathbilltracker.vercel.app/#/bill/${insertResult.insertedId}`,
                };

                // Trigger the email alert
                await sendEmailAlert(emailAlertData);
            } catch (emailError) {
                console.error(`Failed to send email alert for bill ${bill.bill.title}:`, emailError.message);
            }
        }
    }
    // Get and save the new offset as to not repeat checks on already seen pages
    const newOffset = lastOffset + (data.summaries ? data.summaries.length : 0);
    await saveProgress(db, lastUpdateDate, newOffset);

    return true;
}

// Serverless function handler -- specific to Vercel
// Start the MongoDb connection via the mongoUri, call the fetchBatch function until no more batches
// left to process, and then close the client (necessary so that it doesn't stay open, which causes errors)
export default async function handler(request, response) {
    const client = new MongoClient(mongoUri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        await client.connect();
        const db = client.db('ThesisDB');

        // Process a single batch
        const hasMoreBatches = await fetchBatch(db);
        if (hasMoreBatches) {
            response.status(200).json({ message: "Batch processed. More batches remain." });
        } else {
            response.status(200).json({ message: "All bills processed." });
        }
    } catch (error) {
        response.status(500).json({ error: "Failed to fetch and update bills.", details: error.message });
    } finally {
        await client.close();
    }
}
