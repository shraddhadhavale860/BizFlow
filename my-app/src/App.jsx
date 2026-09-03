import { useState } from "react";
import "./App.css";
import AdminPortal from "./AdminPortal";

function App() {
  // Check if user is already logged in
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Open Admin Portal
      setLoggedIn(true);

    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to server. Please make sure backend is running."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);

    setUsername("");
    setPassword("");
    setError("");
  };


  // =========================
  // ADMIN PORTAL
  // =========================

  if (loggedIn) {
    const savedUser = localStorage.getItem("user");

    const user = savedUser
      ? JSON.parse(savedUser)
      : {
          username: "Admin",
          role: "admin",
        };

    return (
      <AdminPortal
        user={user}
        onLogout={handleLogout}
      />
    );
  }


  // =========================
  // LOGIN PAGE
  // =========================

  return (
    <div className="login-page">

      {/* =====================
          LEFT SECTION
      ====================== */}

      <div className="login-left">

        <div className="brand">

          <div className="brand-icon">
            B
          </div>

          <span>
            BizFlow
          </span>

        </div>


        <div className="hero-content">

          <h1>
            Manage your business.
            <br />

            <span>
              Connect with customers.
            </span>
          </h1>


          <p>
            A smart business management platform
            for billing, customer management and
            communication.
          </p>


          <div className="features">

            <div>
              <span>✓</span>
              Customer Management
            </div>

            <div>
              <span>✓</span>
              Smart Billing
            </div>

            <div>
              <span>✓</span>
              WhatsApp Communication
            </div>

          </div>

        </div>

      </div>


      {/* =====================
          RIGHT SECTION
      ====================== */}

      <div className="login-right">

        <div className="login-card">


          {/* Mobile Logo */}

          <div className="mobile-logo">

            <div className="brand-icon">
              B
            </div>

            <span>
              BizFlow
            </span>

          </div>


          {/* Header */}

          <div className="login-header">

            <h2>
              Welcome back 👋
            </h2>

            <p>
              Login to access your admin portal
            </p>

          </div>


          {/* Login Form */}

          <form onSubmit={handleLogin}>


            {/* Username */}

            <div className="form-group">

              <label>
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                autoComplete="username"
              />

            </div>


            {/* Password */}

            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />

            </div>


            {/* Options */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                />

                Remember me

              </label>


              <button
                type="button"
                className="forgot-btn"
                onClick={() =>
                  alert(
                    "Forgot password feature will be added later."
                  )
                }
              >
                Forgot Password?
              </button>

            </div>


            {/* Error */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}


            {/* Login Button */}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Login"}

            </button>

          </form>


          {/* Footer */}

          <div className="login-footer">

            <span>
              Secure Business Portal
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;