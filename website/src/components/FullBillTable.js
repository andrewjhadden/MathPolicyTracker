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

import React, { useState, useEffect, useMemo } from 'react';
import './FullBillTable.css';
import { useNavigate } from 'react-router-dom';

// Using a Set to avoid duplicates, add all sponsors and cosponsors to it, and finally convert it back
// to an array and sort alphabetically to get a usable, sorted, non-duplicated, list of representatives.
const getUniqueRepresentatives = (data) => {
    const representatives = new Set();

    data.forEach((item) => {
        if (item.sponsors?.length > 0) {
            representatives.add(item.sponsors[0].fullName);
        }
        item.cosponsors?.forEach((cosponsor) => {
            representatives.add(cosponsor.fullName);
        });
    });

    return Array.from(representatives).sort();
};

// Same concept as above, getting a usable, sorted, non-duplicated, list of states that each rep 
// comes from.
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

    // Need for storing the currently selected reps or states from the filter dropdown 
    const [selectedReps, setSelectedReps] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);

    // To be able to show reps and states or not
    const [showRepFilter, setShowRepFilter] = useState(false);
    const [showStateFilter, setShowStateFilter] = useState(false);

    // Setting the number of rows shown (inital is 20)
    const [visibleCount, setVisibleCount] = useState(20);

    // Memoize the unique reps and states -- need for storing the list of all unique filters 
    // (empty list to start)
    const representatives = useMemo(() => getUniqueRepresentatives(data), [data]);
    const states = useMemo(() => getUniqueStates(data), [data]);

    const [showKeywordsDropdown, setKeywordsDropdown] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Filter data based on query matching title or bill number, then check if selected rep is 
        // either a sponsor or cosponsor, and finally check if the selected state is in either the
        // sponsors or cosponsors
        const results = data.filter((item) => {
            const title = item.bill.bill.title.toLowerCase();
            const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
            const matchesQuery = title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            
            const matchesReps = selectedReps.length === 0 || selectedReps.some(rep =>
                    item.sponsors?.some(s => s.fullName === rep) ||
                    item.cosponsors?.some(c => c.fullName === rep)
                );

            const matchesStates = selectedStates.length === 0 || selectedStates.some(state =>
                    item.sponsors?.some(s => s.state === state) ||
                    item.cosponsors?.some(c => c.state === state)
                );

            return matchesQuery && matchesReps && matchesStates;
        });

        // Sort by actionDate descending
        const sortedResults = results.sort(
            (a, b) => new Date(b.bill.actionDate) - new Date(a.bill.actionDate)
        );

        setFilteredData(sortedResults);

        // Defining loading as false so that "loading..." doesn't continue to show
        setLoading(false);

        // Reset visible count on new search
        setVisibleCount(20);
    }, [query, selectedReps, selectedStates, data]);

    // Toggle representative selection on click (remove is already selected, add if not)
    const handleRepClick = (rep) => {
        setSelectedReps((prevSelectedReps) => {
            if (prevSelectedReps.includes(rep)) {
                return prevSelectedReps.filter((selectedRep) => selectedRep !== rep);
            } else {
                return [...prevSelectedReps, rep];
            }
        });
    };

    // Toggle state selection on click (remove is already selected, add if not)
    const handleStateClick = (state) => {
        setSelectedStates((prevSelectedStates) => {
            if (prevSelectedStates.includes(state)) {
                return prevSelectedStates.filter((selectedState) => selectedState !== state);
            } else {
                return [...prevSelectedStates, state];
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
            <h3 className="all-bills-subtitle1">
                List of all actions related to mathematics since the 114th congressional year, in the senate and house.
                <span
                    className="dropdown-toggle"
                    onClick={() => setKeywordsDropdown(!showKeywordsDropdown)}
                >
                    {showKeywordsDropdown ? '↑' : '↓'}
                </span>
            </h3>
            {showKeywordsDropdown && (
                <div className="dropdown-info">
                    We determined bills related to mathematics by filtering for keywords in a bill title or summary: " math ", "mathematics", "stem workforce", "stem education", and "mathematicians".
                </div>
            )}
    
            <h3 className="all-bills-subtitle3">Note: Each row represents a distinct action taken on any bill related to mathematics. Search a bill number or name to see a list of actions tracking that bill's progress.</h3>
            <h3 className="all-bills-subtitle2">Descending Order by Actions</h3>
            
            <div className="filter-container">
                <div className="filter-title">Filter</div>
                <div>
                    <div className="filter-type-click"
                        onClick={() => setShowRepFilter(!showRepFilter)}
                    >
                        Representatives <span className="arrow">{showRepFilter ? '↑' : '↓'}</span>
                    </div>
                    {showRepFilter && (
                        <div className="filter-list">
                            {representatives.map((rep) => (
                                <div
                                    key={rep}
                                    className={`filter-option ${selectedReps.includes(rep) ? 'selected' : ''}`}
                                    onClick={() => handleRepClick(rep)}
                                >
                                    {rep}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div>
                    <div className="filter-type-click"
                        onClick={() => setShowStateFilter(!showStateFilter)}
                    >
                        States <span className="arrow">{showStateFilter ? '↑' : '↓'}</span>
                    </div>
                    {showStateFilter && (
                        <div className="filter-list">
                            {states.map((state) => (
                                <div
                                    key={state}
                                    className={`filter-option ${selectedStates.includes(state) ? 'selected' : ''}`}
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

            {loading ? (
                <div className="loading-message">Loading...</div>
            ) : (
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
                            {/* Showing all data from our database, just sorted and only 20 at a time */}
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
                                    <td colSpan="5">Loading...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {visibleCount < filteredData.length && (
                <button className="load-more-button" onClick={handleShowMore}>
                    Load More
                </button>
            )}
        </div>
    );
};

export default PrintFullBillTable;
