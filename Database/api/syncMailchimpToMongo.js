import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
const mailchimpDataCenter = 'us17'; 
const mongoUri = process.env.MONGODB_URI; 


// Connect to MongoDB
async function connectToMongoDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('ThesisDB').collection('mailchimpusers');
}

// Fetch subscribers from Mailchimp
async function fetchSubscribers() {
    const url = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `apikey ${mailchimpApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.members.map(member => ({
        email: member.email_address,
        name: member.merge_fields.FNAME,
        status: member.status,
        subscribe_date: member.timestamp_opt
    }));
}

// Sync subscribers to MongoDB
async function syncSubscribers() {
    try {
        const collection = await connectToMongoDB();
        const subscribers = await fetchSubscribers();

        // Insert or update each subscriber in MongoDB
        const bulkOperations = subscribers.map(subscriber => ({
            updateOne: {
                filter: { email: subscriber.email },
                update: { $set: subscriber },
                upsert: true
            }
        }));

        const result = await collection.bulkWrite(bulkOperations);
        console.log(`Synced ${result.upsertedCount + result.modifiedCount} subscribers to MongoDB`);
    } catch (error) {
        console.error('Error syncing subscribers:', error);
    }
}

// Run the sync function
syncSubscribers().catch(console.error);






// THIS IS TO RUN SCHEDULED
// import fetch from 'node-fetch';
// import { MongoClient } from 'mongodb';
// import dotenv from 'dotenv';
// import cron from 'node-cron';

// dotenv.config();

// const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
// const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
// const mailchimpDataCenter = 'us17'; 
// const mongoUri = process.env.MONGODB_URI; 

// // Connect to MongoDB
// async function connectToMongoDB() {
//     const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db('ThesisDB').collection('mailchimpusers');
// }

// // Fetch subscribers from Mailchimp
// async function fetchSubscribers() {
//     const url = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;

//     const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Basic ${Buffer.from(`anystring:${mailchimpApiKey}`).toString('base64')}`,
//             'Content-Type': 'application/json'
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`Failed to fetch subscribers: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data.members.map(member => ({
//         email: member.email_address,
//         name: member.merge_fields.FNAME,
//         status: member.status,
//         subscribe_date: member.timestamp_opt
//     }));
// }

// // Sync subscribers to MongoDB
// async function syncSubscribers() {
//     try {
//         const collection = await connectToMongoDB();
//         const subscribers = await fetchSubscribers();

//         // Insert or update each subscriber in MongoDB
//         const bulkOperations = subscribers.map(subscriber => ({
//             updateOne: {
//                 filter: { email: subscriber.email },
//                 update: { $set: subscriber },
//                 upsert: true
//             }
//         }));

//         const result = await collection.bulkWrite(bulkOperations);
//         console.log(`Synced ${result.upsertedCount + result.modifiedCount} subscribers to MongoDB`);
//     } catch (error) {
//         console.error('Error syncing subscribers:', error);
//     }
// }

// // Schedule the sync to run every day at midnight
// cron.schedule('0 0 * * *', () => {
//     console.log('Running scheduled sync...');
//     syncSubscribers().catch(console.error);
// });

// // Optional: Run sync immediately on startup
// syncSubscribers().catch(console.error);

