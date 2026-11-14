import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function DealerProfile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(function () {
        if (!user) {
            navigate("/login");
        }
    }, []);

    if (!user) return null;

    return (
        <div>
            <Navbar />

            <div className="page" style={{ maxWidth: "600px" }}>
                <h1>Dealer Profile</h1>

                <div className="card" style={{ padding: "20px" }}>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Shop Name:</strong> {user.shopName}</p>
                    <p><strong>City:</strong> {user.city}</p>
                    <p><strong>Pincode:</strong> {user.pincode || "Not provided"}</p>
                    <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
                    <p><strong>Address:</strong> {user.address || "Not provided"}</p>
                    <p><strong>GST Number:</strong> {user.gstNumber || "Not provided"}</p>
                    <p><strong>Account Status:</strong> <span className="badge badge-success">Approved Dealer</span></p>
                </div>
            </div>
        </div>
    );
}

export default DealerProfile;
