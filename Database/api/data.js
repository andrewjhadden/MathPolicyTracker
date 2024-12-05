import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
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

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Length');

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    try {
        await connectToDB();
        const data = await dataModel.find().lean();

        const processedData = data.map(item => ({
            ...item,
            relatedBills: item.relatedBills || [],
            committees: item.committees || []
        }));

        response.status(200).json(processedData);
    } catch (error) {
        console.error('Error in handler:', error);
        response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
