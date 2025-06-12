import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAdmin, children }) {
  if (!isAdmin) {
    // If not logged in (no token), redirect to admin login
    return <Navigate to="/admin" replace />;
  }
  
  // If logged in, show the protected page
  return children;
}

export default ProtectedRoute;
