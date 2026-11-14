import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";


function AdminOrders() {

    const [orders, setOrders] = useState([]);


    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    const getOrders = async function () {

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/orders"
                );


            const data =
                await response.json();


            if (response.ok) {

                setOrders(data);

            } else {

                alert(
                    data.message ||
                    "Failed to fetch orders"
                );

            }


        } catch (error) {

            console.log(
                "Get orders error:",
                error
            );

        }

    };


    useEffect(function () {

        getOrders();

    }, []);


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateOrder = async function (
        id,
        status
    ) {

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/orders/" + id,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            status:
                                status

                        })

                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                alert(
                    data.message ||
                    "Order status updated successfully"
                );


                getOrders();

            } else {

                alert(
                    data.message ||
                    "Failed to update order"
                );

            }


        } catch (error) {

            console.log(
                "Update order error:",
                error
            );


            alert(
                "Cannot connect to server"
            );

        }

    };

    const deleteOrder = async function (id) {
        if (!window.confirm("Are you sure you want to delete this order?")) {
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/orders/" + id, {
                method: "DELETE"
            });
            const data = await response.json();
            alert(data.message);
            getOrders();
        } catch (error) {
            console.log("Delete order error:", error);
            alert("Cannot connect to server");
        }
    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div>

            <Navbar />


            <div className="page">

                <h1>
                    Order Requests
                </h1>


                {orders.length === 0 ? (

                    <p>
                        No orders placed yet.
                    </p>

                ) : (

                    <table
                        border="1"
                        cellPadding="8"
                    >

                        <thead>

                            <tr>

                                <th>
                                    Order Number
                                </th>

                                <th>
                                    Dealer
                                </th>

                                <th>
                                    Shop
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Payment Method
                                </th>

                                <th>
                                    Payment Status
                                </th>

                                <th>
                                    Order Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {orders.map(
                                function (order) {

                                    return (

                                        <tr
                                            key={
                                                order._id
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        order.orderNumber ||
                                                        order._id
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    order.dealerName
                                                }
                                            </td>


                                            <td>
                                                {
                                                    order.shopName ||
                                                    "-"
                                                }
                                            </td>


                                            <td>

                                                {
                                                    order.items &&
                                                    order.items.length > 0
                                                        ? (

                                                            <ul
                                                                style={{
                                                                    margin: 0,
                                                                    paddingLeft: "18px"
                                                                }}
                                                            >

                                                                {
                                                                    order.items.map(
                                                                        function (
                                                                            item,
                                                                            idx
                                                                        ) {

                                                                            return (

                                                                                <li
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                >

                                                                                    {
                                                                                        item.productName
                                                                                    }

                                                                                    {" — Qty: "}

                                                                                    {
                                                                                        item.quantity
                                                                                    }

                                                                                    {" (₹"}

                                                                                    {
                                                                                        item.price
                                                                                    }

                                                                                    {")"}

                                                                                </li>

                                                                            );

                                                                        }
                                                                    )
                                                                }

                                                            </ul>

                                                        )
                                                        : "-"

                                                }

                                            </td>


                                            <td>

                                                ₹
                                                {
                                                    order.totalAmount
                                                }

                                            </td>


                                            <td>
                                                <span className="badge badge-info">
                                                    {order.paymentMethod || "UPI"}
                                                </span>
                                            </td>


                                            <td>
                                                <span className={"badge badge-" + (
                                                    (order.paymentStatus === "Paid" || order.paymentStatus === "approved")
                                                        ? "success"
                                                        : (order.paymentStatus === "Verification Pending" || order.paymentStatus === "verification_pending")
                                                            ? "warning"
                                                            : (order.paymentStatus === "Rejected" || order.paymentStatus === "rejected")
                                                                ? "danger"
                                                                : "secondary"
                                                )}>
                                                    {order.paymentStatus || "Pending"}
                                                </span>
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        "badge badge-" +
                                                        (
                                                            order.status ===
                                                            "Approved"

                                                                ? "success"

                                                                : order.status ===
                                                                  "Delivered"

                                                                    ? "success"

                                                                    : order.status ===
                                                                      "Dispatched"

                                                                        ? "info"

                                                                        : order.status ===
                                                                          "Rejected"

                                                                            ? "danger"

                                                                            : "warning"
                                                        )
                                                    }
                                                >

                                                    {
                                                        order.status
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {
                                                    order.status ===
                                                    "Pending"

                                                        ? (

                                                            <>

                                                                <button
                                                                    onClick={
                                                                        function () {

                                                                            updateOrder(
                                                                                order._id,
                                                                                "Approved"
                                                                            );

                                                                        }
                                                                    }
                                                                >

                                                                    Approve

                                                                </button>


                                                                <button
                                                                    onClick={
                                                                        function () {

                                                                            updateOrder(
                                                                                order._id,
                                                                                "Rejected"
                                                                            );

                                                                        }
                                                                    }

                                                                    style={{
                                                                        background:
                                                                            "#dc2626",
                                                                        color:
                                                                            "white"
                                                                    }}
                                                                >

                                                                    Reject

                                                                </button>

                                                            </>

                                                        )

                                                        : order.status ===
                                                          "Approved"

                                                            ? (

                                                                <Link
                                                                    to="/admin/shipments"
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        background: "#0284c7",
                                                                        color: "white",
                                                                        padding: "8px 14px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "13px",
                                                                        fontWeight: "bold",
                                                                        display: "inline-block"
                                                                    }}
                                                                >
                                                                    Create Shipment
                                                                </Link>

                                                            )

                                                            : (

                                                                "-"

                                                            )

                                                }

                                                <button
                                                    onClick={() => deleteOrder(order._id)}
                                                    style={{
                                                        background: "#dc2626",
                                                        color: "white",
                                                        marginLeft: "8px"
                                                    }}
                                                >
                                                    Delete Order
                                                </button>

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

}


export default AdminOrders;

