import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URL from environment variables
const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Database connection error:', error);
            throw new Error('Failed to connect to database');
        }
    }
}

// Define Mongoose schema and model
const dataSchema = new mongoose.Schema({
    bill: {
        actionDate: String,
        actionDesc: String,
        bill: Object,
        currentChamber: String,
        currentChamberCode: String,
        lastSummaryUpdateDate: String,
        text: String,
        updateDate: String,
        versionCode: String
    },
    keywordsMatched: [String]
});

const DataModel = mongoose.models.thesisdbcollections || mongoose.model('thesisdbcollections', dataSchema);

// Serverless function to handle data requests
export default async function handler(req, res) {
    await connectToDB();

    try {
        const data = await DataModel.find();
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
