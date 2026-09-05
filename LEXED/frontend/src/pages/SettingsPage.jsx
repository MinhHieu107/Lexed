import { FiAlertCircle, FiEdit, FiUserCheck, FiClipboard, FiArchive } from "react-icons/fi";
import Sidebar from "../components/dashboard/Sidebar";
import Footer from "../components/Footer";
import SettingsMenuItem from "../components/settings/SettingsMenuItem";
import "../styles/settings/SettingsPage.css";

const menuItems = [
    { icon: FiAlertCircle, label: "Trợ giúp về LexEd" },
    { icon: FiEdit, label: "Gửi phản hồi" },
    { icon: FiUserCheck, label: "Community" },
    { icon: FiClipboard, label: "Ngôn ngữ" },
    { icon: FiArchive, label: "Quản lý gói" }
];

function SettingsPage() {

    return (

        <div className="settings-layout">

            <Sidebar />

            <div className="settings-main">

                <div className="settings-content">

                    <div className="settings-card">

                        {menuItems.map((item) => (
                            <SettingsMenuItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                            />
                        ))}

                    </div>

                </div>

                <Footer />

            </div>

        </div>

    );

}

export default SettingsPage;
