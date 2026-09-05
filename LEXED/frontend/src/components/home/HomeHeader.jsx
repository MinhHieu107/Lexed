import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "../../styles/home/HomeHeader.css";

function HomeHeader() {

    const { user } = useAuth();

    const initial = user?.username?.charAt(0).toUpperCase() || "?";

    return (

        <header className="home-header">

            <div className="home-greeting">

                <h1>Hello, {user?.username || "there"}</h1>

                <p>You are doing great. Keep moving forward!</p>

            </div>

            <div className="home-header-right">

                <div className="home-search">
                    <FiSearch />
                    <input type="text" placeholder="Search" />
                </div>

                <div className="home-user">

                    <div className="home-avatar">
                        {initial}
                    </div>

                    <FiChevronDown />

                </div>

            </div>

        </header>

    );

}

export default HomeHeader;
