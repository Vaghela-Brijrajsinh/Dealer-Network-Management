import { useState } from "react";
import Navbar from "./Navbar";

function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const[city,setCity]=useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const validateForm = function () {
        setErrorMsg("");
        const cleanName = name.trim();
        const cleanEmail = email.toLowerCase().trim();
        const cleanPhone = phone.trim();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();
        
        const cleanCity = city.trim();

        if (!cleanName || !/^[A-Za-z\s]+$/.test(cleanName) || cleanName.length < 2) {
            setErrorMsg("Name must contain alphabets and spaces only.");
            return false;
        }

        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setErrorMsg("Please enter a valid email address.");
            return false;
        }

        if (cleanPhone && !/^[0-9]{10}$/.test(cleanPhone)) {
            setErrorMsg("Phone number must contain exactly 10 digits.");
            return false;
        }

        if (!cleanSubject) {
            setErrorMsg("Subject is required.");
            return false;
        }

        if (!cleanMessage) {
            setErrorMsg("Message is required.");
            return false;
        }

        return true;
    };

    const handleSubmit = async function (e) {
        e.preventDefault();
        setErrorMsg("");

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    phone: phone.trim(),
                    subject: subject.trim(),
                    message: message.trim(),
                    city:city.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "Message submitted successfully!");
                setSubmitted(true);
                setName("");
                setEmail("");
                setPhone("");
                setSubject("");
                setMessage("");
                setCity("");
            } else {
                setErrorMsg(data.message || "Submission failed");
            }
        } catch (error) {
            console.log(error);
            setErrorMsg("Cannot connect to server");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="page" style={{ maxWidth: "800px" }}>
                <h1>Contact Us</h1>
                <p>Have questions? Send us a message and our team will get back to you shortly.</p>

                {errorMsg && (
                    <div style={{ padding: "10px", background: "#fee2e2", color: "#dc2626", borderRadius: "6px", marginBottom: "15px" }}>
                        {errorMsg}
                    </div>
                )}

                {submitted && (
                    <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: "5px", marginBottom: "20px" }}>
                        Thank you! Your message has been sent successfully.
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
                    <div>
                        <label>Your Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={function (e) { setName(e.target.value); }}
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div>
                        <label>Your Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={function (e) { setEmail(e.target.value); }}
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div>
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={function (e) { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); }}
                            placeholder="Optional 10-digit phone number"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <label>Subject *</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={function (e) { setSubject(e.target.value); }}
                            placeholder="Message subject"
                            required
                        />
                    </div>

                    <div>
                        <label>Message *</label>
                        <textarea
                            rows="5"
                            value={message}
                            onChange={function (e) { setMessage(e.target.value); }}
                            placeholder="Type your message here..."
                            required
                        />
                    </div>

                    {/* <div>
                        <label>City *</label>
                        <input
                            type="text"
                            value={city}
                            onChange={function (e) { setCity(e.target.value); }}
                            placeholder="Enter city name"
                            required
                        />
                    </div>*/}


                    <button type="submit">Submit Message</button>
                </form>
            </div>
        </div>
    );
}

export default Contact;
