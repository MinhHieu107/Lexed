import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import ClassCard from "../components/dashboard/ClassCard";
import StudyCard from "../components/dashboard/StudyCard";
import SetFilterTabs from "../components/dashboard/SetFilterTabs";
import { getSummary } from "../services/progressService";
import { gradientForExam } from "../utils/subjectTheme";
import "../styles/dashboard/DashboardPage.css";
import "../styles/dashboard/SetFilterTabs.css";

const upcomingClasses = [
    {
        category: "Investment Law",
        title: "Investor-State Disput...",
        time: "Today, 11:30 AM - 12:45 PM",
        instructor: "Evelyn",
        avatarColor: "#c98b7a"
    },
    {
        category: "International Trade Law",
        title: "The WTO Dispute Set...",
        time: "Today, 2:00 PM - 3:15 PM",
        instructor: "Cyra Collins",
        avatarColor: "#8ca16d"
    },
    {
        category: "Contract Law",
        title: "Structure and Essent...",
        time: "Tomorrow, 9:00 AM - 10:15 AM",
        instructor: "Trieu Vu",
        avatarColor: "#786d43"
    }
];

function DashboardPage() {

    const [studySubjects, setStudySubjects] = useState([]);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {

        const loadSummary = async () => {

            try {

                const data = await getSummary();
                setStudySubjects(data);

            } catch (err) {

                console.log(err.response?.data);

            }

        };

        loadSummary();

    }, []);

    const filteredSubjects = useMemo(() => {

        if (filter === "ALL") return studySubjects;

        return studySubjects.filter((item) => item.visibility === filter);

    }, [studySubjects, filter]);

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />

                <div className="dashboard-content">

                    <div className="section-header">
                        <h2>Upcoming Classes</h2>
                        <a href="#" className="view-all-link">View entire schedule</a>
                    </div>

                    <div className="class-grid">

                        {upcomingClasses.map((item) => (
                            <ClassCard key={item.title} {...item} />
                        ))}

                    </div>

                    <div className="section-header">
                        <h2>Recent Studies &amp; Flashcards</h2>
                    </div>

                    <SetFilterTabs active={filter} onChange={setFilter} />

                    <div className="study-grid">

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

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DashboardPage;
