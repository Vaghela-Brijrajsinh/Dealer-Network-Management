import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Invoice from "./Invoice";

function MyOrders() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const dealerId = user?._id || user?.id;

    const [orders, setOrders] = useState([]);
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
    const [selectedPaymentForInvoice, setSelectedPaymentForInvoice] = useState(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    const getOrders = async function () {
        if (!dealerId) return;

        try {
            const response = await fetch("http://localhost:5000/api/orders/dealer/" + dealerId);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(function () {
        if (!user) {
            navigate("/login");
            return;
        }

        getOrders();
    }, []);

    const handleOpenInvoice = async function (order) {
        setLoadingInvoice(true);
        try {
            const res = await fetch(`http://localhost:5000/api/payments/order/${order._id}`);
            const paymentData = await res.json();
            setSelectedPaymentForInvoice(paymentData || null);
            setSelectedOrderForInvoice(order);
        } catch (error) {
            console.log("Fetch payment for invoice error:", error);
            setSelectedOrderForInvoice(order);
        }
        setLoadingInvoice(false);
    };

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>My Orders</h1>

                {orders.length === 0 ? (
                    <p>You have not placed any orders yet.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table border="1" cellPadding="8">
                            <thead>
                                <tr>
                                    <th>Order Number</th>
                                    <th>Products / Items</th>
                                    <th>Total Amount</th>
                                    <th>Payment Method</th>
                                    <th>Order Status</th>
                                    <th>Payment Status</th>
                                    <th>Date</th>
                                    <th>Actions / Invoice</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map(function (order) {
                                    const pStatus = order.paymentStatus || "Pending";
                                    const isPaid = pStatus === "Paid" || pStatus === "approved";
                                    const isPendingVerification = pStatus === "Verification Pending" || pStatus === "verification_pending";
                                    const isRejected = pStatus === "Rejected" || pStatus === "rejected";

                                    return (
                                        <tr key={order._id}>
                                            <td>
                                                <strong>#{order._id.substring(order._id.length - 8)}</strong>
                                            </td>

                                            <td>
                                                {order.items && order.items.length > 0 ? (
                                                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                                        {order.items.map(function (item, idx) {
                                                            return (
                                                                <li key={idx}>
                                                                    {item.productName} — Qty: {item.quantity} (₹{item.price})
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td>₹{order.totalAmount}</td>

                                            <td>
                                                <span className="badge badge-info">{order.paymentMethod || "UPI"}</span>
                                            </td>

                                            <td>
                                                <span className={"badge badge-" + (
                                                    order.status === "Approved" ? "success" :
                                                    order.status === "Delivered" ? "success" :
                                                    order.status === "Dispatched" ? "info" :
                                                    order.status === "Rejected" ? "danger" : "warning"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={"badge badge-" + (
                                                    isPaid ? "success" :
                                                    isPendingVerification ? "warning" :
                                                    isRejected ? "danger" : "secondary"
                                                )}>
                                                    {isPaid ? "Paid ✓" :
                                                     isPendingVerification ? "Verification Pending" :
                                                     isRejected ? "Payment Rejected" :
                                                     order.paymentMethod === "COD" ? "Pending COD" : "Payment Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                                            </td>

                                            <td>
                                                {isPaid ? (
                                                    <button
                                                        onClick={() => handleOpenInvoice(order)}
                                                        style={{ background: "#16a34a", color: "white", padding: "6px 12px", fontSize: "13px" }}
                                                    >
                                                        Download Invoice
                                                    </button>
                                                ) : order.paymentMethod === "COD" ? (
                                                    <span style={{ fontSize: "12px", color: "#666" }}>COD Order</span>
                                                ) : (
                                                    <Link
                                                        to={`/dealer/payment/${order._id}`}
                                                        className="badge badge-info"
                                                        style={{ textDecoration: "none", padding: "6px 10px", display: "inline-block" }}
                                                    >
                                                        {isPendingVerification ? "View Payment Status" : "Pay Now / Submit UTR"}
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedOrderForInvoice && (
                <Invoice
                    order={selectedOrderForInvoice}
                    payment={selectedPaymentForInvoice}
                    onClose={() => setSelectedOrderForInvoice(null)}
                />
            )}
        </div>
    );
}

export default MyOrders;
