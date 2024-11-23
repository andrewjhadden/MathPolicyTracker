# Math-related Congressional Bill Tracker
Computer Science Thesis Project (Fall 2024) Hamilton College
By Allison Berkowitz and Andrew Hadden
Project Goal: To build a database and connected website to present and track all bills in congress, since the 117th congress and being continously updated, related to mathematics. This will be useful to Prof. Courtney Gibbons in the Mathematics Department, and congressional staff all over who care for easy access to the progression of legislation related to mathematics.

Technologies, Key Libraries & Platforms Used:
- Database with MongoDB
- Database data is collected via the publicly-available Congress.gov API
- Website and database are connected with Vercel through Github
- Website is built on Vercel, using React and HTML/CSS
- Email alerts are run with an email API (Mailchimp) that comes with Node.js

How to use... (to do)
(something about how vercel just pushes this code straight to the website)
(anything that could be helpful to courtney ever wanting to make changes
or someone wanting to copy this over and make it their own)

Code folders, in 2 parts (highlighting main features):
1. Database:
  * fetchMathBills.js: data collection script using the API, to the database, which we will change to a continous data pull and upload any new changes to Github which will deploy it to the website.
  * data.js: connects database with website using Vercel database from MongoDb
  * syncMailchimToMongo.js: adds the sign up emails to our MongoDB database in a new collection

2. Website:
  * src/App.js: shows the data from the database
  * script.js: connects with the database using Vercel database from MongoDb
  * src/components/.. all the parts of the website in .js and .css

# License
This software is available under the MIT license.
* See the LICENSE.txt file in the project root for full license information.