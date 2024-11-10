// AboutUs.js
import React from 'react';
import './AboutUs.css'; // Import the CSS file for styling

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
                of Mathematics at Hamilton College, after finding the public does not have easy access to
                updated infromation on legislative actions related to mathematics. We aim to create easy access
                to legislative changes related to mathematics for congressional staff and to empower citizens 
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
    </div>
);

export default AboutUs;