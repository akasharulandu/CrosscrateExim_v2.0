// // controllers/authController.js
// import jwt from "jsonwebtoken"

// class AuthController {
//   static async login(req, res) {
//     try {
//       console.log("=== Login Attempt ===")
//       console.log("Request body:", req.body)
//       console.log("Content-Type:", req.headers["content-type"])

//       const { username, password } = req.body

//       console.log("Received username:", username)
//       console.log("Received password:", password ? "***" : "undefined")

//       // Check if username and password are provided
//       if (!username || !password) {
//         console.log("❌ Missing username or password")
//         return res.status(400).json({
//           success: false,
//           message: "Username and password are required",
//         })
//       }

//       const ADMIN = { username: "admin", password: "admin123" }
//       const SECRET = process.env.JWT_SECRET || "supersecretkey"

//       console.log("Expected username:", ADMIN.username)
//       console.log("Expected password:", ADMIN.password)
//       console.log("Username match:", username === ADMIN.username)
//       console.log("Password match:", password === ADMIN.password)

//       if (username === ADMIN.username && password === ADMIN.password) {
//         const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" })
//         console.log("✅ Login successful - Token generated")
//         return res.json({ success: true, token })
//       }

//       console.log("❌ Login failed - Invalid credentials")
//       console.log("Provided credentials:", { username, password })
//       res.status(401).json({ success: false, message: "Invalid credentials" })
//     } catch (error) {
//       console.error("❌ Login error:", error)
//       res.status(500).json({ success: false, message: "Login failed", error: error.message })
//     }
//   }

//   static async verifyToken(req, res) {
//     try {
//       const token = req.headers.authorization?.split(" ")[1]
//       if (!token) {
//         return res.status(401).json({ valid: false, message: "No token provided" })
//       }

//       const SECRET = process.env.JWT_SECRET || "supersecretkey"
//       const decoded = jwt.verify(token, SECRET)
//       res.json({ valid: true, user: decoded.user })
//     } catch (error) {
//       res.status(401).json({ valid: false, message: "Invalid token" })
//     }
//   }
// }

// export default AuthController



// controllers/authController.js
import jwt from "jsonwebtoken"

class AuthController {
  static async login(req, res) {
    try {
      console.log("=== Login Attempt ===")
      console.log("Request body:", req.body)
      console.log("Content-Type:", req.headers["content-type"])

      const { username, password } = req.body

      console.log("Received username:", username)
      console.log("Received password:", password ? "***" : "undefined")

      // Check if username and password are provided
      if (!username || !password) {
        console.log("❌ Missing username or password")
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        })
      }

      const ADMIN = { username: "admin", password: "admin123" }
      const SECRET = process.env.JWT_SECRET || "supersecretkey"

      console.log("Expected username:", ADMIN.username)
      console.log("Expected password:", ADMIN.password)
      console.log("Username match:", username === ADMIN.username)
      console.log("Password match:", password === ADMIN.password)

      if (username === ADMIN.username && password === ADMIN.password) {
        const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" })
        console.log("✅ Login successful - Token generated")
        return res.json({ success: true, token })
      }

      console.log("❌ Login failed - Invalid credentials")
      console.log("Provided credentials:", { username, password })
      res.status(401).json({ success: false, message: "Invalid credentials" })
    } catch (error) {
      console.error("❌ Login error:", error)
      res.status(500).json({ success: false, message: "Login failed", error: error.message })
    }
  }

  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
        return res.status(401).json({ valid: false, message: "No token provided" })
      }

      const SECRET = process.env.JWT_SECRET || "supersecretkey"
      const decoded = jwt.verify(token, SECRET)
      res.json({ valid: true, user: decoded.user })
    } catch (error) {
      res.status(401).json({ valid: false, message: "Invalid token" })
    }
  }
}

export default AuthController
