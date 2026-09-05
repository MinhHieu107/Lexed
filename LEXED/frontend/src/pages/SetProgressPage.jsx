import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import { getSetProgress } from "../services/setService";
import "../styles/dashboard/DashboardPage.css";
import "../styles/dashboard/SetProgressPage.css";

const STATUS_LABEL = {
    NOT_STARTED: "Chưa làm",
    IN_PROGRESS: "Đang làm",
    COMPLETED: "Đã hoàn thành"
};

function SetProgressPage() {

    const { setId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const load = async () => {

            setLoading(true);

            try {

                const result = await getSetProgress(setId);
                setData(result);

            } catch (err) {

                console.log(err.response?.data);
                setError(err.response?.data?.message || "Không tải được tiến độ.");

            } finally {

                setLoading(false);

            }

        };

        load();

    }, [setId]);

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />

                <main className="progress-content">

                    <Link to="/classes" className="progress-back-link">
                        <FiArrowLeft />
                        <span>Back to Classes</span>
                    </Link>

                    {loading && <p>Đang tải...</p>}

                    {error && <p className="form-error">{error}</p>}

                    {data && (

                        <>

                            <h1>{data.title}</h1>

                            <div className="progress-summary">

                                <div className="progress-summary-item">
                                    <span className="progress-summary-value">{data.total_students}</span>
                                    <span className="progress-summary-label">Học sinh</span>
                                </div>

                                <div className="progress-summary-item">
                                    <span className="progress-summary-value">{data.percent_started}%</span>
                                    <span className="progress-summary-label">Đã bắt đầu làm ({data.students_started}/{data.total_students})</span>
                                </div>

                                <div className="progress-summary-item">
                                    <span className="progress-summary-value">{data.percent_completed}%</span>
                                    <span className="progress-summary-label">Đã hoàn thành ({data.students_completed}/{data.total_students})</span>
                                </div>

                            </div>

                            <div className="progress-table">

                                <div className="progress-table-header">
                                    <span>Học sinh</span>
                                    <span>Tiến độ</span>
                                    <span>Trạng thái</span>
                                </div>

                                {data.students.map((s) => (

                                    <div className="progress-table-row" key={s.user_id}>

                                        <div className="progress-student">
                                            <span className="progress-student-name">{s.username}</span>
                                            <span className="progress-student-email">{s.email}</span>
                                        </div>

                                        <div className="progress-bar-cell">
                                            <div className="progress-bar-track">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${s.percent_done}%` }}
                                                />
                                            </div>
                                            <span>{s.attempted_count}/{data.total_questions} ({s.percent_done}%)</span>
                                        </div>

                                        <span className={`progress-status-badge ${s.status.toLowerCase()}`}>
                                            {STATUS_LABEL[s.status]}
                                        </span>

                                    </div>

                                ))}

                                {data.students.length === 0 && (
                                    <p className="progress-empty">Lớp chưa có học sinh nào.</p>
                                )}

                            </div>

                        </>

                    )}

                </main>

            </div>

        </div>

    );

}

export default SetProgressPage;
