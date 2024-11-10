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

// <h2>Bill Details</h2>
// <p>Action Date: {item.bill?.actionDate || 'N/A'}</p>
// <p>Action Description: {item.bill?.actionDesc || 'N/A'}</p>
// <p>Bill Congress: {item.bill?.bill?.congress || 'N/A'}</p>
// <p>Bill Number: {item.bill?.bill?.number || 'N/A'}</p>
// <p>Origin Chamber: {item.bill?.bill?.originChamber || 'N/A'}</p>
// <p>Origin Chamber Code: {item.bill?.bill?.originChamberCode || 'N/A'}</p>
// <p>Bill Title: {item.bill?.bill?.title || 'N/A'}</p>
// <p>Bill Type: {item.bill?.bill?.type || 'N/A'}</p>
// <p>Bill Update Date Including Text: {item.bill?.bill?.updateDateIncludingText || 'N/A'}</p>
// <p>Bill URL: {item.bill?.bill?.url || 'N/A'}</p>
// <p>Current Chamber: {item.bill?.currentChamber || 'N/A'}</p>
// <p>Current Chamber Code: {item.bill?.currentChamberCode || 'N/A'}</p>
// <p>Last Summary Update Date: {item.bill?.lastSummaryUpdateDate || 'N/A'}</p>
// <p>Text: {item.bill?.text || 'N/A'}</p>
// <p>Update Date: {item.bill?.updateDate || 'N/A'}</p>
// <p>Version Code: {item.bill?.versionCode || 'N/A'}</p>
// <p>Keywords: {
//     Array.isArray(item.keywordsMatched) && item.keywordsMatched.length > 0 
//     ? item.keywordsMatched.join(', ') 
//     : 'N/A'