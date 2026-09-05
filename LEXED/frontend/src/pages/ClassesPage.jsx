import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import { useAuth } from "../context/AuthContext";
import { deleteSet } from "../services/setService";
import {
    getMyClasses,
    createClass,
    joinClassByCode,
    getClassMembers,
    addMemberByEmail,
    deleteClass,
    getClassSets,
    removeMember
} from "../services/classService";
import "../styles/dashboard/DashboardPage.css";
import "../styles/dashboard/ClassesPage.css";

function ClassSetList({ classId, canEdit }) {

    const navigate = useNavigate();
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const loadSets = async () => {

        setLoading(true);

        try {

            const data = await getClassSets(classId);
            setSets(data);

        } catch (err) {

            console.log(err.response?.data);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadSets();

    }, [classId]);

    const handleDeleteSet = async (e, setIdToDelete, title) => {

        e.stopPropagation();

        const confirmed = window.confirm(`Xóa set "${title}"? Hành động này không thể hoàn tác.`);

        if (!confirmed) return;

        setDeletingId(setIdToDelete);

        try {

            await deleteSet(setIdToDelete);
            await loadSets();

        } catch (err) {

            console.log(err.response?.data);
            alert(err.response?.data?.message || "Xóa set thất bại.");

        } finally {

            setDeletingId(null);

        }

    };

    if (loading) {
        return <p className="class-sets-empty">Đang tải set...</p>;
    }

    if (sets.length === 0) {
        return <p className="class-sets-empty">Lớp này chưa có set flashcard nào.</p>;
    }

    return (

        <div className="class-set-list">

            {sets.map((set) => (

                <div
                    key={set.set_id}
                    className="class-set-item"
                    onClick={() => navigate(`/flashcards/set/${set.set_id}`)}
                >

                    <div>
                        <h4>{set.title}</h4>
                        <p>{set.total_questions} cards{set.exam_name ? ` • ${set.exam_name}` : ""}</p>
                    </div>

                    {canEdit && (

                        <div className="class-set-actions">

                            <button
                                className="class-set-edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/flashcards/set/${set.set_id}/progress`);
                                }}
                            >
                                Tiến độ
                            </button>

                            <button
                                className="class-set-edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/flashcards/set/${set.set_id}/edit`);
                                }}
                            >
                                Sửa
                            </button>

                            <button
                                className="class-set-delete-btn"
                                onClick={(e) => handleDeleteSet(e, set.set_id, set.title)}
                                disabled={deletingId === set.set_id}
                            >
                                {deletingId === set.set_id ? "..." : "Xóa"}
                            </button>

                        </div>

                    )}

                </div>

            ))}

        </div>

    );

}

function TeacherClasses() {

    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const [openClassId, setOpenClassId] = useState(null);
    const [members, setMembers] = useState([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const loadClasses = async () => {

        try {

            const data = await getMyClasses();
            setClasses(data);

        } catch (err) {

            console.log(err.response?.data);

        }

    };

    useEffect(() => {

        loadClasses();

    }, []);

    const handleCreateClass = async () => {

        if (!newClassName.trim()) {
            setError("Vui lòng nhập tên lớp.");
            return;
        }

        setError("");
        setCreating(true);

        try {

            await createClass(newClassName.trim());
            setNewClassName("");
            await loadClasses();

        } catch (err) {

            console.log(err.response?.data);
            setError(err.response?.data?.message || "Tạo lớp thất bại.");

        } finally {

            setCreating(false);

        }

    };

    const openMembers = async (classId) => {

        if (openClassId === classId) {
            setOpenClassId(null);
            return;
        }

        setOpenClassId(classId);
        setInviteMessage("");

        try {

            const data = await getClassMembers(classId);
            setMembers(data);

        } catch (err) {

            console.log(err.response?.data);

        }

    };

    const handleAddMember = async (classId) => {

        if (!inviteEmail.trim()) return;

        try {

            const result = await addMemberByEmail(classId, inviteEmail.trim());
            setInviteMessage(result.message);
            setInviteEmail("");

            const data = await getClassMembers(classId);
            setMembers(data);

            await loadClasses();

        } catch (err) {

            console.log(err.response?.data);
            setInviteMessage(err.response?.data?.message || "Thêm học sinh thất bại.");

        }

    };

    const handleRemoveMember = async (classId, memberId, displayName) => {

        const confirmed = window.confirm(`Mời "${displayName}" ra khỏi lớp?`);

        if (!confirmed) return;

        try {

            await removeMember(classId, memberId);

            const data = await getClassMembers(classId);
            setMembers(data);

            await loadClasses();

        } catch (err) {

            console.log(err.response?.data);
            alert(err.response?.data?.message || "Xóa thành viên thất bại.");

        }

    };

    const handleDeleteClass = async (e, classId, className) => {

        e.stopPropagation();

        const confirmed = window.confirm(
            `Xóa lớp "${className}"? Toàn bộ set flashcard đã giao cho lớp này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`
        );

        if (!confirmed) return;

        setDeletingId(classId);

        try {

            await deleteClass(classId);

            if (openClassId === classId) {
                setOpenClassId(null);
            }

            await loadClasses();

        } catch (err) {

            console.log(err.response?.data);
            alert(err.response?.data?.message || "Xóa lớp thất bại.");

        } finally {

            setDeletingId(null);

        }

    };

    return (

        <div className="classes-content">

            <div className="section-header">
                <h2>Lớp học của tôi</h2>
            </div>

            <div className="create-class-box">

                <input
                    placeholder="Tên lớp mới, ví dụ: Luật Dân sự - K19A"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                />

                <button onClick={handleCreateClass} disabled={creating}>
                    {creating ? "Đang tạo..." : "+ Tạo lớp"}
                </button>

            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="class-list">

                {classes.map((cls) => (

                    <div className="class-item" key={cls.class_id}>

                        <div
                            className="class-item-header"
                            onClick={() => openMembers(cls.class_id)}
                        >

                            <div>
                                <h3>{cls.name}</h3>
                                <p>Mã lớp: <strong>{cls.class_code}</strong> &bull; {cls.member_count} học sinh</p>
                            </div>

                            <div className="class-item-actions">

                                <button
                                    className="class-delete-btn"
                                    onClick={(e) => handleDeleteClass(e, cls.class_id, cls.name)}
                                    disabled={deletingId === cls.class_id}
                                >
                                    {deletingId === cls.class_id ? "Đang xóa..." : "Xóa lớp"}
                                </button>

                                <span className="class-toggle">
                                    {openClassId === cls.class_id ? "▲" : "▼"}
                                </span>

                            </div>

                        </div>

                        {openClassId === cls.class_id && (

                            <div className="class-item-body">

                                <div className="invite-row">

                                    <input
                                        placeholder="Email học sinh"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />

                                    <button onClick={() => handleAddMember(cls.class_id)}>
                                        Thêm
                                    </button>

                                </div>

                                {inviteMessage && <p className="invite-message">{inviteMessage}</p>}

                                <ul className="member-list">

                                    {members.map((m) => (
                                        <li key={m.member_id}>
                                            <span>{m.username || m.invited_email}</span>
                                            <div className="member-item-right">
                                                <span className={`status-badge ${m.status.toLowerCase()}`}>
                                                    {m.status === "ACTIVE" ? "Đã tham gia" : "Chờ đăng ký"}
                                                </span>
                                                <button
                                                    className="member-kick-btn"
                                                    onClick={() => handleRemoveMember(cls.class_id, m.member_id, m.username || m.invited_email)}
                                                >
                                                    Kick
                                                </button>
                                            </div>
                                        </li>
                                    ))}

                                    {members.length === 0 && <li>Chưa có học sinh nào.</li>}

                                </ul>

                                <h4 className="class-sets-title">
                                    Set flashcard trong lớp
                                    <Link
                                        to={`/flashcards/addnewsetcard?classId=${cls.class_id}`}
                                        className="class-add-set-link"
                                    >
                                        + Thêm set mới
                                    </Link>
                                </h4>

                                <ClassSetList classId={cls.class_id} canEdit />

                            </div>

                        )}

                    </div>

                ))}

                {classes.length === 0 && <p>Bạn chưa tạo lớp nào.</p>}

            </div>

        </div>

    );

}

function StudentClasses() {

    const [classes, setClasses] = useState([]);
    const [code, setCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [openClassId, setOpenClassId] = useState(null);

    const loadClasses = async () => {

        try {

            const data = await getMyClasses();
            setClasses(data);

        } catch (err) {

            console.log(err.response?.data);

        }

    };

    useEffect(() => {

        loadClasses();

    }, []);

    const handleJoin = async () => {

        if (!code.trim()) {
            setError("Vui lòng nhập mã lớp.");
            return;
        }

        setError("");
        setSuccess("");
        setJoining(true);

        try {

            const result = await joinClassByCode(code.trim());
            setSuccess(`Đã tham gia lớp "${result.class_name}".`);
            setCode("");
            await loadClasses();

        } catch (err) {

            console.log(err.response?.data);
            setError(err.response?.data?.message || "Tham gia lớp thất bại.");

        } finally {

            setJoining(false);

        }

    };

    const toggleClass = (classId) => {

        setOpenClassId(openClassId === classId ? null : classId);

    };

    return (

        <div className="classes-content">

            <div className="section-header">
                <h2>Lớp học của tôi</h2>
            </div>

            <div className="create-class-box">

                <input
                    placeholder="Nhập mã lớp giáo viên cung cấp"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <button onClick={handleJoin} disabled={joining}>
                    {joining ? "Đang tham gia..." : "Tham gia lớp"}
                </button>

            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="invite-message">{success}</p>}

            <div className="class-list">

                {classes.map((cls) => (

                    <div className="class-item" key={cls.class_id}>

                        <div
                            className="class-item-header"
                            onClick={() => toggleClass(cls.class_id)}
                        >

                            <div>
                                <h3>{cls.name}</h3>
                                <p>Giáo viên: {cls.teacher_name}</p>
                            </div>

                            <span className="class-toggle">
                                {openClassId === cls.class_id ? "▲" : "▼"}
                            </span>

                        </div>

                        {openClassId === cls.class_id && (

                            <div className="class-item-body">

                                <h4 className="class-sets-title">Set flashcard trong lớp</h4>

                                <ClassSetList classId={cls.class_id} />

                            </div>

                        )}

                    </div>

                ))}

                {classes.length === 0 && <p>Bạn chưa tham gia lớp nào.</p>}

            </div>

        </div>

    );

}

function ClassesPage() {

    const { user } = useAuth();

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />

                {user?.role === "TEACHER" ? <TeacherClasses /> : <StudentClasses />}

            </div>

        </div>

    );

}

export default ClassesPage;
