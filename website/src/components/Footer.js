/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// Component: Footer.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the sign up button at the bottom of every page, attached to mailchimp and our database
//      to keep track of them.

import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <footer className="footer">
            <button onClick={toggleModal} className="signup-button">
                Sign Up for Alerts
            </button>

            {isModalOpen && (
                <div className="modal-overlay" onClick={toggleModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={toggleModal}>✖</button>
                        <div id="mc_embed_shell">
                            <link
                                href="//cdn-images.mailchimp.com/embedcode/classic-061523.css"
                                rel="stylesheet"
                                type="text/css"
                            />
                            <div id="mc_embed_signup" style={{ background: "#fff", font: "14px Helvetica,Arial,sans-serif", width: "100%" }}>
                                <form
                                    action="https://hamilton.us17.list-manage.com/subscribe/post?u=5655c218737b1c2830a7677a1&amp;id=568adfc2bd&amp;f_id=0058c3e1f0"
                                    method="post"
                                    id="mc-embedded-subscribe-form"
                                    name="mc-embedded-subscribe-form"
                                    className="validate"
                                    target="_blank"
                                >
                                    <div id="mc_embed_signup_scroll">
                                        <h2>Sign Up for Alerts</h2>
                                        <div className="indicates-required">
                                            <span className="asterisk">*</span> indicates required
                                        </div>
                                        <div className="mc-field-group">
                                            <label htmlFor="mce-EMAIL">
                                                Email Address <span className="asterisk">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="EMAIL"
                                                className="required email"
                                                id="mce-EMAIL"
                                                required
                                            />
                                        </div>
                                        <div id="mce-responses" className="clear foot">
                                            <div className="response" id="mce-error-response" style={{ display: "none" }}></div>
                                            <div className="response" id="mce-success-response" style={{ display: "none" }}></div>
                                        </div>
                                        <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
                                            <input
                                                type="text"
                                                name="b_5655c218737b1c2830a7677a1_568adfc2bd"
                                                tabIndex="-1"
                                                value=""
                                            />
                                        </div>
                                        <div className="optionalParent">
                                            <div className="clear foot">
                                                <input
                                                    type="submit"
                                                    name="subscribe"
                                                    id="mc-embedded-subscribe"
                                                    className="button"
                                                    value="Subscribe"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="copyright">
                © Copyright 2024 Allison Berkowitz and Andrew Hadden. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
