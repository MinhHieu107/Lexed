const connection = require("../config/db");

// GET ALL QUESTIONS OF AN EXAM
const getQuestions = (req, res) => {
    const { examId, questionSet } = req.params;

    connection.query(
        `SELECT *
         FROM questions
         WHERE exam_id = ?
         AND question_set = ?
         ORDER BY question_number`,
        [examId, questionSet],
        (err, results) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);
        }
    );
};

// GET ONE QUESTION
const getQuestion = (req, res) => {
    const { examId, questionSet, questionNumber } = req.params;

    connection.query(
        `SELECT *
         FROM questions
         WHERE exam_id = ?
         AND question_set = ?
         AND question_number = ?`,
        [examId, questionSet, questionNumber],
        (err, results) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Question not found"
                });
            }

            res.status(200).json(results[0]);
        }
    );
};

// CREATE QUESTION
const createQuestion = (req, res) => {
    const { examId, questionSet } = req.params;

    const {
        noi_dung,
        nhan_dinh,
        co_so_phap_ly,
        giai_thich
    } = req.body;

    connection.query(
        `SELECT IFNULL(MAX(question_number),0)+1 AS nextQuestionNumber
         FROM questions
         WHERE exam_id = ?
         AND question_set = ?`,
        [examId, questionSet],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            const nextNumber = result[0].nextQuestionNumber;

            connection.query(
                `INSERT INTO questions
                (exam_id, question_set, question_number, noi_dung, nhan_dinh, co_so_phap_ly, giai_thich)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    examId,
                    questionSet,
                    nextNumber,
                    noi_dung,
                    nhan_dinh,
                    co_so_phap_ly,
                    giai_thich
                ],
                (err, insertResult) => {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(201).json({
                        message: "Question created successfully",
                        question_number: nextNumber,
                        id: insertResult.insertId
                    });
                }
            );
        }
    );
};

// UPDATE QUESTION
const updateQuestion = (req, res) => {
    const { examId, questionSet, questionNumber } = req.params;

    const {
        noi_dung,
        nhan_dinh,
        co_so_phap_ly,
        giai_thich
    } = req.body;

    connection.query(
        `UPDATE questions
         SET
            noi_dung = ?,
            nhan_dinh = ?,
            co_so_phap_ly = ?,
            giai_thich = ?
         WHERE exam_id = ?
         AND question_set = ?
         AND question_number = ?`,
        [
            noi_dung,
            nhan_dinh,
            co_so_phap_ly,
            giai_thich,
            examId,
            questionSet,
            questionNumber
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Question not found"
                });
            }

            res.status(200).json({
                message: "Question updated successfully"
            });
        }
    );
};
// DELETE QUESTION
const deleteQuestion = (req, res) => {
    const { examId, questionSet, questionNumber } = req.params;

    connection.query(
        `DELETE FROM questions
         WHERE exam_id = ?
         AND question_set = ?
         AND question_number = ?`,
        [examId, questionSet, questionNumber],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Question not found"
                });
            }

            // Đánh lại số thứ tự
            connection.query(
                `UPDATE questions
                 SET question_number = question_number - 1
                 WHERE exam_id = ?
                 AND question_set = ?
                 AND question_number > ?`,
                [examId, questionSet, questionNumber],
                (err) => {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json({
                        message: "Question deleted successfully"
                    });
                }
            );
        }
    );
};


module.exports = {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
};