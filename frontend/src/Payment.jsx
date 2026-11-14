import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import Navbar from "./Navbar";
import Invoice from "./Invoice";

function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const dealerId = user?._id || user?.id;

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentTab, setPaymentTab] = useState("NEFT_RTGS"); // "UPI" or "NEFT_RTGS"
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const upiId = "Enter your UPI ID";
  const receiverName = "Dealer Network";

  // Static receiving bank details for NEFT / RTGS
  const bankDetails = {
    bankName: "State Bank of India",
    accountNumber: "3892010045612",
    ifscCode: "SBIN0004561",
    accountHolder: "Dealer Network Management",
  };

  const fetchOrderAndPayment = async function () {
    setLoading(true);
    try {
      const orderRes = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
      );
      const orderData = await orderRes.json();

      if (orderRes.ok) {
        setOrder(orderData);
        if (
          orderData.paymentMethod === "NEFT_RTGS" ||
          orderData.paymentMethod === "NEFT/RTGS"
        ) {
          setPaymentTab("NEFT_RTGS");
        } else if (orderData.paymentMethod === "UPI") {
          setPaymentTab("UPI");
        }
      } else {
        setErrorMsg(orderData.message || "Failed to load order");
        setLoading(false);
        return;
      }

      const paymentRes = await fetch(
        `http://localhost:5000/api/payments/order/${orderId}`,
      );
      const paymentData = await paymentRes.json();

      if (paymentRes.ok && paymentData) {
        setPayment(paymentData);
        if (paymentData.transactionId) {
          setTransactionId(paymentData.transactionId);
        }
        if (paymentData.paymentMethod) {
          setPaymentTab(
            paymentData.paymentMethod === "NEFT/RTGS"
              ? "NEFT_RTGS"
              : paymentData.paymentMethod,
          );
        }
      }
    } catch (error) {
      console.log("Fetch error:", error);
      setErrorMsg("Cannot connect to server");
    }
    setLoading(false);
  };

  useEffect(
    function () {
      if (!user) {
        navigate("/login");
        return;
      }
      fetchOrderAndPayment();
    },
    [orderId],
  );

  const handleSubmitPayment = async function (e) {
    e.preventDefault();
    setErrorMsg("");

    const cleanTxId = transactionId.trim();

    if (!cleanTxId) {
      setErrorMsg("Please enter a valid Transaction ID / UTR Number.");
      return;
    }

    if (cleanTxId.length > 10) {
      setErrorMsg("Transaction ID / UTR Number must not exceed 12 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          dealerId: dealerId,
          amount: order.totalAmount,
          transactionId: cleanTxId,
          paymentMethod: paymentTab,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPayment(data.payment);
      } else {
        setErrorMsg(data.message || "Failed to submit payment");
      }
    } catch (error) {
      console.log("Submit error:", error);
      setErrorMsg("Server error. Please try again.");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <h2>Order Not Found</h2>
          <p>{errorMsg}</p>
          <Link to="/dealer/orders">Back to My Orders</Link>
        </div>
      </div>
    );
  }

  const amount = Number(order.totalAmount || 0);
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(receiverName)}&am=${amount.toFixed(2)}&cu=INR`;

  const paymentStatus = payment?.status || order.paymentStatus || "pending";
  const isVerificationPending =
    paymentStatus === "verification_pending" ||
    paymentStatus === "Verification Pending";
  const isApproved = paymentStatus === "approved" || paymentStatus === "Paid";
  const isRejected =
    paymentStatus === "rejected" || paymentStatus === "Rejected";

  return (
    <div>
      <Navbar />
      <div className="page" style={{ maxWidth: "650px", margin: "30px auto" }}>
        <h1>Pay for Order</h1>

        {/* ORDER SUMMARY */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "10px",
            }}
          >
            <span>
              <strong>Order ID:</strong> #
              {order._id.substring(order._id.length - 8)}
            </span>
            <span>
              <strong>Order Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p>
            <strong>Total Amount:</strong>{" "}
            <span
              style={{ fontSize: "20px", color: "#4f46e5", fontWeight: "bold" }}
            >
              ₹{amount}
            </span>
          </p>

          <div>
            <strong>Order Items:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.productName} — Qty: {item.quantity} (₹{item.price} each)
                </li>
              ))}
            </ul>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "6px",
              marginBottom: "15px",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* APPROVED STATUS */}
        {isApproved ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
              padding: "25px",
            }}
          >
            <h2 style={{ color: "#16a34a", margin: "0 0 10px 0" }}>
              Payment Verified Successfully ✓
            </h2>
            <p>
              <strong>Order ID:</strong> #{order._id}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {payment?.paymentMethod === "NEFT_RTGS"
                ? "NEFT / RTGS"
                : payment?.paymentMethod || order.paymentMethod}
            </p>
            {payment?.transactionId && payment.transactionId !== "COD" && (
              <p>
                <strong>Transaction ID / UTR:</strong>{" "}
                <code>{payment.transactionId}</code>
              </p>
            )}
            <p>
              <strong>Amount Paid:</strong> ₹{amount}
            </p>
            <p style={{ color: "#15803d", fontWeight: "bold" }}>
              Your payment details have been verified and approved by admin.
            </p>
            <button
              onClick={() => setShowInvoiceModal(true)}
              style={{
                background: "#16a34a",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                marginTop: "10px",
              }}
            >
              Download Invoice
            </button>
          </div>
        ) : order.paymentMethod === "COD" ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "20px" }}
          >
            <h2 style={{ color: "#16a34a" }}>Cash on Delivery Selected</h2>
            <p>Your order has been placed with Cash on Delivery option.</p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Please pay ₹{amount} in cash upon receipt of shipment.
            </p>
            <Link
              to="/dealer/orders"
              className="badge badge-info"
              style={{
                textDecoration: "none",
                display: "inline-block",
                marginTop: "10px",
              }}
            >
              View My Orders
            </Link>
          </div>
        ) : isVerificationPending ? (
          /* UNDER VERIFICATION STATUS PAGE (REQUIREMENT #22) */
          <div
            className="card"
            style={{
              textAlign: "center",
              background: "#fffbeb",
              borderColor: "#fef08a",
              padding: "25px",
            }}
          >
            <h2 style={{ color: "#d97706", margin: "0 0 15px 0" }}>
              Payment Status: Under Verification
            </h2>

            <div
              style={{
                textAlign: "left",
                background: "#ffffff",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #fde68a",
                margin: "15px 0",
              }}
            >
              <p style={{ margin: "5px 0" }}>
                <strong>Order ID:</strong> #{order._id}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Payment Method:</strong>{" "}
                {payment?.paymentMethod === "NEFT_RTGS"
                  ? "NEFT / RTGS"
                  : payment?.paymentMethod || paymentTab}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Transaction ID / UTR:</strong>{" "}
                <code>{payment?.transactionId || transactionId}</code>
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Amount:</strong> ₹{amount}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Submitted On:</strong>{" "}
                {payment?.createdAt
                  ? new Date(payment.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>

            <p
              style={{ fontSize: "15px", color: "#92400e", fontWeight: "bold" }}
            >
              Your payment details have been submitted successfully and are
              currently under verification.
            </p>
            <p style={{ fontSize: "13px", color: "#78350f" }}>
              Admin will verify your payment details shortly.
            </p>
            <button
              onClick={fetchOrderAndPayment}
              style={{
                background: "#d97706",
                color: "white",
                padding: "8px 18px",
                marginTop: "10px",
              }}
            >
              Refresh Status
            </button>
          </div>
        ) : (
          /* PAYMENT FORM: SCANNER OR NEFT/RTGS */
          <div className="card">
            {isRejected && (
              <div
                style={{
                  padding: "10px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                <strong>Payment Verification Failed.</strong> Please re-submit a
                valid Transaction ID / UTR number or contact support.
              </div>
            )}

            {/* PAYMENT METHOD TABS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setPaymentTab("NEFT_RTGS")}
                style={{
                  flex: 1,
                  padding: "10px",
                  background:
                    paymentTab === "NEFT_RTGS" ? "#4f46e5" : "#e2e8f0",
                  color: paymentTab === "NEFT_RTGS" ? "white" : "#334155",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                Bank Transfer (NEFT / RTGS)
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab("UPI")}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: paymentTab === "UPI" ? "#4f46e5" : "#e2e8f0",
                  color: paymentTab === "UPI" ? "white" : "#334155",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                UPI / QR Scanner
              </button>
            </div>

            {/* TAB 1: NEFT / RTGS BANK DETAILS */}
            {paymentTab === "NEFT_RTGS" ? (
              <div>
                <h2 style={{ textAlign: "center", marginTop: 0 }}>
                  Bank Transfer — NEFT / RTGS
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                    textAlign: "center",
                  }}
                >
                  Please transfer <strong>₹{amount}</strong> manually using your
                  bank app / net banking to our static bank account below:
                </p>

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    margin: "15px 0",
                  }}
                >
                  <p style={{ margin: "6px 0" }}>
                    <strong>Bank Name:</strong> {bankDetails.bankName}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <strong>Account Number:</strong>{" "}
                    <code style={{ fontSize: "15px", fontWeight: "bold" }}>
                      {bankDetails.accountNumber}
                    </code>
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <strong>IFSC Code:</strong>{" "}
                    <code style={{ fontSize: "15px", fontWeight: "bold" }}>
                      {bankDetails.ifscCode}
                    </code>
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <strong>Account Holder Name:</strong>{" "}
                    {bankDetails.accountHolder}
                  </p>
                </div>
              </div>
            ) : (
              /* TAB 2: UPI SCANNER */
              <div style={{ textAlign: "center" }}>
                <h2 style={{ marginTop: 0 }}>Scan QR Code to Pay</h2>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "15px 0",
                  }}
                >
                  <div
                    style={{
                      padding: "15px",
                      background: "white",
                      border: "2px solid #e2e8f0",
                      borderRadius: "10px",
                      display: "inline-block",
                    }}
                  >
                    <QRCodeCanvas value={upiLink} size={200} />
                  </div>
                </div>

                <p style={{ margin: "5px 0" }}>
                  Scan this QR using any UPI app (GPay, PhonePe, Paytm).
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>UPI ID:</strong> {upiId}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Name:</strong> {receiverName}
                </p>
              </div>
            )}

            <hr
              style={{
                margin: "20px 0",
                border: 0,
                borderTop: "1px solid #eee",
              }}
            />

            {/* TRANSACTION ID / UTR FORM */}
            <form
              onSubmit={handleSubmitPayment}
              style={{ textAlign: "center" }}
            >
              <label
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Transaction ID / UTR Number *
              </label>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "0 0 12px 0",
                }}
              >
                After completing payment in your bank/UPI app, enter your
                reference / UTR number below:
              </p>

              <input
                type="text"
                placeholder="Enter NEFT/RTGS Transaction ID or UTR Number"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.slice(0, 10))}
                maxLength={10}
                required
                style={{
                  textAlign: "center",
                  fontSize: "15px",
                  letterSpacing: "1px",
                  padding: "10px",
                }}
              />

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  background: "#4f46e5",
                  color: "white",
                  marginTop: "15px",
                }}
              >
                {submitting ? "Submitting..." : "Submit Payment"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <Invoice
          order={order}
          payment={payment}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}

export default Payment;
