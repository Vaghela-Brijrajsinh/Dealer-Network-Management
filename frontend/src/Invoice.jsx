import React from "react";

function Invoice({ order, payment, onClose }) {
    if (!order) return null;

    const dealer = order.dealerId && typeof order.dealerId === "object" ? order.dealerId : {};
    const dealerName = dealer.name || order.dealerName || "Dealer";
    const shopName = dealer.shopName || order.shopName || "";
    const district = dealer.district || "";
    const taluka = dealer.taluka || "";
    const pincode = dealer.pincode || "";
    const address = dealer.address || "";
    const gstNumber = dealer.gstNumber || "";

    const handlePrint = function () {
        window.print();
    };

    const invoiceNo = "INV-" + (order._id ? order._id.substring(order._id.length - 6).toUpperCase() : "0000");

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px"
        }}>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div style={{
                background: "white",
                padding: "30px",
                borderRadius: "8px",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
            }}>
                <div id="printable-invoice">
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #333", paddingBottom: "15px", marginBottom: "20px" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1e1b3a" }}>TAX INVOICE</h2>
                            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>Dealer Network Management</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <h3 style={{ margin: 0, color: "#4f46e5" }}>{invoiceNo}</h3>
                            <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            {payment?.verifiedAt && (
                                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#16a34a" }}>
                                    Approval Date: {new Date(payment.verifiedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                        <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Billed To (Dealer):</h4>
                            <p style={{ margin: "2px 0", fontWeight: "bold" }}>{dealerName}</p>
                            {shopName && <p style={{ margin: "2px 0" }}>Shop: {shopName}</p>}
                            {district && taluka && (
                                <p style={{ margin: "2px 0" }}>Location: {taluka}, {district}, Gujarat</p>
                            )}
                            {pincode && <p style={{ margin: "2px 0" }}>Pincode: {pincode}</p>}
                            {address && <p style={{ margin: "2px 0" }}>Address: {address}</p>}
                            {gstNumber && <p style={{ margin: "2px 0" }}>GSTIN: {gstNumber}</p>}
                        </div>

                        <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Order & Payment Info:</h4>
                            <p style={{ margin: "2px 0" }}><strong>Order ID:</strong> #{order._id}</p>
                            <p style={{ margin: "2px 0" }}><strong>Payment Method:</strong> {order.paymentMethod || payment?.paymentMethod || "UPI"}</p>
                            {payment?.transactionId && payment.transactionId !== "COD" ? (
                                <p style={{ margin: "2px 0" }}><strong>UPI Transaction ID / UTR:</strong> {payment.transactionId}</p>
                            ) : (
                                <p style={{ margin: "2px 0" }}><strong>Payment Option:</strong> Cash on Delivery (Payment Received)</p>
                            )}
                            <p style={{ margin: "2px 0" }}>
                                <strong>Payment Status:</strong>{" "}
                                <span style={{ color: "#16a34a", fontWeight: "bold" }}>PAID ✓</span>
                            </p>
                        </div>
                    </div>

                    <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                        <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                                <th style={{ textAlign: "left" }}>#</th>
                                <th style={{ textAlign: "left" }}>Item Description</th>
                                <th style={{ textAlign: "right" }}>Qty</th>
                                <th style={{ textAlign: "right" }}>Unit Price</th>
                                <th style={{ textAlign: "right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        <strong>{item.productName}</strong>
                                    </td>
                                    <td style={{ textAlign: "right" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>₹{item.price}</td>
                                    <td style={{ textAlign: "right" }}>₹{item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
                        <div style={{ width: "260px", borderTop: "2px solid #333", paddingTop: "10px", textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold" }}>
                                <span>Grand Total:</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#166534", fontWeight: "600" }}>
                                * Prices are inclusive of SGST and CGST
                            </p>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px", textAlign: "center", fontSize: "12px", color: "#666" }}>
                        <p style={{ margin: 0 }}>This is a computer-generated invoice for Dealer Network Management System.</p>
                    </div>
                </div>

                <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <button onClick={handlePrint} style={{ background: "#4f46e5", color: "white", padding: "8px 16px" }}>
                        Print / Save PDF
                    </button>
                    <button onClick={onClose} style={{ background: "#64748b", color: "white", padding: "8px 16px" }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Invoice;
