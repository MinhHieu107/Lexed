const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");


const {
    register,
    login,
    currentUser,
    refresh,
    logout,
    verifyEmail,
    resendCode
} = require("../controllers/authController");


router.get("/current", validateToken, currentUser);
router.post("/register", register);
router.post("/logout", logout);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendCode);


module.exports = router;