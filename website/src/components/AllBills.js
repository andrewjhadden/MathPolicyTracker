import React, { useState, useEffect } from 'react';
import './AllBills.css';
import { Link } from 'react-router-dom';

const AllBills = ({ data }) => {
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        // Filter data based on search query
        const results = data.filter((item) => {
            const title = item.bill.bill.title?.toLowerCase();
            const billNumber = `${item.bill.bill.type}.${item.bill.bill.number}`.toLowerCase();
            const matchesQuery = title.includes(query.toLowerCase()) || billNumber.includes(query.toLowerCase());
            return matchesQuery;
        });

        setFilteredData(results);
    }, [query, data]);

    // Sort the filtered data by action date (newest to oldest)
    const sortedData = [...filteredData].sort((a, b) => 
        new Date(b.bill.actionDate) - new Date(a.bill.actionDate)
    );

    return (
        <div>
            <h2 className="all-bills-title">All Bill Updates</h2>
            <h3 className="all-bills-subtitle1">List of all updates related to mathematics since congressional year 117, in the senate and house.</h3>
            <h3 className="all-bills-subtitle2">Descending Order by Update</h3>

            {/* Search bar container */}
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
                            <th>Title (click for more info)</th>
                            <th>Congress Year</th>
                            <th>Update</th>
                            <th>Update Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? (
                            sortedData.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        {item.bill.bill.type}.{item.bill.bill.number}
                                    </td>
                                    <td>
                                        <Link to={`/bill/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {item.bill.bill.title}
                                        </Link>
                                    </td>
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
        </div>
    );
};

export default AllBills;
