import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const fetchPayments = async function () {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/payments");
            const data = await response.json();
            if (response.ok) {
                setPayments(data);
            } else {
                alert(data.message || "Failed to fetch payments");
            }
        } catch (error) {
            console.log("Fetch payments error:", error);
        }
        setLoading(false);
    };

    useEffect(function () {
        fetchPayments();
    }, []);

    const handleVerify = async function (paymentId, action) {
        const actionLabel = action === "approve" ? "approve" : "reject";
        if (!window.confirm(`Are you sure you want to ${actionLabel} this payment?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/verify`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: action,
                    adminId: user?._id || user?.id
                })
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                fetchPayments();
            }
        } catch (error) {
            console.log(error);
            alert("Cannot connect to server");
        }
    };

    const handleDelete = async function (paymentId) {
        if (!window.confirm("Are you sure you want to delete this payment record permanently from database?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/payments/${paymentId}`, {
                method: "DELETE"
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                fetchPayments();
            }
        } catch (error) {
            console.log("Delete payment error:", error);
            alert("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="page">
                <h1>Payment Verifications</h1>

                {loading ? (
                    <p>Loading payments...</p>
                ) : payments.length === 0 ? (
                    <p>No payment records submitted yet.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table border="1" cellPadding="8">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Dealer Name</th>
                                    <th>Shop Name</th>
                                    <th>District & Taluka</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Transaction ID / UTR</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => {
                                    const dealer = payment.dealerId || {};
                                    const order = payment.orderId || {};

                                    let badgeColor = "warning";
                                    let statusText = payment.status;

                                    if (payment.status === "approved") {
                                        badgeColor = "success";
                                        statusText = "Approved";
                                    } else if (payment.status === "rejected") {
                                        badgeColor = "danger";
                                        statusText = "Rejected";
                                    } else if (payment.status === "verification_pending") {
                                        badgeColor = "warning";
                                        statusText = "Verification Pending";
                                    }

                                    return (
                                        <tr key={payment._id}>
                                            <td>
                                                <strong>#{order._id ? order._id.substring(order._id.length - 8) : payment.orderId}</strong>
                                            </td>
                                            <td>{dealer.name || "N/A"}</td>
                                            <td>{dealer.shopName || "-"}</td>
                                            <td>
                                                {dealer.district && dealer.taluka
                                                    ? `${dealer.taluka}, ${dealer.district}`
                                                    : "-"}
                                            </td>
                                            <td>₹{payment.amount}</td>
                                            <td>
                                                <span className="badge badge-info">{payment.paymentMethod}</span>
                                            </td>
                                            <td>
                                                <code style={{ fontSize: "14px", fontWeight: "bold" }}>
                                                    {payment.transactionId || "N/A (COD)"}
                                                </code>
                                            </td>
                                            <td>
                                                {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "-"}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${badgeColor}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                             <td>
                                                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                    {payment.status === "verification_pending" ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleVerify(payment._id, "approve")}
                                                                style={{ background: "#16a34a", color: "white", padding: "6px 12px" }}
                                                            >
                                                                {payment.paymentMethod === "COD" ? "Mark Payment Received" : "Approve Payment"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleVerify(payment._id, "reject")}
                                                                style={{ background: "#dc2626", color: "white", padding: "6px 12px" }}
                                                            >
                                                                Reject Payment
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: "12px", color: "#666", marginRight: "6px" }}>
                                                            Verified on {payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleDateString() : "-"}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(payment._id)}
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPayments;
