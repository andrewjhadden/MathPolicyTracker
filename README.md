# Thesis
Computer Science Thesis Fall 2024, Hamilton College
Ally Berkowitz and Andrew Hadden
Goal: To build a database and connected website to present and track all bills in congress, since the 117th congress and being continously updated, related to mathematics. This will be useful to Prof. Courtney Gibbons in the Mathematics Department, and congressional staff all over who care to have easy access to the progression of legislation related to mathematics.
Specifics:
- Database uses MongoDB
- Database data is collected via the publicly-available Congress.gov API
- Website and database are connected with Vercel through Github, which is serverless (we plan to write a
script to get new bills collected with a new Github push, and that should update the website)
- Website is built on Vercel, using React and HTML/CSS
- The public can sign up for email alerts, run with an email API that comes with Node.js (Mailchimp)

Code folders, in 2 parts (highlighting main features):
1. Database:
  * fetchMathBills.js: data collection script using the API, to the database, which we will change to a continous data pull and upload any new changes to Github which will deploy it to the website.
  * data.js: connects database with website using Vercel database from MongoDb
  * syncMailchimToMongo.js: adds the sign up emails to our MongoDB database in a new collection

2. Website:
  * src/App.js: shows the data from the database
  * script.js: connects with the database using Vercel database from MongoDb
  * src/components/.. all the parts of the website in .js and .css