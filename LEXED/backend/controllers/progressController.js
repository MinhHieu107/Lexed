const connection = require("../config/db");

const getSummary = (req, res) => {

    connection.query(
        `SELECT
            fs.id AS set_id,
            fs.exam_id,
            fs.title AS name,
            fs.visibility,
            c.name AS class_name,
            COUNT(DISTINCT q.id) AS total_questions,
            COUNT(DISTINCT CASE WHEN latest.is_correct = 1 THEN q.id END) AS mastered_count
         FROM flashcard_sets fs
         JOIN questions q ON q.set_id = fs.id
         LEFT JOIN classes c ON c.id = fs.class_id
         LEFT JOIN (
             SELECT question_id, is_correct
             FROM (
                 SELECT
                    question_id,
                    is_correct,
                    ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY answered_at DESC) AS rn
                 FROM question_attempts
                 WHERE user_id = ?
             ) ranked
             WHERE rn = 1
         ) latest ON latest.question_id = q.id
         WHERE (
            fs.visibility = 'GLOBAL'
            OR (fs.visibility = 'PRIVATE' AND fs.owner_id = ?)
            OR (fs.visibility = 'CLASS' AND fs.class_id IN (
                SELECT id FROM classes WHERE teacher_id = ?
                UNION
                SELECT class_id FROM class_members WHERE user_id = ? AND status = 'ACTIVE'
            ))
         )
         GROUP BY fs.id, fs.exam_id, fs.title, fs.visibility, c.name`,
        [req.user.id, req.user.id, req.user.id, req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            const summary = results.map((row) => ({
                set_id: row.set_id,
                exam_id: row.exam_id,
                name: row.visibility === "CLASS" && row.class_name
                    ? `${row.name} (${row.class_name})`
                    : row.name,
                visibility: row.visibility,
                total_questions: row.total_questions,
                mastered_count: row.mastered_count,
                mastered_percent: row.total_questions === 0
                    ? 0
                    : Math.round((row.mastered_count / row.total_questions) * 100)
            }));

            res.status(200).json(summary);

        }
    );

};

const getStats = (req, res) => {

    connection.query(
        `SELECT COUNT(*) AS total_correct
         FROM question_attempts qa
         JOIN daily_challenges dc
            ON dc.question_id = qa.question_id
            AND dc.challenge_date = DATE(qa.answered_at)
         WHERE qa.user_id = ? AND qa.is_correct = 1`,
        [req.user.id],
        (err, correctResults) => {

            if (err) {
                return res.status(500).json(err);
            }

            connection.query(
                `SELECT DISTINCT dc.challenge_date AS attempt_date
                 FROM daily_challenges dc
                 JOIN question_attempts qa
                    ON qa.question_id = dc.question_id
                    AND DATE(qa.answered_at) = dc.challenge_date
                 WHERE qa.user_id = ?
                 ORDER BY attempt_date DESC`,
                [req.user.id],
                (err, dateResults) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    const dayKeys = new Set(
                        dateResults.map((row) => {
                            const d = new Date(row.attempt_date);
                            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                        })
                    );

                    let cursor = new Date();

                    const cursorKey = () =>
                        `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;

                    if (!dayKeys.has(cursorKey())) {
                        cursor.setDate(cursor.getDate() - 1);
                    }

                    let streak = 0;

                    while (dayKeys.has(cursorKey())) {
                        streak++;
                        cursor.setDate(cursor.getDate() - 1);
                    }

                    res.status(200).json({
                        streak,
                        totalCorrect: correctResults[0].total_correct
                    });

                }
            );

        }
    );

};

const getChallengeForToday = (res, today, userId) => {

    connection.query(
        `SELECT q.*, e.name AS exam_name
         FROM daily_challenges dc
         JOIN questions q ON q.id = dc.question_id
         JOIN exams e ON e.id = q.exam_id
         WHERE dc.challenge_date = ?`,
        [today],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Daily challenge not found"
                });
            }

            const challenge = results[0];

            connection.query(
                `SELECT is_correct
                 FROM question_attempts
                 WHERE user_id = ? AND question_id = ? AND DATE(answered_at) = ?
                 ORDER BY answered_at DESC
                 LIMIT 1`,
                [userId, challenge.id, today],
                (err, attemptResults) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    if (attemptResults.length > 0) {

                        const wasCorrect = !!attemptResults[0].is_correct;

                        challenge.already_answered = true;
                        challenge.was_correct = wasCorrect;
                        challenge.previous_answer = wasCorrect
                            ? challenge.nhan_dinh
                            : (challenge.nhan_dinh === "ĐÚNG" ? "SAI" : "ĐÚNG");

                    } else {

                        challenge.already_answered = false;
                        challenge.was_correct = null;
                        challenge.previous_answer = null;

                    }

                    res.status(200).json(challenge);

                }
            );

        }
    );

};

const getDailyChallenge = (req, res) => {

    connection.query(
        "SELECT CURDATE() AS today",
        (err, dateResult) => {

            if (err) {
                return res.status(500).json(err);
            }

            const today = dateResult[0].today;

            connection.query(
                `SELECT question_id
                 FROM daily_challenges
                 WHERE challenge_date = ?`,
                [today],
                (err, existing) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    if (existing.length > 0) {
                        return getChallengeForToday(res, today, req.user.id);
                    }

                    // Chưa có câu nào cho hôm nay: random 1 câu rồi chốt lại cho cả ngày.
                    // Chỉ random trong các set GLOBAL (công khai) để tránh lộ câu hỏi riêng tư/lớp học của người khác.
                    connection.query(
                        `SELECT q.id
                         FROM questions q
                         JOIN flashcard_sets fs ON fs.id = q.set_id
                         WHERE fs.visibility = 'GLOBAL'
                         ORDER BY RAND() LIMIT 1`,
                        (err, randomResult) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            if (randomResult.length === 0) {
                                return res.status(404).json({
                                    message: "No questions available"
                                });
                            }

                            const questionId = randomResult[0].id;

                            connection.query(
                                `INSERT INTO daily_challenges (challenge_date, question_id)
                                 VALUES (?, ?)
                                 ON DUPLICATE KEY UPDATE question_id = question_id`,
                                [today, questionId],
                                (err) => {

                                    if (err) {
                                        return res.status(500).json(err);
                                    }

                                    getChallengeForToday(res, today, req.user.id);

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};

const recordAttempt = (req, res) => {

    const { question_id, is_correct } = req.body;

    if (!question_id || typeof is_correct !== "boolean") {
        return res.status(400).json({
            message: "question_id and is_correct are required"
        });
    }

    connection.query(
        `INSERT INTO question_attempts (user_id, question_id, is_correct)
         VALUES (?, ?, ?)`,
        [req.user.id, question_id, is_correct],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Attempt recorded successfully",
                id: result.insertId
            });

        }
    );

};

module.exports = {
    getSummary,
    getStats,
    getDailyChallenge,
    recordAttempt
};
