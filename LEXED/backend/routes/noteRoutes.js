const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");

const {
    getNotes,
    createNote,
    updateNote,
    deleteNote
} = require("../controllers/noteController");

router.route("/").get(validateToken, getNotes);
router.route("/").post(validateToken, createNote);
router.route("/:id").put(validateToken, updateNote);
router.route("/:id").delete(validateToken, deleteNote);

module.exports = router;
