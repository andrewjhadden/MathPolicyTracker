// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Make sure to include the CSS file for styling

const Header = () => (
    <header className="header">
        <a href="/" className="logo">
            Congressional Bill Tracker
        </a>
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
