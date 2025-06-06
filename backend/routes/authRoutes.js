// routes/authRoutes.js
import express from "express"
import AuthController from "../controllers/authController.js"

const router = express.Router()

router.post("/login", AuthController.login)
router.get("/verify", AuthController.verifyToken)

export default router
