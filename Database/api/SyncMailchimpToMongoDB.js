/**
 * Copyright 2024 Allison Berkowitz and Andrew Hadden
 * Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
 */

// Component: SyncMailchimpToMongoDB.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Adding emails to MongoDB, from Mailchimp with progress tracking and reset capability.

import fetch from "node-fetch";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Environment variables from Vercel
const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
const mailchimpDataCenter = process.env.MAILCHIMP_DATA_CENTER;
const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectToMongoDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");
    return {
        usersCollection: client.db("ThesisDB").collection("mailchimpusers"),
        progressCollection: client.db("ThesisDB").collection("sync_progress"),
        client,
    };
}

// Get the last sync time from MongoDB
async function getLastSyncTime(progressCollection) {
    const progress = await progressCollection.findOne({ type: "mailchimpSync" });
    return progress?.lastSyncTime || null; // Return the last sync time or null
}

// Save the last sync time to MongoDB
async function saveSyncProgress(progressCollection, lastSyncTime) {
    await progressCollection.updateOne(
        { type: "mailchimpSync" },
        { $set: { lastSyncTime } },
        { upsert: true }
    );
}

// Fetch subscribers from Mailchimp, optionally using the last sync time
async function fetchSubscribers(lastSyncTime = null) {
    const url = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members` +
                (lastSyncTime ? `?since_last_changed=${encodeURIComponent(lastSyncTime)}` : "");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `apikey ${mailchimpApiKey}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.members.map((member) => ({
        email: member.email_address,
        name: member.merge_fields.FNAME,
        status: member.status,
        subscribe_date: member.timestamp_opt,
        last_changed: member.last_changed,
    }));
}

// Sync subscribers to MongoDB with incremental progress tracking
async function syncSubscribers() {
    let client;
    try {
        const { usersCollection, progressCollection, client: dbClient } = await connectToMongoDB();
        client = dbClient;

        // Get the last sync time
        const lastSyncTime = await getLastSyncTime(progressCollection);

        // Fetch subscribers updated since the last sync time
        const subscribers = await fetchSubscribers(lastSyncTime);

        if (subscribers.length === 0) {
            console.log("No new or updated subscribers to sync.");
            return;
        }

        // Insert or update each subscriber in MongoDB
        const bulkOperations = subscribers.map((subscriber) => ({
            updateOne: {
                filter: { email: subscriber.email },
                update: { $set: subscriber },
                upsert: true,
            },
        }));

        const result = await usersCollection.bulkWrite(bulkOperations);
        console.log(`Synced ${result.upsertedCount + result.modifiedCount} subscribers to MongoDB`);

        // Save the last sync time
        const latestSyncTime = new Date().toISOString();
        await saveSyncProgress(progressCollection, latestSyncTime);
    } catch (error) {
        console.error("Error syncing subscribers:", error);
    } finally {
        if (client) {
            await client.close();
            console.log("MongoDB connection closed.");
        }
    }
}

// Reset sync progress
async function resetSyncProgress() {
    const { progressCollection, client } = await connectToMongoDB();
    try {
        await progressCollection.deleteOne({ type: "mailchimpSync" });
        console.log("Sync progress reset.");
    } finally {
        await client.close();
    }
};