function GeneralTab({
    user,
    displayName: name,
    setDisplayName: setName,
    handleUpdateName: onUpdate,
    isLoading: loading,
    resetKnowledgeBase: doReset,
    isResettingKnowledge: resetting,
    hasIndexedDocuments: hasDocs,
    showToast,
    signOut,
    setShowDeleteModal: setShowDelete
}) {
    const [confirm, setConfirm] = React.useState(false);
    const [editing, setEditing] = React.useState(false);

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

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await onUpdate(e);
        setEditing(false);
    };

    return (
        <div className="settings-tab">
            <div className="settings-section">
                <h2 className="settings-section-title">Profile</h2>
                <div className="profile-card">
                    <div className="profile-avatar-large"><span>{initial}</span></div>
                    <div className="profile-card-info" style={{flex: 1}}>
                        {editing ? (
                            <form onSubmit={handleEditSubmit} style={{display: 'flex', flexDirection: 'column', gap: '8px', width: '100%'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%'}}>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Name"
                                        className="settings-input"
                                        style={{height: '36px', padding: '0 12px', flex: 1, minWidth: '0'}}
                                        autoFocus
                                    />
                                    <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0}}>
                                        <button type="submit" className="settings-btn-danger" disabled={loading} style={{padding: '6px 12px', fontSize: '13px', width: '100px', height: '36px', justifyContent: 'center'}}>
                                            {loading ? '...' : 'Save'}
                                        </button>
                                        <button type="button" className="settings-btn-secondary" onClick={() => setEditing(false)} style={{padding: '6px 12px', fontSize: '13px', width: '100px', height: '36px', justifyContent: 'center'}}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <h3>{user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'User'}</h3>
                        )}
                    </div>
                    {!editing && (
                        <button 
                            onClick={() => setEditing(true)}
                            style={{marginLeft: 'auto', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#a3a3a3', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                        >
                            <i className="ti ti-edit" style={{fontSize: 20}}></i>
                        </button>
                    )}
                </div>
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
