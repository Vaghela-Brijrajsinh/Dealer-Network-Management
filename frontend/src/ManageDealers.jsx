import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import gujaratData from "./gujaratData";

function ManageDealers() {
  const [dealers, setDealers] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [pincode, setPincode] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [errors, setErrors] = useState({});
  const [formMsg, setFormMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getDealers = async function () {
    try {
      const response = await fetch("http://localhost:5000/api/dealers");
      const data = await response.json();
      setDealers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(function () {
    getDealers();
  }, []);

  const handleDistrictChange = function (e) {
    const selectedDist = e.target.value;
    setDistrict(selectedDist);
    setTaluka("");
  };

  const validateForm = function () {
    const errs = {};

    const nameClean = name.trim();
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameClean || !nameRegex.test(nameClean) || nameClean.length < 2) {
      errs.name = "Name must contain alphabets and spaces only.";
    }

    const emailClean = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailClean || !emailRegex.test(emailClean)) {
      errs.email = "Please enter a valid email address.";
    }

    /*const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!password) {
      errs.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      errs.password =
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special symbol.";
    }*/

    // Password validation
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must contain at least 6 characters.";
    } else if (/\s/.test(password)) {
      errs.password = "Password cannot contain spaces.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!district) errs.district = "Please select a district.";
    if (!taluka) errs.taluka = "Please select a taluka.";

    const pincodeClean = pincode.trim();
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeClean || !pincodeRegex.test(pincodeClean)) {
      errs.pincode = "Pincode must contain exactly 6 digits.";
    }

    const shopClean = shopName.trim();
    if (!shopClean || shopClean.length < 2) {
      errs.shopName = "Please enter a valid shop name.";
    }

    const phoneClean = phone.trim();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      errs.phone = "Phone number must contain exactly 10 digits.";
    }

    const addressClean = address.trim();
    if (!addressClean || addressClean.length < 5) {
      errs.address = "Please enter a complete address.";
    }

    const gstClean = gstNumber.trim().toUpperCase();
    if (!gstClean || gstClean.length < 15) {
      errs.gstNumber = "GST number must be at least 15 characters long.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addDealer = async function (e) {
    e.preventDefault();
    setFormMsg("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          confirmPassword: confirmPassword,
          district: district,
          taluka: taluka,
          city: `${taluka}, ${district}`,
          pincode: pincode.trim(),
          shopName: shopName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          gstNumber: gstNumber.trim().toUpperCase(),
        }),
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDistrict("");
        setTaluka("");
        setPincode("");
        setShopName("");
        setPhone("");
        setAddress("");
        setGstNumber("");
        setErrors({});
        getDealers();
      }
    } catch (error) {
      alert("Cannot connect to server");
    }

    setLoading(false);
  };

  const changeApproval = async function (id, approved) {
    try {
      const response = await fetch("http://localhost:5000/api/dealers/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: approved }),
      });
      const data = await response.json();
      alert(data.message);
      getDealers();
    } catch (error) {
      alert("Cannot connect to server");
    }
  };

  const deleteDealer = async function (id) {
    if (!window.confirm("Delete this dealer?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/dealers/" + id, {
        method: "DELETE",
      });
      const data = await response.json();
      alert(data.message);
      getDealers();
    } catch (error) {
      alert("Cannot connect to server");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Manage Dealers</h1>

        <h2>Add Dealer Direct</h2>

        <form onSubmit={addDealer} className="manage-dealers-form">
          <div>
            <label>Name *</label>
            <input
              type="text"
              placeholder="Enter dealer full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label>Email *</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.email}
              </span>
            )}
          </div>

          <div>
            <label>State *</label>
            <input
              type="text"
              value="Gujarat"
              readOnly
              style={{ background: "#f1f5f9", cursor: "not-allowed" }}
            />
          </div>

          <div>
            <label>District *</label>
            <select value={district} onChange={handleDistrictChange} required>
              <option value="">Select District </option>
              {Object.keys(gujaratData).map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            {errors.district && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.district}
              </span>
            )}
          </div>

          <div>
            <label>Taluka *</label>
            <select
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              disabled={!district}
              required
            >
              <option value="">Select Taluka </option>
              {district &&
                gujaratData[district].map((tal) => (
                  <option key={tal} value={tal}>
                    {tal}
                  </option>
                ))}
            </select>
            {errors.taluka && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.taluka}
              </span>
            )}
          </div>

          <div>
            <label>Pincode *</label>
            <input
              type="text"
              placeholder="6 digit pincode"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
            />
            {errors.pincode && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.pincode}
              </span>
            )}
          </div>

          <div>
            <label>Shop Name *</label>
            <input
              type="text"
              placeholder="Enter shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
            {errors.shopName && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.shopName}
              </span>
            )}
          </div>

          <div>
            <label>Phone Number *</label>
            <input
              type="text"
              placeholder="10 digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              required
            />
            {errors.phone && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.phone}
              </span>
            )}
          </div>

          <div>
            <label>Address *</label>
            <input
              type="text"
              placeholder="Enter complete address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            {errors.address && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.address}
              </span>
            )}
          </div>

          <div>
            <label>GST Number *</label>
            <input
              type="text"
              placeholder="e.g. 24ABCDE1234F1Z5"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              maxLength={15}
              required
            />
            {errors.gstNumber && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.gstNumber}
              </span>
            )}
          </div>

          <div>
            <label>Password *</label>

            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "◉" : "🔒"}
              </span>
            </div>

            {errors.password && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.password}
              </span>
            )}
          </div>

          <div>
            <label>Confirm Password *</label>

            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value.replace(/\s/g, ""))
                }
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "◉" : "🔒"}
              </span>
            </div>

            {errors.confirmPassword && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "15px" }}
          >
            {loading ? "Adding..." : "Add Dealer Direct"}
          </button>
        </form>

        <h2>All Dealers</h2>

        {dealers.length === 0 ? (
          <p>No dealers registered yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Shop Name</th>
                  <th>District</th>
                  <th>Taluka</th>
                  <th>Pincode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {dealers.map((dealer) => (
                  <tr key={dealer._id}>
                    <td>{dealer.name}</td>
                    <td>{dealer.email}</td>
                    <td>{dealer.shopName}</td>
                    <td>{dealer.district || "-"}</td>
                    <td>{dealer.taluka || "-"}</td>
                    <td>{dealer.pincode || "-"}</td>
                    <td>
                      <span
                        className={
                          "badge badge-" +
                          (dealer.approved ? "success" : "warning")
                        }
                      >
                        {dealer.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      {dealer.approved ? (
                        <button
                          onClick={() => changeApproval(dealer._id, false)}
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => changeApproval(dealer._id, true)}
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => deleteDealer(dealer._id)}
                        style={{
                          background: "#dc2626",
                          color: "white",
                          marginLeft: "5px",
                        }}
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
  );
}

export default ManageDealers;
