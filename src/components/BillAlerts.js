import React, { useEffect, useState } from 'react';
import './BillAlerts.css';

const BillAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await fetch('http://localhost:3002/data'); // Adjust URL if necessary
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
    }, []);

    return (
        <div className="bill-alerts">
            {alerts.map((alert, index) => (
                <div key={index} className="alert-card">
                    <h3>{`${alert.bill.bill.type} ${alert.bill.bill.number}`}</h3> {/* Label + Bill number */}
                    <p>{new Date(alert.bill.actionDate).toLocaleDateString()}</p> {/* Date under */}
                    <a href={alert.bill.url || `/bill/${alert._id}`}>Learn More</a> {/* Learn more link below */}
                </div>
            ))}
        </div>
    );
}

export default BillAlerts;
