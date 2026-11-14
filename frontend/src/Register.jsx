import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import Navbar from "./Navbar";
import gujaratData from "./gujaratData";

function Register() {
  const navigate = useNavigate();

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDistrictChange = function (e) {
    const selectedDist = e.target.value;
    setDistrict(selectedDist);
    setTaluka("");
  };

  const validateForm = function () {
    const errs = {};

    // Name validation

    const nameClean = name.trim();

    if (!nameClean) {
      errs.name = "Name is required.";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(nameClean)) {
      errs.name = "Name can contain only alphabets and spaces.";
    }

    // Email validation
    const emailClean = email.toLowerCase().trim();

    if (!emailClean || !emailClean.includes("@") || !emailClean.includes(".")) {
      errs.email = "Please enter a valid email address.";
    }

    // Password validation
    // Password validation
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must contain maximum 6 characters.";
    } else if (/\s/.test(password)) {
      errs.password = "Password cannot contain spaces.";
    }

    // Confirm password validation
    if (!confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Confirm password must match password.";
    }

    // District validation
    if (!district) {
      errs.district = "Please select a district.";
    }

    // Taluka validation
    if (!taluka) {
      errs.taluka = "Please select a taluka.";
    }

    // Pincode validation
    const pincodeClean = pincode.trim();

    if (!pincodeClean || pincodeClean.length !== 6) {
      errs.pincode = "Pincode must contain exactly 6 digits.";
    }

    // Shop Name validation
    const shopClean = shopName.trim();

    if (!shopClean || shopClean.length < 2) {
      errs.shopName = "Please enter a valid shop name.";
    }

    // Phone validation
    const phoneClean = phone.trim();

    if (!phoneClean || phoneClean.length !== 10) {
      errs.phone = "Phone number must contain exactly 10 digits.";
    }

    // Address validation
    const addressClean = address.trim();

    if (!addressClean || addressClean.length < 5) {
      errs.address = "Please enter a complete address.";
    }

    // GST validation

    const gstClean = gstNumber.trim().toUpperCase();

    if (!gstClean || gstClean.length !== 15) {
      errs.gstNumber = "GST number must contain exactly 15 characters.";
    } else if (!/^[A-Z0-9]+$/.test(gstClean)) {
      errs.gstNumber = "GST number can contain only letters and numbers.";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async function (e) {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        setServerError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert(
        "Registration successful! Your account is waiting for admin approval.",
      );

      navigate("/login");
    } catch (error) {
      console.log("Registration error:", error);

      setServerError(
        "Cannot connect to server. Please ensure backend is running.",
      );
    }

    setLoading(false);
  };

  return (
    <div>
      <Navbar />

      <div className="register">
        <h2>Dealer Registration</h2>

        {serverError && (
          <div
            style={{
              padding: "10px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "6px",
              marginBottom: "15px",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div>
            <label>Name *</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                    .replace(/[^A-Za-z ]/g, "")
                    .replace(/\s+/g, " "),
                )
              }
              placeholder="Enter your full name"
              required
            />

            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* EMAIL */}
          <div>
            <label>Email *</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              required
            />

            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* STATE */}
          <div>
            <label>State *</label>

            <input
              type="text"
              value="Gujarat"
              readOnly
              style={{
                background: "#f1f5f9",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* DISTRICT */}
          <div>
            <label>District *</label>

            <select value={district} onChange={handleDistrictChange} required>
              <option value="">Select District</option>

              {Object.keys(gujaratData).map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>

            {errors.district && (
              <span className="form-error">{errors.district}</span>
            )}
          </div>

          {/* TALUKA */}
          <div>
            <label>Taluka *</label>

            <select
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              disabled={!district}
              required
            >
              <option value="">Select Taluka</option>

              {district &&
                gujaratData[district].map((tal) => (
                  <option key={tal} value={tal}>
                    {tal}
                  </option>
                ))}
            </select>

            {errors.taluka && (
              <span className="form-error">{errors.taluka}</span>
            )}
          </div>

          {/* PINCODE */}
          <div>
            <label>Pincode *</label>

            <input
              type="text"
              inputMode="numeric"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6 digit pincode"
              maxLength={6}
              required
            />

            {errors.pincode && (
              <span className="form-error">{errors.pincode}</span>
            )}
          </div>

          {/* SHOP NAME */}
          <div>
            <label>Shop Name *</label>

            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter your shop name"
              required
            />

            {errors.shopName && (
              <span className="form-error">{errors.shopName}</span>
            )}
          </div>

          
          <div>
            <label>Phone Number *</label>
            <input
              type="text"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10 digit mobile number"
              maxLength={10}
              required
            />

            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* ADDRESS */}
          <div>
            <label>Address *</label>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete address"
              required
            />

            {errors.address && (
              <span className="form-error">{errors.address}</span>
            )}
          </div>

          {/* GST NUMBER */}
          <div>
            <label>GST Number *</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) =>
                setGstNumber(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 15),
                )
              }
              placeholder="Enter 15 character GST number"
              maxLength={15}
              required
            />

            {errors.gstNumber && (
              <span className="form-error">{errors.gstNumber}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label>Password *</label>

            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                placeholder="Enter Password"
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "◉" : "🔒"}
              </span>
            </div>

            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label>Confirm Password *</label>

            <div className="password-input-container">
              <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value.replace(/\s/g, ""))
                  }
                  placeholder="Re-enter your password"
                  required
              />

              <span
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "◉" : "🔒"}
              </span>
            </div>

            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginLeft: "140px",
              marginTop: "15px",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
