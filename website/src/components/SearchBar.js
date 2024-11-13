// Component: BillTable.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Creates the search bar on the main page of all bills in our database. Also filters through the 
//      data depending on the search in the search bar.
// Properties passed:
// - data: Array of bill objects used for displaying all the bill data.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const FilterDataUsingSearchBar = ({ data = [] }) => {
    const [query, setQuery] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);

    // State to manage dropdown visibility:
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // Reference to the search container:
    const searchRef = useRef(null);

    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Filter data based on the query
        if (query && data.length > 0) {
            const results = data.filter((item) => {
                const title = item.bill.bill.title?.toLowerCase();
                const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
                return title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            });
            // Limit results for dropdown
            setFilteredResults(results.slice(0, 10));
        } else {
            setFilteredResults([]);
        }
    }, [query, data]); // so, if either query or data changes then the function will be triggered again

    // Event listener to hide dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Empty ependency array means it'll run automatically, and not re-run

    const handleResultClick = (id) => {
        navigate(`/bill/${id}`);
    };

    const handleFocus = () => {
        // Show dropdown when input is focused
        setIsDropdownVisible(true);

        // Move cursor to the end of the current text
        if (inputRef.current) {
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
        }
    };

    return (
        <div className="filter" ref={searchRef}>
            <input
                type="text"
                placeholder="Search bills by title or number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}

                // Show dropdown on focus and set cursor position
                onFocus={handleFocus}

                className="filter-input"

                // Reference to the input element
                ref={inputRef}
            />

            {isDropdownVisible && filteredResults.length > 0 && (
                <div className="filter-dropdown">
                    {filteredResults.map((item) => (
                        <div
                            key={item._id}
                            className="filter-dropdown-item"
                            onClick={() => handleResultClick(item._id)}
                        >
                            {item.bill.bill.type}.{item.bill.bill.number}: {item.bill.bill.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterDataUsingSearchBar;
