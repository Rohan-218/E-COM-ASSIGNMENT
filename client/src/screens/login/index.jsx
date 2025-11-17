import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "./index.css";
import { LoginButton } from "../../components/button/styles.jsx";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        handleLoginSuccess(result.token);
      } else {
        handleLoginError(result.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  const handleLoginSuccess = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      const expirationTime = new Date().getTime() + 3 * 60 * 60 * 1000;
      localStorage.setItem("tokenExpiration", expirationTime);

      const intervalId = setInterval(() => {
        if (checkTokenExpiration()) {
          clearInterval(intervalId);
        }
      }, 5 * 60 * 1000);

      setMessage("Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setMessage("Login failed: No token received.");
    }
  };

  const handleLoginError = (errorMessage) => {
    setMessage(errorMessage || "Login failed. Please check your credentials.");
  };

  const checkTokenExpiration = () => {
    const expirationTime = localStorage.getItem("tokenExpiration");
    const currentTime = new Date().getTime();

    if (currentTime > expirationTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");

      alert("Session expired. Please log in again");
      setTimeout(() => navigate("/login"), 500);
      return true;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="slogin-page">
        <div className="sform">
          <h1 className="login-h1">Login</h1>
          <form onSubmit={onSubmitForm}>
            <div className="input-group">
              <label className="slabel">Email:</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="slabel">Password:</label>
              <div className="password-container">
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
              <p className="password">
                <RouterLink to="/change-password">Change password?</RouterLink>
              </p>
            </div>
            <LoginButton type="submit">Login</LoginButton>
          </form>
          {message && (
            <p className={`message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </p>
          )}
        </div>
    </div>
  );
};

export default Login;