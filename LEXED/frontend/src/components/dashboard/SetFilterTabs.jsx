const FILTERS = [
    { key: "ALL", label: "Tất cả" },
    { key: "PRIVATE", label: "Của tôi" },
    { key: "CLASS", label: "Lớp học" }
];

function SetFilterTabs({ active, onChange }) {

    return (

        <div className="set-filter-tabs">

            {FILTERS.map((filter) => (

                <button
                    key={filter.key}
                    className={`set-filter-tab ${active === filter.key ? "active" : ""}`}
                    onClick={() => onChange(filter.key)}
                >
                    {filter.label}
                </button>

            ))}

        </div>

    );

}

export default SetFilterTabs;
