// General Tab Component - Profile, Name, Stats, Plan
// 1. Displays user profile card, display name editor, usage statistics, and current plan


function GeneralTab({
    user,
    displayName,
    setDisplayName,
    handleUpdateName,
    isLoading,
    tokenCount,
    filesProcessed
}) {
    const userInitial = (user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase();

    return (
        <div className="settings-tab">
            {/* Profile Section */}
            <div className="settings-section">
                <h2 className="settings-section-title">Profile</h2>
                <div className="profile-card">
                    <div className="profile-avatar-large">
                        <span>{userInitial}</span>
                    </div>
                    <div className="profile-card-info">
                        <h3>{user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'User'}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Display Name Section */}
            <div className="settings-section">
                <h2 className="settings-section-title">Display Name</h2>
                <form onSubmit={handleUpdateName} className="settings-form">
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter display name"
                        className="settings-input"
                    />
                    <button type="submit" className="settings-btn-primary" disabled={isLoading} style={{width: '160px', height: '42px'}}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>

            {/* Usage Statistics */}
            <div className="settings-section">
                <h2 className="settings-section-title">Usage Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{tokenCount.toLocaleString()}</div>
                        <div className="stat-label">Tokens Used</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{filesProcessed}</div>
                        <div className="stat-label">Files Processed</div>
                    </div>
                </div>
            </div>

            {/* Current Plan */}
            <div className="settings-section">
                <h2 className="settings-section-title">Current Plan</h2>
                <div className="plan-card">
                    <div className="plan-info">
                        <span className="plan-badge free">Free</span>
                        <p className="plan-desc">You're on the free plan with limited features.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
