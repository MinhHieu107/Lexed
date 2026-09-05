import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";

import SetDetails from "./SetDetails";
import CardItem from "./CardItem";
import AddCardButton from "./AddCardButton";

import { getExams } from "../../services/examService";
import { createSet, updateSet, getSet, getSetQuestions } from "../../services/setService";
import { getMyClasses } from "../../services/classService";
import { useAuth } from "../../context/AuthContext";

import "../../styles/flashcards/CreateFlashcardSet.css";

const emptyCard = () => ({
    noi_dung: "",
    answer: "ĐÚNG",
    legalBasis: "",
    explanation: ""
});

function CreateFlashcardSet() {

    const navigate = useNavigate();
    const { user } = useAuth();
    const { setId } = useParams();
    const [searchParams] = useSearchParams();
    const suggestedClassId = searchParams.get("classId");
    const isEditMode = Boolean(setId);

    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [visibility, setVisibility] = useState("PRIVATE");
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [className, setClassName] = useState("");

    const [cards, setCards] = useState([emptyCard()]);

    const [loadingSet, setLoadingSet] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Danh sách Legal Area để gắn (không bắt buộc)
    useEffect(() => {

        const loadExams = async () => {

            try {

                const data = await getExams();

                const uniqueExams = [];
                const seen = new Set();

                data.forEach((item) => {
                    if (!seen.has(item.exam_id)) {
                        seen.add(item.exam_id);
                        uniqueExams.push(item);
                    }
                });

                setExams(uniqueExams);

            } catch (err) {

                console.log(err.response?.data);

            }

        };

        loadExams();

    }, []);

    // Nếu là TEACHER thì load danh sách lớp mình dạy (chỉ cần khi tạo mới, chọn lớp để giao)
    useEffect(() => {

        if (isEditMode || user?.role !== "TEACHER") return;

        const loadClasses = async () => {

            try {

                const data = await getMyClasses();
                setClasses(data);

                if (suggestedClassId && data.some((c) => String(c.class_id) === suggestedClassId)) {
                    setVisibility("CLASS");
                    setClassId(suggestedClassId);
                }

            } catch (err) {

                console.log(err.response?.data);

            }

        };

        loadClasses();

    }, [user, isEditMode, suggestedClassId]);

    // Chế độ sửa: load dữ liệu set + câu hỏi hiện có
    useEffect(() => {

        if (!isEditMode) return;

        const loadSet = async () => {

            setLoadingSet(true);

            try {

                const [setData, questionData] = await Promise.all([
                    getSet(setId),
                    getSetQuestions(setId)
                ]);

                setTitle(setData.title);
                setDescription(setData.description || "");
                setExamId(setData.exam_id || "");
                setVisibility(setData.visibility);
                setClassId(setData.class_id || "");
                setClassName(setData.class_name || "");

                setCards(
                    questionData.map((q) => ({
                        id: q.id,
                        noi_dung: q.noi_dung,
                        answer: q.nhan_dinh,
                        legalBasis: q.co_so_phap_ly || "",
                        explanation: q.giai_thich || ""
                    }))
                );

            } catch (err) {

                console.log(err.response?.data);
                setError("Không tải được set này (có thể bạn không có quyền sửa).");

            } finally {

                setLoadingSet(false);

            }

        };

        loadSet();

    }, [isEditMode, setId]);

    const addCard = () => {

        setCards([...cards, emptyCard()]);

    };

    const updateCard = (index, field, value) => {

        const clone = [...cards];

        clone[index][field] = value;

        setCards(clone);

    };

    const deleteCard = (index) => {

        if (cards.length === 1) return;

        setCards(cards.filter((_, i) => i !== index));

    };

    const validate = () => {

        if (!title.trim()) {
            return "Vui lòng nhập tên set.";
        }

        if (!isEditMode && visibility === "CLASS" && !classId) {
            return "Vui lòng chọn lớp để giao set này.";
        }

        if (cards.length === 0) {
            return "Set phải có ít nhất 1 flashcard.";
        }

        const emptyOne = cards.find((c) => !c.noi_dung.trim());

        if (emptyOne) {
            return "Mỗi flashcard cần có nội dung câu hỏi/nhận định.";
        }

        return "";

    };

    const handleSave = async () => {

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setSaving(true);

        const questionsPayload = cards.map((card, index) => ({
            id: card.id,
            question_number: index + 1,
            noi_dung: card.noi_dung,
            nhan_dinh: card.answer,
            co_so_phap_ly: card.legalBasis,
            giai_thich: card.explanation
        }));

        try {

            if (isEditMode) {

                await updateSet(setId, {
                    title,
                    description,
                    exam_id: examId || null,
                    questions: questionsPayload
                });

                navigate(`/flashcards/set/${setId}`);

            } else {

                const payload = {
                    title,
                    description,
                    exam_id: examId || null,
                    visibility,
                    class_id: visibility === "CLASS" ? classId : null,
                    questions: questionsPayload
                };

                const result = await createSet(payload);

                navigate(`/flashcards/set/${result.set_id}`);

            }

        } catch (err) {

            console.log(err.response?.data);
            setError(err.response?.data?.message || "Lưu set thất bại, vui lòng thử lại.");

        } finally {

            setSaving(false);

        }

    };

    const handleCancel = () => {

        navigate(isEditMode ? `/flashcards/set/${setId}` : "/flashcards");

    };

    if (loadingSet) {

        return (

            <div className="dashboard-layout">

                <Sidebar />

                <div className="dashboard-main">

                    <Topbar />

                    <main className="create-page">
                        <p>Đang tải...</p>
                    </main>

                </div>

            </div>

        );

    }

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />

                <main className="create-page">

                    <div className="page-header">

                        <h1>{isEditMode ? "Edit Flashcard Set" : "Create New Flashcard Set"}</h1>

                        <div className="header-buttons">

                            <button
                                className="cancel-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Set"}
                            </button>

                        </div>

                    </div>

                    {error && <p className="form-error">{error}</p>}

                    {isEditMode && visibility === "CLASS" && (
                        <p className="set-number-hint">
                            Set này đang được giao cho lớp <strong>{className}</strong>. Phạm vi hiển thị không thể đổi sau khi tạo.
                        </p>
                    )}

                    <SetDetails
                        exams={exams}
                        examId={examId}
                        onExamChange={setExamId}
                        title={title}
                        onTitleChange={setTitle}
                        description={description}
                        onDescriptionChange={setDescription}
                        role={user?.role}
                        visibility={visibility}
                        onVisibilityChange={setVisibility}
                        classes={classes}
                        classId={classId}
                        onClassChange={setClassId}
                        lockVisibility={isEditMode}
                    />

                    <div className="cards-header">

                        <h2>Cards in this Set</h2>

                        <span>{cards.length} Cards Added</span>

                    </div>

                    {
                        cards.map((card, index) => (

                            <CardItem
                                key={card.id || `new-${index}`}
                                index={index}
                                card={card}
                                onChange={updateCard}
                                onDelete={deleteCard}
                            />

                        ))
                    }

                    <AddCardButton onClick={addCard} />

                </main>

            </div>

        </div>

    );

}

export default CreateFlashcardSet;
