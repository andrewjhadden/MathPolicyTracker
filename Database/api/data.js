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
    try {
        await connectToDB();
        const data = await DataModel.find();  // Fetch data from MongoDB
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
