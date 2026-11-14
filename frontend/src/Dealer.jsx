import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Dealer() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const dealerId = user?._id || user?.id;

    const [products, setProducts] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [quantity, setQuantity] = useState({});
    const [cartCount, setCartCount] = useState(0);

    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        deliveredOrders: 0,
        openComplaints: 0
    });


    const getProducts = async function (pageNumber) {
        try {
            const response = await fetch(
                "http://localhost:5000/api/products/dealer?page=" + pageNumber
            );

            const data = await response.json();

            setProducts(data.products);
            setPage(data.currentPage);
            setTotalPages(data.totalPages);

        } catch (error) {
            console.log("Fetch products error:", error);
        }
    };


    // ============================
    // GET DEALER STATS
    // ============================

    const getDealerStats = async function () {
        if (!dealerId) {
            return;
        }

        try {
            const ordersResponse = await fetch(
                "http://localhost:5000/api/orders/dealer/" +
                dealerId
            );

            const orders = await ordersResponse.json();


            const complaintsResponse = await fetch(
                "http://localhost:5000/api/complaints/dealer/" +
                dealerId
            );

            const complaints = await complaintsResponse.json();


            setStats({
                totalOrders: Array.isArray(orders)
                    ? orders.length
                    : 0,

                pendingOrders: Array.isArray(orders)
                    ? orders.filter(function (order) {
                        return order.status === "Pending";
                    }).length
                    : 0,

                approvedOrders: Array.isArray(orders)
                    ? orders.filter(function (order) {
                        return order.status === "Approved";
                    }).length
                    : 0,

                deliveredOrders: Array.isArray(orders)
                    ? orders.filter(function (order) {
                        return order.status === "Delivered";
                    }).length
                    : 0,

                openComplaints: Array.isArray(complaints)
                    ? complaints.filter(function (complaint) {
                        return complaint.status === "Open";
                    }).length
                    : 0
            });

        } catch (error) {
            console.log(error);
        }
    };


    // ============================
    // CART COUNT
    // ============================

    const updateCartCount = function () {
        const cart = JSON.parse(
            localStorage.getItem("dealer_cart") || "[]"
        );

        setCartCount(cart.length);
    };


    // first page

    useEffect(function () {
        if (!user || user.role !== "dealer") {
            navigate("/login");
            return;
        }

        getProducts(1);
        getDealerStats();
        updateCartCount();

    }, []);


    // change page

    const changePage = function (newPage) {
        if (newPage < 1 || newPage > totalPages) {
            return;
        }

        getProducts(newPage);
    };


    
    // ADD TO CART
    

    const addToCart = function (product) {
        const qty = Number(
            quantity[product._id] || 1
        );

        if (product.stock <= 0) {
            alert("This product is currently Out of Stock.");
            return;
        }

        if (qty < 1) {
            alert("Quantity must be at least 1");
            return;
        }


        const cart = JSON.parse(
            localStorage.getItem("dealer_cart") || "[]"
        );


        const index = cart.findIndex(function (item) {
            return item.productId === product._id;
        });


        if (index !== -1) {

            const oldQuantity = Number(
                cart[index].quantity
            );

            const newQuantity = oldQuantity + qty;


            if (newQuantity > product.stock) {
                alert(
                    "Only " +
                    product.stock +
                    " products are available in stock."
                );

                return;
            }


            cart[index].quantity = newQuantity;
            cart[index].stock = product.stock;

        } else {

            if (qty > product.stock) {
                alert(
                    "Only " +
                    product.stock +
                    " products are available in stock."
                );

                return;
            }


            cart.push({
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity: qty,
                stock: product.stock
            });
        }


        localStorage.setItem(
            "dealer_cart",
            JSON.stringify(cart)
        );

        updateCartCount();

        alert(
            product.name +
            " added to your cart!"
        );
    };


    // ============================
    // PAGE
    // ============================

    return (
        <div>

            <Navbar />


            <div className="page dealer-page">

                <h1>Dealer Dashboard</h1>


                <p>
                    Welcome{" "}
                    <strong>
                        {user ? user.name : ""}
                    </strong>{" "}
                    (
                    {user ? user.shopName : ""}
                    )
                </p>


                {/* ================= STATS ================= */}

                <div
                    className="metrics-grid"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "15px",
                        margin: "20px 0"
                    }}
                >

                    <div
                        className="card"
                        onClick={function () {
                            navigate("/dealer/orders");
                        }}
                        style={{
                            flex: "1 1 150px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                    >
                        <h3>{stats.totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>


                    <div
                        className="card"
                        onClick={function () {
                            navigate(
                                "/dealer/orders?status=Pending"
                            );
                        }}
                        style={{
                            flex: "1 1 150px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                    >
                        <h3>{stats.pendingOrders}</h3>
                        <p>Pending Orders</p>
                    </div>


                    <div
                        className="card"
                        onClick={function () {
                            navigate(
                                "/dealer/orders?status=Approved"
                            );
                        }}
                        style={{
                            flex: "1 1 150px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                    >
                        <h3>{stats.approvedOrders}</h3>
                        <p>Approved Orders</p>
                    </div>


                    <div
                        className="card"
                        onClick={function () {
                            navigate(
                                "/dealer/orders?status=Delivered"
                            );
                        }}
                        style={{
                            flex: "1 1 150px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                    >
                        <h3>{stats.deliveredOrders}</h3>
                        <p>Delivered Orders</p>
                    </div>


                    <div
                        className="card"
                        onClick={function () {
                            navigate("/dealer/complaints");
                        }}
                        style={{
                            flex: "1 1 150px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                    >
                        <h3>{stats.openComplaints}</h3>
                        <p>Open Complaints</p>
                    </div>

                </div>


                {/* ================= PRODUCTS TITLE ================= */}

                <div
                    style={{
                        margin: "20px 0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >

                    <h2>Active Products</h2>


                    <Link
                        to="/dealer/cart"
                        className="badge badge-info"
                        style={{
                            fontSize: "16px",
                            padding: "10px 15px",
                            textDecoration: "none"
                        }}
                    >
                        View Cart ({cartCount} items)
                    </Link>

                </div>


                {/* ================= PRODUCTS ================= */}

                <div className="dealer-products">

                    {products.length === 0 ? (

                        <p>
                            No products available right now.
                        </p>

                    ) : (

                        products.map(function (product) {

                            return (
                                <div
                                    className="dealer-product card"
                                    key={product._id}
                                >

                                    <img
                                        src={
                                            "http://localhost:5000/uploads/" +
                                            product.image
                                        }
                                        alt={product.name}
                                    />


                                    <h3>
                                        {product.name}
                                    </h3>


                                    <p>
                                        Category:{" "}
                                        {product.category || "-"}
                                    </p>


                                    <p>
                                        Price: ₹{product.price}
                                    </p>


                                    <p>
                                        Stock: {product.stock}
                                    </p>


                                    <p>
                                        {product.description}
                                    </p>


                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        disabled={
                                            product.stock <= 0
                                        }
                                        value={
                                            quantity[product._id] ||
                                            "1"
                                        }
                                        onChange={function (e) {
                                            setQuantity({
                                                ...quantity,
                                                [product._id]:
                                                    e.target.value
                                            });
                                        }}
                                    />


                                    <button
                                        disabled={
                                            product.stock <= 0
                                        }
                                        onClick={function () {
                                            addToCart(product);
                                        }}
                                    >

                                        {product.stock <= 0
                                            ? "Out of Stock"
                                            : "Add to Cart"}

                                    </button>

                                </div>
                            );
                        })

                    )}

                </div>

                {/*page change  button*/}

                {totalPages > 1 && (

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "15px",
                            margin: "30px"
                        }}
                    >

                        <button
                            onClick={function () {
                                changePage(page - 1);
                            }}
                            disabled={page === 1}
                        >
                            Previous
                        </button>




                        <button
                            onClick={function () {
                                changePage(page + 1);
                            }}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Dealer;