const express = require('express');
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const checkRole = require("../middleware/checkRole");
const {
    getMySets,
    getSet,
    getSetQuestions,
    createSet,
    updateSet,
    deleteSet,
    getSetProgress
} = require("../controllers/flashcardSetController");

router.route("/sets/mine").get(validateToken, getMySets);
router.route("/sets/:setId").get(validateToken, getSet);
router.route("/sets/:setId/questions").get(validateToken, getSetQuestions);
router.route("/sets/:setId/progress").get(validateToken, checkRole("TEACHER"), getSetProgress);

router.route("/sets").post(validateToken, checkRole("USER", "TEACHER", "ADMIN"), createSet);
router.route("/sets/:setId").put(validateToken, checkRole("USER", "TEACHER", "ADMIN"), updateSet);
router.route("/sets/:setId").delete(validateToken, checkRole("USER", "TEACHER", "ADMIN"), deleteSet);

module.exports = router;
