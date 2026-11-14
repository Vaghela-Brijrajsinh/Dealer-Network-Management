    import Navbar from "./Navbar";

    function Home() {
        return (
            <div className="home">
                <Navbar />

                <section className="hero">
                    <div className="hero-text">
                        <h1>One Dashboard For Every Dealer, Order And Shipment.</h1>
                        <p>
                            Approve dealers, manage the catalog, orders from request to
                            delivery, and resolve complaints — without switching tools.
                        </p>
                        <a href="/login">
                            <button>Login</button>
                        </a>
                        <a href="/register">
                            <button>Register</button>
                        </a>

                        <div className="hero-metrics">
                            <div className="hero-metric hero-metric--steel">
                                <span className="hero-metric-value">148</span>
                                <span className="hero-metric-label">Dealers Onboarded</span>
                            </div>
                            <div className="hero-metric hero-metric--amber">
                                <span className="hero-metric-value">63</span>
                                <span className="hero-metric-label">Orders In Transit</span>
                            </div>
                            <div className="hero-metric hero-metric--teal">
                                <span className="hero-metric-value">12</span>
                                <span className="hero-metric-label">Shipments Today</span>
                            </div>
                            <div className="hero-metric hero-metric--red">
                                <span className="hero-metric-value">4</span>
                                <span className="hero-metric-label">Open Complaints</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80"
                            alt="Business team"
                        />
                    </div>
                </section>

                <section className="about">
                    <h2>About the System</h2>
                    <p>
                        This system helps companies manage their dealer network and allows
                        approved dealers to place product orders, show shipments, and
                        register complaints.
                    </p>
                </section>

                <section className="features">
                    <h2>Our Features</h2>

                    <div className="feature-container">
                        <div className="feature-card card">
                            <h3>Dealer Approval</h3>
                            <p>Register and approve dealers easily.</p>
                        </div>

                        <div className="feature-card card">
                            <h3>Product Catalog</h3>
                            <p>Manage products, prices, stock and status.</p>
                        </div>

                        <div className="feature-card card">
                            <h3>Order Management</h3>
                            <p>Dealers place orders, Admin approves and stock updates.</p>
                        </div>

                        <div className="feature-card card">
                            <h3>Shipments & Complaints</h3>
                            <p>Track deliveries and resolve dealer complaints.</p>
                        </div>
                    </div>
                </section>

                <footer>
                    <p>Dealer Network Management System</p>
                </footer>
            </div>
        );
    }

    export default Home;