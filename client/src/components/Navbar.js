import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSun, FaMoon, FaBell, FaGlobe, FaChevronDown } from "react-icons/fa";
import logo from "../assets/logo.png";
import languageText from "../utils/languageText";
import './Navbar.css';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false);
      }
    }
    if (languageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageDropdownOpen]);

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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const themeClass = theme === "dark" ? "dark-theme" : "light-theme";

  return (
    <nav 
      className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'scrolled' : ''} ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}
      style={{
        transition: "all 0.3s ease",
        boxShadow: isScrolled ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
        background: theme === "dark" 
          ? isScrolled ? "#1a1a1a" : "rgba(33, 37, 41, 0.9)"
          : isScrolled ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: isScrolled ? "0.5rem 1rem" : "0.3rem",
        
      }}
    >
      <div className="container" style={{ paddingLeft: 0, marginLeft: 0, maxWidth: "100%" }}>
        <div
          className="navbar-brand d-flex align-items-center"
          style={{ cursor: "pointer", marginLeft: "2px" }}
          onClick={handleHomeClick}
        >
          <img 
            src={logo || "/placeholder.svg"} 
            alt="Logo" 
            className="logo-image"
            style={{
              height: isScrolled ? "40px" : "50px",
              transition: "height 0.3s ease",
              marginRight: "px",
              boxShadow: "0 0 30px 0 rgba(27, 27, 27, 0.1)",
              borderRadius: "50%"
            }}
          />
          <div className="brand-text">
            <span className="brand-name" style={{color: theme === "dark" ? "#fff" : "#000"}}>CROSSCRATE</span>
            <span className="brand-highlight" style={{color: theme === "dark" ? "blue" : "blue",paddingLeft: "10px"}}>EXIM</span>
          </div>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
          style={{
            border: "none",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            backgroundColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mt-2 mt-lg-0 custom-nav fw-bold">
            {onHomePage ? (
              <>
                <li className="nav-item">
                  <span className="nav-link nav-link-underline" style={{ cursor: "pointer" }} onClick={handleHomeClick}>
                    {navbarText.navbar?.home || "Home"}
                  </span>
                </li>
                <li className="nav-item">
                  <a className="nav-link nav-link-underline" href="#products">
                    {navbarText.navbar?.products || "Products"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link nav-link-underline" href="#about">
                    {navbarText.navbar?.about || "About"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link nav-link-underline" href="#mission">
                    {navbarText.navbar?.mission || "Mission"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link nav-link-underline" href="#values">
                    {navbarText.navbar?.values || "Values"}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link nav-link-underline" href="#contact">
                    {navbarText.navbar?.contact || "Contact"}
                  </a>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link nav-link-underline" to="/">
                  {navbarText.navbar?.home || "Home"}
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2">
            {/* Language Selector */}
            <div className="dropdown" ref={languageDropdownRef}>
              <button 
                className="btn dropdown-toggle language-selector"
                type="button"
                id="languageDropdown"
                aria-expanded={languageDropdownOpen}
                onClick={() => setLanguageDropdownOpen((open) => !open)}
                style={{
                  backgroundColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: "none",
                  padding: "0.25rem 0.4rem",
                  borderRadius: "0.18rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.78rem",
                  minHeight: "32px",
                  height: "35px"
                }}
              >
                <FaGlobe style={{ fontSize: "0.95rem" }} />
                {language === "en" ? "English" : 
                 language === "ta" ? "Tamil" : 
                 language === "hi" ? "Hindi" : 
                 language === "ml" ? "Malayalam" : language}
                <FaChevronDown style={{ fontSize: "0.7rem", marginLeft: "0.18rem" }} />
              </button>
              <ul 
                className={`dropdown-menu${languageDropdownOpen ? ' show' : ''}`}
                aria-labelledby="languageDropdown"
                style={{
                  backgroundColor: theme === "dark" ? "#343a40" : "#fff",
                  border: theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
                  borderRadius: "0.25rem",
                  boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                  padding: "0.5rem 0",
                  minWidth: "10rem",
                  display: languageDropdownOpen ? 'block' : 'none',
                  position: 'absolute',
                  zIndex: 1000
                }}
              >
                <li>
                  <button 
                    className={`dropdown-item ${language === "en" ? "active" : ""}`} 
                    onClick={() => { setLanguage("en"); setLanguageDropdownOpen(false); }}
                    style={{
                      color: theme === "dark" ? "#fff" : "#212529",
                      backgroundColor: language === "en" ? (theme === "dark" ? "#495057" : "#e9ecef") : "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem"
                    }}
                  >
                    English
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${language === "ta" ? "active" : ""}`} 
                    onClick={() => { setLanguage("ta"); setLanguageDropdownOpen(false); }}
                    style={{
                      color: theme === "dark" ? "#fff" : "#212529",
                      backgroundColor: language === "ta" ? (theme === "dark" ? "#495057" : "#e9ecef") : "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem"
                    }}
                  >
                    Tamil
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${language === "hi" ? "active" : ""}`} 
                    onClick={() => { setLanguage("hi"); setLanguageDropdownOpen(false); }}
                    style={{
                      color: theme === "dark" ? "#fff" : "#212529",
                      backgroundColor: language === "hi" ? (theme === "dark" ? "#495057" : "#e9ecef") : "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem"
                    }}
                  >
                    Hindi
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${language === "ml" ? "active" : ""}`} 
                    onClick={() => { setLanguage("ml"); setLanguageDropdownOpen(false); }}
                    style={{
                      color: theme === "dark" ? "#fff" : "#212529",
                      backgroundColor: language === "ml" ? (theme === "dark" ? "#495057" : "#e9ecef") : "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem"
                    }}
                  >
                    Malayalam
                  </button>
                </li>
              </ul>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="theme-toggle-btn"
              style={{
                backgroundColor: theme === "dark" ? "#ffc107" : "#343a40",
                color: theme === "dark" ? "#343a40" : "#fff",
                border: "none",
                padding: "0.38rem 0.7rem",
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                boxShadow: theme === "dark" ? "0 0 8px rgba(255, 193, 7, 0.5)" : "none",
                transition: "all 0.3s ease"
              }}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
              <span className="d-none d-sm-inline">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            {/* Notification Bell for Admin */}
            {isAdmin && (
              <div
                className="notification-bell"
                style={{ 
                  cursor: "pointer", 
                  fontSize: "1.25rem", 
                  color: theme === "dark" ? "#fff" : "#343a40",
                  position: "relative",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Notifications"
                onClick={() => navigate("/notifications")}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span
                    className="notification-badge"
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      borderRadius: "50%",
                      fontSize: "0.6rem",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold"
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            )}

            {/* Admin Panel and Logout Buttons */}
            {isAdmin ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="admin-btn"
                  style={{
                    backgroundColor: "#ffc107",
                    color: "#212529",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    paddingTop: "8px",
                    borderRadius: "0.18rem",
                    textDecoration: "none",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    display: "inline-block",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    minHeight: "32px",
                    height: "35px",
                    
                  }}
                >
                  Admin Panel
                </Link>
                <button
                  className="logout-btn"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setShowLogoutAlert(true);
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 1500);
                  }}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "0.42rem 0.7rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    
                    
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/admin" 
                className="login-btn"
                style={{
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.25rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  display: "inline-block",
                  textAlign: "center",
                  transition: "all 0.3s ease"
                }}
              >
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


