import { Link, useLocation } from "react-router-dom";
import { FiHome, FiLayers, FiBookOpen, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";
import { logout } from "../../services/authService";
import "../../styles/dashboard/Sidebar.css";

const navItems = [
    { label: "Home Page", to: "/home", icon: FiHome },
    { label: "Flashcards", to: "/flashcards", icon: FiLayers },
    { label: "Classes", to: "/classes", icon: FiUsers },
    { label: "Your Library", to: "/dashboard", icon: FiBookOpen },
    { label: "Settings", to: "/settings", icon: FiSettings }
];

function Sidebar() {

    const { pathname } = useLocation();

    const handleLogout = async () => {

        const refreshToken = localStorage.getItem("refreshToken");

        try {

            if (refreshToken) {
                await logout(refreshToken);
            }

        } catch (err) {

            console.log(err.response?.data);

        }

        localStorage.clear();

        // Full page reload thay vì navigate() SPA: tránh race condition với
        // ProtectedRoute (nó có thể tự redirect sang /login trước khi kịp về "/").
        window.location.href = "/";

    };

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">
                LEXED
            </div>

            <nav className="sidebar-nav">

                {navItems.map(({ label, to, icon: Icon }) => {

                    const active = pathname === to;

                    return (
                        <Link
                            key={label}
                            to={to}
                            className={`sidebar-link ${active ? "active" : ""}`}
                        >
                            <Icon />
                            <span>{label}</span>
                        </Link>
                    );

                })}

                <button
                    className="sidebar-link sidebar-logout"
                    onClick={handleLogout}
                >
                    <FiLogOut />
                    <span>Logout</span>
                </button>

            </nav>

        </aside>

    );

}

export default Sidebar;
