/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: FetchMathBills.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Incremental fetching of math bills with batch processing to avoid timeouts.

import { MongoClient, ServerApiVersion } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file from Vercel
dotenv.config();
const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;

// We'll change the dates to be the latest saved updateDate until now
// const fromDate = "2021-01-01T00:00:00Z";
// const toDate = "2024-09-22T00:00:00Z";

// We could use actionDate to accurately get the new bills uploaded into the db,
// but it seems that there could be some bills missing if their actionDate is beforehand and we miss it
const sortOrder = "updateDate+asc";

// Compile regex patterns for each keyword to ensure whole-word matching
const keywords = [
    /\bmath\b/i,
    /\bmathematics\b/i,
    /\bstem workforce\b/i,
    /\bstem education\b/i,
    /\bmathematicians\b/i,
];

// Created isConnected with the serverless function to be able to check if connected
// everwhere
// let isConnected = false;

// Removed the isConnect() function because that isn't a function in MongoClient (don't know which of us did that)
// But, also we are making sure there aren't extra connects
// Switching isConnect with the actual client becuase it seems to be safer
async function connectToMongoDB() {
    // if (isConnected) {
    //     return client.db('ThesisDB');
    // }
    try {
        const client = new MongoClient(mongoUri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        await client.connect();
        // isConnected = true;  // Mark as connected
        return { db: client.db("ThesisDB"), client };
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// Get the last update info from MongoDB
async function getLastUpdateInfo(db) {
    const progress = await db.collection("fetch_progress").findOne({ type: "mathBills" });
    return {
        lastUpdateDate: progress?.lastUpdateDate || "2021-01-01T00:00:00Z",
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

// Helper function to fetch sponsor bill data -- not an endpoint, only in /bill
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

// Helper function to fetch additional bill data
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

// Fetch a single batch of Congress bills
async function fetchBatch(db) {
    // Use the helper function to get to next offset we need
    const { lastUpdateDate, lastOffset } = await getLastUpdateInfo(db);

    // Fetch smaller batches to avoid timeouts (vercel has 2 min time limit)
    const limit = 50;

    const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${lastUpdateDate}&sort=${sortOrder}&api_key=${apiKey}&limit=${limit}&offset=${lastOffset}`;

    console.log(`Fetching batch: offset=${lastOffset}, fromDateTime=${lastUpdateDate}`);
    const response = await fetch(APIurl);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    // Stop if no more bills are available
    if (!data.summaries || data.summaries.length === 0) {
        //console.log('No more bills available in this batch.');
        return false;
    }

    // Iterate over the data of each bill and check for keywords
    for (const bill of data.summaries) {
        const title = (bill.bill?.title || "").toLowerCase();
        const summary = (bill.text || "").toLowerCase();
        const congressYr = bill.bill?.congress || 'N/A';

        // Create an array to store matched keywords
        const matchedKeywords = keywords
        .filter(kw => kw.test(title) || kw.test(summary))
        .map(kw => kw.source);

        // If keywords are found, join them into a string, otherwise set it to null
        const editedKeywords = matchedKeywords.length > 0 ? matchedKeywords.join(', ') : null;

        // if (editedKeywords && parseInt(congressYr) > 116) {
        if (editedKeywords) {
            // Fetch additional data for each bill with matching keywords
            const sponsors = await fetchBillSponsor(bill.bill);
            const cosponsors = await fetchBillDetails('cosponsors', bill.bill);
            const committees = await fetchBillDetails('committees', bill.bill);
            const relatedBills = await fetchBillDetails('relatedbills', bill.bill);
            
            // Combine all data into a single document
            const fullBillData = {
                bill,
                sponsors: sponsors || [],
                cosponsors: cosponsors?.cosponsors || [],
                committees: committees?.committees || [],
                relatedBills: relatedBills?.relatedBills || [],
                keywordsMatched: editedKeywords,
            };

            // Insert or update in MongoDB
            await db.collection("thesisdbcollections").updateOne(
                { "bill.number": bill.bill.number },
                { $set: fullBillData },
                { upsert: true }
            );
            // TODO make sure that this is what we want vs original insertOne and make sure we don't want the retries
        }
    }

    // Save progress after processing this batch
    const newOffset = lastOffset + (data.summaries ? data.summaries.length : 0);
    await saveProgress(db, lastUpdateDate, newOffset);

    return true; // Signal that more batches might exist
}

// Serverless function handler
export default async function handler(request, response) {
    let client;
    try {
        const connection = await connectToMongoDB();
        const db = connection.db;
        client = connection.client;

        const hasMoreBatches = await fetchBatch(db); // Process a single batch
        if (hasMoreBatches) {
            response.status(200).json({ message: "Batch processed. More batches remain." });
        } else {
            response.status(200).json({ message: "All bills processed." });
        }
    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ error: "Failed to fetch and update bills.", details: error.message });
    } finally {
        if (client) await client.close();
    }
}
