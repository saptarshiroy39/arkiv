// General Tab Component - Profile, Name, Knowledge Base, Plan
// 1. Displays user profile card, display name editor, and knowledge reset


function GeneralTab({
    user,
    displayName,
    setDisplayName,
    handleUpdateName,
    isLoading,
    resetKnowledgeBase,
    isResettingKnowledge,
    hasIndexedDocuments
}) {
    const [showResetConfirm, setShowResetConfirm] = React.useState(false);
    const [resetMessage, setResetMessage] = React.useState(null);

    const userInitial = (user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase();

    const handleReset = async () => {
        const result = await resetKnowledgeBase();
        if (result.success) {
            setResetMessage({ text: 'Knowledge base cleared successfully!', type: 'success' });
        } else {
            setResetMessage({ text: result.error?.message || 'Reset failed', type: 'error' });
        }
        setShowResetConfirm(false);
        setTimeout(() => setResetMessage(null), 4000);
    };

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

            {/* Knowledge Base - styled like Session section */}
            <div className="settings-section inline-section session-section">
                <h2 className="settings-section-title">Knowledge Base</h2>
                {!showResetConfirm ? (
                    <button 
                        className="settings-btn-secondary" 
                        onClick={() => setShowResetConfirm(true)}
                        disabled={!hasIndexedDocuments || isResettingKnowledge}
                        style={{opacity: hasIndexedDocuments ? 1 : 0.5}}
                    >
                        <i className="ti ti-eraser" style={{fontSize: 16}}></i>
                        {hasIndexedDocuments ? 'Reset' : 'No Documents'}
                    </button>
                ) : (
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <button 
                            className="settings-btn-danger" 
                            onClick={handleReset}
                            disabled={isResettingKnowledge}
                        >
                            <i className="ti ti-check" style={{fontSize: 16}}></i>
                            {isResettingKnowledge ? 'Resetting...' : 'Confirm'}
                        </button>
                        <button 
                            className="settings-btn-secondary" 
                            onClick={() => setShowResetConfirm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {resetMessage && (
                <div className={`profile-message ${resetMessage.type}`} style={{marginTop: '-10px', marginBottom: '20px'}}>
                    <i className={`ti ti-${resetMessage.type === 'success' ? 'check' : 'alert-triangle'}`} style={{fontSize: 16}}></i>
                    {resetMessage.text}
                </div>
            )}
        </div>
    );
}
