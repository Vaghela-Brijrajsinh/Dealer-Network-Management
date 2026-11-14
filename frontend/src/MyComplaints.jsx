import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function MyComplaints() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const dealerId = user?._id || user?.id;

    const [complaints, setComplaints] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("Damaged Product");
    const [description, setDescription] = useState("");

    const getComplaints = async function () {
        if (!dealerId) return;

        try {
            const response = await fetch("http://localhost:5000/api/complaints/dealer/" + dealerId);
            const data = await response.json();
            setComplaints(data);
        } catch (error) {
            console.log(error);
        }
    };

    const getDeliveredOrders = async function () {
        if (!dealerId) return;

        try {
            const response = await fetch("http://localhost:5000/api/orders/dealer/" + dealerId);
            const data = await response.json();
            // Filter delivered orders only
            const delivered = data.filter(function (order) {
                return order.status === "Delivered";
            });
            setDeliveredOrders(delivered);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(function () {
        if (!user) {
            navigate("/login");
            return;
        }

        getComplaints();
        getDeliveredOrders();
    }, []);

    // Submit new complaint
    const submitComplaint = async function (e) {
        e.preventDefault();

        if (!dealerId) {
            alert("Session expired. Please login again.");
            navigate("/login");
            return;
        }

        if (!selectedOrder || !selectedProduct) {
            alert("Please select a delivered order and a product");
            return;
        }

        const cleanDescription = description.trim();
        if (!cleanDescription) {
            alert("Description cannot be empty.");
            return;
        }

        const numQty = Number(quantity);
        if (isNaN(numQty) || numQty < 1 || !Number.isInteger(numQty)) {
            alert("Quantity must be a positive whole number.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dealerId: dealerId,
                    orderId: selectedOrder,
                    productId: selectedProduct,
                    quantity: quantity,
                    reason: reason,
                    description: description
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "Complaint submitted successfully!");
                setSelectedOrder("");
                setSelectedProduct("");
                setQuantity("1");
                setDescription("");
                getComplaints();
            } else {
                alert(data.message || "Failed to submit complaint");
            }
        } catch (error) {
            console.log(error);
            alert("Cannot connect to server");
        }
    };

    // Find items for selected delivered order
    const currentOrderObj = deliveredOrders.find(function (o) { return o._id === selectedOrder; });
    const orderItemsList = currentOrderObj ? (currentOrderObj.items || []) : [];

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>My Complaints</h1>

                <h2>Raise New Complaint</h2>
                <p style={{ color: "#666" }}>You can only raise complaints for your <strong>Delivered</strong> orders.</p>

                {deliveredOrders.length === 0 ? (
                    <p style={{ color: "#d9534f" }}>You have no Delivered orders yet. Complaints can only be filed after order delivery.</p>
                ) : (
                    <form onSubmit={submitComplaint} style={{ maxWidth: "600px", marginBottom: "40px" }}>
                        <div>
                            <label>Select Delivered Order *</label>
                            <select
                                value={selectedOrder}
                                onChange={function (e) {
                                    setSelectedOrder(e.target.value);
                                    setSelectedProduct("");
                                }}
                                required
                            >
                                <option value="">-- Choose Order --</option>
                                {deliveredOrders.map(function (order) {
                                    return (
                                        <option key={order._id} value={order._id}>
                                            Order #{order.orderNumber || order._id} (Total: ₹{order.totalAmount})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {selectedOrder && (
                            <div>
                                <label>Select Problematic Product *</label>
                                <select
                                    value={selectedProduct}
                                    onChange={function (e) { setSelectedProduct(e.target.value); }}
                                    required
                                >
                                    <option value="">-- Choose Product --</option>
                                    {orderItemsList.map(function (item) {
                                        return (
                                            <option key={item.productId} value={item.productId}>
                                                {item.productName} (Ordered Qty: {item.quantity})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}

                        <div>
                            <label>Quantity Affected *</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={function (e) { setQuantity(e.target.value); }}
                                required
                            />
                        </div>

                        <div>
                            <label>Reason *</label>
                            <select
                                value={reason}
                                onChange={function (e) { setReason(e.target.value); }}
                            >
                                <option value="Damaged Product">Damaged Product</option>
                                <option value="Wrong Product">Wrong Product</option>
                                <option value="Missing Product">Missing Product</option>
                                <option value="Quantity Problem">Quantity Problem</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label>Detailed Description *</label>
                            <textarea
                                rows="4"
                                value={description}
                                onChange={function (e) { setDescription(e.target.value); }}
                                placeholder="Explain the problem in detail..."
                                required
                            />
                        </div>

                        <button type="submit">Submit Complaint</button>
                    </form>
                )}

                <h2>Complaint History</h2>
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

export default MyComplaints;