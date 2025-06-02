import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSun, FaMoon, FaBell } from "react-icons/fa";
import logo from "../assets/logo.png";
import languageText from "../utils/languageText";
import Notifications from "../pages/Notifiactions";

function Navbar({ isAdmin, language, setLanguage, theme, toggleTheme, setShowLogoutAlert }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onHomePage = location.pathname === "/";

  const navbarText = languageText[language] || {};
  const productText = languageText[language]?.product || {};

  const handleHomeClick = () => {
    if (onHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      // Fetch unread message count from backend
      const fetchUnreadCount = async () => {
        try {
          const res = await fetch("/api/messages", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch messages");
          const messages = await res.json();
          const unread = messages.filter((msg) => !msg.read).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error("Error fetching unread messages count", err);
        }
      };
      fetchUnreadCount();

      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const themeClass = theme === "dark" ? "dark-theme" : "light-theme";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top rounded-bottom">
      <div className="container-fluid px-3">
        <div
          className="navbar-brand d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={handleHomeClick}
        >
          <img src={logo} alt="Logo" width="70" height="50" className="d-inline-block align-top" />
          <span className="brand-text">
            CROSSCRATE <span className="highlight">EXIM</span>
          </span>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mt-2 mt-lg-0 custom-nav">
            {onHomePage ? (
              <>
                <li className="nav-item">
                  <span className="nav-link" style={{ cursor: "pointer" }} onClick={handleHomeClick}>
                    {navbarText.navbar?.home || "Home"}
                  </span>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#products">
                    {navbarText.navbar?.products || "Products"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about">
                    {navbarText.navbar?.about || "About"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#mission">
                    {navbarText.navbar?.mission || "Mission"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#values">
                    {navbarText.navbar?.values || "Values"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contact">
                    {navbarText.navbar?.contact || "Contact"}
                  </a>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  {navbarText.navbar?.home || "Home"}
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2">
            {/* Language Selector */}
            <select
              className="form-select form-select-sm me-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: "auto",
                backgroundColor: theme === "dark" ? "#343a40" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                borderColor: theme === "dark" ? "#6c757d" : "#ced4da",
              }}
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="ml">Malayalam</option>
            </select>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                backgroundColor: theme === "dark" ? "#ffc107" : "#343a40",
                color: theme === "dark" ? "#343a40" : "#fff",
                border: "none",
                padding: "5px 10px",
                fontSize: "14px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginRight: "0.5rem",
                cursor: "pointer",
                boxShadow: theme === "dark" ? "0 0 8px #ffc107aa" : "none",
                transition: "background-color 0.3s ease, color 0.3s ease",
              }}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
              <span style={{ display: window.innerWidth >= 576 ? "inline" : "none" }}>
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            {/* Notification Bell for Admin */}
            {isAdmin && (
              <div
                className="nav-icon position-relative me-3"
                style={{ cursor: "pointer", fontSize: "1.5rem", color: "white" }}
                title="Notifications"
                onClick={() => navigate("/notifications")}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {unreadCount}
                    <span className="visually-hidden">unread messages</span>
                  </span>
                )}
              </div>
            )}

            {/* Admin Panel and Logout Buttons */}
            {isAdmin ? (
              <>
                <Link to="/dashboard" className="btn btn-warning btn-sm me-2">
                  Admin Panel
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setShowLogoutAlert(true);
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 1500);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin" className="btn btn-success btn-sm">
                {navbarText.navbar?.login || "Login"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
