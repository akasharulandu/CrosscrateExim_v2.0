import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from './components/Navbar';
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from './pages/Notifiactions';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAdmin(!!token); // true if token exists
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      <NavigationBar
        isAdmin={isAdmin}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowLogoutAlert={setShowLogoutAlert}
      />

      {showLogoutAlert && (
        <div className="alert alert-warning text-center" role="alert">
          Logging out...
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home language={language} isAdmin={isAdmin} />} />
        <Route path="/admin" element={<Login setIsAdmin={setIsAdmin} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAdmin={isAdmin}>
              <AdminDashboard isAdmin={isAdmin} />
            </ProtectedRoute>
          }
        />
        {/* New Notifications Route */}
        <Route path="/notifications" element={<Notifications theme={theme} />} />
      </Routes>
    </Router>
  );
}

export default App;
