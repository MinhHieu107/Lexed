import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StudyCard from "../components/dashboard/StudyCard";
import SetFilterTabs from "../components/dashboard/SetFilterTabs";
import DailyChallengeCard from "../components/flashcards/DailyChallengeCard";
import { getSummary } from "../services/progressService";
import { gradientForExam } from "../utils/subjectTheme";
import "../styles/flashcards/FlashcardsPage.css";
import "../styles/dashboard/SetFilterTabs.css";

function FlashcardsPage() {

    const [subjects, setSubjects] = useState([]);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {

        const load = async () => {

            try {

                const data = await getSummary();
                setSubjects(data);

            } catch (err) {

                console.log(err.response?.data);

            }

        };

        load();

    }, []);

    const filteredSubjects = useMemo(() => {

        if (filter === "ALL") return subjects;

        return subjects.filter((item) => item.visibility === filter);

    }, [subjects, filter]);

    return (

        <div className="flashcards-layout">

            <Sidebar />

            <div className="flashcards-main">

                <Topbar />

                <div className="flashcards-content">

                    <div className="section-header">
                        <h2>Yours Flashcards</h2>
                        <div className="header-actions">
                            <Link to="/classes" className="view-all-link">
                                Lớp học
                            </Link>
                            <Link to="/flashcards/addnewsetcard" className="view-all-link">
                                + Add New Set
                            </Link>
                            <Link to="/dashboard" className="view-all-link">Go to Library</Link>
                        </div>
                    </div>

                    <SetFilterTabs active={filter} onChange={setFilter} />

                    <div className="flashcards-grid">

                        {filteredSubjects.map((item) => (
                            <StudyCard
                                key={item.set_id}
                                subject={item.name}
                                cardCount={item.total_questions}
                                mastered={item.mastered_percent}
                                gradient={gradientForExam(item.exam_id, item.set_id)}
                                setId={item.set_id}
                            />
                        ))}

                        {filteredSubjects.length === 0 && (
                            <p className="empty-hint">Không có set nào trong mục này.</p>
                        )}

                    </div>

                    <DailyChallengeCard />

                </div>

            </div>

        </div>

    );

}

export default FlashcardsPage;
