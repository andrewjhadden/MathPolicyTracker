/**
* Copyright 2024 Allison Berkowitz and Andrew Hadden
* Licensed under the MIT License. See the LICENSE.txt file in the project root for full license information.
*/

// website: DatabaseConnection.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Client-side functionality connecting database in Vercel from MongoDB to the website.
//    (i.e. connects to a MongoDB database (hosted on Vercel) and displays the data on our webpage)
// can put copyright in readme or in license file (open source? mit license?), put at the top for clarity

import React, { useState, useEffect } from 'react';

const FetchAndDisplayData = () => {
	// Set up state to store the fetched data
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Fetch data from Vercel (originally from MongoDB database)
		fetch(`${process.env.REACT_APP_DATABASE_API_URL}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			// Store the data in state
			setData(data);

			setLoading(false);
		})
		.catch((error) => {
			setError(error.message);
			setLoading(false);
		});
	}, []); // Empty ependency array means it'll run automatically, and not re-run

	// Return JSX to render data (error handling!)
	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
	<div>
		<h1>Bill Data</h1>
		<pre>{JSON.stringify(data, null, 2)}</pre>
	</div>
	);
};

export default FetchAndDisplayData;