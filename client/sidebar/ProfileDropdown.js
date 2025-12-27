function ProfileDropdown({
    user,
    showProfileMenu: showMenu,
    setShowProfileMenu: setShowMenu,
    setShowProfile,
    signOut,
    collapsed = false
}) {
    const initial = (user.user_metadata?.display_name || user.user_metadata?.full_name || 'U').charAt(0).toUpperCase();
    const name = user.user_metadata?.display_name || user.user_metadata?.full_name || 'User';

    const Dropdown = () => (
        <div className="profile-dropdown sidebar-dropdown">
            <div className="profile-dropdown-header">
                <div className="profile-avatar-mini"><span>{initial}</span></div>
                <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name">{name}</span>
                </div>
            </div>
            <div className="profile-divider"></div>
            <button className="profile-menu-item" onClick={() => { setShowProfile(true); setShowMenu(false); }}>
                <i className="ti ti-settings" style={{fontSize: 20}}></i>
                Settings
            </button>
            <button className="profile-menu-item signout" onClick={signOut}>
                <i className="ti ti-logout" style={{fontSize: 20}}></i>
                Log out
            </button>
        </div>
    );

    if (collapsed) {
        return (
            <>
                <div className="profile-trigger-collapsed" onClick={() => setShowMenu(!showMenu)}>
                    <div className="profile-avatar-mini"><span>{initial}</span></div>
                </div>
                {showMenu && <Dropdown />}
            </>
        );
    }

    return (
        <>
            <div className="profile-trigger-expanded" onClick={() => setShowMenu(!showMenu)}>
                <div className="profile-avatar-mini"><span>{initial}</span></div>
                <div className="profile-trigger-info">
                    <span className="profile-trigger-name">{name}</span>
                </div>
            </div>
            {showMenu && <Dropdown />}
        </>
    );
}
