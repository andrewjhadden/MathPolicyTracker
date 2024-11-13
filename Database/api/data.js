// Component: AboutUs.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Connecting the math bills data in the mongoDB database to the website/how we want to show our 
//      data.

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI; // get from Vercel

async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
}

const billSchema = new mongoose.Schema({
    congress: Number,
    number: String,
    originChamber: String,
    originChamberCode: String,
    title: String,
    type: String,
    updateDateIncludingText: String,
    url: String
});
  
const activitiesSchema = new mongoose.Schema({
    date: String,
    name: String
});
  
const latestActionSchema = new mongoose.Schema({
    actionDate: String,
    actionTime: String,
    text: String
});
  
const relationshipDetailsSchema = new mongoose.Schema({
    identifiedBy: String,
    type: String
});
  
// Define Mongoose schema and model
const dataSchema = new mongoose.Schema({
    bill: {
        actionDate: String,
        actionDesc: String,
        bill: billSchema,
        currentChamber: String,
        currentChamberCode: String,
        lastSummaryUpdateDate: String,
        text: String,
        updateDate: String,
        versionCode: String},
    sponsors: [{
        bioguideId: String,
        district: Number,
        firstName: String,
        fullName: String,
        isByRequest: String,
        lastName: String,
        middleName: String,
        party: String,
        state: String,
        url: String}],
    cosponsors: [{
        bioguideId: String,
        district: Number,
        firstName: String,
        fullName: String,
        isOriginalCosponsor: Boolean,
        lastName: String,
        party: String,
        sponsorshipDate: String,
        state: String,
        url: String}],
    committees: [{
        activities: [activitiesSchema],
        chamber: String,
        name: String,
        systemCode: String,
        type: String,
        url: String}],
    relatedBills: [{
        congress: Number,
        latestAction: latestActionSchema,
        number: Number,
        relationshipDetails: [relationshipDetailsSchema],
        title: String,
        type: String,
        url: String}],
    keywordsMatched: [String]
});

const dataModel = mongoose.model('thesisdbcollections', dataSchema);

// Handler function edited for the serverless function
export default async function handler(request, response) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    response.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins -- fix later? https://deployedthesiswebsite.vercel.app/
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (request.method === 'OPTIONS') {
        response.status(200).end(); // 200 is okay
        return;
    }

    try {
        await connectToDB();
        const data = await dataModel.find();
        response.status(200).json(data); // 200 is okay
    } catch (error) {
        console.error('Error in handler:', error);
        response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
