/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: AboutUs.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays a description of our project's purpose including who we work with and who we are.

import React from 'react';
import './AboutUs.css';

const AboutUs = () => (
    <div className="about-us">
        <header className="about-header">
            <h1>About Us</h1>
            <p>Learn more about our mission, values, and the team behind Congressional Bill Tracker.</p>
        </header>
        
        <section className="about-mission">
            <h2>Our Mission</h2>
            <p>
                We created this website as seniors at Hamilton College for our Computer Science thesis project 
                in the fall of 2024. We choose this project with the guidance of Courtney Gibbons, Professor
                of Mathematics at Hamilton College, and Darren Strash, Professor of Computer Science at 
                Hamilton College, after finding the public does not have easy access to updated information on 
                legislative actions specifically about mathematics. We aim to create easy access to 
                legislative changes related to mathematics for congressional staff and to empower citizens 
                to stay informed and engaged in the legislative process.
            </p>
        </section>
        
        <section className="about-team">
            <h2>Meet the Team</h2>
            <div className="team-member">
                <h3>Allison Berkowitz, Developer</h3>
                <p>Computer Science Major, Hamilton College '25</p>
            </div>
            <div className="team-member">
                <h3>Andrew Hadden, Developer</h3>
                <p>Computer Science Major, Hamilton College '25</p>
            </div>
        </section>

        <section className="about-mission">
            <h2>Code and Copyright</h2>
            <p>
                The Math Policy Tracker and all related content are © Copyright 2024 Allison Berkowitz and Andrew Hadden. 
                The project is licensed under the MIT License. See the LICENSE.txt file in the project root for full details.
                The GitHub repo publically available: 
                <a href='https://github.com/andrewjhadden/deployedthesis' target='_blank' rel='noreferrer'>GitHub Repo</a>
            </p>
        </section>
    </div>
);

export default AboutUs;