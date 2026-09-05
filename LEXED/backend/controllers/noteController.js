const connection = require("../config/db");

const getNotes = (req, res) => {

    connection.query(
        `SELECT
            id,
            DATE_FORMAT(note_date, '%Y-%m-%d') AS note_date,
            title,
            note_time,
            description
         FROM study_notes
         WHERE user_id = ?
         ORDER BY note_date, note_time`,
        [req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);

        }
    );

};

const createNote = (req, res) => {

    const { note_date, title, note_time, description } = req.body;

    if (!note_date || !title) {
        return res.status(400).json({
            message: "note_date and title are required"
        });
    }

    connection.query(
        `INSERT INTO study_notes
        (user_id, note_date, title, note_time, description)
        VALUES (?, ?, ?, ?, ?)`,
        [
            req.user.id,
            note_date,
            title,
            note_time || null,
            description || null
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Note created successfully",
                id: result.insertId
            });

        }
    );

};

const updateNote = (req, res) => {

    const { id } = req.params;
    const { note_date, title, note_time, description } = req.body;

    if (!note_date || !title) {
        return res.status(400).json({
            message: "note_date and title are required"
        });
    }

    connection.query(
        `UPDATE study_notes
         SET note_date = ?, title = ?, note_time = ?, description = ?
         WHERE id = ? AND user_id = ?`,
        [
            note_date,
            title,
            note_time || null,
            description || null,
            id,
            req.user.id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Note not found"
                });
            }

            res.status(200).json({
                message: "Note updated successfully"
            });

        }
    );

};

const deleteNote = (req, res) => {

    const { id } = req.params;

    connection.query(
        `DELETE FROM study_notes
         WHERE id = ? AND user_id = ?`,
        [id, req.user.id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Note not found"
                });
            }

            res.status(200).json({
                message: "Note deleted successfully"
            });

        }
    );

};

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
};
