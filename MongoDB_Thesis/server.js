// October 24, 2024
// Thesis Fall 2024
// Ally Berkowitz and Andrew Hadden
// Description: Attaching MongoDB data with Express-- as an API-- to the website.

// Express, Mongoose code to connect the database to the website

// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Allow cross-origin requests -- maybe unnecessary?
// import path from 'path'; // don't need
import dotenv from "dotenv";
// import cron from "node-cron"; // For scheduling the job

// Load environment variables from .env file
dotenv.config();
const hidden_url = process.env.MONGODB_URI;

const app = express(); // need
const port = 3002; // or any port

// Serve static files from the 'website' directory
// app.use(express.static('website')); //don't need when this doesnt interact with the front-end

app.use(cors());  // Allow all origins

// Connect to MongoDB
async function connectToDB() {
    try {
        await mongoose.connect(hidden_url);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Could not connect to MongoDB:', err);
    }
}

// Define the Mongoose schema and model
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
        versionCode: String
    },
    keywordsMatched: [String]
});

const dataModel = mongoose.model("thesisdbcollections", dataSchema)

// Route to data from the MongoDB collection
app.get('/data', async (request, response) => {
  try {
    const data = await dataModel.find();  // Fetch all documents from collection
    console.log('Data Model:', dataModel);
    console.log('Fetched Data:', data);
    if (!data || data.length === 0) {
        return response.status(404).json({ message: 'No data found' });
    }
    response.json(data);  // Send the data as JSON response
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

connectToDB();