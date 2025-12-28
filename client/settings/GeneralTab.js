function GeneralTab({
    user,
    displayName: name,
    setDisplayName: setName,
    handleUpdateName: onUpdate,
    isLoading: loading,
    showToast,
    signOut,
    setShowDeleteModal: setShowDelete
}) {
    const initial = (user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase();

    return (
        <div className="settings-tab">
            <div className="settings-section">
                <h2 className="settings-section-title">Profile</h2>
                <div className="profile-card">
                    <div className="profile-input-row">
                        <div className="profile-avatar-large"><span>{initial}</span></div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={onUpdate}
                            placeholder="Enter your name"
                            className="settings-input"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>



            <div className="settings-section inline-section session-section">
                <h2 className="settings-section-title">Session</h2>
                <button className="settings-btn-secondary" onClick={signOut}>
                    <i className="ti ti-logout" style={{fontSize: 16}}></i> Log out
                </button>
            </div>

            <div className="settings-section inline-section danger-section">
                <h2 className="settings-section-title danger">Danger Zone</h2>
                <button className="settings-btn-danger" onClick={() => setShowDelete(true)}>
                    <i className="ti ti-trash" style={{fontSize: 16}}></i> Delete Account
                </button>
            </div>
        </div>
    );
}
