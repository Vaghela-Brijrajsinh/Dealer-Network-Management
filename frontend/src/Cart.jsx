import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Cart() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const dealerId = user?._id || user?.id;

    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("UPI"); // "UPI" or "COD"
    const [loading, setLoading] = useState(false);

    useEffect(function () {
        if (!user) {
            navigate("/login");
            return;
        }

        const savedCart = JSON.parse(localStorage.getItem("dealer_cart") || "[]");
        setCart(savedCart);
    }, []);

    const updateQuantity = function (productId, newQty) {
        let qty = Number(newQty);
        if (qty < 1) qty = 1;

        const updated = cart.map(function (item) {
            if (item.productId === productId) {
                const availableStock = Number(item.stock);

                if (!isNaN(availableStock) && availableStock >= 0 && qty > availableStock) {
                    alert("Only " + availableStock + " products are available.");
                    qty = availableStock;
                }

                return {
                    ...item,
                    quantity: qty
                };
            }
            return item;
        });

        setCart(updated);
        localStorage.setItem("dealer_cart", JSON.stringify(updated));
    };

    const removeItem = function (productId) {
        const updated = cart.filter(item => item.productId !== productId);
        setCart(updated);
        localStorage.setItem("dealer_cart", JSON.stringify(updated));
    };

    const calculateTotal = function () {
        let total = 0;
        for (let i = 0; i < cart.length; i++) {
            total = total + (Number(cart[i].price) * Number(cart[i].quantity));
        }
        return total;
    };

    const checkStock = function () {
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const availableStock = Number(item.stock);
            const requestedQuantity = Number(item.quantity);

            if (!isNaN(availableStock) && availableStock >= 0 && requestedQuantity > availableStock) {
                alert(item.productName + ": Only " + availableStock + " products are available.");
                return false;
            }
        }
        return true;
    };

    const placeOrder = async function () {
        if (!dealerId) {
            alert("Session expired. Please login again.");
            navigate("/login");
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty");
            return;
        }

        if (!checkStock()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dealerId: dealerId,
                    items: cart,
                    paymentMethod: paymentMethod
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCart([]);
                localStorage.removeItem("dealer_cart");

                if (paymentMethod === "COD") {
                    alert(data.message || "Order placed successfully with Cash on Delivery!");
                    navigate("/dealer/orders");
                } else {
                    // Redirect to payment QR page for UPI payment
                    alert("Order created! Proceeding to UPI Payment...");
                    navigate(`/dealer/payment/${data.order._id}`);
                }
            } else {
                alert(data.message || "Failed to place order");
            }
        } catch (error) {
            console.log("Place order error:", error);
            alert("Cannot connect to server");
        }

        setLoading(false);
    };

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>My Cart</h1>

                {cart.length === 0 ? (
                    <div>
                        <p>Your cart is currently empty.</p>
                        <Link to="/dealer">Browse Available Products</Link>
                    </div>
                ) : (
                    <div>
                        <table border="1" cellPadding="8">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Available Stock</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.productId}>
                                        <td><strong>{item.productName}</strong></td>
                                        <td>₹{item.price}</td>
                                        <td>{item.stock !== undefined ? item.stock : "N/A"}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.stock !== undefined ? item.stock : undefined}
                                                value={item.quantity}
                                                onChange={e => updateQuantity(item.productId, e.target.value)}
                                                style={{ width: "70px", padding: "5px" }}
                                            />
                                        </td>
                                        <td>₹{Number(item.price) * Number(item.quantity)}</td>
                                        <td>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                style={{ background: "#dc2626", color: "white" }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold" }}>
                            Total Amount: ₹{calculateTotal()}
                        </div>

                        {/* DELIVERY ADDRESS & CHARGES NOTICE */}
                        <div className="card" style={{ marginTop: "15px", background: "#f8fafc", borderColor: "#cbd5e1" }}>
                            <h4 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>📦 Delivery Information</h4>
                            <p style={{ margin: "3px 0", fontSize: "14px", color: "#334155" }}>
                                <strong>Delivery Address:</strong> Same as your registered shop address ({user?.shopName || "Shop"}, {user?.address || ""}, {user?.taluka ? `${user.taluka}, ${user.district}` : ""})
                            </p>
                            <p style={{ margin: "3px 0", fontSize: "13px", color: "#d97706", fontWeight: "500" }}>
                                ℹ️ Note: Delivery charges are not included in the total amount.
                            </p>
                        </div>

                        {/* PAYMENT METHOD SELECTION */}
                        <div className="card" style={{ marginTop: "15px", maxWidth: "450px" }}>
                            <h3>Select Payment Option</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="UPI"
                                        checked={paymentMethod === "UPI"}
                                        onChange={() => setPaymentMethod("UPI")}
                                    />
                                    <strong>UPI / Online Payment (QR Code)</strong>
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="NEFT_RTGS"
                                        checked={paymentMethod === "NEFT_RTGS"}
                                        onChange={() => setPaymentMethod("NEFT_RTGS")}
                                    />
                                    <strong>Bank Transfer (NEFT / RTGS)</strong>
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                    />
                                    <strong>Cash on Delivery (COD)</strong>
                                </label>
                            </div>
                        </div>

                        <br />

                        <button
                            onClick={placeOrder}
                            disabled={loading}
                            style={{
                                padding: "12px 25px",
                                fontSize: "16px",
                                background: "#4f46e5",
                                color: "white"
                            }}
                        >
                            {loading
                                ? "Processing Order..."
                                : paymentMethod === "COD"
                                    ? "Place Order (Cash on Delivery)"
                                    : paymentMethod === "NEFT_RTGS"
                                        ? "Proceed to Bank Details & UTR Entry"
                                        : "Proceed to UPI Payment & QR Code"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;