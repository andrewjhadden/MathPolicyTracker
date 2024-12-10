/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: FullBillTable.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays a searchable list of all congressional bills from our database. We are still working 
//      on infinite scroll.
// Properties passed:
// - data: Array of bill objects used for displaying all the bill data.

import React, { useState, useEffect } from 'react';
import './FullBillTable.css';
import { useNavigate } from 'react-router-dom';

const PrintFullBillTable = ({ data }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20); // Initial rows shown

    useEffect(() => {
        // Filter data based on query
        const results = data.filter((item) => {
            const title = item.bill.bill.title.toLowerCase();
            const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
            const matchesQuery = title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            return matchesQuery;
        });

        // Sort by actionDate descending
        const sortedResults = results.sort(
            (a, b) => new Date(b.bill.actionDate) - new Date(a.bill.actionDate)
        );

        setFilteredData(sortedResults);
        setVisibleCount(20); // Reset visible count on new search
    }, [query, data]);

    // Show more rows on click
    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 20);
    };

    const handleRowClick = (id) => {
        navigate(`/bill/${id}`);
    };

    return (
        <div>
            <h2 className="all-bills-title">All Bill Actions</h2>
            <h3 className="all-bills-subtitle1">List of all actions related to mathematics since the 114th congression year, in the senate and house.</h3>
            <h3 className="all-bills-subtitle2">Descending Order by Actions</h3>

            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Search bills by title or number"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <table className="bill-table">
                    <thead>
                        <tr>
                            <th>Bill Number</th>
                            <th>Title</th>
                            <th>Congress Year</th>
                            <th>Action</th>
                            <th>Action Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.slice(0, visibleCount).map((item) => (
                                <tr 
                                    key={item._id} 
                                    className="clickable-row" 
                                    onClick={() => handleRowClick(item._id)}
                                >
                                    <td>{item.bill.bill.type}.{item.bill.bill.number}</td>
                                    <td>{item.bill.bill.title}</td>
                                    <td>{item.bill.bill.congress}</td>
                                    <td>{item.bill.actionDesc}</td>
                                    <td>{item.bill.actionDate}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No results found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {visibleCount < filteredData.length && (
                <button className="load-more-button" onClick={handleShowMore}>
                    Load More
                </button>
            )}
        </div>
    );
};

export default PrintFullBillTable;