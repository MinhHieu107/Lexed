import { FiMenu, FiSearch, FiBell, FiPlus, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard/Topbar.css";

function Topbar() {

    const { user } = useAuth();

    const initial = user?.username?.charAt(0).toUpperCase() || "?";

    return (

        <header className="topbar">

            <button className="topbar-menu-btn">
                <FiMenu />
            </button>

            <div className="topbar-search">
                <FiSearch />
                <input type="text" placeholder="Search" />
            </div>

            <button className="topbar-icon-btn">
                <FiBell />
            </button>

            <button className="topbar-icon-btn topbar-add-btn">
                <FiPlus />
            </button>

            <div className="topbar-user">

                <div className="topbar-avatar">
                    {initial}
                </div>

                <FiChevronDown />

            </div>

        </header>

    );

}

export default Topbar;
