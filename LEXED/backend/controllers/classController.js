const crypto = require("crypto");
const connection = require("../config/db");

const generateClassCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

// POST tạo lớp mới (TEACHER)
const createClass = (req, res) => {

    const { name } = req.body;
    const teacherId = req.user.id;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Class name is required" });
    }

    const tryInsert = (attemptsLeft) => {

        const code = generateClassCode();

        connection.query(
            `INSERT INTO classes (name, class_code, teacher_id) VALUES (?, ?, ?)`,
            [name, code, teacherId],
            (err, result) => {

                if (err) {

                    if (err.code === "ER_DUP_ENTRY" && attemptsLeft > 0) {
                        return tryInsert(attemptsLeft - 1);
                    }

                    return res.status(500).json(err);

                }

                res.status(201).json({
                    message: "Class created successfully",
                    class_id: result.insertId,
                    class_code: code
                });

            }
        );

    };

    tryInsert(5);

};

// GET danh sách lớp của user hiện tại (TEACHER: lớp mình dạy, USER/khác: lớp mình đã tham gia)
const getMyClasses = (req, res) => {

    const userId = req.user.id;
    const role = req.user.role;

    if (role === "TEACHER") {

        connection.query(
            `SELECT
                c.id AS class_id,
                c.name,
                c.class_code,
                COUNT(DISTINCT CASE WHEN cm.status = 'ACTIVE' THEN cm.id END) AS member_count
             FROM classes c
             LEFT JOIN class_members cm ON cm.class_id = c.id
             WHERE c.teacher_id = ?
             GROUP BY c.id, c.name, c.class_code
             ORDER BY c.created_at DESC`,
            [userId],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.status(200).json(results);

            }
        );

        return;

    }

    connection.query(
        `SELECT
            c.id AS class_id,
            c.name,
            c.class_code,
            u.username AS teacher_name
         FROM class_members cm
         JOIN classes c ON c.id = cm.class_id
         JOIN users u ON u.id = c.teacher_id
         WHERE cm.user_id = ? AND cm.status = 'ACTIVE'
         ORDER BY cm.created_at DESC`,
        [userId],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);

        }
    );

};

// POST tham gia lớp bằng mã lớp (mọi user đã đăng nhập)
const joinClassByCode = (req, res) => {

    const { class_code } = req.body;
    const userId = req.user.id;

    if (!class_code || !class_code.trim()) {
        return res.status(400).json({ message: "Class code is required" });
    }

    connection.query(
        `SELECT id, name FROM classes WHERE class_code = ?`,
        [class_code.trim().toUpperCase()],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: "Class code not found" });
            }

            const classId = rows[0].id;

            connection.query(
                `INSERT INTO class_members (class_id, user_id, status)
                 VALUES (?, ?, 'ACTIVE')
                 ON DUPLICATE KEY UPDATE status = 'ACTIVE'`,
                [classId, userId],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json({
                        message: "Joined class successfully",
                        class_id: classId,
                        class_name: rows[0].name
                    });

                }
            );

        }
    );

};

// POST thêm học sinh vào lớp bằng email (TEACHER, phải là chủ nhiệm lớp đó)
// Nếu email đã có tài khoản -> thêm ACTIVE ngay. Nếu chưa -> lưu PENDING, tự động active khi họ đăng ký.
const addMemberByEmail = (req, res) => {

    const { classId } = req.params;
    const { email } = req.body;
    const teacherId = req.user.id;

    if (!email || !email.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }

    connection.query(
        `SELECT id FROM classes WHERE id = ? AND teacher_id = ?`,
        [classId, teacherId],
        (err, classRows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (classRows.length === 0) {
                return res.status(403).json({ message: "You are not the teacher of this class" });
            }

            connection.query(
                `SELECT id FROM users WHERE email = ?`,
                [email.trim()],
                (err, userRows) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    const foundUserId = userRows.length > 0 ? userRows[0].id : null;
                    const status = foundUserId ? "ACTIVE" : "PENDING";

                    // Tìm xem email này đã được mời vào lớp này chưa (kể cả khi user_id còn NULL)
                    connection.query(
                        `SELECT cm.id
                         FROM class_members cm
                         LEFT JOIN users u ON u.id = cm.user_id
                         WHERE cm.class_id = ? AND (cm.invited_email = ? OR u.email = ?)`,
                        [classId, email.trim(), email.trim()],
                        (err, existingRows) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            if (existingRows.length > 0) {

                                connection.query(
                                    `UPDATE class_members SET user_id = ?, invited_email = ?, status = ? WHERE id = ?`,
                                    [foundUserId, email.trim(), status, existingRows[0].id],
                                    (err) => {

                                        if (err) {
                                            return res.status(500).json(err);
                                        }

                                        res.status(200).json({
                                            message: foundUserId
                                                ? "Student added to class"
                                                : "Email not registered yet, will auto-join when they sign up"
                                        });

                                    }
                                );

                                return;

                            }

                            connection.query(
                                `INSERT INTO class_members (class_id, user_id, invited_email, status)
                                 VALUES (?, ?, ?, ?)`,
                                [classId, foundUserId, email.trim(), status],
                                (err) => {

                                    if (err) {
                                        return res.status(500).json(err);
                                    }

                                    res.status(201).json({
                                        message: foundUserId
                                            ? "Student added to class"
                                            : "Email not registered yet, will auto-join when they sign up"
                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};

// GET danh sách thành viên của 1 lớp (chỉ giáo viên chủ nhiệm lớp đó)
const getClassMembers = (req, res) => {

    const { classId } = req.params;
    const teacherId = req.user.id;

    connection.query(
        `SELECT id FROM classes WHERE id = ? AND teacher_id = ?`,
        [classId, teacherId],
        (err, classRows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (classRows.length === 0) {
                return res.status(403).json({ message: "You are not the teacher of this class" });
            }

            connection.query(
                `SELECT
                    cm.id AS member_id,
                    cm.status,
                    cm.invited_email,
                    u.id AS user_id,
                    u.username,
                    u.email
                 FROM class_members cm
                 LEFT JOIN users u ON u.id = cm.user_id
                 WHERE cm.class_id = ?
                 ORDER BY cm.created_at DESC`,
                [classId],
                (err, members) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json(members);

                }
            );

        }
    );

};

// DELETE lớp học (chỉ giáo viên chủ nhiệm). FK cascade sẽ tự xóa luôn
// class_members, flashcard_sets (visibility=CLASS thuộc lớp này) và questions trong các set đó.
const deleteClass = (req, res) => {

    const { classId } = req.params;
    const teacherId = req.user.id;

    connection.query(
        `SELECT id FROM classes WHERE id = ? AND teacher_id = ?`,
        [classId, teacherId],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (rows.length === 0) {
                return res.status(403).json({ message: "You are not the teacher of this class" });
            }

            connection.query(
                `DELETE FROM classes WHERE id = ?`,
                [classId],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json({ message: "Class deleted successfully" });

                }
            );

        }
    );

};

// GET danh sách set trong 1 lớp (giáo viên chủ nhiệm hoặc thành viên ACTIVE của lớp mới xem được)
const getClassSets = (req, res) => {

    const { classId } = req.params;
    const userId = req.user.id;

    connection.query(
        `SELECT id FROM classes WHERE id = ? AND (
            teacher_id = ?
            OR id IN (SELECT class_id FROM class_members WHERE user_id = ? AND status = 'ACTIVE')
        )`,
        [classId, userId, userId],
        (err, accessRows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (accessRows.length === 0) {
                return res.status(403).json({ message: "You don't have access to this class" });
            }

            connection.query(
                `SELECT
                    fs.id AS set_id,
                    fs.title,
                    fs.description,
                    fs.exam_id,
                    e.name AS exam_name,
                    COUNT(q.id) AS total_questions
                 FROM flashcard_sets fs
                 LEFT JOIN exams e ON e.id = fs.exam_id
                 LEFT JOIN questions q ON q.set_id = fs.id
                 WHERE fs.class_id = ?
                 GROUP BY fs.id, fs.title, fs.description, fs.exam_id, e.name
                 ORDER BY fs.created_at DESC`,
                [classId],
                (err, results) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(200).json(results);

                }
            );

        }
    );

};

// DELETE mời 1 thành viên ra khỏi lớp (chỉ giáo viên chủ nhiệm lớp đó)
const removeMember = (req, res) => {

    const { classId, memberId } = req.params;
    const teacherId = req.user.id;

    connection.query(
        `SELECT id FROM classes WHERE id = ? AND teacher_id = ?`,
        [classId, teacherId],
        (err, classRows) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (classRows.length === 0) {
                return res.status(403).json({ message: "You are not the teacher of this class" });
            }

            connection.query(
                `DELETE FROM class_members WHERE id = ? AND class_id = ?`,
                [memberId, classId],
                (err, result) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ message: "Member not found in this class" });
                    }

                    res.status(200).json({ message: "Member removed from class" });

                }
            );

        }
    );

};

module.exports = {
    createClass,
    getMyClasses,
    joinClassByCode,
    addMemberByEmail,
    getClassMembers,
    deleteClass,
    getClassSets,
    removeMember
};
