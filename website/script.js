fetch(`${process.env.REACT_APP_DATABASE_API_URL}/data`)  // Call the API server to fetch data
  .then(response => { // Checks if response from server is okay 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // Convert response as JSON
  })
  .then(data => { // Processes JSON data
    console.log('Received Data:', data);
    const container = document.getElementById('data-container');
    data.forEach(item => {
      const div = document.createElement('div');
      
      // Accessing the whole schema (don't use ? here)
      div.textContent = `
      Action Date: ${item.bill.actionDate},
      Action Description: ${item.bill.actionDesc},
      Bill Congress: ${item.bill.bill.congress},
      Bill Number: ${item.bill.bill.number},
      Origin Chamber: ${item.bill.bill.originChamber},
      Origin Chamber Code: ${item.bill.bill.originChamberCode},
      Bill Title: ${item.bill.bill.title},
      Bill Type: ${item.bill.bill.type},
      Bill Update Date Including Text: ${item.bill.bill.updateDateIncludingText},
      Bill URL: ${item.bill.bill.url},
      Current Chamber: ${item.bill.currentChamber},
      Current Chamber Code: ${item.bill.currentChamberCode},
      Last Summary Update Date: ${item.bill.lastSummaryUpdateDate},
      Text: ${item.bill.text},
      Update Date: ${item.bill.updateDate},
      Version Code: ${item.bill.versionCode},
      Keywords Matched: ${item.keywordsMatched.join(', ')}`;
    
      container.appendChild(div);
    });
  })
  .catch(error => console.error('Error fetching data:', error));
