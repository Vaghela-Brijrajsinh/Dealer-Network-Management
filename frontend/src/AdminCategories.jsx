
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function AdminCategories() {
    const [categories, setCategories] = useState([]);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [newSubcategoryName, setNewSubcategoryName] = useState("");
    const [computerSubTypes, setComputerSubTypes] = useState("");

    const [editingCategoryId, setEditingCategoryId] = useState("");
    const [editingCategoryName, setEditingCategoryName] = useState("");

    const [editingSubcategoryId, setEditingSubcategoryId] = useState("");
    const [editingSubcategoryName, setEditingSubcategoryName] = useState("");
    const [editingSubTypes, setEditingSubTypes] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const fetchCategories = async function () {
        try {
            const response = await fetch(
                "http://localhost:5000/api/categories"
            );

            const data = await response.json();

            if (response.ok) {
                setCategories(data);

                if (data.length > 0 && !selectedCategoryId) {
                    setSelectedCategoryId(data[0]._id);
                }

                if (data.length === 0) {
                    setSelectedCategoryId("");
                }
            }
        } catch (error) {
            console.log("Fetch categories error:", error);
            setErrorMsg("Cannot connect to server");
        }
    };

    useEffect(function () {
        fetchCategories();
    }, []);

    // =========================
    // ADD MAIN CATEGORY
    // =========================

    const handleAddCategory = async function (e) {
        e.preventDefault();

        setErrorMsg("");
        setSuccessMsg("");

        const categoryName = newCategoryName.trim();

        if (!categoryName) {
            setErrorMsg("Category name cannot be empty.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/categories",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: categoryName
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg("Category added successfully!");
                setNewCategoryName("");

                await fetchCategories();
            } else {
                setErrorMsg(
                    data.message || "Failed to add category"
                );
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    // =========================
    // ADD SUBCATEGORY
    // =========================

    const handleAddSubcategory = async function (e) {
        e.preventDefault();

        setErrorMsg("");
        setSuccessMsg("");

        if (!selectedCategoryId) {
            setErrorMsg("Please select a category.");
            return;
        }

        const subcategoryName = newSubcategoryName.trim();

        if (!subcategoryName) {
            setErrorMsg("Subcategory name cannot be empty.");
            return;
        }

        const subTypes = computerSubTypes
            ? computerSubTypes
                  .split(",")
                  .map(function (item) {
                      return item.trim();
                  })
                  .filter(Boolean)
            : [];

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${selectedCategoryId}/subcategories`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: subcategoryName,
                        subTypes: subTypes
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(
                    "Subcategory added successfully!"
                );

                setNewSubcategoryName("");
                setComputerSubTypes("");

                await fetchCategories();
            } else {
                setErrorMsg(
                    data.message ||
                        "Failed to add subcategory"
                );
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    // =========================
    // EDIT MAIN CATEGORY
    // =========================

    const handleEditCategory = function (category) {
        setErrorMsg("");
        setSuccessMsg("");

        setEditingCategoryId(category._id);
        setEditingCategoryName(category.name);
    };

    const handleCancelEditCategory = function () {
        setEditingCategoryId("");
        setEditingCategoryName("");
    };

    const handleUpdateCategory = async function (
        e,
        categoryId
    ) {
        e.preventDefault();

        setErrorMsg("");
        setSuccessMsg("");

        const categoryName =
            editingCategoryName.trim();

        if (!categoryName) {
            setErrorMsg(
                "Category name cannot be empty."
            );
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${categoryId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: categoryName
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(
                    "Category updated successfully!"
                );

                setEditingCategoryId("");
                setEditingCategoryName("");

                await fetchCategories();
            } else {
                setErrorMsg(
                    data.message ||
                        "Failed to update category"
                );
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    // =========================
    // DELETE MAIN CATEGORY
    // =========================

    const handleDeleteMainCategory = async function (
        categoryId,
        categoryName
    ) {
        const confirmed = window.confirm(
            `Are you sure you want to delete main category '${categoryName}'? This will also delete its subcategories.`
        );

        if (!confirmed) {
            return;
        }

        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${categoryId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(
                    `Category '${categoryName}' deleted successfully!`
                );

                if (
                    selectedCategoryId === categoryId
                ) {
                    setSelectedCategoryId("");
                }

                if (
                    editingCategoryId === categoryId
                ) {
                    setEditingCategoryId("");
                    setEditingCategoryName("");
                }

                await fetchCategories();
            } else {
                setErrorMsg(
                    data.message ||
                        "Failed to delete category"
                );
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    // =========================
    // EDIT SUBCATEGORY
    // =========================

    const handleEditSubcategory = function (
        subcategory
    ) {
        setErrorMsg("");
        setSuccessMsg("");

        setEditingSubcategoryId(
            subcategory._id
        );

        setEditingSubcategoryName(
            subcategory.name
        );

        setEditingSubTypes(
            subcategory.subTypes
                ? subcategory.subTypes.join(", ")
                : ""
        );
    };

    const handleCancelEditSubcategory =
        function () {
            setEditingSubcategoryId("");
            setEditingSubcategoryName("");
            setEditingSubTypes("");
        };

    const handleUpdateSubcategory = async function (
        e,
        categoryId,
        subcategoryId
    ) {
        e.preventDefault();

        setErrorMsg("");
        setSuccessMsg("");

        const subcategoryName =
            editingSubcategoryName.trim();

        if (!subcategoryName) {
            setErrorMsg(
                "Subcategory name cannot be empty."
            );
            return;
        }

        const subTypes = editingSubTypes
            ? editingSubTypes
                  .split(",")
                  .map(function (item) {
                      return item.trim();
                  })
                  .filter(Boolean)
            : [];

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${categoryId}/subcategories/${subcategoryId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: subcategoryName,
                        subTypes: subTypes
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(
                    "Subcategory updated successfully!"
                );

                setEditingSubcategoryId("");
                setEditingSubcategoryName("");
                setEditingSubTypes("");

                await fetchCategories();
            } else {
                setErrorMsg(
                    data.message ||
                        "Failed to update subcategory"
                );
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    // =========================
    // DELETE SUBCATEGORY
    // =========================

    const handleDeleteSubcategory = async function (
        categoryId,
        subcategoryId,
        subName
    ) {
        const confirmed = window.confirm(
            `Are you sure you want to delete subcategory '${subName}'?`
        );

        if (!confirmed) {
            return;
        }

        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${categoryId}/subcategories/${subcategoryId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(
                    "Subcategory deleted successfully!"
                );

                if (
                    editingSubcategoryId ===
                    subcategoryId
                ) {
                    setEditingSubcategoryId("");
                    setEditingSubcategoryName("");
                    setEditingSubTypes("");
                }

                await fetchCategories();
            } else {
                setErrorMsg(
                    data.message ||
                        "Failed to delete subcategory"
                );
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="page">
                <h1>
                    Category & Subcategory Management
                </h1>

                {errorMsg && (
                    <div
                        style={{
                            padding: "10px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            borderRadius: "6px",
                            marginBottom: "15px"
                        }}
                    >
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div
                        style={{
                            padding: "10px",
                            background: "#dcfce7",
                            color: "#166534",
                            borderRadius: "6px",
                            marginBottom: "15px"
                        }}
                    >
                        {successMsg}
                    </div>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "20px"
                    }}
                >
                    {/* =========================
                        ADD MAIN CATEGORY
                    ========================= */}

                    <div className="card">
                        <h2>Add Main Category</h2>

                        <form
                            onSubmit={
                                handleAddCategory
                            }
                        >
                            <label>
                                Category Name *
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Electronics"
                                value={
                                    newCategoryName
                                }
                                onChange={function (
                                    e
                                ) {
                                    setNewCategoryName(
                                        e.target.value
                                    );
                                }}
                                required
                            />

                            <button type="submit">
                                Add Category
                            </button>
                        </form>
                    </div>

                    {/* =========================
                        ADD SUBCATEGORY
                    ========================= */}

                    <div className="card">
                        <h2>Add Subcategory</h2>

                        <form
                            onSubmit={
                                handleAddSubcategory
                            }
                        >
                            <label>
                                Select Main Category *
                            </label>

                            <select
                                value={
                                    selectedCategoryId
                                }
                                onChange={function (
                                    e
                                ) {
                                    setSelectedCategoryId(
                                        e.target.value
                                    );
                                }}
                                required
                            >
                                <option value="">
                                    -- Select Category --
                                </option>

                                {categories.map(
                                    function (cat) {
                                        return (
                                            <option
                                                key={
                                                    cat._id
                                                }
                                                value={
                                                    cat._id
                                                }
                                            >
                                                {cat.name}
                                            </option>
                                        );
                                    }
                                )}
                            </select>

                            <label>
                                Subcategory Name *
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Phone or Computer"
                                value={
                                    newSubcategoryName
                                }
                                onChange={function (
                                    e
                                ) {
                                    setNewSubcategoryName(
                                        e.target.value
                                    );
                                }}
                                required
                            />

                            {newSubcategoryName
                                .trim()
                                .toLowerCase() ===
                                "computer" && (
                                <>
                                    <label>
                                        Product Types
                                        (Comma Separated)
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Laptop, Keyboard, Mouse, Monitor"
                                        value={
                                            computerSubTypes
                                        }
                                        onChange={function (
                                            e
                                        ) {
                                            setComputerSubTypes(
                                                e.target
                                                    .value
                                            );
                                        }}
                                    />

                                    <small
                                        style={{
                                            color: "#666"
                                        }}
                                    >
                                        Optional product
                                        types for
                                        Computer.
                                    </small>
                                </>
                            )}

                            <br />

                            <button
                                type="submit"
                                style={{
                                    marginTop: "10px"
                                }}
                            >
                                Add Subcategory
                            </button>
                        </form>
                    </div>
                </div>

                {/* =========================
                    ALL CATEGORIES
                ========================= */}

                <h2
                    style={{
                        marginTop: "30px"
                    }}
                >
                    All Categories & Subcategories
                </h2>

                {categories.length === 0 ? (
                    <p>No categories found.</p>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                            marginTop: "15px"
                        }}
                    >
                        {categories.map(
                            function (cat) {
                                return (
                                    <div
                                        key={cat._id}
                                        className="card"
                                    >
                                        {/* =========================
                                            MAIN CATEGORY HEADER
                                        ========================= */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                borderBottom:
                                                    "1px solid #eee",
                                                paddingBottom:
                                                    "8px",
                                                marginBottom:
                                                    "10px"
                                            }}
                                        >
                                            {editingCategoryId ===
                                            cat._id ? (
                                                <form
                                                    onSubmit={function (
                                                        e
                                                    ) {
                                                        handleUpdateCategory(
                                                            e,
                                                            cat._id
                                                        );
                                                    }}
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "8px",
                                                        alignItems:
                                                            "center",
                                                        width: "100%"
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={
                                                            editingCategoryName
                                                        }
                                                        onChange={function (
                                                            e
                                                        ) {
                                                            setEditingCategoryName(
                                                                e
                                                                    .target
                                                                    .value
                                                            );
                                                        }}
                                                        autoFocus
                                                        required
                                                        style={{
                                                            margin: 0,
                                                            flex: 1
                                                        }}
                                                    />

                                                    <button type="submit">
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleCancelEditCategory
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </form>
                                            ) : (
                                                <>
                                                    <h3
                                                        style={{
                                                            margin: 0,
                                                            color: "#1e1b3a"
                                                        }}
                                                    >
                                                        {
                                                            cat.name
                                                        }
                                                    </h3>

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            gap: "8px"
                                                        }}
                                                    >
                                                        <button
                                                            onClick={function () {
                                                                handleEditCategory(
                                                                    cat
                                                                );
                                                            }}
                                                            style={{
                                                                background:
                                                                    "#2563eb",
                                                                color:
                                                                    "white",
                                                                padding:
                                                                    "5px 12px",
                                                                fontSize:
                                                                    "13px"
                                                            }}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={function () {
                                                                handleDeleteMainCategory(
                                                                    cat._id,
                                                                    cat.name
                                                                );
                                                            }}
                                                            style={{
                                                                background:
                                                                    "#dc2626",
                                                                color:
                                                                    "white",
                                                                padding:
                                                                    "5px 12px",
                                                                fontSize:
                                                                    "13px"
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* =========================
                                            SUBCATEGORIES
                                        ========================= */}

                                        {cat
                                            .subcategories
                                            .length ===
                                        0 ? (
                                            <p
                                                style={{
                                                    fontStyle:
                                                        "italic",
                                                    color:
                                                        "#888"
                                                }}
                                            >
                                                No
                                                subcategories
                                                added yet.
                                            </p>
                                        ) : (
                                            <ul
                                                style={{
                                                    listStyle:
                                                        "none",
                                                    paddingLeft:
                                                        0,
                                                    margin: 0
                                                }}
                                            >
                                                {cat.subcategories.map(
                                                    function (
                                                        sub
                                                    ) {
                                                        return (
                                                            <li
                                                                key={
                                                                    sub._id ||
                                                                    sub.name
                                                                }
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    justifyContent:
                                                                        "space-between",
                                                                    alignItems:
                                                                        "center",
                                                                    padding:
                                                                        "8px 12px",
                                                                    background:
                                                                        "#f8fafc",
                                                                    marginBottom:
                                                                        "6px",
                                                                    borderRadius:
                                                                        "4px"
                                                                }}
                                                            >
                                                                {editingSubcategoryId ===
                                                                sub._id ? (
                                                                    <form
                                                                        onSubmit={function (
                                                                            e
                                                                        ) {
                                                                            handleUpdateSubcategory(
                                                                                e,
                                                                                cat._id,
                                                                                sub._id
                                                                            );
                                                                        }}
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            gap: "8px",
                                                                            alignItems:
                                                                                "center",
                                                                            width: "100%"
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                editingSubcategoryName
                                                                            }
                                                                            onChange={function (
                                                                                e
                                                                            ) {
                                                                                setEditingSubcategoryName(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                            }}
                                                                            autoFocus
                                                                            required
                                                                            style={{
                                                                                margin: 0,
                                                                                flex: 1
                                                                            }}
                                                                        />

                                                                        {editingSubcategoryName
                                                                            .trim()
                                                                            .toLowerCase() ===
                                                                            "computer" && (
                                                                            <input
                                                                                type="text"
                                                                                value={
                                                                                    editingSubTypes
                                                                                }
                                                                                onChange={function (
                                                                                    e
                                                                                ) {
                                                                                    setEditingSubTypes(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    );
                                                                                }}
                                                                                placeholder="Laptop, Keyboard, Mouse"
                                                                                style={{
                                                                                    margin: 0,
                                                                                    flex: 1
                                                                                }}
                                                                            />
                                                                        )}

                                                                        <button type="submit">
                                                                            Save
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={
                                                                                handleCancelEditSubcategory
                                                                            }
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </form>
                                                                ) : (
                                                                    <>
                                                                        <div>
                                                                            <strong>
                                                                                -
                                                                                {
                                                                                    sub.name
                                                                                }
                                                                            </strong>

                                                                            {sub.subTypes &&
                                                                                sub
                                                                                    .subTypes
                                                                                    .length >
                                                                                    0 && (
                                                                                    <span
                                                                                        style={{
                                                                                            fontSize:
                                                                                                "12px",
                                                                                            color:
                                                                                                "#64748b",
                                                                                            marginLeft:
                                                                                                "10px"
                                                                                        }}
                                                                                    >
                                                                                        (Types:{" "}
                                                                                        {sub.subTypes.join(
                                                                                            ", "
                                                                                        )}
                                                                                        )
                                                                                    </span>
                                                                                )}
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "flex",
                                                                                gap:
                                                                                    "6px"
                                                                            }}
                                                                        >
                                                                            <button
                                                                                onClick={function () {
                                                                                    handleEditSubcategory(
                                                                                        sub
                                                                                    );
                                                                                }}
                                                                                style={{
                                                                                    background:
                                                                                        "#2563eb",
                                                                                    color:
                                                                                        "white",
                                                                                    padding:
                                                                                        "4px 10px",
                                                                                    fontSize:
                                                                                        "12px"
                                                                                }}
                                                                            >
                                                                                Edit
                                                                            </button>

                                                                            <button
                                                                                onClick={function () {
                                                                                    handleDeleteSubcategory(
                                                                                        cat._id,
                                                                                        sub._id,
                                                                                        sub.name
                                                                                    );
                                                                                }}
                                                                                style={{
                                                                                    background:
                                                                                        "#ef4444",
                                                                                    color:
                                                                                        "white",
                                                                                    padding:
                                                                                        "4px 10px",
                                                                                    fontSize:
                                                                                        "12px"
                                                                                }}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCategories;

