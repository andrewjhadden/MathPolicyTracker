# Thesis
Computer Science Thesis Fall 2024, Hamilton College
Allison Berkowitz and Andrew Hadden
Goal: To build a database and connected website to present and track all bills in congress, since the 117th congress and being continously updated, related to mathematics. This will be useful to Prof. Courtney Gibbons in the Mathematics Department, and congressional staff all over who care to have easy access to the progression of legislation related to mathematics.
Specifics:
- Database uses MongoDB
- Database data is collected via the publicly-available Congress.gov API
- Website and database are connected with Express as an API
- Website is built with React and HTML/CSS
- The public can sign up for email alerts, run with an email API that comes with Node.js

Code folders, in 2 parts:
1. Database:
- Firebase-Thesis: is the Google Firebase original version, using Cloud Functions (with an emulator) and a local script (9/29 switched over)
- MongoDB-Thesis: the functional code using MongoDB which successfully pulls data into the database and is the interface to connect the database with the website.
  * index.js: data collection script using the API, to the database, which we will change to a continouus 
  * server.js: connects database with website using Express

2. Website:
  * App.js: shows the data from the database
  * script.js: connects with the database using Express
  * [email API to be added]