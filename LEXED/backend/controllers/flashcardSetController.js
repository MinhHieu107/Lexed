const connection = require("../config/db");
const promisePool = connection.promise();

// Điều kiện SQL: set này có được user hiện tại nhìn thấy không.
// GLOBAL: ai cũng thấy. PRIVATE: chỉ chủ sở hữu. CLASS: giáo viên của lớp hoặc thành viên ACTIVE của lớp.
const VISIBILITY_CONDITION = `(
    fs.visibility = 'GLOBAL'
    OR (fs.visibility = 'PRIVATE' AND fs.owner_id = ?)
    OR (fs.visibility = 'CLASS' AND fs.class_id IN (
        SELECT id FROM classes WHERE teacher_id = ?
        UNION
        SELECT class_id FROM class_members WHERE user_id = ? AND status = 'ACTIVE'
    ))
)`;

// GET danh sách tất cả set mà user hiện tại được phép xem
const getMySets = (req, res) => {

    const userId = req.user.id;

    connection.query(
        `SELECT
            fs.id AS set_id,
            fs.title,
            fs.description,
            fs.visibility,
            fs.exam_id,
            fs.class_id,
            fs.owner_id,
            e.name AS exam_name,
            c.name AS class_name,
            COUNT(q.id) AS total_questions
         FROM flashcard_sets fs
         LEFT JOIN exams e ON e.id = fs.exam_id
         LEFT JOIN classes c ON c.id = fs.class_id
         LEFT JOIN questions q ON q.set_id = fs.id
         WHERE ${VISIBILITY_CONDITION}
         GROUP BY fs.id, fs.title, fs.description, fs.visibility, fs.exam_id, fs.class_id, fs.owner_id, e.name, c.name
         ORDER BY fs.created_at DESC`,
        [userId, userId, userId],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);

        }
    );

};

// GET thông tin 1 set (có kiểm tra quyền xem)
const getSet = (req, res) => {

    const { setId } = req.params;
    const userId = req.user.id;

    connection.query(
        `SELECT
            fs.id AS set_id,
            fs.title,
            fs.description,
            fs.visibility,
            fs.exam_id,
            fs.class_id,
            fs.owner_id,
            e.name AS exam_name,
            c.name AS class_name
         FROM flashcard_sets fs
         LEFT JOIN exams e ON e.id = fs.exam_id
         LEFT JOIN classes c ON c.id = fs.class_id
         WHERE fs.id = ?
         AND ${VISIBILITY_CONDITION}`,
        [setId, userId, userId, userId],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Set not found or you don't have access"
                });
            }

            res.status(200).json(results[0]);

        }
    );

};

// GET câu hỏi của 1 set (có kiểm tra quyền xem, không trả câu hỏi nếu không có quyền)
const getSetQuestions = (req, res) => {

    const { setId } = req.params;
    const userId = req.user.id;

    connection.query(
        `SELECT fs.id
         FROM flashcard_sets fs
         WHERE fs.id = ?
         AND ${VISIBILITY_CONDITION}`,
        [setId, userId, userId, userId],
        (err, accessRows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (accessRows.length === 0) {
                return res.status(404).json({
                    message: "Set not found or you don't have access"
                });
            }

            connection.query(
                `SELECT * FROM questions
                 WHERE set_id = ?
                 ORDER BY question_number`,
                [setId],
                (err, questions) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json(questions);

                }
            );

        }
    );

};

// POST tạo set mới kèm danh sách câu hỏi
const createSet = (req, res) => {

    const { title, description, exam_id, visibility, class_id, questions } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!title || !title.trim()) {
        return res.status(400).json({ message: "Set title is required" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Set must have at least 1 question" });
    }

    if (!["GLOBAL", "PRIVATE", "CLASS"].includes(visibility)) {
        return res.status(400).json({ message: "Invalid visibility" });
    }

    if (visibility === "GLOBAL" && role !== "ADMIN") {
        return res.status(403).json({ message: "Only ADMIN can create global sets" });
    }

    if (visibility === "CLASS" && role !== "TEACHER") {
        return res.status(403).json({ message: "Only TEACHER can create class sets" });
    }

    if (visibility === "CLASS" && !class_id) {
        return res.status(400).json({ message: "class_id is required for CLASS sets" });
    }

    const insertSetAndQuestions = (ownerId, classId) => {

        connection.query(
            `INSERT INTO flashcard_sets (exam_id, title, description, owner_id, class_id, visibility)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [exam_id || null, title, description || null, ownerId, classId, visibility],
            (err, setResult) => {

                if (err) {
                    return res.status(500).json(err);
                }

                const setId = setResult.insertId;

                const values = questions.map((q, index) => [
                    exam_id || null,
                    setId,
                    q.noi_dung,
                    q.nhan_dinh,
                    q.co_so_phap_ly || null,
                    q.giai_thich || null,
                    index + 1,
                    setId
                ]);

                connection.query(
                    `INSERT INTO questions
                    (exam_id, set_id, noi_dung, nhan_dinh, co_so_phap_ly, giai_thich, question_number, question_set)
                    VALUES ?`,
                    [values],
                    (err, qResult) => {

                        if (err) {
                            return res.status(500).json(err);
                        }

                        res.status(201).json({
                            message: "Set created successfully",
                            set_id: setId,
                            inserted: qResult.affectedRows
                        });

                    }
                );

            }
        );

    };

    if (visibility === "CLASS") {

        // Xác nhận đúng là giáo viên chủ nhiệm của lớp này
        connection.query(
            `SELECT id FROM classes WHERE id = ? AND teacher_id = ?`,
            [class_id, userId],
            (err, rows) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (rows.length === 0) {
                    return res.status(403).json({ message: "You are not the teacher of this class" });
                }

                insertSetAndQuestions(userId, class_id);

            }
        );

    } else if (visibility === "PRIVATE") {

        insertSetAndQuestions(userId, null);

    } else {

        insertSetAndQuestions(null, null);

    }

};

// DELETE set (chỉ chủ sở hữu hoặc ADMIN)
const deleteSet = (req, res) => {

    const { setId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    connection.query(
        `SELECT owner_id, visibility FROM flashcard_sets WHERE id = ?`,
        [setId],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: "Set not found" });
            }

            const set = rows[0];
            const isOwner = set.owner_id === userId;

            if (!isOwner && role !== "ADMIN") {
                return res.status(403).json({ message: "You don't have permission to delete this set" });
            }

            connection.query(
                `DELETE FROM flashcard_sets WHERE id = ?`,
                [setId],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json({ message: "Set deleted successfully" });

                }
            );

        }
    );

};

// PUT sửa 1 set đã có (chỉ chủ sở hữu hoặc ADMIN).
// Câu hỏi có "id" -> update tại chỗ (giữ nguyên lịch sử question_attempts của học sinh).
// Câu hỏi không có "id" -> câu mới, insert.
// Câu hỏi cũ trong DB nhưng không còn trong payload -> bị xóa (học sinh đã trả lời sẽ mất lịch sử của riêng câu đó, không ảnh hưởng các câu khác).
const updateSet = async (req, res) => {

    const { setId } = req.params;
    const { title, description, exam_id, questions } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!title || !title.trim()) {
        return res.status(400).json({ message: "Set title is required" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Set must have at least 1 question" });
    }

    try {

        const [setRows] = await promisePool.query(
            `SELECT owner_id FROM flashcard_sets WHERE id = ?`,
            [setId]
        );

        if (setRows.length === 0) {
            return res.status(404).json({ message: "Set not found" });
        }

        const isOwner = setRows[0].owner_id === userId;

        if (!isOwner && role !== "ADMIN") {
            return res.status(403).json({ message: "You don't have permission to edit this set" });
        }

        await promisePool.query(
            `UPDATE flashcard_sets SET title = ?, description = ?, exam_id = ? WHERE id = ?`,
            [title, description || null, exam_id || null, setId]
        );

        const [existingRows] = await promisePool.query(
            `SELECT id FROM questions WHERE set_id = ?`,
            [setId]
        );

        const existingIds = existingRows.map((row) => row.id);
        const incomingIds = questions.filter((q) => q.id).map((q) => q.id);
        const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

        if (toDelete.length > 0) {
            await promisePool.query(
                `DELETE FROM questions WHERE id IN (?)`,
                [toDelete]
            );
        }

        let questionNumber = 1;

        for (const q of questions) {

            if (q.id && existingIds.includes(q.id)) {

                await promisePool.query(
                    `UPDATE questions
                     SET noi_dung = ?, nhan_dinh = ?, co_so_phap_ly = ?, giai_thich = ?, question_number = ?, exam_id = ?
                     WHERE id = ? AND set_id = ?`,
                    [q.noi_dung, q.nhan_dinh, q.co_so_phap_ly || null, q.giai_thich || null, questionNumber, exam_id || null, q.id, setId]
                );

            } else {

                await promisePool.query(
                    `INSERT INTO questions
                     (exam_id, set_id, noi_dung, nhan_dinh, co_so_phap_ly, giai_thich, question_number, question_set)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [exam_id || null, setId, q.noi_dung, q.nhan_dinh, q.co_so_phap_ly || null, q.giai_thich || null, questionNumber, setId]
                );

            }

            questionNumber++;

        }

        res.status(200).json({ message: "Set updated successfully" });

    } catch (err) {

        res.status(500).json(err);

    }

};

// GET tiến độ làm bài của học sinh trong 1 set thuộc lớp (chỉ giáo viên sở hữu set/lớp đó xem được)
const getSetProgress = async (req, res) => {

    const { setId } = req.params;
    const userId = req.user.id;

    try {

        const [setRows] = await promisePool.query(
            `SELECT fs.id, fs.title, fs.owner_id, fs.visibility, fs.class_id
             FROM flashcard_sets fs
             WHERE fs.id = ?`,
            [setId]
        );

        if (setRows.length === 0) {
            return res.status(404).json({ message: "Set not found" });
        }

        const set = setRows[0];

        if (set.visibility !== "CLASS") {
            return res.status(400).json({ message: "Progress tracking only applies to class sets" });
        }

        if (set.owner_id !== userId) {
            return res.status(403).json({ message: "You don't have permission to view this set's progress" });
        }

        const [countRows] = await promisePool.query(
            `SELECT COUNT(*) AS total FROM questions WHERE set_id = ?`,
            [setId]
        );

        const totalQuestions = countRows[0].total;

        const [students] = await promisePool.query(
            `SELECT
                cm.user_id,
                u.username,
                u.email,
                COALESCE(attempted.cnt, 0) AS attempted_count,
                COALESCE(mastered.cnt, 0) AS mastered_count
             FROM class_members cm
             JOIN users u ON u.id = cm.user_id
             LEFT JOIN (
                 SELECT user_id, COUNT(DISTINCT question_id) AS cnt
                 FROM question_attempts
                 WHERE question_id IN (SELECT id FROM questions WHERE set_id = ?)
                 GROUP BY user_id
             ) attempted ON attempted.user_id = cm.user_id
             LEFT JOIN (
                 SELECT user_id, COUNT(DISTINCT question_id) AS cnt
                 FROM (
                     SELECT
                        user_id, question_id, is_correct,
                        ROW_NUMBER() OVER (PARTITION BY user_id, question_id ORDER BY answered_at DESC) AS rn
                     FROM question_attempts
                     WHERE question_id IN (SELECT id FROM questions WHERE set_id = ?)
                 ) ranked
                 WHERE rn = 1 AND is_correct = 1
                 GROUP BY user_id
             ) mastered ON mastered.user_id = cm.user_id
             WHERE cm.class_id = ? AND cm.status = 'ACTIVE'
             ORDER BY u.username`,
            [setId, setId, set.class_id]
        );

        const studentProgress = students.map((s) => ({
            user_id: s.user_id,
            username: s.username,
            email: s.email,
            attempted_count: s.attempted_count,
            mastered_count: s.mastered_count,
            percent_done: totalQuestions === 0 ? 0 : Math.round((s.attempted_count / totalQuestions) * 100),
            status: s.attempted_count === 0
                ? "NOT_STARTED"
                : s.attempted_count >= totalQuestions
                    ? "COMPLETED"
                    : "IN_PROGRESS"
        }));

        const totalStudents = studentProgress.length;
        const studentsStarted = studentProgress.filter((s) => s.status !== "NOT_STARTED").length;
        const studentsCompleted = studentProgress.filter((s) => s.status === "COMPLETED").length;

        res.status(200).json({
            set_id: set.id,
            title: set.title,
            total_questions: totalQuestions,
            total_students: totalStudents,
            students_started: studentsStarted,
            students_completed: studentsCompleted,
            percent_started: totalStudents === 0 ? 0 : Math.round((studentsStarted / totalStudents) * 100),
            percent_completed: totalStudents === 0 ? 0 : Math.round((studentsCompleted / totalStudents) * 100),
            students: studentProgress
        });

    } catch (err) {

        res.status(500).json(err);

    }

};

module.exports = {
    getMySets,
    getSet,
    getSetQuestions,
    createSet,
    updateSet,
    deleteSet,
    getSetProgress
};
