/**
 * Copyright 2024 Allison Berkowitz and Andrew Hadden
 * Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
 */

// Component: TenBillsTable.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the top 10 most recently updated bills for the main page in a table.
// Properties passed:
// - data: Array of bill objects used for displaying all the bill data.

import React from 'react';
import { Link } from 'react-router-dom';
import './TenBillsTable.css'; 

const Display10BillsTable = ({ data }) => {
    // Sort function compares actionDate as Date values in js to arrange in newest to oldest order
    const sortedData = [...data].sort((a, b) =>  // ...data creates a shallow copy of the array to avoid editing the original
        new Date(b.bill.actionDate) - new Date(a.bill.actionDate)
    );

    return (
        <div className="table-container">
            <table className="bill-table">
                <thead>
                    <tr>
                        <th>Bill</th>
                        <th>Title (click for more info)</th>
                        <th>Action</th>
                        <th>Action Date</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.slice(0, 10).map((item) => (
                        <tr key={item._id}>
                            <td>
                            {item.bill.bill.type}.{item.bill.bill.number}
                            </td>
                            <td>
                                <Link to={`/bill/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {item.bill.bill.title}
                                </Link>
                            </td>
                            <td>{item.bill.actionDesc}</td>
                            <td>{item.bill.actionDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Display10BillsTable;