import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function AdminContacts() {
    const [contacts, setContacts] = useState([]);

    const getContacts = async function () {
        try {
            const response = await fetch(
                "http://localhost:5000/api/contacts"
            );

            const data = await response.json();

            if (response.ok) {
                setContacts(data);
            } else {
                setContacts([]);
            }

        } catch (error) {
            console.log("Get contacts error:", error);
        }
    };

    useEffect(function () {
        getContacts();
    }, []);

    const updateStatus = async function (id, newStatus) {
        try {
            const response = await fetch(
                "http://localhost:5000/api/contacts/" +
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

            alert(
                data.message ||
                "Contact status updated"
            );

            if (response.ok) {
                getContacts();
            }

        } catch (error) {
            console.log(
                "Update status error:",
                error
            );

            alert("Cannot connect to server");
        }
    };

    const deleteContact = async function (id) {

        if (
            !window.confirm(
                "Are you sure you want to delete this contact message?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/contacts/" +
                id,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            alert(
                data.message ||
                "Contact deleted successfully"
            );

            if (response.ok) {
                getContacts();
            }

        } catch (error) {
            console.log(
                "Delete contact error:",
                error
            );

            alert("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="page">

                <h1>Public Contact Messages</h1>

                {contacts.length === 0 ? (

                    <p>
                        No contact messages submitted yet.
                    </p>

                ) : (

                    <table
                        border="1"
                        cellPadding="8"
                    >

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th>Status</th>
                                
                                {/*<th>City</th>*/}
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {contacts.map(function (c) {

                                return (

                                    <tr key={c._id}>

                                        <td>
                                            {c.name}
                                        </td>

                                        <td>
                                            {c.email}
                                        </td>

                                        <td>
                                            {c.phone || "-"}
                                        </td>

                                        <td>
                                            {c.subject}
                                        </td>

                                        <td>
                                            {c.message}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    "badge badge-" +
                                                    (
                                                        c.status === "New"
                                                            ? "danger"
                                                            : c.status === "Read"
                                                            ? "warning"
                                                            : "success"
                                                    )
                                                }
                                            >
                                                {c.status}
                                            </span>

                                        </td>

                                        {/*<td>
                                            {c.city || "-"}
                                        </td>*/}

                                        <td>

                                            {c.status === "New" && (

                                                <button
                                                    onClick={function () {
                                                        updateStatus(
                                                            c._id,
                                                            "Read"
                                                        );
                                                    }}
                                                >
                                                    Mark Read
                                                </button>

                                            )}

                                            {c.status !== "Resolved" && (

                                                <button
                                                    onClick={function () {
                                                        updateStatus(
                                                            c._id,
                                                            "Resolved"
                                                        );
                                                    }}
                                                >
                                                    Mark Resolved
                                                </button>

                                            )}

                                            {c.status === "Resolved" && (

                                                <span>
                                                    Completed
                                                </span>

                                            )}

                                            <button
                                                onClick={function () {
                                                    deleteContact(
                                                        c._id
                                                    );
                                                }}
                                                style={{
                                                    background: "#dc2626",
                                                    color: "white",
                                                    marginLeft: "8px",
                                                    padding: "6px 12px",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Delete
                                            </button>

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

export default AdminContacts;