
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./index.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Login
  const handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        alert(data.message || "Login failed");
        return;
      }

      // Dealer needs OTP verification
      if (data.requiresOTP === true) {
        setOtpEmail(data.email);

        setTimeout(function () {
          setLoading(false);
          setOtpMode(true);
        }, 1000);

        return;
      }

      // Admin login
      if (data.user && data.user.role === "admin") {
        const userObj = {
          ...data.user,
          _id: data.user._id || data.user.id,
          id: data.user.id || data.user._id,
        };

        localStorage.setItem("user", JSON.stringify(userObj));

        setLoading(false);
        navigate("/admin");
        return;
      }

      setLoading(false);
      alert("Unknown user role");
    } catch (error) {
      setLoading(false);

      console.log("Login error:", error);
      alert("Cannot connect to server");
    }
  };

  // Verify dealer OTP
  const verifyOTP = async function (e) {
    e.preventDefault();
    setOtpLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: otpEmail.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setOtpLoading(false);
        alert(data.message || "Wrong OTP");
        return;
      }

      // Dealer login successful
      if (data.user && data.user.role === "dealer") {
        const userObj = {
          ...data.user,
          _id: data.user._id || data.user.id,
          id: data.user.id || data.user._id,
        };

        localStorage.setItem("user", JSON.stringify(userObj));

        setOtpLoading(false);
        navigate("/dealer");
        return;
      }

      setOtpLoading(false);
      alert("OTP verification failed");
    } catch (error) {
      setOtpLoading(false);

      console.log("OTP error:", error);
      alert("Cannot connect to server");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="login">
        {!otpMode ? (
          <>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div>
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={function (e) {
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label>Password</label>

                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={function (e) {
                      setPassword(e.target.value);
                    }}
                    required
                  />

                  <span
                    className="password-toggle"
                    onClick={function () {
                      setShowPassword(!showPassword);
                    }}
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "🔒"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ marginLeft: "150px" }}
              >
                {loading ? "Sending OTP..." : "Login"}
              </button>

              {loading && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#596578",
                    marginTop: "10px",
                  }}
                >
                  Please wait...
                </p>
              )}
            </form>

            <p>
              Don't have an account?{" "}
              <Link to="/register">Create Dealer Account</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify OTP</h2>

            <p>OTP has been sent to:</p>

            <strong>{otpEmail}</strong>

            <p
              style={{
                color: "#596578",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Please check your email and enter the 6-digit OTP.
            </p>

            <form onSubmit={verifyOTP}>
              <div>
                <label>Enter OTP</label>

                <input
                  type="text"
                  value={otp}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={function (e) {
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    );
                  }}
                  required
                />
              </div>

              <button type="submit" disabled={otpLoading}>
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>

              {otpLoading && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#596578",
                    marginTop: "10px",
                  }}
                >
                  Please wait...
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;

