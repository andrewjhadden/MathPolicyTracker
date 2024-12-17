# Math-related Congressional Bill Tracker

Computer Science Thesis Project (Fall 2024) [Hamilton College](https://www.hamilton.edu/)

By Allison Berkowitz and Andrew Hadden

Project Goal: To build a database and connected website to present and track all bills in congress, since the 114th congress and being continuously updated, related to mathematics. This will be useful to [Prof. Courtney Gibbons](https://crgibbons.github.io/) in the Mathematics Department, and congressional staff all over who care for easy access to the progression of legislation related to mathematics.

## Integration of Our Technologies, Key Libraries, & Platforms:
- [MongoDB](https://www.mongodb.com/products/platform/atlas-database) Database: holds all bill details, mail subscribers, and backend values helpful for our data pull
- Congress bill data is collected via the publicly-available [Congress.gov API](https://www.congress.gov/help/using-data-offsite) (one just needs to sign up for their own API key)
- Website and database are both hosted on [Vercel](https://vercel.com/docs) through the Github repository
- Website is built using [React](https://react.dev/), HTML, and CSS
- Email alerts are run with [Mailchimp’s](https://mailchimp.com/) API, subscriber information is added to MongoDB database

## Step-by-step…
**Before Deploying**
1. Clone this GitHub repository
2. Gather Congress.gov API key, MongoDB URI, Mailchimp API Key, Mailchimp Audience ID, and Mailchimp Data Center values
3. Create a new Vercel project with this Github repo

**Deploy the page**
1. In the Vercel project, import from the cloned Github repository, and use Database as the root
2. Add **MONGODB_URI, MAILCHIMP_DATA_CENTER, API_KEY, MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID** as environment variables.
4. Deploy
5. Repeat step 1, changing root directory to website instead of database

*Push Git repo and website will deploy under the provided url for the Vercel website project*

## Code folders, in 2 parts (highlighting main features):
1. Database:
 * `Database/api/FetchMathBills.js`: Continuously running data collection script using the Congress.gov API and inputting selected bills into our MongoDB database, running every day through Vercel’s cron jobs. It also sends emails with each new bill found through Mailchimp with the file `Database/api/SendMailchimpEmails.js`.
 * `Database/api/data.js`: Connects the MongoDB database, using the Mongoose library, as an API, which brings the data into a Vercel database with a url link (which is a built in feature available to Vercel websites), looking like https://deployeddatabse.vercel.app/api/data.
 * `Database/api/SyncMailchimpToMongoDB.js`: Adds the sign up emails to our MongoDB database in a new collection.

2. Website:
 * `website/DatabaseConnection.js`: Connects with the MongoDB database using Vercel database.
 * `website/src/index.js`: Shows the data from the database.
 * `website/src/PageStructure.js`: The main page of the website.
 * `website/src/components/..` All the aspects of the website in .js and .css (i.e. AboutUs, BillDetails, FullBillTable, TenBillsTable, etc.).

## Helpful things to know!
**Pushing Code:** Vercel just pushes this code straight to the website when you add it to GitHub. Additionally, the automatic integration means if you change the MongoDB database, the website automatically updates with the new data. Additionally, all of this GitHub repo, including the front-end section, is internally, automatically, connected to Vercel, so if you edit any of the `website/src/...` code and push it, the website will automatically change. Note 2: if you ever want to run the code separate of Vercel, specifically code in the ‘Database’ folder, you need to add an .env file locally (and we still have a .gitignore file to ignore .env's), with the environment variables, that we have as Vercel secrets right now.

**Cron jobs' timing:** Note that Vercel’s cron jobs, with the unpaid plan, only can run cron jobs once a day. Also, cron jobs time out at 10 seconds in the unpaid plan. However, you can run the serverless function’s data collection manually through the terminal, still, whenever you want (likely if you want to add a larger chunk of data). For example, we added two years of data after being almost done with the whole project by changing various aspects of the `Database/api/FetchMathBills.js` script to not just take bills from the most recent updateDate on, nor just use singular batches, but deleted all the current bills in our database (as to not duplicate them, but you can change the script to only update bills), to pull everything from the date we wanted and continuously run (for an hour) until it was done – we just changed the setup of the main function, called that function at the end of the file, and ran the file in terminal. Before we used Vercel, and still had an edge function (not serverless), we did the data collection through our terminal and that added the data to our MongoDB seamlessly as well.

**Data Pull: Cron job** We currently have a daily cron job in Vercel to pull any new math-related bills as well as sync the mailchimp subscribers to our database. It runs through `Database/vercel.json` and you can just delete any of the file, or change the time, etc. Vercel's website has information about what the time format means.

**Data Pull: Re-pulling bills/changing database bills at all (what years you're pulling, keywords filtered for, etc.):** We currently have the continous data pull script for the `FetchMathBills.js` file, but that means that if you want to go through and re-pull bills for new keywords or any adjustments for the bills, you will need to change that script to pull data from much further back (not from the most recent cron job date). 
* Before running a new script, you will probably want to delete all the data in 'thesisdbcollections' in MongoDB so you don't have the old data/bills there and new data/bills on top.
* After you delete the old data (if you want), you would have to edit `FetchMathBills.js` to not just have it run as a daily bill pull... You will need to add a new start date for your data pull (maybe the first day of congressional year 114), and that variable needs to be inputted into the API web links (all of them), instead of the lastUpdateDate variable we have now. You will also want to make lastOffset at 0, if you want it to start from the beginning of the lastUpdateDate day. Also, if you re-pull a bunch of new data, you might want to comment out the email sending, at the end of the fetchBatch funciton. Now, you might change a few little lines of codes here and there depending on what you want to pull this time, but you should be good to run it.
* You can run this updated data script either through Vercel -- you can run it seperate of the cron job through Vercel, by going on the database website, extend the link to `api/FetchMathBills`, and then there should be an option to run it manually -- or via totally disconnecting `FetchMathBills.js` and `data.js` files from Vercel, where you would have to change the serverless function handlers to not be serverless anymore, and run it locally -- that will take a bit more understanding of the main functions, and you would want to run it through [Node.js](https://nodejs.org/en/about), running node server.js. To do that second way, refer to my [GitHub scripts in `MongoDB_Thesis`](https://github.com/allyberkowitz/Thesis/tree/main/MongoDB_Thesis) from early on in the project where we did run it locally. You would need to adjust parts of the data pull script to pull all the data that we do now (added API links with the helper functions, made the code cleaner and better, etc.), however the general set-up of files and the main functions, should be helpful.

**Data Pull: API Data Source Changes** If you want to change the type of bill that is pulled, alter the keywords in the `FetchMathBills.js` file. We are using various Congress.gov API links (more information here and on other api.congress.gov sites: https://api.congress.gov/#/summaries/bill_summaries_all) to get all the information we want about all the sponsors, committees, cosponsors, and relatedBills related to each bill (we use the helper functions in `FetchMathBills.js` to get to the different API links to access different information in the API database). From there, push the repository to GitHub and new bills that are pulled to include those keywords. This [link](https://gpo.congress.gov/) is a great resource to understand all the options for accessing the library through the API.

**Using MongoDB** Info to know: MongoDB Atlas is the database platform. Installing [MongoDB Compass](https://www.mongodb.com/products/tools/compass) is helpful if you want to play around with MongoDB – it is a UI to easily look through your ‘collections’ (explained below). ‘Clusters’ is the overarching project database, which holds ‘Databases’ which is like an inner database, and that holds ‘Collections’, which is an inner-inner database. We have 1 cluster: “Thesis-Cluster”, 1 database within it: “ThesisDB”, and 4 collections… 1) “thesisdbcollections” – needs to be lowercase for our data pull code to work, it is the list of the bills. 2) “mailchimpusers” – the list of users we are sending emails too, and when someone unsubscribes it should update. 3 & 4) “fetch_progress” & “sync_progress” – both used for the continuous data pull

# License
This software is available under the MIT license.
* See the LICENSE.txt file in the project root for full license information.
