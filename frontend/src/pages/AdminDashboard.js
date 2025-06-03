"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import "bootstrap/dist/css/bootstrap.min.css"
import { FaHome, FaBoxOpen } from "react-icons/fa"

import Navbar from "../components/Navbar"
import ProductTable from "../components/ProductTable"
import "./AdminDashboard.css"

function AdminDashboard() {
  const navigate = useNavigate()

  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("light")
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  const [products, setProducts] = useState([])
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    } else {
      fetchProducts()
      const timeout = setTimeout(() => setShowWelcome(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [navigate])

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setProducts(res.data)
    } catch (err) {
      console.error("Fetching products failed:", err)
    }
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/", { state: { loggedOut: true } })
  }

  const goBackToHome = () => {
    navigate("/")
  }

  return (
    <div className={`crosscrate-adash-root ${theme}`}>
      <Navbar
        isAdmin={true}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowLogoutAlert={setShowLogoutAlert}
      />

      <div className="crosscrate-adash-container">
        {showWelcome && (
          <motion.div
            className="crosscrate-adash-welcome-alert"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="crosscrate-adash-welcome-content">
              <h3>Welcome to Admin Dashboard!</h3>
              <p>Manage your products and website content here</p>
            </div>
          </motion.div>
        )}

        <div className="crosscrate-adash-header">
          <h1 className="crosscrate-adash-title">Admin Dashboard</h1>
          <div className="crosscrate-adash-actions">
            <button className="crosscrate-adash-action-btn crosscrate-adash-home-btn" onClick={goBackToHome}>
              <FaHome /> Go to Homepage
            </button>
          </div>
        </div>

        <div className="crosscrate-adash-content">
          <div className="crosscrate-adash-grid-single">
            {/* Product Management Card */}
            <motion.div
              className="crosscrate-adash-card crosscrate-adash-product-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="crosscrate-adash-card-header">
                <h2 className="crosscrate-adash-card-title">
                  <FaBoxOpen className="crosscrate-adash-card-icon" /> Product Management
                </h2>
                <p className="crosscrate-adash-card-description">Add, edit, or remove products from your catalog</p>
              </div>

              <div className="crosscrate-adash-product-table-wrapper">
                <ProductTable products={products} theme={theme} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

