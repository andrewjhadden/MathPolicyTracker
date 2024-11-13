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

const filterDataUsingSearchBar = ({ data = [] }) => {
    const [query, setQuery] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // State to manage dropdown visibility
    const searchRef = useRef(null); // Reference to the search container
    const inputRef = useRef(null); // Reference to the input element
    const navigate = useNavigate();

    useEffect(() => {
        // Filter data based on the query
        if (query && data.length > 0) {
            const results = data.filter((item) => {
                const title = item.bill.bill.title?.toLowerCase();
                const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
                return title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            });
            setFilteredResults(results.slice(0, 10)); // Limit results for dropdown
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
        setIsDropdownVisible(true); // Show dropdown when input is focused

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
                onFocus={handleFocus} // Show dropdown on focus and set cursor position
                className="filter-input"
                ref={inputRef} // Reference to the input element
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

export default filterDataUsingSearchBar;
