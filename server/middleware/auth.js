// middleware/auth.js
import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const SECRET = process.env.JWT_SECRET || "supersecretkey"
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    console.log("Auth token verified for user:", decoded.user)
    next()
  } catch (err) {
    console.error("Auth error:", err)
    res.status(403).json({ message: "Invalid or expired token" })
  }
}

export default authMiddleware
