// Component: BillDetails.js
// Hamilton College Fall '24 Thesis
// Ally Berkowitz and Andrew Hadden
// Description: Displays the all the information about one bill, including title, keywords, summary and more.
//      There is also a more info button for the link to the bill in Congress.gov
// Properties passed:
// - text: either a keyword or a summary that can be edited to look like normal text from html symbols present
//      from the data pull
// - data: Array of bill objects used for displaying all the bill data.

import React from 'react';
import './BillDetails.css'; 
import { useParams, Link } from 'react-router-dom'; // adding Link

const cleanText = (text) => {
    const htmlRemoved = text.replace(/<[^>]*>/g, '');
    return htmlRemoved.replace(/\\b/g, '').trim(); // trim() removes leading/trailing spaces
};

// give header- high level (reading bill details and ...) (is it get bill details or display...) (verb)
const BillDetails = ({ data }) => {
    const { id } = useParams();
    const bill = data.find(b => b._id === id);

    if (!bill) {
        return <div>Bill not found</div>;
    }

    return (
        <div className="bill-details">
            <h2 className="bill-title">
                {bill.bill.bill.type}.{bill.bill.bill.number}: {bill.bill.bill.title}
            </h2>
            <p className="congress">{bill.bill.bill.congress}th Congressional Year</p>
            <div className="tracker">
                <button><strong>Latest Action:</strong> {bill.bill.actionDesc} ({bill.bill.actionDate}) <br/></button>
            </div>
            <div className="chambers">
                <strong>Origin Chamber:</strong> {bill.bill.bill.originChamber} <br/>
                <strong>Current Chamber:</strong> {bill.bill.currentChamber} <br/>
            </div>
            <div className="sponsors">
                <strong>Sponsor:</strong> {bill.sponsors[0].fullName} <br/>
                {bill.cosponsors && bill.cosponsors.length > 0 && (
                    <>
                        <strong>Cosponsor(s):</strong>
                        {bill.cosponsors.map((cosponsor, index) => (
                            <div key={index}>
                                &nbsp; {cosponsor.fullName} <br/> 
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="sponsors">
                {bill.committees && bill.committees.length > 0 && (
                    <>
                        <strong>Committee(s):</strong>
                        {bill.committees.map((committee, index) => (
                            <div key={index}>
                                &nbsp; {committee.chamber}: {committee.name} ({committee.type}) <br/> 
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="sponsors">
                {bill.relatedBills && bill.relatedBills.length > 0 && (
                    <>
                        <strong>Related Bill(s):</strong>
                        {bill.relatedBills.map((relatedBill, index) => (
                            <div key={index}>
                                &nbsp; {relatedBill.congress}th year: {relatedBill.type}.{relatedBill.number} "{relatedBill.title}" <br/> 
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="keywords">
            <strong>Keywords: </strong>
                {bill.keywordsMatched && bill.keywordsMatched.length > 0 ? (
                    bill.keywordsMatched.map((keyword, index) => (
                        <span key={index}>
                            {cleanText(keyword)}
                            {index < bill.keywordsMatched.length - 1 && ', '}
                        </span>
                    ))
                ) : (
                    <span>No keywords available</span>
                )}
            </div>
            <div className="summary">
                <h3>Summary:</h3>
                <p>{cleanText(bill.bill?.text) || "Summary Not Available"}</p>
            </div>
            <a 
                href={`https://www.congress.gov/bill/${bill.bill?.bill?.congress}/${
                    bill.bill?.bill?.type === "HR" ? "house-bill" :
                    bill.bill?.bill?.type === "HRES" ? "house-resolution" : 
                    bill.bill?.bill?.type === "SRES" ? "senate-resolution" : "senate-bill" 
                }/${bill.bill?.bill?.number}`}
                target="_blank"
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none' }}
            >
                <button className="more-info-button">Congress.gov</button>
            </a>
        </div>
    );
};

export default BillDetails;
