import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import Register from "./Register";
import Login from "./Login";

import Admin from "./Admin";
import DealerRequests from "./DealerRequests";
import ManageDealers from "./ManageDealers";
import AddProduct from "./AddProduct";
import AdminOrders from "./AdminOrders";
import AdminShipments from "./AdminShipments";
import AdminComplaints from "./AdminComplaints";
import AdminContacts from "./AdminContacts";
import AdminCategories from "./AdminCategories";
import AdminPayments from "./AdminPayments";

import Dealer from "./Dealer";
import Cart from "./Cart";
import MyOrders from "./MyOrders";
import MyShipments from "./MyShipments";
import MyComplaints from "./MyComplaints";
import DealerProfile from "./DealerProfile";
import Payment from "./Payment";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/dealer-requests" element={<DealerRequests />} />
                <Route path="/admin/dealers" element={<ManageDealers />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/products" element={<AddProduct />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/shipments" element={<AdminShipments />} />
                <Route path="/admin/complaints" element={<AdminComplaints />} />
                <Route path="/admin/contacts" element={<AdminContacts />} />

                {/* DEALER ROUTES */}
                <Route path="/dealer" element={<Dealer />} />
                <Route path="/dealer/cart" element={<Cart />} />
                <Route path="/dealer/orders" element={<MyOrders />} />
                <Route path="/dealer/payment/:orderId" element={<Payment />} />
                <Route path="/dealer/shipments" element={<MyShipments />} />
                <Route path="/dealer/complaints" element={<MyComplaints />} />
                <Route path="/dealer/profile" element={<DealerProfile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;