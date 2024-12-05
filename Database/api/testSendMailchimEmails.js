// import fetch from 'node-fetch';
// import dotenv from 'dotenv';

// dotenv.config();

// // Mailchimp configuration
// const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
// const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
// const mailchimpDataCenter = 'us17'; // Replace with your actual data center (e.g., 'us17')

// (async () => {
//   try {
//     console.log("Testing Mailchimp email functionality...");

//     // Step 1: Create the campaign
//     const campaignUrl = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/campaigns`;

//     const campaignResponse = await fetch(campaignUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `apikey ${mailchimpApiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         type: "regular",
//         recipients: { list_id: mailchimpAudienceId },
//         settings: {
//           subject_line: "Test Email Alert",
//           title: "Test Campaign",
//           from_name: "Math Tracker",
//           reply_to: "andrewhadden5@gmail.com",
//         },
//       }),
//     });

//     const campaignData = await campaignResponse.json();

//     if (!campaignResponse.ok) {
//       console.error("Failed to create campaign:", campaignData);
//       throw new Error(`Campaign creation failed: ${campaignData.detail || "Unknown error"}`);
//     }

//     const campaignId = campaignData.id;
//     console.log(`Campaign created with ID: ${campaignId}`);

//     // Step 2: Set the campaign content
//     const contentUrl = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`;

//     const contentResponse = await fetch(contentUrl, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `apikey ${mailchimpApiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         html: `<h1>This is a test email</h1><p>Your email alert functionality works!</p>`,
//       }),
//     });

//     if (!contentResponse.ok) {
//       const contentError = await contentResponse.json();
//       console.error("Failed to set campaign content:", contentError);
//       throw new Error("Content setup failed.");
//     }

//     console.log("Campaign content set successfully.");

//     // Step 3: Send the campaign
//     const sendUrl = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`;

//     const sendResponse = await fetch(sendUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `apikey ${mailchimpApiKey}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!sendResponse.ok) {
//       const sendError = await sendResponse.json();
//       console.error("Failed to send campaign:", sendError);
//       throw new Error("Sending campaign failed.");
//     }

//     console.log("Test email sent successfully!");
//   } catch (error) {
//     console.error("Error during Mailchimp test:", error.message);
//   }
// })();