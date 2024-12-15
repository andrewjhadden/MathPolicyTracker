/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: BillAlerts.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the 3 most recent bill updates for our main page as alerts at the front.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BillAlerts.css';

const BillAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    const API_URL = `${process.env.REACT_APP_DATABASE_API_URL}`;

    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bills:', error);
            }
        };
        fetchBills();
    }, [API_URL]);

    return (
        <div>
            {loading ? (
                    <p className="loading-message">Loading...</p>
                ) : (
                    <div className="bill-alerts">
                        {alerts.map((alert, index) => (
                            <Link 
                                key={index} 
                                to={`/bill/${alert._id}`}
                                reloadDocument
                                className="alert-card"
                            >
                                <h3>{`${alert.bill.bill.type} ${alert.bill.bill.number}`}</h3>
                                <p>{alert.bill.actionDate}</p>
                            </Link>
                        ))}
                    </div>
            )}
        </div>
    );
}

export default BillAlerts;