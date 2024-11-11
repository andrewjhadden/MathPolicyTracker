import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
}

// Define Mongoose schema and model
const dataSchema = new mongoose.Schema({
    bill: Object,
    keywordsMatched: [String]
});

const DataModel = mongoose.models.DataModel || mongoose.model('DataModel', dataSchema);

// Handler function for the serverless function
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://deployedthesiswebsite.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Disable caching for the response
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDB();
        const data = await DataModel.find();  // Fetch data from MongoDB
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

