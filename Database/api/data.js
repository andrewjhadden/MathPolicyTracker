/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: data.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Connecting the math bills data in the MongoDB database to the website/how we want to 
//      show our data.

//this is the part that determines database/api/data
//make sure that the latest version of data.js is getting deployed via vercel

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
    // response.setHeader('Access-Control-Allow-Credentials', true)
    // Need to allow all origins
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Length');
    response.setHeader('Cache-Control', 'no-store'); //new

    if (request.method === 'OPTIONS') {
        response.status(200).end(); // 200 is okay
        return;
    }

    try {
        await connectToDB();
        const data = await dataModel.find();
        console.log("Raw data from MongoDB:", JSON.stringify(data, null, 2)); //new
        response.status(200).json(data); // 200 is okay
    } catch (error) {
        console.error('Error in handler:', error);
        response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}