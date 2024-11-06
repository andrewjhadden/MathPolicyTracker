// LATER ON -- hide the api key? with an enviornment variable
// LATER ON -- push to the server and switch the exports line to be a schedule

// to run: 
// 1. export FIREBASE_CONFIG='{"projectId":"cs-thesis-a3d1c"}' // firebase emulators:start
// 2. curl http://localhost:5002/cs-thesis-a3d1c/us-central1/fetchCongressData
// to test the scheduling locally run: firebase emulators:exec --only functions "node -e 'require(\"./functions/index.js\").fetchCongressData();'"

// using Firebase Admin SDK set up and not including the HTTP triggered set up 
//      which would use onrequest and logger and then express
const functions = require("firebase-functions"); // import the Firebase SDK for cloud functions
const admin = require("firebase-admin"); // initialize SDK admin 
const fetch = require("node-fetch"); // use fetch to integrate with api, which is http request

admin.initializeApp(); 
const db = admin.firestore();

// Compile regex patterns for each keyword to ensure whole-word matching
const keywords = [
    /\bmath\b/i,
    /\bstem\b/i,
    /\bmathematics\b/i,
    /\bfunding to national science foundation\b/i,
    /\bdirector of national science foundation\b/i,
    /\bstem workforce\b/i,
    /\bstem education\b/i,
    /\boffice of personnel management \(hire more mathematicians\)\b/i,
    /\bdepartment of education\b/i
];

// const key = **removed**
const fromDate = "2021-01-01T00:00:00Z";
const toDate = "2024-09-22T00:00:00Z";
const sortOrder = "updateDate+asc";
const limit = 250;
let offset = 0;

// Pull data every 24 hours
// exports.fetchCongressData = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
exports.fetchCongressData = functions.https.onRequest(async (request, response) => {
    console.log('Start')
    try {
        await fetchMathBills(); // fetch data from api and let the fetchMathBills function add to db
        console.log('Congress data successfully stored in Firestore');
        response.send('Data added to live Firestore');
    
    } catch (error) {
        console.error('Error fetching or storing Congress data:', error);
        response.status(500).send('Error fetching or storing Congress data');
    }
    console.log('End')
});

// Function to fetch data from Congress.gov API
async function fetchMathBills() {
    while (true) { // consistently run until either break occurs -- maybe switch?
        const url = `https://api.congress.gov/v3/summaries?fromDateTime=${fromDate}&toDateTime=${toDate}&sort=${sortOrder}&api_key=${key}&limit=${limit}&offset=${offset}`;
        
        try { // run until catch error found
            const response = await fetch(url);
            if (!response.ok) { //if the response throws an error, throw it
                throw new Error(`HTTP error: status: ${response.status}`);
            }
            
            const data = await response.json(); // make data in json
            
            // Iterate over each summary and check for keywords in the title or text
            for (const bill of data.summaries || []) {
                const title = (bill.bill?.title || "").toLowerCase();
                const summary = (bill.text || "").toLowerCase();
                const congressYr = bill.bill?.congress || 'N/A';
                
                // Check if any keyword is in the title or summary using regex for whole-word matching
                const foundKeywords = keywords.some(kw => kw.test(title) || kw.test(summary));
                if (foundKeywords && parseInt(congressYr) > 116) {
                    await db.collection("congressData").add({ bill, keywordsMatched: foundKeywords }); // store data in firestone
                    console.log(`Stored bill ${congressYr}: ${title}`);
                }
            }
            
            // Increment the offset to get the next batch (pagination)
            offset += limit;
            
            // Check if there are no more bills to fetch
            if (!data.summaries || data.summaries.length === 0) {
                console.log("No more bills available.");
                break;
            }
        
        } catch (error) {
            console.error(`Error: ${error.message}`);
            break;
        }
    }
    // return mathBills;
}