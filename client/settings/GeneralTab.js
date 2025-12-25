function GeneralTab({
    user,
    displayName: name,
    setDisplayName: setName,
    handleUpdateName: onUpdate,
    isLoading: loading,
    resetKnowledgeBase: doReset,
    isResettingKnowledge: resetting,
    hasIndexedDocuments: hasDocs,
    showToast
}) {
    const [confirm, setConfirm] = React.useState(false);

    const initial = (user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase();

    const onReset = async () => {
        const res = await doReset();
        if (res.success) {
            showToast('Knowledge base cleared!');
        } else {
            showToast(res.error?.message || 'Failed', 'error');
        }
        setConfirm(false);
    };

    return (
        <div className="settings-tab">
            <div className="settings-section">
                <h2 className="settings-section-title">Profile</h2>
                <div className="profile-card">
                    <div className="profile-avatar-large"><span>{initial}</span></div>
                    <div className="profile-card-info">
                        <h3>{user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'User'}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Display Name</h2>
                <form onSubmit={onUpdate} className="settings-form">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="settings-input"
                    />
                    <button type="submit" className="settings-btn-primary" disabled={loading} style={{width: '160px', height: '42px'}}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>

            <div className="settings-section inline-section session-section">
                <h2 className="settings-section-title">Knowledge Base</h2>
                {!confirm ? (
                    <button 
                        className="settings-btn-secondary" 
                        onClick={() => setConfirm(true)}
                        disabled={!hasDocs || resetting}
                        style={{opacity: hasDocs ? 1 : 0.5}}
                    >
                        <i className="ti ti-eraser" style={{fontSize: 16}}></i>
                        {hasDocs ? 'Reset' : 'No Docs'}
                    </button>
                ) : (
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <button className="settings-btn-danger" onClick={onReset} disabled={resetting}>
                            <i className="ti ti-check" style={{fontSize: 16}}></i>
                            {resetting ? 'Resetting...' : 'Confirm'}
                        </button>
                        <button className="settings-btn-secondary" onClick={() => setConfirm(false)}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}
