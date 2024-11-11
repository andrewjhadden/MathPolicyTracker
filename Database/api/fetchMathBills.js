// Fix!!

import { MongoClient, ServerApiVersion } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;

// MongoDB Client configuration
const client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const fromDate = "2021-01-01T00:00:00Z";
const toDate = "2024-09-22T00:00:00Z";
const sortOrder = "updateDate+asc";
const limit = 250;
let offset = 0;

// Compile regex patterns for keywords
const keywords = [
    /\bmath\b/i,
    /\bmathematics\b/i,
    /\bstem workforce\b/i,
    /\bstem education\b/i,
    /\bmathematicians\b/i,
];

// Connect to MongoDB
async function connectToMongoDB() {
    if (!client.isConnected()) {
        await client.connect();
    }
    return client.db('ThesisDB');
}

// Fetch and store Congress bills
async function fetchMathBills(db) {
    while (true) {
        const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${fromDate}&toDateTime=${toDate}&sort=${sortOrder}&api_key=${apiKey}&limit=${limit}&offset=${offset}`;
        
        try {
            const response = await fetch(APIurl);
            if (!response.ok) throw new Error(`HTTP error: status: ${response.status}`);
            
            const data = await response.json();

            for (const bill of data.summaries || []) {
                const title = (bill.bill?.title || '').toLowerCase();
                const summary = (bill.text || '').toLowerCase();
                const congressYr = bill.bill?.congress || 'N/A';
                
                const matchedKeywords = keywords
                    .filter(kw => kw.test(title) || kw.test(summary))
                    .map(kw => kw.source);

                if (matchedKeywords.length && parseInt(congressYr) > 116) {
                    await db.collection('thesisdbcollections').insertOne({
                        bill,
                        keywordsMatched: matchedKeywords
                    });
                }
            }

            offset += limit;
            if (!data.summaries || data.summaries.length === 0) break;
        } catch (error) {
            console.error('Error fetching or storing Congress data:', error);
            break;
        }
    }
}

// Serverless function handler
export default async function handler(req, res) {
    try {
        const db = await connectToMongoDB();
        await fetchMathBills(db);
        res.status(200).json({ message: 'Bills fetched and stored successfully.' });
    } catch (error) {
        console.error('Error during operation:', error);
        res.status(500).json({ error: 'Failed to fetch and store bills', details: error.message });
    } finally {
        await client.close();
    }
}
