/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: FetchMathBills.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Collecting all the math bills. Need to update to work with Vercel and need to update for 
//      the continuous pull. 

import { MongoClient, ServerApiVersion } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file from Vercel
dotenv.config();
const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;

// const client = new MongoClient(mongoUri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// We'll change the dates to be the latest saved updateDate until now
// const fromDate = "2021-01-01T00:00:00Z";
// const toDate = "2024-09-22T00:00:00Z";

// We could use actionDate to accurately get the new bills uploaded into the db,
// but it seems that there could be some bills missing if their actionDate is beforehand and we miss it
const sortOrder = "updateDate+asc"; 

// Max limit API allows at a time is 250
const limit = 250;
let offset = 0;

// Compile regex patterns for each keyword to ensure whole-word matching
const keywords = [
    /\b math \b/i,
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
            }
        });
        await client.connect();
        // isConnected = true;  // Mark as connected
        return client.db('ThesisDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; // Ensure the error is thrown
    }
}

// Helper function to fetch sponsor bill data -- not an endpoint, only in /bill
async function fetchBillSponsor(bill) {
    const billType = bill.type.toLowerCase();
    const { congress, number } = bill;
    const APIurlSponsor = `https://api.congress.gov/v3/bill/${congress}/${billType}/${number}?api_key=${hidden_key}`;
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
    const APIurlOther = `https://api.congress.gov/v3/bill/${congress}/${billType}/${number}/${endpoint}?api_key=${hidden_key}`;
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

// I need this because it won't remember the last updateDate in the code, I have to get from DB
// Function to get the update date for each new run
async function getLastUpdateDate(db) {
    const lastBill = await db.collection('thesisdbcollections')
        .find({})
        .sort({ 'bill.bill.updateDate': -1 }) // Sort by newest updateDate
        .limit(1)
        .toArray();
    console.log(`Getting latest update date from bill in database: ${lastBill[0]}: ${lastBill[0].bill.bill.updateDate}`)
    return lastBill[0].bill.bill.updateDate;
}

// Fetch and store Congress bills
// Changes.. 
// 1- made it async taking the db, so the db is directly from the db connection
// 2 - Start with the fromDateTime parameter set to the last stored updateDate.
// Continue fetching until: No new bills are returned or all bills in the current page have an updateDate earlier than the stored updateDate.
async function fetchMathBills(db) {
    // Use the helper function to get the updateDate at which to start api data pull
    const lastUpdateDate = await getLastUpdateDate(db);

    // Maximum number of retries for failed requests
    const maxRetries = 5; 

    // Delay in milliseconds between retries
    const delayBetweenRetries = 2000; 

    while (true) {
        // Get the summaries endpoint data to search through the text to find keywords, to decide if bill should be collected
        const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${lastUpdateDate}&sort=${sortOrder}&api_key=${apiKey}&limit=${limit}&offset=${offset}`;
        let retries = 0;

        // Make sure it tries again even with small netword issues
        while (retries < maxRetries) {
            try {
                const response = await fetch(APIurl);
                if (!response.ok) {
                    throw new Error(`HTTP error: status: ${response.status}`);
                }
                
                const data = await response.json();

                // Stop if no more bills are available
                if (!data.summaries || data.summaries.length === 0) {
                    // console.log('No more bills available.');
                    return;
                }

                // Iterate over the data and check for keywords
                for (const bill of data.summaries || []) {
                    const title = (bill.bill?.title || '').toLowerCase();
                    const summary = (bill.text || '').toLowerCase();
                    const congressYr = bill.bill?.congress || 'N/A';
                    
                    // Create an array to store matched keywords
                    const matchedKeywords = keywords
                        .filter(kw => kw.test(title) || kw.test(summary))
                        .map(kw => kw.source);

                    // If keywords are found, join them into a string, otherwise set it to null
                    const editedKeywords = matchedKeywords.length > 0 ? matchedKeywords.join(', ') : null;

                    if (editedKeywords && parseInt(congressYr) > 116) {
                        // Fetch additional data for each bill with matching keywords
                        const sponsors = await fetchBillSponsor(bill.bill);
                        const cosponsors = await fetchBillDetails('cosponsors', bill.bill);
                        const committees = await fetchBillDetails('committees', bill.bill);
                        const relatedBills = await fetchBillDetails('relatedbills', bill.bill);

                        // Combine all data into a single document
                        const fullBillData = {
                            bill,
                            sponsors: sponsors || [],
                            cosponsors: (cosponsors && cosponsors.cosponsors) || [],
                            committees: (committees && committees.committees) || [],
                            relatedBills: (relatedBills && relatedBills.relatedBills) || [],
                            keywordsMatched: editedKeywords
                        };

                        // Insert one bill with all the extra info into MongoDB
                        await db.collection('thesisdbcollections').insertOne(fullBillData);
                    }
                }
                // Increment offset for pagination
                offset += limit;

                // Ran successfully; can restart
                retries = maxRetries;
            } catch (error) {
                retries += 1;
                console.error(`Error fetching Congress data: ${error}. Retrying (${retries}/${maxRetries})...`);

                if (retries >= maxRetries) {
                    console.error('Max retries reached. Exiting fetch.');

                    // Exit function if max retries are reached:
                    return;
                }

                // Give some time before retrying
                await new Promise(response => setTimeout(response, delayBetweenRetries * retries));
            }
        }
    }
}

// Serverless function handler
export default async function handler(request, response) {
    try {
        const db = await connectToMongoDB();
        await fetchMathBills(db);
        // 200 is ok
        response.status(200).json({ message: 'Bills fetched and stored successfully.' });
    } catch (error) {
        console.error('Error during operation:', error);
        response.status(500).json({ error: 'Failed to fetch and store bills', details: error.message });
    } finally {
        // Close the MongoDB client after everything completes (need!)
        await client.close();
    }
}

// Pre-serverlesss function...
// Main process to connect to MongoDB and fetch data
// async function mainProcess() {
//     try {
//         await connectToMongoDB();
//         await fetchMathBills();
//     } catch (error) {
//         console.error('Error during initial connection or fetch:', error);
//     } finally {
//         console.log('Closing MongoDB connection.');
//         await client.close();
//     }
// }
// mainProcess();