import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function AdminComplaints() {
    const [complaints, setComplaints] = useState([]);

    const getComplaints = async function () {
        try {
            const response = await fetch("http://localhost:5000/api/complaints");
            const data = await response.json();
            setComplaints(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(function () {
        getComplaints();
    }, []);

    const updateStatus = async function (id, newStatus) {
        try {
            const response = await fetch("http://localhost:5000/api/complaints/" + id + "/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            alert(data.message || "Complaint status updated");
            getComplaints();
        } catch (error) {
            alert("Cannot connect to server");
        }
    };

    const deleteComplaint = async function (id) {
        if (!window.confirm("Are you sure you want to delete this complaint record permanently from database?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/complaints/" + id, {
                method: "DELETE"
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                getComplaints();
            }
        } catch (error) {
            console.log("Delete complaint error:", error);
            alert("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>Complaint Management</h1>

                {complaints.length === 0 ? (
                    <p>No complaints submitted yet.</p>
                ) : (
                    <table border="1" cellPadding="8">
                        <thead>
                            <tr>
                                <th>Complaint No</th>
                                <th>Order No</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Reason</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(function (c) {
                                return (
                                    <tr key={c._id}>
                                        <td><strong>{c.complaintNumber || c._id}</strong></td>
                                        <td>{c.orderNumber || c.orderId}</td>
                                        <td>{c.productName}</td>
                                        <td>{c.quantity}</td>
                                        <td>{c.reason}</td>
                                        <td>{c.description}</td>
                                        <td>
                                            <span className={"badge badge-" + (
                                                c.status === "Resolved" ? "success" :
                                                c.status === "Approved" ? "success" :
                                                c.status === "Rejected" ? "danger" : "warning"
                                            )}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                {c.status === "Open" && (
                                                    <button onClick={function () { updateStatus(c._id, "Under Review"); }}>
                                                        Review
                                                    </button>
                                                )}
                                                {c.status === "Under Review" && (
                                                    <>
                                                        <button onClick={function () { updateStatus(c._id, "Approved"); }}>
                                                            Approve
                                                        </button>
                                                        <button onClick={function () { updateStatus(c._id, "Rejected"); }} style={{ background: "#dc2626", color: "white" }}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {(c.status === "Approved" || c.status === "Rejected") && (
                                                    <button onClick={function () { updateStatus(c._id, "Resolved"); }}>
                                                        Mark Resolved
                                                    </button>
                                                )}
                                                {c.status === "Resolved" && (
                                                    <span>Resolved</span>
                                                )}
                                                <button
                                                    onClick={function () { deleteComplaint(c._id); }}
                                                    style={{ background: "#b91c1c", color: "white", padding: "6px 12px" }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
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

export default AdminComplaints;
