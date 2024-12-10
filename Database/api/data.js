/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: data.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Connecting the math bills data in the MongoDB database to the website/how we want to 
//      show our data. This is the part that determines database/api/data.

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Get from Vercel
const mongoUri = process.env.MONGODB_URI; 

async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }
}

// Don't need to define it comphrensively, because the data will automatically fill in sub-objects and arrays where it goes. 
const dataSchema = new mongoose.Schema({
    bill: Object,
    sponsors: Array,
    cosponsors: Array,
    committees: Array,
    relatedBills: Array,
    keywordsMatched: [String]
});

const dataModel = mongoose.model('thesisdbcollections', dataSchema);

// Handler function edited for the serverless function
export default async function handler(request, response) {
    // Set CORS headers
    // Need to allow all origins
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Length');
    response.setHeader('Cache-Control', 'no-store');

    if (request.method === 'OPTIONS') {
        response.status(200).end(); // 200 is okay
        return;
    }

    try {
        await connectToDB();
        const data = await dataModel.find();
        console.log("Raw data from MongoDB:", JSON.stringify(data, null, 2));
        response.status(200).json(data); // 200 is okay
    } catch (error) {
        console.error('Error in handler:', error);
        response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}