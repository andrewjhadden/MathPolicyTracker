// Component: BillAlerts.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the 3 most recent bill updates for our main page as alerts at the front.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BillAlerts.css';

const BillAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const API_URL = `${process.env.REACT_APP_DATABASE_API_URL}/data`; // Call environment variable in Vercel

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();

                // Sort by actionDate in descending order and take the top 3
                const topThreeBills = data
                    .sort((a, b) => new Date(b.bill.actionDate) - new Date(a.bill.actionDate))
                    .slice(0, 3);

                setAlerts(topThreeBills);
            } catch (error) {
                console.error('Error fetching bills:', error);
            }
        };
        fetchBills();
    }, [API_URL]); // dependency array: API url to ___ 

    return (
        <div className="bill-alerts">
            {alerts.map((alert, index) => (
                <div key={index} className="alert-card">
                    <h3>{`${alert.bill.bill.type} ${alert.bill.bill.number}`}</h3>
                    <p>{alert.bill.actionDate}</p>
                    <Link reloadDocument to={`/bill/${alert._id}`}>Learn More</Link>
                </div>
            ))}
        </div>
    );
}

export default BillAlerts;
