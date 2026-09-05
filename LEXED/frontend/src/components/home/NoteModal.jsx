import { useState } from "react";
import { createNote, updateNote, deleteNote } from "../../services/noteService";
import "../../styles/home/NoteModal.css";

function NoteModal({ date, note, onClose, onSaved, onDeleted }) {

    const [noteDate, setNoteDate] = useState(note?.note_date || date);
    const [title, setTitle] = useState(note?.title || "");
    const [time, setTime] = useState(note?.note_time?.slice(0, 5) || "");
    const [description, setDescription] = useState(note?.description || "");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setSaving(true);
        setError("");

        const payload = {
            note_date: noteDate,
            title: title.trim(),
            note_time: time || null,
            description: description.trim()
        };

        try {

            if (note) {
                await updateNote(note.id, payload);
            } else {
                await createNote(payload);
            }

            onSaved();

        } catch (err) {

            setError(err.response?.data?.message || "Something went wrong");

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async () => {

        setSaving(true);
        setError("");

        try {

            await deleteNote(note.id);
            onDeleted();

        } catch (err) {

            setError(err.response?.data?.message || "Something went wrong");
            setSaving(false);

        }

    };

    return (

        <div className="note-modal-overlay" onClick={onClose}>

            <div className="note-modal" onClick={(e) => e.stopPropagation()}>

                <h2>{note ? "Edit note" : "Add note"}</h2>

                <form onSubmit={handleSubmit}>

                    <label>
                        Date
                        <input
                            type="date"
                            value={noteDate}
                            onChange={(e) => setNoteDate(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Title
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Study Commercial Law"
                            required
                        />
                    </label>

                    <label>
                        Time
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </label>

                    <label>
                        Description
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Details you want to remember..."
                        />
                    </label>

                    {error && (
                        <p className="note-modal-error">
                            {error}
                        </p>
                    )}

                    <div className="note-modal-actions">

                        {note && (
                            <button
                                type="button"
                                className="note-delete-btn"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="button"
                            className="note-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="note-save-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default NoteModal;
