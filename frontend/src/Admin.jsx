
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Admin() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [menuOpen, setMenuOpen] = useState(false);

    const [stats, setStats] = useState({
        totalDealers: 0,
        pendingDealers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        activeShipments: 0,
        openComplaints: 0,
        newContacts: 0
    });

    const getData = async function (url) {

        const response = await fetch(url);

        if (!response.ok) {
            return [];
        }

        return await response.json();
    };

    const fetchStats = async function () {

        try {

            const dealers = await getData(
                "http://localhost:5000/api/dealers"
            );

            const pendingDealers = await getData(
                "http://localhost:5000/api/dealers/requests"
            );

            const products = await getData(
                "http://localhost:5000/api/products"
            );

            const orders = await getData(
                "http://localhost:5000/api/orders"
            );

            const shipments = await getData(
                "http://localhost:5000/api/shipments"
            );

            const complaints = await getData(
                "http://localhost:5000/api/complaints"
            );

            const contacts = await getData(
                "http://localhost:5000/api/contacts"
            );

            setStats({

                totalDealers:
                    Array.isArray(dealers)
                        ? dealers.length
                        : 0,

                pendingDealers:
                    Array.isArray(pendingDealers)
                        ? pendingDealers.length
                        : 0,

                totalProducts:
                    Array.isArray(products)
                        ? products.length
                        : 0,

                pendingOrders:
                    Array.isArray(orders)
                        ? orders.filter(function (order) {
                            return order.status === "Pending";
                        }).length
                        : 0,

                activeShipments:
                    Array.isArray(shipments)
                        ? shipments.filter(function (shipment) {
                            return shipment.status !== "Delivered";
                        }).length
                        : 0,

                openComplaints:
                    Array.isArray(complaints)
                        ? complaints.filter(function (complaint) {
                            return complaint.status === "Open";
                        }).length
                        : 0,

                newContacts:
                    Array.isArray(contacts)
                        ? contacts.filter(function (contact) {
                            return contact.status === "New";
                        }).length
                        : 0
            });

        } catch (error) {

            console.log("Dashboard error:", error);

        }
    };

    useEffect(function () {

        if (!user || user.role !== "admin") {

            navigate("/login");

            return;
        }

        fetchStats();

    }, []);

    return (
        <div className="admin-dashboard">

            <Navbar />

            
            <main className="admin-main">

                <h1>Admin Dashboard</h1>

                <p className="admin-welcome">
                    Welcome, {user ? user.name : "Admin"}
                </p>

                <div className="admin-count-grid">

                    <Link
                        to="/admin/dealers"
                        className="admin-count-card"
                    >
                        <h2>{stats.totalDealers}</h2>
                        <p>Total Dealers</p>
                        <small>View dealers</small>
                    </Link>

                    <Link
                        to="/admin/dealer-requests"
                        className="admin-count-card"
                    >
                        <h2>{stats.pendingDealers}</h2>
                        <p>Pending Dealer Requests</p>
                        <small>Review requests</small>
                    </Link>

                    <Link
                        to="/admin/products"
                        className="admin-count-card"
                    >
                        <h2>{stats.totalProducts}</h2>
                        <p>Total Products</p>
                        <small>Manage products</small>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="admin-count-card"
                    >
                        <h2>{stats.pendingOrders}</h2>
                        <p>Pending Orders</p>
                        <small>Review orders</small>
                    </Link>

                    <Link
                        to="/admin/shipments"
                        className="admin-count-card"
                    >
                        <h2>{stats.activeShipments}</h2>
                        <p>Active Shipments</p>
                        <small>Manage shipments</small>
                    </Link>

                    <Link
                        to="/admin/complaints"
                        className="admin-count-card"
                    >
                        <h2>{stats.openComplaints}</h2>
                        <p>Open Complaints</p>
                        <small>View complaints</small>
                    </Link>

                    <Link
                        to="/admin/contacts"
                        className="admin-count-card"
                    >
                        <h2>{stats.newContacts}</h2>
                        <p>New Messages</p>
                        <small>View messages</small>
                    </Link>

                </div>


            </main>

        </div>
    );
}

export default Admin;

