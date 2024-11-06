// website/src/components/BillDetails.js
import React from 'react';
import './BillDetails.css'; 
import { useParams } from 'react-router-dom';

const cleanText = (text) => {
    const htmlRemoved = text.replace(/<[^>]*>/g, '');
    return htmlRemoved.replace(/\\b/g, '').trim(); // trim() removes leading/trailing spaces
};

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
            <div className="sponsor">
                {/* How do we get a sponsor or committee? */}
                <strong>Origin Chamber:</strong> {bill.bill.bill.originChamber} <br/>
                {/* <strong>Latest Action:</strong> {bill.bill.actionDesc} ({bill.bill.actionDate}) <br/> */}
                <strong>Current Chamber:</strong> {bill.bill.currentChamber} <br/>
            </div>
            <div className="tracker">
                <button><strong>Latest Action:</strong> {bill.bill.actionDesc} ({bill.bill.actionDate}) <br/></button>
                {/* <button>Introduced</button>➜
                <button>Passed House</button>➜
                <button>Passed Senate</button>➜
                <button>To President</button>➜
                <button>Became Law</button> */}
            </div>
            <div className="keywords">
                <strong>Keywords:</strong> {Array.isArray(bill.keywordsMatched) && bill.keywordsMatched.length > 0 
                ? bill.keywordsMatched.map(keyword => cleanText(keyword)).join(', ') 
                : 'N/A'}
            </div>
            <div className="summary">
                <h3>Summary:</h3>
                <p>{cleanText(bill.bill?.text) || "Summary Not Available"}</p>
            </div>
            <a 
                href={`https://www.congress.gov/bill/${bill.bill?.bill?.congress}/${
                    bill.bill?.bill?.type === "HR" ? "house-bill" :
                    bill.bill?.bill?.type === "HRES" ? "house-resolution" : "senate-bill"
                }/${bill.bill?.bill?.number}`}
                target="_blank"
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none' }}
            >
                <button className="more-info-button">Congress.gov</button>
            </a>
        </div>
    );

    // const bill = {
    //     name: 'H.R.210 - Rural STEM Education Research Act',
    //     congress: '117th Congress',
    //     sponsor: 'Rep. Lucas, Frank D. [R-OK-3]',
    //     introducedDate: '01/05/2021',
    //     committee: 'House - Science, Space, and Technology',
    //     latestAction: 'Became Public Law No: 117-167 (08/09/2022)',
    //     summary: `
    //         This bill directs the National Science Foundation (NSF) 
    //         to award grants to encourage and support activities related 
    //         to STEM (science, technology, engineering, and mathematics) 
    //         education in rural schools.

    //         The bill focuses on research and development in STEM education 
    //         for rural communities, including increasing the participation 
    //         of underrepresented students, creating online STEM education 
    //         programs, and improving professional development for STEM teachers.
    //     `,
    //     actions: [
    //         { date: '01/05/2021', action: 'Introduced in House', actionBy: 'House of Representatives' },
    //         { date: '06/28/2021', action: 'Passed House', actionBy: 'House of Representatives' },
    //         { date: '07/15/2021', action: 'Passed Senate', actionBy: 'Senate' },
    //         { date: '08/02/2022', action: 'Presented to President', actionBy: 'President' },
    //         { date: '08/09/2022', action: 'Signed by President and became Public Law No: 117-167', actionBy: 'President' },
    //     ]
    // };
};

export default BillDetails;
