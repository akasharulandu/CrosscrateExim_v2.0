"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import AOS from "aos"
import "aos/dist/aos.css"
import { motion } from "framer-motion"
import "./Login.css"

function Login({ setIsAdmin, onLoginSuccess, redirectPath = "/dashboard" }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Get API URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"
  const LOGIN_ENDPOINT = `${API_BASE_URL}/api/login`

  useEffect(() => {
    AOS.init({ duration: 1000 })

    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      verifyToken(token)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      })

      if (response.data.valid) {
        if (setIsAdmin) setIsAdmin(true)
        if (navigate) navigate(redirectPath)
      }
    } catch (error) {
      console.log("Token verification failed:", error.message)
      localStorage.removeItem("token")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      return false
    }

    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("=== Login Debug Info ===")
      console.log("API URL:", LOGIN_ENDPOINT)
      console.log("Username:", formData.username)

      // Use axios for consistency with main code
      const response = await axios.post(LOGIN_ENDPOINT, {
        username: formData.username.trim(),
        password: formData.password,
      })

      console.log("✅ Login response:", response.data)

      if (response.data.success && response.data.token) {
        localStorage.setItem("token", response.data.token)

        if (setIsAdmin) setIsAdmin(true)
        if (onLoginSuccess) onLoginSuccess(response.data)
        if (navigate) navigate(redirectPath)
      } else {
        setError("Invalid credentials")
      }
    } catch (error) {
      console.error("❌ Login error:", error)

      let errorMessage = "Invalid credentials"

      if (error.message.includes("Network Error") || error.code === "ERR_NETWORK") {
        errorMessage = "Cannot connect to server. Please ensure the backend is running."
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Server is taking too long to respond."
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid username or password"
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later."
        } else {
          errorMessage = error.response.data?.message || "Login failed"
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestCredentials = () => {
    setFormData({
      username: "admin",
      password: "admin123",
    })
    setError("")
  }

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

        {/* Error Message */}
        {error && (
          <motion.div
            className="loginx-error-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span>⚠️ {error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="loginx-form">
          <div className="loginx-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="loginx-form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div className="loginx-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="loginx-form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="loginx-form-actions">
            <button
              type="submit"
              className="loginx-button"
              disabled={isLoading || !formData.username.trim() || !formData.password.trim()}
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

            {/* Test Credentials Button (for development)
            {process.env.NODE_ENV === "development" && (
              <button type="button" className="loginx-test-button" onClick={handleTestCredentials} disabled={isLoading}>
                Use Test Credentials
              </button>
            )} */}

            <Link to="/" className="loginx-back-link">
              Back to Homepage
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Login
