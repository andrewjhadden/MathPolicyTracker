// src: App.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the main page, inserting the header, 3 alerts, main table, and footer.

import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import BillAlerts from './components/BillAlerts';
import Filters from './components/Filters';
import BillTable from './components/BillTable';
import Footer from './components/Footer';
import BillDetails from './components/BillDetails'; 
import AllBills from './components/AllBills';
import AboutUs from './components/AboutUs';
import './App.css';

function App() {
    // State to store fetched data
    const [data, setData] = useState([]);

    // get API url from Vercel
    const API_URL = `${process.env.REACT_APP_DATABASE_API_URL}/data`;

    // Data fetching logic:
    // useEffect is, by design, used to contain code with side effects (The reason you put this 
    // code there is partly because it runs after things are done rendering and the 
    // markup is ready to be changed. Another reason is that you can control when it is 
    // called.)
    useEffect(() => {
        fetch(API_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, [API_URL]);
    // Reminder about dependency arrays: (you should reference any variables used inside of it)
    // 1- No dependency array >> code inside runs every time your component re-renders.
    // 2- Empty dependency array >> code inside only runs once when your component first mounts.
    // 3- Not-empty dependency array >> code inside runs every time any variables you put inside.
    //      the dependency array changes.
    
    return (
        <Router>
            <div className="App">
                <Header />
                <main>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <>
                                <h1 className="alert-header">See What’s New!</h1>
                                <BillAlerts data={data} />
                                <h2 className="table-header">10 Most Recent Bill Actions</h2>
                                <Filters data={data} />
                                <BillTable data={data} />
                                </>
                            }
                        />
                        <Route path="/bill/:id" element={<BillDetails data={data} />} />
                        <Route path="/all-bills" element={<AllBills data={data} />} />
                        <Route path="/filters" element={<Filters data={data} />} /> 
                        <Route path="/about-us" element={<AboutUs />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
