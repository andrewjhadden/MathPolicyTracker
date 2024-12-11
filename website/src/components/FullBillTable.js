/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: FullBillTable.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays a filterable and searchable list of all congressional bills from our database. It
//      shows 20 bills at a time
// Properties passed:
// - data: Array of bill objects used for displaying all the bill data.

import React, { useState, useEffect } from 'react';
import './FullBillTable.css';
import { useNavigate } from 'react-router-dom';

const getUniqueRepresentatives = (data) => {
    // Using a Set to avoid duplicates
    const representatives = new Set();

    // Add sponsor and cosponsor
    data.forEach((item) => {
        if (item.sponsors?.length > 0) {
            representatives.add(item.sponsors[0].fullName);
        }
        item.cosponsors?.forEach((cosponsor) => {
            representatives.add(cosponsor.fullName);
        });
    });

    // Convert the Set back to an array and sort alphabetically
    return Array.from(representatives).sort();
};

const getUniqueStates = (data) => {
    const states = new Set();
    data.forEach((item) => {
        if (item.sponsors?.length > 0) {
            states.add(item.sponsors[0].state);
        }
        item.cosponsors?.forEach((cosponsor) => {
            states.add(cosponsor.state);
        });
    });
    return Array.from(states).sort();
};

const PrintFullBillTable = ({ data }) => {
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    // Need for storing the currently selected representative from the filter dropdown (default is no filter)
    const [selectedReps, setSelectedReps] = useState([]);
    // Need for storing the list of all unique representatives (empty list to start)
    const [representatives, setRepresentatives] = useState([]);

    // Same for states
    const [selectedStates, setSelectedStates] = useState([]);
    const [states, setStates] = useState([]);

    // To be able to show reps and states or not
    const [showRepFilter, setShowRepFilter] = useState(false);
    const [showStateFilter, setShowStateFilter] = useState(false);

    // Initial rows shown
    const [visibleCount, setVisibleCount] = useState(20);

    // Populate representatives when data changes
    useEffect(() => {
        setRepresentatives(getUniqueRepresentatives(data));
        setStates(getUniqueStates(data));
    }, [data]);

    useEffect(() => {
        // Filter data based on query
        const results = data.filter((item) => {
            // Check if query matches title or bill number
            const title = item.bill.bill.title.toLowerCase();
            const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
            const matchesQuery = title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            
            // Check if the selected representative is either sponsor or cosponsor
            const matchesReps = selectedReps.length === 0 || selectedReps.some(rep =>
                    item.sponsors.some(s => s.fullName === rep) ||
                    item.cosponsors.some(c => c.fullName === rep)
                );

            // Check if the selected representative is either sponsor or cosponsor
            const matchesStates = selectedStates.length === 0 || selectedStates.some(state =>
                item.sponsors.some(s => s.state === state) ||
                item.cosponsors.some(c => c.state === state)
            );

            return matchesQuery && matchesReps && matchesStates;
        });

        // Sort by actionDate descending
        const sortedResults = results.sort(
            (a, b) => new Date(b.bill.actionDate) - new Date(a.bill.actionDate)
        );

        setFilteredData(sortedResults);

        // Reset visible count on new search
        setVisibleCount(20);
    }, [query, selectedReps, selectedStates, data]);

    // Toggle representative selection on click
    const handleRepClick = (rep) => {
        setSelectedReps((prevSelectedReps) => {
            if (prevSelectedReps.includes(rep)) {
                return prevSelectedReps.filter((selectedRep) => selectedRep !== rep); // Remove if already selected
            } else {
                return [...prevSelectedReps, rep]; // Add if not selected
            }
        });
    };

    // Toggle state selection on click
    const handleStateClick = (state) => {
        setSelectedStates((prevSelectedStates) => {
            if (prevSelectedStates.includes(state)) {
                return prevSelectedStates.filter((selectedState) => selectedState !== state); // Remove if already selected
            } else {
                return [...prevSelectedStates, state]; // Add if not selected
            }
        });
    };

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
            
            <div className="filter-container">
                <label htmlFor="rep-filter">Filter</label>
                <div>
                    <div onClick={() => setShowRepFilter(!showRepFilter)}>
                        Representatives \u2191
                    </div>
                    {showRepFilter && (
                        <div className="representatives-list">
                            {representatives.map((rep) => (
                                <div
                                    key={rep}
                                    className={`rep-option ${selectedReps.includes(rep) ? 'selected' : ''}`}
                                    onClick={() => handleRepClick(rep)}
                                >
                                    {rep}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div>
                    <div onClick={() => setShowStateFilter(!showStateFilter)}>
                        States \u2191
                    </div>
                    {showStateFilter && (
                        <div className="representatives-list">
                            {states.map((state) => (
                                <div
                                    key={state}
                                    className={`rep-option ${selectedStates.includes(state) ? 'selected' : ''}`}
                                    onClick={() => handleStateClick(state)}
                                >
                                    {state}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

            <div className="table-container-full">
                <table className="bill-table-full">
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