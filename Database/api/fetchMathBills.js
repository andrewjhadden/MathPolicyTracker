/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: FetchMathBills.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Collecting all the math bills. Implements incremental updates by tracking progress.

import { MongoClient, ServerApiVersion } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file from Vercel
dotenv.config();
const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;

// Sorting order for fetching updated bills
const sortOrder = "updateDate+asc";

// Compile regex patterns for each keyword to ensure whole-word matching
const keywords = [
    /\bmath\b/i,
    /\bmathematics\b/i,
    /\bstem workforce\b/i,
    /\bstem education\b/i,
    /\bmathematicians\b/i,
];

// Function to establish MongoDB connection
async function connectToMongoDB() {
    try {
        const client = new MongoClient(mongoUri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        await client.connect();
        return client.db("ThesisDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// I need this because it won't remember the last updateDate in the code; I have to get it from the database
async function getLastUpdateInfo(db) {
    const progress = await db.collection("fetch_progress").findOne({ type: "mathBills" });
    return {
        lastUpdateDate: progress?.lastUpdateDate || "2021-01-01T00:00:00Z",
        lastOffset: progress?.lastOffset || 0,
    };
}

// Save offset and updateDate progress after each batch
async function saveProgress(db, lastUpdateDate, lastOffset) {
    await db.collection("fetch_progress").updateOne(
        { type: "mathBills" },
        { $set: { lastUpdateDate, lastOffset } },
        { upsert: true }
    );
}

// Helper function to fetch additional bill data from specific endpoints
async function fetchBillDetails(endpoint, bill) {
    const billType = bill.type.toLowerCase();
    const { congress, number } = bill;
    const APIurl = `https://api.congress.gov/v3/bill/${congress}/${billType}/${number}/${endpoint}?api_key=${apiKey}`;
    try {
        const response = await fetch(APIurl);
        if (!response.ok) {
            console.warn(`Failed to fetch ${endpoint}: ${response.status}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}: ${error.message}`);
        return [];
    }
}

// Fetch and store Congress bills
async function fetchMathBills(db) {
    const { lastUpdateDate, lastOffset } = await getLastUpdateInfo(db); // Get last progress
    const limit = 50; // Fetch smaller batches to avoid timeouts
    let offset = lastOffset; // Start from the last offset

    while (true) {
        const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${lastUpdateDate}&sort=${sortOrder}&api_key=${apiKey}&limit=${limit}&offset=${offset}`;
        try {
            const response = await fetch(APIurl);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const data = await response.json();
            if (!data.summaries || data.summaries.length === 0) {
                console.log("No new bills found.");
                break;
            }

            // Process each bill in the summaries
            for (const bill of data.summaries) {
                const title = (bill.bill?.title || "").toLowerCase();
                const summary = (bill.text || "").toLowerCase();
                const matchedKeywords = keywords.filter(
                    (kw) => kw.test(title) || kw.test(summary)
                );

                if (matchedKeywords.length > 0) {
                    const sponsors = [];
                    const cosponsors = await fetchBillDetails("cosponsors", bill.bill);
                    const committees = await fetchBillDetails("committees", bill.bill);
                    const relatedBills = await fetchBillDetails("relatedbills", bill.bill);

                    // Combine all data into a single document
                    const fullBillData = {
                        bill,
                        sponsors: sponsors || [],
                        cosponsors: cosponsors?.cosponsors || [],
                        committees: committees?.committees || [],
                        relatedBills: relatedBills?.relatedBills || [],
                        keywordsMatched: matchedKeywords.map((kw) => kw.source),
                    };

                    // Insert or update the bill in MongoDB
                    await db.collection("thesisdbcollections").updateOne(
                        { "bill.number": bill.bill.number },
                        { $set: fullBillData },
                        { upsert: true } // Create new entry if it doesn't exist
                    );
                }
            }

            // Save progress after each batch
            offset += limit;
            await saveProgress(db, lastUpdateDate, offset);
        } catch (error) {
            console.error("Error fetching bills:", error);
            break;
        }
    }
}

// Serverless function handler
export default async function handler(request, response) {
    try {
        const db = await connectToMongoDB();
        await fetchMathBills(db);
        response.status(200).json({ message: "Bills fetched and updated successfully." });
    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ error: "Failed to fetch and update bills.", details: error.message });
    }
}
