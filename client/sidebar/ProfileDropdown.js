// Profile Dropdown Component - User Menu
// 1. Displays user avatar, name, email with settings and logout options


function ProfileDropdown({
    user,
    showProfileMenu,
    setShowProfileMenu,
    setShowProfile,
    signOut,
    collapsed = false
}) {
    const userInitial = (user.user_metadata?.display_name || user.user_metadata?.full_name || 'U').charAt(0).toUpperCase();
    const userName = user.user_metadata?.display_name || user.user_metadata?.full_name || 'User';

    if (collapsed) {
        return (
            <>
                <div className="profile-trigger-collapsed" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <div className="profile-avatar-mini">
                        <span>{userInitial}</span>
                    </div>
                </div>
                {showProfileMenu && (
                    <div className="profile-dropdown sidebar-dropdown">
                        <div className="profile-dropdown-header">
                            <div className="profile-avatar-mini">
                                <span>{userInitial}</span>
                            </div>
                            <div className="profile-dropdown-info">
                                <span className="profile-dropdown-name">{userName}</span>
                                <span className="profile-dropdown-email">{user.email}</span>
                            </div>
                        </div>
                        <div className="profile-divider"></div>
                        <button className="profile-menu-item" onClick={() => { setShowProfile(true); setShowProfileMenu(false); }}>
                            <i className="ti ti-settings" style={{fontSize: 20}}></i>
                            Settings
                        </button>
                        <button className="profile-menu-item signout" onClick={signOut}>
                            <i className="ti ti-logout" style={{fontSize: 20}}></i>
                            Log out
                        </button>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <div className="profile-trigger-expanded" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="profile-avatar-mini">
                    <span>{userInitial}</span>
                </div>
                <div className="profile-trigger-info">
                    <span className="profile-trigger-name">{userName}</span>
                </div>
            </div>
            {showProfileMenu && (
                <div className="profile-dropdown sidebar-dropdown">
                    <div className="profile-dropdown-header">
                        <div className="profile-avatar-mini">
                            <span>{userInitial}</span>
                        </div>
                        <div className="profile-dropdown-info">
                            <span className="profile-dropdown-name">{userName}</span>
                            <span className="profile-dropdown-email">{user.email}</span>
                        </div>
                    </div>
                    <div className="profile-divider"></div>
                    <button className="profile-menu-item" onClick={() => { setShowProfile(true); setShowProfileMenu(false); }}>
                        <i className="ti ti-settings" style={{fontSize: 20}}></i>
                        Settings
                    </button>
                    <button className="profile-menu-item signout" onClick={signOut}>
                        <i className="ti ti-logout" style={{fontSize: 20}}></i>
                        Log out
                    </button>
                </div>
            )}
        </>
    );
}
