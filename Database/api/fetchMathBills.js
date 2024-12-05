import { MongoClient, ServerApiVersion } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;

async function connectToMongoDB() {
    const client = new MongoClient(mongoUri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    await client.connect();
    return client.db('ThesisDB');
}

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
        return [];
    }
}

async function fetchMathBills(db) {
    const lastUpdateDate = "2021-01-01T00:00:00Z"; // Example: Replace with your logic for fetching the last update date
    const limit = 250;
    let offset = 0;

    while (true) {
        const APIurl = `https://api.congress.gov/v3/summaries?fromDateTime=${lastUpdateDate}&sort=updateDate+asc&api_key=${apiKey}&limit=${limit}&offset=${offset}`;
        try {
            const response = await fetch(APIurl);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const data = await response.json();
            if (!data.summaries || data.summaries.length === 0) return;

            for (const bill of data.summaries || []) {
                const sponsors = []; // Implement fetch logic
                const cosponsors = await fetchBillDetails('cosponsors', bill.bill);
                const committees = await fetchBillDetails('committees', bill.bill);
                const relatedBills = await fetchBillDetails('relatedbills', bill.bill);

                const sanitizedData = {
                    bill,
                    sponsors: sponsors || [],
                    cosponsors: cosponsors?.cosponsors || [],
                    committees: committees?.committees?.filter(item => item && Object.keys(item).length > 0) || [],
                    relatedBills: relatedBills?.relatedBills?.filter(item => item && Object.keys(item).length > 0) || [],
                    keywordsMatched: ["math"]
                };

                await db.collection('thesisdbcollections').insertOne(sanitizedData);
            }
            offset += limit;
        } catch (error) {
            console.error(`Error fetching Congress data: ${error}`);
            break;
        }
    }
}

export default async function handler(request, response) {
    try {
        const db = await connectToMongoDB();
        await fetchMathBills(db);
        response.status(200).json({ message: 'Bills fetched and stored successfully.' });
    } catch (error) {
        console.error('Error during operation:', error);
        response.status(500).json({ error: 'Failed to fetch and store bills', details: error.message });
    }
}
