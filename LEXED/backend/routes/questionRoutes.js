const express = require('express');
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const checkRole = require("../middleware/checkRole");
const {getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion} = require("../controllers/questionController")
router.route("/exams/:examId/sets/:questionSet/questions").get(getQuestions)
router.route("/exams/:examId/sets/:questionSet/questions/:questionNumber").get(getQuestion)

router.route("/exams/:examId/sets/:questionSet/questions").post(validateToken, checkRole("ADMIN"), createQuestion)
router.route("/exams/:examId/sets/:questionSet/questions/:questionNumber").put(validateToken, checkRole("ADMIN"),updateQuestion)
router.route("/exams/:examId/sets/:questionSet/questions/:questionNumber").delete(validateToken, checkRole("ADMIN"), deleteQuestion)



module.exports = router