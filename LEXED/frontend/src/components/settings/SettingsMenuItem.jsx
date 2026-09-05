import "../../styles/settings/SettingsMenuItem.css";

function SettingsMenuItem({ icon: Icon, label, onClick }) {

    return (

        <button className="settings-menu-item" onClick={onClick}>

            <Icon />

            <span>{label}</span>

        </button>

    );

}

export default SettingsMenuItem;
