import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import HomeHeader from "../components/home/HomeHeader";
import ScheduleSidebar from "../components/home/ScheduleSidebar";
import CalendarGrid from "../components/home/CalendarGrid";
import NoteModal from "../components/home/NoteModal";
import { getNotes, createNote } from "../services/noteService";
import "../styles/home/HomePage.css";

function HomePage() {

    const [currentMonth, setCurrentMonth] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState(null);

    const loadNotes = async () => {

        try {

            const data = await getNotes();
            setNotes(data);

        } catch (err) {

            console.log(err.response?.data);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadNotes();

    }, []);

    const goToPrevMonth = () => {
        setCurrentMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        );
    };

    const handleDayClick = (dateKey, note) => {
        setModalState({ date: dateKey, note: note || null });
    };

    const handleNoteClick = (note) => {
        setModalState({ date: note.note_date, note });
    };

    const handleQuickAdd = async (title, dateKey) => {

        try {

            await createNote({
                note_date: dateKey,
                title,
                note_time: null,
                description: ""
            });

            loadNotes();

        } catch (err) {

            console.log(err.response?.data);

        }

    };

    const closeModal = () => setModalState(null);

    const handleSaved = () => {
        closeModal();
        loadNotes();
    };

    const handleDeleted = () => {
        closeModal();
        loadNotes();
    };

    return (

        <div className="home-layout">

            <Sidebar />

            <div className="home-main">

                <HomeHeader />

                <div className="home-content">

                    <button className="home-view-btn">
                        Month
                    </button>

                    <div className="home-calendar-section">

                        <ScheduleSidebar
                            currentMonth={currentMonth}
                            onPrevMonth={goToPrevMonth}
                            onNextMonth={goToNextMonth}
                            notes={notes}
                            onNoteClick={handleNoteClick}
                            onQuickAdd={handleQuickAdd}
                        />

                        {!loading && (
                            <CalendarGrid
                                currentMonth={currentMonth}
                                notes={notes}
                                onDayClick={handleDayClick}
                            />
                        )}

                    </div>

                </div>

            </div>

            {modalState && (
                <NoteModal
                    date={modalState.date}
                    note={modalState.note}
                    onClose={closeModal}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                />
            )}

        </div>

    );

}

export default HomePage;
