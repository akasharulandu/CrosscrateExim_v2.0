import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import "./Login.css";

function Login({ setIsAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setIsAdmin(true);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginx-container">
      <div className="loginx-background">
        <div className="loginx-shape"></div>
        <div className="loginx-shape"></div>
      </div>
      
      <motion.div 
        className="loginx-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        data-aos="fade-up"
      >
        <div className="loginx-header">
          <h2>Admin Login</h2>
          <p>Enter your credentials to access the dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="loginx-form">
          <div className="loginx-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="loginx-form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="loginx-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="loginx-form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="loginx-form-actions">
            <button 
              type="submit" 
              className="loginx-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loginx-spinner">
                  <div className="bounce1"></div>
                  <div className="bounce2"></div>
                  <div className="bounce3"></div>
                </div>
              ) : (
                "Login"
              )}
            </button>
            
            <Link to="/" className="loginx-back-link">
              Back to Homepage
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
