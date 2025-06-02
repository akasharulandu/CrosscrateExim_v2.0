import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from "../components/Navbar";
import ProductTable from "../components/ProductTable";

function AdminDashboard() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const [heroPhoto, setHeroPhoto] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProducts();
      const timeout = setTimeout(() => setShowWelcome(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Fetching products failed:", err);
    }
  };

  const uploadHeroImage = async (e) => {
    e.preventDefault();
    if (!heroPhoto) {
      alert("Please select a photo before uploading.");
      return;
    }
    const formData = new FormData();
    formData.append("photo", heroPhoto);

    try {
      await axios.post("/api/hero/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Hero image updated!");
      setHeroPhoto(null);
      setHeroPreview(null);
    } catch (err) {
      console.error("Hero image upload failed:", err);
      alert("Hero image upload failed");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { state: { loggedOut: true } });
  };

  const goBackToHome = () => {
    navigate("/");
  };

  // Dynamic Styles based on theme
  const pageBackground =
    theme === "dark"
      ? "#1c1c1e"
      : "url('https://images.unsplash.com/photo-1707130868349-3ed75fc7fe8f?q=80&w=1942&auto=format&fit=crop')";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";

  const cardBaseStyle = {
    border: "none",
    borderRadius: "16px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
    color: textColor,
  };

  const heroCardStyle = {
    ...cardBaseStyle,
    background:
      theme === "dark"
        ? "linear-gradient(270deg, #434343, #000000)"
        : "linear-gradient(270deg, #e0c3fc, #8ec5fc)",
  };

  const productCardStyle = {
    ...cardBaseStyle,
    background:
      theme === "dark"
        ? "linear-gradient(270deg, #232526, #414345)"
        : "linear-gradient(270deg, #89f7fe, #66a6ff)",
  };

  return (
    <>
      <Navbar
        isAdmin={true}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowLogoutAlert={setShowLogoutAlert}
      />

      <div
        className="container-fluid"
        style={{
          minHeight: "100vh",
          paddingTop: "120px",
          background: pageBackground,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: textColor,
          transition: "all 0.3s ease",
        }}
      >
        {showWelcome && (
          <div
            className={`alert ${
              theme === "dark" ? "alert-dark" : "alert-success"
            } text-center fw-bold`}
            role="alert"
          >
            Welcome to Admin Dashboard!
          </div>
        )}

        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: textColor }}>
              Admin Dashboard
            </h2>
          </div>

          {/* Hero Image Upload Section */}
          <div className="card p-4 mb-5 animated-glass" style={heroCardStyle}>
            <h4 className="mb-3">Update Hero Image</h4>
            <form onSubmit={uploadHeroImage}>
              <input
                type="file"
                className="form-control mb-3"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setHeroPhoto(e.target.files[0]);
                    setHeroPreview(URL.createObjectURL(e.target.files[0]));
                  } else {
                    setHeroPhoto(null);
                    setHeroPreview(null);
                  }
                }}
              />
              {heroPreview && (
                <img
                  src={heroPreview}
                  alt="Hero Preview"
                  className="img-fluid mb-3 rounded"
                  style={{ maxHeight: "200px" }}
                />
              )}
              <button
                type="submit"
                className={`btn ${theme === "dark" ? "btn-light" : "btn-primary"}`}
                disabled={!heroPhoto}
              >
                Upload Hero Image
              </button>
            </form>
          </div>

          {/* Product Table Section */}
          <div className="card p-4 mb-5 animated-glass" style={productCardStyle}>
            <h4 className="mb-3">Manage Products</h4>
            <ProductTable products={products} theme={theme} />
          </div>
        </div>
      </div>

      {/* Wave Gradient Animation Keyframes */}
      <style>
        {`
          @keyframes waveBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </>
  );
}

export default AdminDashboard;
