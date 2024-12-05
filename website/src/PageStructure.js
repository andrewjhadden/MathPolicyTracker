/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// src: PageStructure.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the main page, inserting the header, 3 alerts, main table, and footer.

import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BillAlerts from './components/BillAlerts';
import SearchBar from './components/SearchBar';
import TenBillsTable from './components/TenBillsTable';
import Footer from './components/Footer';
import BillDetails from './components/BillDetails'; 
import FullBillTable from './components/FullBillTable';
import AboutUs from './components/AboutUs';
import './PageStructure.css';
import congressImage from './congress_image.png';
import hamiltonImage from './hamilton_image.png';

// React component names must start with uppercase -- otherwise using camel case
function StructureWebsiteWithData() {
    // State to store fetched data
    const [data, setData] = useState([]);

    // get API url from Vercel
    const API_URL = `${process.env.REACT_APP_DATABASE_API_URL}`;

    // Data fetching logic:
    // useEffect is, by design, used to contain code with side effects (The reason you put this code there is 
    // partly because it runs after things are done rendering and the markup is ready to be changed. Another 
    // reason is that you can control when it is called.)
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
    // 3- Not-empty dependency array >> code inside runs every time any variables you put inside the 
    //      dependency array changes.
    
    const location = useLocation(); // Get the current route

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
                                {/* <div className="scroll-container">  */}
                                <div className="top-section">
                                    <div className="image-container">
                                        <img src={congressImage} alt="Capitol Image" />
                                        <div className="overlay"></div>
                                    </div>
                                    <div className="image-container">
                                        <img src={hamiltonImage} alt="Hamilton Image" />
                                        <div className="overlay"></div>
                                    </div>
                                    <div className="title">Math Policy Tracker</div>
                                </div>
                                <h1 className="alert-header">See What’s New!</h1>
                                <div className="bill-alerts">
                                    <BillAlerts data={data} />
                                </div>
                                <h2 className="table-header">10 Most Recent Bill Actions</h2>
                                <div className="search-bar">
                                    <SearchBar data={data} />
                                </div>
                                <TenBillsTable data={data} />
                                {/* </div> */}
                                </>
                            }
                        />
                        <Route path="/bill/:id" element={<BillDetails data={data} />} />
                        <Route path="/full-bill-table" element={<FullBillTable data={data} />} />
                        <Route path="/search-bar" element={<SearchBar data={data} />} /> 
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/sign-up" element={<SignUp />} />
                    </Routes>
                </main>
                {location.pathname !== '/sign-up' && <Footer />}
            </div>
        </Router>
    );
}

export default StructureWebsiteWithData;