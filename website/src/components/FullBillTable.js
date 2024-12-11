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

const getUniqueRepresentatives = (data) => {
    // Using a Set to avoid duplicates
    const representatives = new Set();

    data.forEach((bill) => {
        // Add sponsor (only can be one)
        if (bill.bill.sponsors?.length > 0) {
            representatives.add(bill.bill.sponsors[0].fullName);
        }

        // Add each cosponsor
        bill.bill.cosponsors?.forEach((cosponsor) => {
            representatives.add(cosponsor.fullName);
        });
    });

    // Convert the Set back to an array and sort alphabetically
    return Array.from(representatives).sort();
};

const PrintFullBillTable = ({ data }) => {
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    // Need for storing the currently selected representative from the filter dropdown (default is no filter)
    const [selectedRep, setSelectedRep] = useState('');
    // Need for storing the list of all unique representatives (empty list to start)
    const [representatives, setRepresentatives] = useState([]);

    // Initial rows shown
    const [visibleCount, setVisibleCount] = useState(20);

    // Populate representatives when data changes
    useEffect(() => {
        setRepresentatives(getUniqueRepresentatives(data));
    }, [data]);

    useEffect(() => {
        // Filter data based on query
        const results = data.filter((item) => {
            // Check if query matches title or bill number
            const title = item.bill.bill.title.toLowerCase();
            const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
            const matchesQuery = title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            
            // Check if the selected representative is either sponsor or cosponsor
            const matchesRep = selectedRep ? 
                item.bill.sponsors.some(s => s.fullName === selectedRep) ||
                item.bill.cosponsors.some(c => c.fullName === selectedRep)
                : true;

            return matchesQuery && matchesRep;
        });

        // Sort by actionDate descending
        const sortedResults = results.sort(
            (a, b) => new Date(b.bill.actionDate) - new Date(a.bill.actionDate)
        );

        setFilteredData(sortedResults);

        // Reset visible count on new search
        setVisibleCount(20);
    }, [query, selectedRep, data]);

    // Show more rows on click
    const HandleShowMore = () => {
        setVisibleCount((prev) => prev + 20);
    };

    const HandleRowClick = (id) => {
        navigate(`/bill/${id}`);
    };

    return (
        <div>
            <h2 className="all-bills-title">All Bill Actions</h2>
            <h3 className="all-bills-subtitle1">List of all actions related to mathematics since the 114th congression year, in the senate and house.</h3>
            <h3 className="all-bills-subtitle2">Descending Order by Actions</h3>
            
            <div className="filter-container">
                <label htmlFor="rep-filter">Filter by Representative:</label>
                <select
                    id="rep-filter"
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className="filter-select"
                >
                    <option value="">
                        All Representatives
                    </option>
                    {representatives.map((rep) => (
                        <option key={rep} value={rep}>
                            {rep}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Search bills by number or title"
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
                                    onClick={() => HandleRowClick(item._id)}
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
                <button className="load-more-button" onClick={HandleShowMore}>
                    Load More
                </button>
            )}
        </div>
    );
};

export default PrintFullBillTable;