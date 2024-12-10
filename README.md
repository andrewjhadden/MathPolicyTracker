# Math-related Congressional Bill Tracker
Computer Science Thesis Project (Fall 2024) Hamilton College
By Allison Berkowitz and Andrew Hadden
Project Goal: To build a database and connected website to present and track all bills in congress, since the 114th congress and being continuously updated, related to mathematics. This will be useful to Prof. Courtney Gibbons in the Mathematics Department, and congressional staff all over who care for easy access to the progression of legislation related to mathematics.


Integration of Our Technologies, Key Libraries, & Platforms:
- MongoDB Database—holds all bill details, mail subscribers, and backend processing values
- Congress bill data is collected via the publicly-available Congress.gov API (one just needs to sign up for their own API key)
- Website and database are both hosted on Vercel through the Github repository
- Website is built using React, HTML, and CSS
- Email alerts are run with Mailchimp’s API, subscriber information is added to MongoDB database


Step-by-step…
1. Clone this GitHub repository
2. Gather Congress.gov API key, MongoDB URI, Mailchimp API Key, Mailchimp Audience ID, and Mailchimp Data Center values
3. Create a new Vercel project
* Import from the cloned Github repository
* Change root directory to database
* Add the environment variables: MONGODB_URI, MAILCHIMP_DATA_CENTER, API_KEY, MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID
* Click deploy
* Repeat all of step 2, except change root directory to website instead of database
4. Push Git repo and website will deploy under the provided url for the Vercel website project


Code folders, in 2 parts (highlighting main features):
1. Database:
 * FetchMathBills.js: continuously running data collection script using the Congress.gov API and inputting selected bills into our MongoDB database, running automatically every day through Vercel’s cron jobs. It also sends emails with each new bill found.
 * data.js: connects the MongoDB database, using the Mongoose library, to our website, which brings the data into a Vercel database with a url link (which is a built in feature available to Vercel websites), looking like https://deployeddatabse.vercel.app/api/data  
 * SyncMailchimpToMongoDB.js: adds the sign up emails to our MongoDB database in a new collection

2. Website:
 * src/DatabaseConnection.js: shows the data from the database
 * script.js: connects with the MongoDB database using Vercel database
 * src/components/.. all the aspects of the website in .js and .css (i.e. AboutUs, BillDetails, FullBillTable, TenBillsTable, etc.)


Helpful things to know!
* Vercel just pushes this code straight to the website when you add it to GitHub. Additionally, the automatic integration means if you change the MongoDB database, the website automatically updates with the new data.
* We currently have a daily cron job in Vercel to pull any new math-related bills as well as sync the mailchimp subscribers to our database. If you want to change the type of bill that is pulled, alter the keywords in the FetchMathBills.js file. We are using various Congress.gov API links (more information here and on other api.congress.gov sites: https://api.congress.gov/#/summaries/bill_summaries_all) to get all the information we want about all the sponsors, committees, cosponsors, and relatedBills related to each bill (we use the helper functions in FetchMathBills.js to get to the different API links to access different information in the API database). From there, push the repository to GitHub and new bills that are pulled to include those keywords. 
* Note that Vercel’s cron jobs, with the unpaid plan, only can run cron jobs once a day. Also, cron jobs time out at 10 seconds in the unpaid plan. However, you can run the serverless function’s data collection manually through the terminal, still, whenever you want (likely if you want to add a larger chunk of data). For example, we added two years of data after being almost done with the whole project by changing various aspects of the FetchMathBills.js script to not just take bills from the most recent updateDate on, nor just use singular batches, but deleted all the current bills in our database (as to not duplicate them, but you can change the script to only update bills), to pull everything from the date we wanted and continuously run (for an hour) until it was done – we just changed the setup of the main function, called that function at the end of the file, and ran the file in terminal. Before we used Vercel, and still had an edge function (not serverless), we did the data collection through our terminal and that added the data to our MongoDB seamlessly as well.


# License
This software is available under the MIT license.
* See the LICENSE.txt file in the project root for full license information.
