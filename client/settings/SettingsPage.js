function SettingsPage({ user, onClose, updateProfile, signOut, deleteAccount }) {
    const [tab, setTab] = useState('general');
    const [name, setName] = useState(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [confirmText, setConfirmText] = useState('');


    const showToast = (text, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const onUpdateName = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setLoading(true);
        try {
            const { error } = await updateProfile({ 
                display_name: name.trim(),
                full_name: name.trim()
            });
            if (error) throw error;
            showToast('Name updated!');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        if (confirmText !== 'DELETE') return;
        
        setLoading(true);
        try {
            const { error } = await deleteAccount();
            if (error) throw error;
            showToast('Account deleted.');
        } catch (err) {
            showToast(err.message || 'Failed', 'error');
        } finally {
            setLoading(false);
            setShowDelete(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: 'user-circle' },

        { id: 'apikeys', label: 'API Keys', icon: 'key' },
        { id: 'about', label: 'About', icon: 'info-octagon' }
    ];

    return (
        <div className="settings-page">
            <div className="settings-modal">

                <div className="settings-layout">
                <nav className="settings-nav">
                    <div className="settings-header">
                        <h1 className="settings-title">Settings</h1>
                        <button className="settings-close-btn" onClick={onClose}>
                            <i className="ti ti-x" style={{fontSize: 20}}></i>
                        </button>
                    </div>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`settings-nav-item ${tab === t.id ? 'active' : ''}`}
                            onClick={() => setTab(t.id)}
                        >
                            <i className={`ti ti-${t.icon}`} style={{fontSize: 20}}></i>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="settings-content">
                    {tab === 'general' && (
                        <GeneralTab
                            user={user}
                            displayName={name}
                            setDisplayName={setName}
                            handleUpdateName={onUpdateName}
                            isLoading={loading}
                            signOut={signOut}
                            setShowDeleteModal={setShowDelete}
                        />
                    )}

                    {tab === 'apikeys' && <ApiKeysTab showToast={showToast} />}
                    {tab === 'about' && <AboutTab />}
                </div>
            </div>

            {showDelete && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Delete Account</h3>
                        <p className="modal-desc">This action cannot be undone. All data will be lost.</p>
                        <p className="modal-desc">Type <strong>DELETE</strong> to confirm:</p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            className="settings-input"
                        />
                        <div className="modal-actions">
                            <button className="settings-btn-secondary" onClick={() => { setShowDelete(false); setConfirmText(''); }}>
                                Cancel
                            </button>
                            <button 
                                className="settings-btn-danger" 
                                onClick={onDelete}
                                disabled={confirmText !== 'DELETE' || loading}
                            >
                                {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
