// Component: Header.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the title and 3 pages we have attached (all bills, about us, and sign up).

import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
    <header className="header">
        <Link className="logo" to="/">Home</Link>
        <nav>
            <ul className="nav-menu">
                <button className="menu-button">
                    <Link to="/all-bills">All Bills</Link>
                </button>
                <button className="menu-button">
                    <Link to="/about-us">About Us</Link>
                </button>
                <button className="menu-button">
                    <Link to="/signup-button">Sign Up</Link>
                </button>
            </ul>
        </nav>
    </header>
);

export default Header;
