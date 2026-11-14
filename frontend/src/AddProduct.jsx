import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
function AddProduct() {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [productType, setProductType] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active"); // Active or Inactive

    const [categoriesList, setCategoriesList] = useState([]);
    const [subcategoriesList, setSubcategoriesList] = useState([]);
    const [subTypesList, setSubTypesList] = useState([]);

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch categories from backend DB
    const fetchCategories = async function () {
        try {
            const response = await fetch("http://localhost:5000/api/categories");
            const data = await response.json();
            if (response.ok) {
                setCategoriesList(data);
            }
        } catch (error) {
            console.log("Fetch categories error:", error);
        }
    };

    const fetchProducts = async function () {
        try {
            const response = await fetch("http://localhost:5000/api/products");
            const data = await response.json();
            if (response.ok) {
                setProducts(data);
            } else {
                alert("Failed to load products");
            }
        } catch (error) {
            console.log(error);
            alert("Cannot connect to server");
        }
    };

    useEffect(function () {
        fetchCategories();
        fetchProducts();
    }, []);

    // When Category selection changes
    const handleCategoryChange = function (e) {
        const catName = e.target.value;
        setCategory(catName);
        setSubcategory("");
        setProductType("");
        setSubTypesList([]);

        const foundCat = categoriesList.find(c => c.name === catName);
        if (foundCat && foundCat.subcategories) {
            setSubcategoriesList(foundCat.subcategories);
        } else {
            setSubcategoriesList([]);
        }
    };

    // When Subcategory selection changes
    const handleSubcategoryChange = function (e) {
        const subName = e.target.value;
        setSubcategory(subName);
        setProductType("");

        const foundSub = subcategoriesList.find(s => s.name === subName);
        if (foundSub && foundSub.subTypes && foundSub.subTypes.length > 0) {
            setSubTypesList(foundSub.subTypes);
        } else {
            setSubTypesList([]);
        }
    };

    const handleImageChange = function (e) {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setImage(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
    };

    const clearForm = function () {
        setName("");
        setCategory("");
        setSubcategory("");
        setProductType("");
        setSubcategoriesList([]);
        setSubTypesList([]);
        setPrice("");
        setStock("");
        setDescription("");
        setStatus("Active");
        setImage(null);
        setImagePreview("");
        setEditingId(null);
        setErrorMsg("");

        const imageInput = document.getElementById("product-image");
        if (imageInput) {
            imageInput.value = "";
        }
    };

    const validateForm = function () {
        setErrorMsg("");
        const cleanName = name.trim();

        if (!cleanName || cleanName.length < 2) {
            setErrorMsg("Product name is required and must be at least 2 characters.");
            return false;
        }

        if (!/[a-zA-Z0-9]/.test(cleanName)) {
            setErrorMsg("Product name cannot contain only symbols.");
            return false;
        }

        if (!category) {
            setErrorMsg("Please select a category.");
            return false;
        }

        if (!subcategory) {
            setErrorMsg("Please select a subcategory.");
            return false;
        }

        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            setErrorMsg("Price must be a valid positive number greater than 0.");
            return false;
        }

        const numStock = Number(stock);
        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
            setErrorMsg("Stock quantity must be a whole number 0 or greater.");
            return false;
        }

        if (!description.trim()) {
            setErrorMsg("Description is required.");
            return false;
        }

        if (!editingId && !image) {
            setErrorMsg("Please choose a product image.");
            return false;
        }

        return true;
    };

    const handleSubmit = async function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("category", category);
        formData.append("subcategory", subcategory);
        formData.append("productType", productType);
        formData.append("price", price);
        formData.append("stock", stock);
        formData.append("description", description.trim());
        formData.append("status", status);

        if (image) {
            formData.append("image", image);
        }

        try {
            let url = "http://localhost:5000/api/products";
            let method = "POST";

            if (editingId) {
                url = "http://localhost:5000/api/products/" + editingId;
                method = "PUT";
            }

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert(editingId ? "Product updated successfully!" : "Product added successfully!");
                clearForm();
                fetchProducts();
            } else {
                setErrorMsg(data.message || "Operation failed");
            }

        } catch (error) {
            console.log(error);
            setErrorMsg("Server error. Please try again.");
        }

        setLoading(false);
    };

    const handleEdit = function (product) {
        setEditingId(product._id);
        setName(product.name);
        setCategory(product.category || "");

        // Populate subcategory lists
        const foundCat = categoriesList.find(c => c.name === product.category);
        if (foundCat && foundCat.subcategories) {
            setSubcategoriesList(foundCat.subcategories);
            const foundSub = foundCat.subcategories.find(s => s.name === product.subcategory);
            if (foundSub && foundSub.subTypes) {
                setSubTypesList(foundSub.subTypes);
            } else {
                setSubTypesList([]);
            }
        } else {
            setSubcategoriesList([]);
            setSubTypesList([]);
        }

        setSubcategory(product.subcategory || "");
        setProductType(product.productType || "");
        setPrice(product.price);
        setStock(product.stock);
        setDescription(product.description);
        setStatus(product.status || "Active");
        setImage(null);
        setImagePreview("http://localhost:5000/uploads/" + product.image);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async function (id) {
        const confirmDelete = window.confirm("Are you sure you want to delete this product?");
        if (!confirmDelete) return;

        try {
            const response = await fetch("http://localhost:5000/api/products/" + id, {
                method: "DELETE"
            });

            const data = await response.json();

            if (response.ok) {
                alert("Product deleted successfully!");
                fetchProducts();
            } else {
                alert(data.message || "Failed to delete product");
            }

        } catch (error) {
            console.log(error);
            alert("Server error");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="product-page page">
                <h1>{editingId ? "Edit Product" : "Add Product"}</h1>

                {errorMsg && (
                    <div style={{ padding: "10px", background: "#fee2e2", color: "#dc2626", borderRadius: "6px", marginBottom: "15px" }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            type="text"
                            placeholder="Enter product name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select value={category} onChange={handleCategoryChange} required>
                            <option value="">Select Category </option>
                            {categoriesList.map(cat => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Subcategory *</label>
                        <select
                            value={subcategory}
                            onChange={handleSubcategoryChange}
                            disabled={!category}
                            required
                        >
                            <option value="">Select Subcategory </option>
                            {subcategoriesList.map(sub => (
                                <option key={sub._id || sub.name} value={sub.name}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Display Sub-Type dropdown if applicable (e.g. for Computer) */}
                    {subTypesList.length > 0 && (
                        <div className="form-group">
                            <label>Product Type (under {subcategory})</label>
                            <select
                                value={productType}
                                onChange={e => setProductType(e.target.value)}
                            >
                                <option value="">Select Product Type </option>
                                {subTypesList.map((type, idx) => (
                                    <option key={idx} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Price (₹) *</label>
                        <input
                            type="number"
                            placeholder="Enter price "
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            min="1"
                            step="any"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input
                            type="number"
                            placeholder="Enter stock quantity "
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Status *</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            placeholder="Enter product description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Product Image *</label>
                        <input
                            id="product-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required={!editingId}
                        />
                    </div>

                    {imagePreview && (
                        <div className="image-preview">
                            <p>Image Preview</p>
                            <img src={imagePreview} alt="Product Preview" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : (editingId ? "Update Product" : "Add Product")}
                    </button>

                    {editingId && (
                        <button type="button" onClick={clearForm} style={{ marginLeft: "10px", background: "#64748b" }}>
                            Cancel Edit
                        </button>
                    )}
                </form>

                <div className="product-table-section" style={{ marginTop: "30px" }}>
                    <h2>Product List</h2>

                    {products.length === 0 ? (
                        <p>No products available.</p>
                    ) : (
                        <div className="table-container" style={{ overflowX: "auto" }}>
                            <table border="1" cellPadding="8">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Subcategory</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <td>
                                                <img
                                                    src={"http://localhost:5000/uploads/" + product.image}
                                                    alt={product.name}
                                                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                                                />
                                            </td>
                                            <td><strong>{product.name}</strong></td>
                                            <td>{product.category || "-"}</td>
                                            <td>{product.subcategory || "-"}</td>
                                            <td>₹{product.price}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <span className={"badge badge-" + (product.status === "Active" ? "success" : "danger")}>
                                                    {product.status || "Active"}
                                                </span>
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => handleEdit(product)}>
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(product._id)}
                                                    style={{ background: "#dc2626", color: "white", marginLeft: "5px" }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddProduct;