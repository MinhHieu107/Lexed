const express = require('express');
const router = express.Router();
const {getExams, getExam, createExam, deleteExam, updateExam} = require("../controllers/examBankController");
const validateToken = require("../middleware/validateToken");
const checkRole = require("../middleware/checkRole");


//Get all bộ đề 
router.route("/exams").get(getExams);

//Get 1 bộ đề theo số thứ tự của nó
router.route("/exams/:examId/sets/:questionSet").get(getExam)

//Tạo thêm 1 bộ đề mới
router.route("/exams").post(validateToken, checkRole("ADMIN"),createExam)
//Update bộ đề
router.route("/exams/:examId/sets/:questionSet").put(validateToken, checkRole("ADMIN"), updateExam);
//Xóa toàn bộ bộ đề đấy dựa theo Id
router.route("/exams/:examId/sets/:questionSet").delete(validateToken, checkRole("ADMIN"), deleteExam);
module.exports = router