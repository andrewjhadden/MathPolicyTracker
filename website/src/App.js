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
    const [data, setData] = useState([]); // State to store fetched data
    const API_URL = `${process.env.REACT_APP_DATABASE_API_URL}/data`; // get API url from Vercel

    // Data fetching logic:
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
    }, [API_URL]); // so, if API_URL changes then the function will be triggered again
    
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
