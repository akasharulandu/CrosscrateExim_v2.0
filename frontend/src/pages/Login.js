import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Login.css"; // Optional: for custom CSS if needed

function Login({ setIsAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setIsAdmin(true);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(to right, rgb(54 191 185), rgb(152 222 191))",
      }}
    >
      <div
        className="p-4 border rounded shadow"
        style={{
          minWidth: "320px",
          maxWidth: "400px",
          background: "#fff",
        }}
        data-aos="fade-up"
      >
        <h2 className="mb-4 text-center">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="d-flex justify-content-between align-items-center">
            <button type="submit" className="btn btn-primary">Login</button>
            <Link to="/" className="btn btn-link">Back to Homepage</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
