import "../../styles/home/CalendarGrid.css";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildCalendarDays(currentMonth) {

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();

    const gridStart = new Date(year, month, 1 - startOffset);

    const daysInGrid = 42;

    const days = [];

    for (let i = 0; i < daysInGrid; i++) {

        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);

        days.push({
            date,
            key: toDateKey(date),
            inCurrentMonth: date.getMonth() === month
        });

    }

    return days;

}

function truncate(text, max = 9) {
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function CalendarGrid({ currentMonth, notes, onDayClick }) {

    const days = buildCalendarDays(currentMonth);
    const todayKey = toDateKey(new Date());

    const notesByDate = {};
    notes.forEach((note) => {
        if (!notesByDate[note.note_date]) {
            notesByDate[note.note_date] = note;
        }
    });

    return (

        <div className="calendar-grid">

            <div className="calendar-weekdays">

                {WEEKDAYS.map((day) => (
                    <div className="calendar-weekday" key={day}>
                        {day}
                    </div>
                ))}

            </div>

            <div className="calendar-days">

                {days.map(({ date, key, inCurrentMonth }) => {

                    const note = notesByDate[key];
                    const isToday = key === todayKey;

                    const showMonthLabel =
                        date.getDate() === 1 && !inCurrentMonth;

                    return (

                        <button
                            type="button"
                            className={[
                                "calendar-day",
                                !inCurrentMonth ? "outside-month" : "",
                                isToday ? "is-today" : ""
                            ].join(" ").trim()}
                            key={key}
                            onClick={() => onDayClick(key, note)}
                        >

                            <span className="calendar-day-number">
                                {date.getDate()}
                                {showMonthLabel && (
                                    <span className="calendar-month-label">
                                        {date.toLocaleString("en-US", { month: "short" }).toUpperCase()}
                                    </span>
                                )}
                            </span>

                            {note && (
                                <span className="calendar-event-badge">
                                    {truncate(note.title)}
                                </span>
                            )}

                        </button>

                    );

                })}

            </div>

        </div>

    );

}

export default CalendarGrid;
