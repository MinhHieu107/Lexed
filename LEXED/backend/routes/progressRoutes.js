const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");

const {
    getSummary,
    getStats,
    getDailyChallenge,
    recordAttempt
} = require("../controllers/progressController");

router.route("/summary").get(validateToken, getSummary);
router.route("/stats").get(validateToken, getStats);
router.route("/daily-challenge").get(validateToken, getDailyChallenge);
router.route("/attempts").post(validateToken, recordAttempt);

module.exports = router;
