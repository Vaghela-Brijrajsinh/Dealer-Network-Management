import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const logout = function () {
        localStorage.removeItem("user");
        localStorage.removeItem("dealer_cart");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <h2>Dealer Network Management</h2>

            <div>
                {!user ? (
                    <>
                        <Link to="/">Home</Link>
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : user.role === "admin" ? (
                    <>
                        <Link to="/admin">Dashboard</Link>
                        <Link to="/admin/categories">Categories</Link>
                        <Link to="/admin/products">Products</Link>
                        <Link to="/admin/orders">Orders</Link>
                        <Link to="/admin/payments">Payments</Link>
                        <Link to="/admin/shipments">Shipments</Link>
                        <Link to="/admin/complaints">Complaints</Link>
                        <Link to="/admin/dealers">Dealers</Link>
                        <Link to="/admin/contacts">Contacts</Link>
                        
                        <button onClick={logout} className="nav-logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/dealer">Dashboard</Link>
                        <Link to="/dealer">Products</Link>
                        <Link to="/dealer/orders">My Orders</Link>
                        <Link to="/dealer/shipments">My Shipments</Link>
                        <Link to="/contact">Contact Us</Link>
                        <Link to="/dealer/complaints">My Complaints</Link>
                        <button onClick={logout} className="nav-logout-btn">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
