import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../../styles/home/ScheduleSidebar.css";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const SEASON_LABELS = [
    "Deep Winter", "Late Winter", "Early Spring", "Mid Spring",
    "Late Spring", "Early Summer", "Mid Summer", "Late Summer",
    "Early Autumn", "Mid Autumn", "Late Autumn", "Deep Winter"
];

function formatEventDate(dateStr) {

    const date = new Date(`${dateStr}T00:00:00`);

    return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${String(date.getDate()).padStart(2, "0")}`;

}

function formatTime(timeStr) {

    if (!timeStr) {
        return "";
    }

    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;

}

function todayDateKey() {

    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

}

function ScheduleSidebar({ currentMonth, onPrevMonth, onNextMonth, notes, onNoteClick, onQuickAdd }) {

    const [quickTitle, setQuickTitle] = useState("");

    const monthLabel = MONTH_NAMES[currentMonth.getMonth()];
    const seasonLabel = SEASON_LABELS[currentMonth.getMonth()];
    const year = currentMonth.getFullYear();

    const handleQuickAddKeyDown = (e) => {

        if (e.key === "Enter" && quickTitle.trim()) {

            onQuickAdd(quickTitle.trim(), todayDateKey());
            setQuickTitle("");

        }

    };

    return (

        <div className="schedule-sidebar">

            <div className="schedule-month-row">

                <h2>{monthLabel}</h2>

                <div className="schedule-month-nav">

                    <button onClick={onPrevMonth}>
                        <FiChevronLeft />
                    </button>

                    <button onClick={onNextMonth}>
                        <FiChevronRight />
                    </button>

                </div>

            </div>

            <p className="schedule-year">
                {year} &mdash; {seasonLabel}
            </p>

            <input
                className="schedule-question"
                type="text"
                placeholder="What do you want to learn today? (Enter to save)"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={handleQuickAddKeyDown}
            />

            <p className="schedule-highlight-label">
                Schedule Highlight
            </p>

            <div className="schedule-event-list">

                {notes.length === 0 && (
                    <p className="schedule-empty">
                        No notes yet — click a day on the calendar to add one.
                    </p>
                )}

                {notes.map((note) => (

                    <button
                        type="button"
                        className="schedule-event"
                        key={note.id}
                        onClick={() => onNoteClick(note)}
                    >

                        <div className="schedule-event-date">

                            <span>{formatEventDate(note.note_date)}</span>

                            {note.note_time && (
                                <span className="schedule-event-time">
                                    {formatTime(note.note_time)}
                                </span>
                            )}

                        </div>

                        <h3>{note.title}</h3>

                        {note.description && (
                            <p>{note.description}</p>
                        )}

                    </button>

                ))}

            </div>

        </div>

    );

}

export default ScheduleSidebar;
