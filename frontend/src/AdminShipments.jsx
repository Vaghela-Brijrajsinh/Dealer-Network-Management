import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function AdminShipments() {
    const [shipments, setShipments] = useState([]);
    const [approvedOrders, setApprovedOrders] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState("");
    const [transportName, setTransportName] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [driverName, setDriverName] = useState("");
    const [expectedDate, setExpectedDate] = useState("");

    const getShipments = async function () {
        try {
            const response = await fetch(
                "http://localhost:5000/api/shipments"
            );

            const data = await response.json();

            if (response.ok) {
                setShipments(data);
            } else {
                setShipments([]);
            }
        } catch (error) {
            console.log("Get shipments error:", error);
        }
    };

    const getApprovedOrders = async function () {
        try {
            const response = await fetch(
                "http://localhost:5000/api/orders"
            );

            const data = await response.json();

            if (response.ok && Array.isArray(data)) {
                const approved = data.filter(function (order) {
                    return order.status === "Approved";
                });

                setApprovedOrders(approved);
            } else {
                setApprovedOrders([]);
            }
        } catch (error) {
            console.log("Get orders error:", error);
        }
    };

    useEffect(function () {
        getShipments();
        getApprovedOrders();
    }, []);

    const createShipment = async function (e) {
        e.preventDefault();

        if (!selectedOrder) {
            alert("Please select an approved order");
            return;
        }

        // Transport / Courier validation
        const cleanTransport = transportName.trim();

        if (!cleanTransport) {
            alert("Transport / Courier name is required.");
            return;
        }

        if (!/^[A-Za-z0-9 ]+$/.test(cleanTransport)) {
            alert(
                "Transport / Courier name can contain only alphabets, numbers and spaces."
            );
            return;
        }

        // Vehicle number validation
        const cleanVehicle = vehicleNumber.replace(/\s/g, "").toUpperCase();

        if (!cleanVehicle) {
            alert("Vehicle number is required.");
            return;
        }

        if (!/^[A-Z]{2}[A-Z0-9]*$/.test(cleanVehicle)) {
            alert(
                "Vehicle number must start with alphabets and contain only alphabets and numbers."
            );
            return;
        }

        // Driver name validation
        const cleanDriver = driverName.trim();

        if (!cleanDriver) {
            alert("Driver name is required.");
            return;
        }

        if (!/^[A-Za-z ]+$/.test(cleanDriver)) {
            alert(
                "Driver name can contain alphabets and spaces only."
            );
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/shipments",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        orderId: selectedOrder,
                        transportName: cleanTransport,
                        vehicleNumber: cleanVehicle,
                        driverName: cleanDriver,
                        expectedDate: expectedDate
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert(
                    data.message ||
                    "Shipment created successfully!"
                );

                setSelectedOrder("");
                setTransportName("");
                setVehicleNumber("");
                setDriverName("");
                setExpectedDate("");

                getShipments();
                getApprovedOrders();
            } else {
                alert(
                    data.message ||
                    "Failed to create shipment"
                );
            }
        } catch (error) {
            console.log("Create shipment error:", error);
            alert("Cannot connect to server");
        }
    };

    const updateShipmentStatus = async function (
        id,
        newStatus
    ) {
        try {
            const response = await fetch(
                "http://localhost:5000/api/shipments/" +
                id +
                "/status",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert(
                    data.message ||
                    "Shipment status updated"
                );

                getShipments();
            } else {
                alert(
                    data.message ||
                    "Failed to update shipment"
                );
            }
        } catch (error) {
            console.log(
                "Update shipment error:",
                error
            );

            alert("Cannot connect to server");
        }
    };

    const deleteShipment = async function (id) {
        if (
            !window.confirm(
                "Are you sure you want to delete this shipment?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/shipments/" + id,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            alert(data.message);

            getShipments();
            getApprovedOrders();
        } catch (error) {
            console.log(
                "Delete shipment error:",
                error
            );

            alert("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>Shipment Management</h1>

                <h2>Create New Shipment</h2>

                <p>
                    Shipments can only be created for
                    <strong> Approved </strong>
                    orders.
                </p>

                {approvedOrders.length === 0 ? (
                    <p>
                        No Approved orders waiting for
                        shipment dispatch right now.
                    </p>
                ) : (
                    <form
                        onSubmit={createShipment}
                        style={{
                            maxWidth: "600px",
                            marginBottom: "40px"
                        }}
                    >
                        <label>
                            Select Approved Order *
                        </label>

                        <select
                            value={selectedOrder}
                            onChange={function (e) {
                                setSelectedOrder(
                                    e.target.value
                                );
                            }}
                            required
                        >
                            <option value="">
                                -- Choose Approved Order --
                            </option>

                            {approvedOrders.map(
                                function (order) {
                                    return (
                                        <option
                                            key={order._id}
                                            value={order._id}
                                        >
                                            Order #
                                            {
                                                order.orderNumber ||
                                                order._id
                                            }
                                            {" "}
                                            (Dealer:
                                            {" "}
                                            {
                                                order.dealerName ||
                                                order.dealerId
                                            }
                                            )
                                        </option>
                                    );
                                }
                            )}
                        </select>

                        <label>
                            Transport / Courier Name *
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Express Cargo"
                            value={transportName}
                            onChange={function (e) {
                                setTransportName(
                                    e.target.value.replace(
                                        /[^A-Za-z0-9 ]/g,
                                        ""
                                    )
                                );
                            }}
                            required
                        />

                        <label>
                            Vehicle Number *
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. GJ01AB1234"
                            value={vehicleNumber}
                            onChange={function (e) {
                                setVehicleNumber(
                                    e.target.value
                                        .replace(/\s/g, "")
                                        .replace(
                                            /[^A-Za-z0-9]/g,
                                            ""
                                        )
                                        .toUpperCase()
                                );
                            }}
                            required
                        />

                        <label>
                            Driver Name *
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Ramesh Kumar"
                            value={driverName}
                            onChange={function (e) {
                                setDriverName(
                                    e.target.value.replace(
                                        /[^A-Za-z ]/g,
                                        ""
                                    )
                                );
                            }}
                            required
                        />

                        <label>
                            Expected Delivery Date
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Within 3 days"
                            value={expectedDate}
                            onChange={function (e) {
                                setExpectedDate(
                                    e.target.value
                                );
                            }}
                        />

                        <button type="submit">
                            Create Shipment
                        </button>
                    </form>
                )}

                <h2>All Shipments</h2>

                {shipments.length === 0 ? (
                    <p>
                        No shipments created yet.
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Order No</th>
                                <th>Transport</th>
                                <th>Vehicle No</th>
                                <th>Driver</th>
                                <th>Dispatch Date</th>
                                <th>Delivered Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {shipments.map(
                                function (shipment) {
                                    return (
                                        <tr
                                            key={
                                                shipment._id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        shipment.orderNumber ||
                                                        shipment.orderId?._id ||
                                                        "-"
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    shipment.transportName
                                                }
                                            </td>

                                            <td>
                                                {
                                                    shipment.vehicleNumber
                                                }
                                            </td>

                                            <td>
                                                {
                                                    shipment.driverName
                                                }
                                            </td>

                                            <td>
                                                {
                                                    shipment.dispatchDate ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    shipment.deliveredDate ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "badge badge-" +
                                                        (
                                                            shipment.status ===
                                                            "Delivered"
                                                                ? "success"
                                                                : shipment.status ===
                                                                  "Dispatched"
                                                                ? "info"
                                                                : "warning"
                                                        )
                                                    }
                                                >
                                                    {
                                                        shipment.status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {
                                                    shipment.status ===
                                                    "Preparing" && (
                                                        <button
                                                            onClick={
                                                                function () {
                                                                    updateShipmentStatus(
                                                                        shipment._id,
                                                                        "Dispatched"
                                                                    );
                                                                }
                                                            }
                                                        >
                                                            Dispatch Shipment
                                                        </button>
                                                    )
                                                }

                                                {
                                                    shipment.status ===
                                                    "Dispatched" && (
                                                        <button
                                                            onClick={
                                                                function () {
                                                                    updateShipmentStatus(
                                                                        shipment._id,
                                                                        "Delivered"
                                                                    );
                                                                }
                                                            }
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )
                                                }

                                                {
                                                    shipment.status ===
                                                    "Delivered" && (
                                                        <span>
                                                            Completed
                                                        </span>
                                                    )
                                                }

                                                <button
                                                    onClick={() =>
                                                        deleteShipment(
                                                            shipment._id
                                                        )
                                                    }
                                                    style={{
                                                        background:
                                                            "#dc2626",
                                                        color:
                                                            "white",
                                                        marginLeft:
                                                            "8px"
                                                    }}
                                                >
                                                    Delete Shipment
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

export default AdminShipments;