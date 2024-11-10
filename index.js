// October 24, 2024
// Thesis Fall 2024
// Ally Berkowitz and Andrew Hadden
// Description: Pulling data via API into MongoDB

import { MongoClient, ServerApiVersion } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";
// import cron from "node-cron"; // For scheduling the job

// Load environment variables from .env file
dotenv.config();
const hidden_url = process.env.MONGODB_URI;
const hidden_key = process.env.API_KEY;

// Create MongoClient with a MongoClientOptions object to set the stable API version
const client = new MongoClient(hidden_url, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

let db;

const fromDate = "2021-01-01T00:00:00Z";
const toDate = "2024-09-22T00:00:00Z";
const sortOrder = "updateDate+asc";
const limit = 250;
let offset = 0;

// Compile regex patterns for each keyword to ensure whole-word matching
const keywords = [
    /\bmath\b/i,
    /\bmathematics\b/i,
    /\bstem workforce\b/i,
    /\bstem education\b/i,
    /\bmathematicians\b/i,
];

// Connect to MongoDB and select the collection
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db('ThesisDB');
        console.log('Database selected:', db.databaseName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Function to fetch and store Congress bills
async function fetchMathBills() {
    if (!db) {
        console.error('Database connection not established');
        return;
    }

    while (true) {
        const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${fromDate}&toDateTime=${toDate}&sort=${sortOrder}&api_key=${hidden_key}&limit=${limit}&offset=${offset}`;
        
        console.log('API URL:', APIurl);
        console.log({ fromDate, toDate, sortOrder, hidden_key, limit, offset });

        try {
            const response = await fetch(APIurl);
            if (!response.ok) {
                throw new Error(`HTTP error: status: ${response.status}`);
            }
            
            const data = await response.json();

            // Iterate over the data and check for keywords
            for (const bill of data.summaries || []) {
                const title = (bill.bill?.title || '').toLowerCase();
                const summary = (bill.text || '').toLowerCase();
                const congressYr = bill.bill?.congress || 'N/A';
                
                // Create an array to store matched keywords
                const matchedKeywords = keywords
                    .filter(kw => kw.test(title) || kw.test(summary))
                    .map(kw => kw.source); // Get the keyword string
                
                // If keywords are found, join them into a string, otherwise set it to null
                const foundKeywords = matchedKeywords.length > 0 ? matchedKeywords.join(', ') : null;

                // Check if any keywords are matched
                console.log('Bill:', bill);
                console.log('Keywords Matched:', foundKeywords);
                if (foundKeywords && parseInt(congressYr) > 116) {
                    // Insert into MongoDB
                    await db.collection('thesisdbcollections').insertOne({
                        bill,
                        keywordsMatched: foundKeywords
                    });
                    console.log(`Stored bill ${congressYr}: ${title}`);
                }
            }

            // Increment offset for pagination
            offset += limit;

            // Break if no more bills are available
            if (!data.summaries || data.summaries.length === 0) {
                console.log('No more bills available.');
                break;
            }
        } catch (error) {
            console.error('Error fetching or storing Congress data:', error);
            break;
        }
    }
}

// Function to start the process every 24 hours (can be adjusted)
// cron.schedule('0 0 * * *', async () => {
//     console.log('Fetching Congress data...');
//     await fetchMathBills();
// });

// Main process to connect to MongoDB and fetch data
async function mainProcess() {
    try {
        await connectToMongoDB();
        await fetchMathBills();  // Ensure fetchMathBills is awaited
    } catch (error) {
        console.error('Error during initial connection or fetch:', error);
    } finally {
        // Close the MongoDB client after everything completes
        console.log('Closing MongoDB connection.');
        await client.close();
    }
}

// Start the main process
mainProcess();