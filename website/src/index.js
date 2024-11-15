/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// src: index.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: puts together the app with React

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PageStructure from './PageStructure';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <PageStructure />
    </React.StrictMode>
);

reportWebVitals();