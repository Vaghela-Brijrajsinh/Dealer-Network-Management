import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function MyShipments() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const dealerId = user?._id || user?.id;

    const [shipments, setShipments] = useState([]);

    const getShipments = async function () {
        if (!dealerId) return;

        try {
            const response = await fetch("http://localhost:5000/api/shipments/dealer/" + dealerId);
            const data = await response.json();
            setShipments(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(function () {
        if (!user) {
            navigate("/login");
            return;
        }

        getShipments();
    }, []);

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>My Shipments</h1>

                {shipments.length === 0 ? (
                    <p>No shipments created for your orders yet.</p>
                ) : (
                    <table border="1" cellPadding="8">
                        <thead>
                            <tr>
                                <th>Order No</th>
                                <th>Transport Name</th>
                                <th>Vehicle Number</th>
                                <th>Driver Name</th>
                                <th>Dispatch Date</th>
                                <th>Expected Delivery</th>
                                <th>Delivered Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.map(function (shipment) {
                                return (
                                    <tr key={shipment._id}>
                                        <td><strong>{shipment.orderNumber || shipment.orderId}</strong></td>
                                        <td>{shipment.transportName}</td>
                                        <td>{shipment.vehicleNumber}</td>
                                        <td>{shipment.driverName}</td>
                                        <td>{shipment.dispatchDate || "-"}</td>
                                        <td>{shipment.expectedDate || "-"}</td>
                                        <td>{shipment.deliveredDate || "-"}</td>
                                        <td>
                                            <span className={"badge badge-" + (
                                                shipment.status === "Delivered" ? "success" :
                                                shipment.status === "Dispatched" ? "info" : "warning"
                                            )}>
                                                {shipment.status}
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

export default MyShipments;