import React from 'react';
import './BillTable.css'; 
import { Link } from 'react-router-dom';

const BillTable = ({ data }) => {
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
                        <th>Update</th>
                        <th>Update Date</th>
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

export default BillTable;