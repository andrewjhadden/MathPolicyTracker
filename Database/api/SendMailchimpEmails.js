import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
const mailchimpDataCenter = process.env.MAILCHIMP_DATA_CENTER;

export async function sendEmailAlert(bill) {
  try {
    // Step 1: Create a campaign
    const createCampaignUrl = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/campaigns`;
    const campaignResponse = await fetch(createCampaignUrl, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'regular',
        recipients: { list_id: mailchimpAudienceId },
        settings: {
          subject_line: 'New Math Policy Alert!',
          title: 'New Bill Alert',
          from_name: 'Math Tracker',
          reply_to: 'andrewhadden5@gmail.com',
        },
      }),
    });

    if (!campaignResponse.ok) {
      throw new Error(`Failed to create campaign: ${campaignResponse.statusText}`);
    }

    const campaignData = await campaignResponse.json();
    const campaignId = campaignData.id;

    // Step 2: Set campaign content
    const setContentUrl = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`;
    const emailContent = `
      <h1>New Math Policy Alert!</h1>
      <p>A new bill titled <strong>${bill.title}</strong> has been introduced.</p>
      <p>Click <a href="${bill.url}">here</a> to view the bill details.</p>
    `;

    const contentResponse = await fetch(setContentUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `apikey ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: emailContent }),
    });

    if (!contentResponse.ok) {
      throw new Error(`Failed to set content: ${contentResponse.statusText}`);
    }

    // Step 3: Send the campaign
    const sendCampaignUrl = `https://${mailchimpDataCenter}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`;
    const sendResponse = await fetch(sendCampaignUrl, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!sendResponse.ok) {
      throw new Error(`Failed to send campaign: ${sendResponse.statusText}`);
    }

    console.log('Email alert sent successfully.');
  } catch (error) {
    console.error('Error sending email alert:', error.message);
  }
}
