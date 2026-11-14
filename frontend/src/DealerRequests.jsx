
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function DealerRequests() {
    const [requests, setRequests] = useState([]);

    const getRequests = async function () {
        try {
            const response = await fetch("http://localhost:5000/api/dealers/requests");
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.log("Error fetching dealer requests:", error);
        }
    };

    useEffect(function () {
        getRequests();
    }, []);

    const approveDealer = async function (id) {
        try {
            const response = await fetch("http://localhost:5000/api/dealers/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    approved: true
                })
            });

            const data = await response.json();
            alert(data.message);
            getRequests();

        } catch (error) {
            alert("Cannot connect to server");
        }
    };

    const rejectDealer = async function (id) {
        if (!window.confirm("Reject and remove this dealer request?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/dealers/" + id, {
                method: "DELETE"
            });

            const data = await response.json();
            alert(data.message);
            getRequests();

        } catch (error) {
            alert("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>Dealer Requests</h1>

                <p>Review and approve new dealer registrations.</p>

                {requests.length === 0 ? (
                    <p>No pending dealer requests right now.</p>
                ) : (
                    <table border="1" cellPadding="8">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Shop Name</th>
                                <th>City</th>
                                <th>Pincode</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>GST Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {requests.map(function (dealer) {
                                return (
                                    <tr key={dealer._id}>
                                        <td>{dealer.name}</td>

                                        <td>{dealer.email}</td>

                                        <td>{dealer.shopName}</td>

                                        <td>{dealer.city}</td>

                                        <td>{dealer.pincode || "-"}</td>

                                        <td>
                                            {dealer.phone
                                                ? String(dealer.phone).trim()
                                                : "Not provided"}
                                        </td>

                                        <td>
                                            {dealer.address
                                                ? String(dealer.address).trim()
                                                : "Not provided"}
                                        </td>

                                        <td>
                                            {dealer.gstNumber
                                                ? String(dealer.gstNumber).trim()
                                                : "Not provided"}
                                        </td>

                                        <td>
                                            <button
                                                onClick={function () {
                                                    approveDealer(dealer._id);
                                                }}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={function () {
                                                    rejectDealer(dealer._id);
                                                }}
                                                style={{
                                                    background: "#dc2626",
                                                    color: "white"
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DealerRequests;

