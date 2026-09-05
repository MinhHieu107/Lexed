const connection = require("../config/db");
const getExams = (req, res) => {
    connection.query(
        `SELECT
            q.exam_id,
            q.question_set,
            e.name,
            e.description,
            COUNT(*) AS total_questions
         FROM questions q
         JOIN exams e ON e.id = q.exam_id
         GROUP BY q.exam_id, q.question_set, e.name, e.description`,
        (err, results) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.status(200).json(results);
        }
    );
};

const getExam = (req, res) => {
    const { questionSet, examId} = req.params;

    connection.query(
        `SELECT
            q.exam_id,
            q.question_set,
            e.name,
            e.description,
            COUNT(*) AS total_questions
         FROM questions q
         JOIN exams e ON e.id = q.exam_id
         WHERE q.exam_id = ?
         AND q.question_set = ?
         GROUP BY q.exam_id, q.question_set, e.name, e.description`,
        [examId, questionSet],
        (err, results) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Exam not found" });
            }

            res.status(200).json(results[0]);
        }
    );
};
const createExam = (req, res) => {
    const { exam_id, question_set, questions } = req.body;

    const values = questions.map(q => [
        exam_id,
        question_set,
        q.question_number,
        q.noi_dung,
        q.nhan_dinh,
        q.co_so_phap_ly,
        q.giai_thich
    ]);

    connection.query(
        `INSERT INTO questions
        (exam_id, question_set, question_number, noi_dung, nhan_dinh, co_so_phap_ly, giai_thich)
        VALUES ?`,
        [values],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Exam created successfully",
                inserted: result.affectedRows
            });
        }
    );
};

    

const updateExam = (req, res) => {
    const { examId, questionSet } = req.params;
    const { newQuestionSet } = req.body;

    connection.query(
        `UPDATE questions
         SET question_set = ?
         WHERE exam_id = ?
         AND question_set = ?`,
        [newQuestionSet, examId, questionSet],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Exam not found"
                });
            }

            res.json({
                message: "Exam updated successfully"
            });
        }
    );
};

const deleteExam = (req, res) => {
    const { examId, questionSet } = req.params;

    connection.query(
        `DELETE FROM questions
         WHERE exam_id = ?
         AND question_set = ?`,
        [examId, questionSet],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Exam not found"
                });
            }

            res.json({
                message: "Exam deleted successfully"
            });
        }
    );
};

module.exports = {
    getExams,
    getExam,
    createExam,
    updateExam,
    deleteExam
}