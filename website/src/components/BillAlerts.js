import React, { useEffect, useState } from 'react';
import './BillAlerts.css';

const BillAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const API_URL = `${process.env.REACT_APP_DATABASE_API_URL}/data`;

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await fetch(API_URL); // Use environment variable for the API URL
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
    }, [API_URL]);

    return (
        <div className="bill-alerts">
            {alerts.map((alert, index) => (
                <div key={index} className="alert-card">
                    <h3>{`${alert.bill.bill.type} ${alert.bill.bill.number}`}</h3> {/* Label + Bill number */}
                    <p>{new Date(alert.bill.actionDate).toLocaleDateString()}</p> {/* Date under */}
                    <Link reloadDocument to={`/bill/${item._id}`}>Learn More</Link>
                </div>
            ))}
        </div>
    );
}

export default BillAlerts;
