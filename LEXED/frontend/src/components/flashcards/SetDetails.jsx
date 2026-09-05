function SetDetails({

    exams,
    examId,
    onExamChange,
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    role,
    visibility,
    onVisibilityChange,
    classes,
    classId,
    onClassChange,
    lockVisibility

}) {

    return (

        <div className="set-details">

            <h3>Set Details</h3>

            <div className="row">

                <div className="field">

                    <label>SET TITLE</label>

                    <input
                        placeholder="Constitutional Law Foundations: Amendment 1-10"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                    />

                </div>

                <div className="field">

                    <label>LEGAL AREA (tùy chọn)</label>

                    <select
                        value={examId}
                        onChange={(e) => onExamChange(e.target.value)}
                    >

                        <option value="">-- Không chọn --</option>

                        {exams.map((exam) => (
                            <option key={exam.exam_id} value={exam.exam_id}>
                                {exam.name}
                            </option>
                        ))}

                    </select>

                </div>

            </div>

            {!lockVisibility && (

                <div className="row">

                    <div className="field">

                        <label>PHẠM VI HIỂN THỊ</label>

                        <select
                            value={visibility}
                            onChange={(e) => onVisibilityChange(e.target.value)}
                        >

                            <option value="PRIVATE">Chỉ mình tôi (tự học)</option>

                            {role === "TEACHER" && (
                                <option value="CLASS">Giao cho 1 lớp học</option>
                            )}

                            {role === "ADMIN" && (
                                <option value="GLOBAL">Công khai (mọi người)</option>
                            )}

                        </select>

                    </div>

                    {visibility === "CLASS" && (

                        <div className="field">

                            <label>LỚP HỌC</label>

                            <select
                                value={classId}
                                onChange={(e) => onClassChange(e.target.value)}
                            >

                                <option value="">-- Chọn lớp --</option>

                                {classes.map((cls) => (
                                    <option key={cls.class_id} value={cls.class_id}>
                                        {cls.name} ({cls.class_code})
                                    </option>
                                ))}

                            </select>

                        </div>

                    )}

                </div>

            )}

            <div className="field">

                <label>DESCRIPTION</label>

                <textarea
                    rows="4"
                    placeholder="Description..."
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                />

            </div>

        </div>

    );

}

export default SetDetails;
