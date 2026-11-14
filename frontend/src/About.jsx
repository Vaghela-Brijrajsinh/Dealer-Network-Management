import Navbar from "./Navbar";

function About() {
    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>About Our System</h1>
                <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
                    The Dealer Network Management System provides a seamless bridge between manufacturers and approved dealers.
                    It simplifies inventory visibility, order placement, order approval, shipment tracking, and complaint resolution.
                </p>

                <h2>Key Objectives</h2>
                <ul>
                    <li>Streamline Dealer Onboarding and Approval</li>
                    <li>Centralize Product Catalog & Real-time Stock Updates</li>
                    <li>Automated Order Processing & Stock Deduction on Approval</li>
                    <li>Internal Shipment Management & Complaint Resolution</li>
                </ul>
            </div>
        </div>
    );
}

export default About;
