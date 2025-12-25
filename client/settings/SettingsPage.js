function SettingsPage({ user, onClose, updateProfile, updateEmail, updatePassword, signOut, deleteAccount, resetKnowledgeBase, isResettingKnowledge, hasIndexedDocuments }) {
    const [tab, setTab] = useState('general');
    const [name, setName] = useState(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const onUpdateEmail = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showToast('Enter a new email', 'error');
            return;
        }
        
        setEmailLoading(true);
        try {
            const { error } = await updateEmail(email.trim());
            if (error) throw error;
            showToast('Verification sent! Check your new email inbox.');
            setEmail('');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setEmailLoading(false);
        }
    };

    const onUpdatePass = async (e) => {
        e.preventDefault();
        if (!pass || !confirm) return;
        
        if (pass !== confirm) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (pass.length < 6) {
            showToast('Password too short', 'error');
            return;
        }
        
        setPassLoading(true);
        try {
            const { error } = await updatePassword(pass);
            if (error) throw error;
            showToast('Password updated!');
            setPass('');
            setConfirm('');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setPassLoading(false);
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
        { id: 'privacy', label: 'Security', icon: 'shield-lock' },
        { id: 'apikeys', label: 'API Keys', icon: 'key' },
        { id: 'about', label: 'About', icon: 'info-octagon' }
    ];

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="profile-back-btn" onClick={onClose}>
                    <i className="ti ti-arrow-left" style={{fontSize: 18}}></i>
                    Back
                </button>
                <h1 className="settings-title">Settings</h1>
            </div>

            <div className="settings-layout">
                <nav className="settings-nav">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`settings-nav-item ${tab === t.id ? 'active' : ''}`}
                            onClick={() => setTab(t.id)}
                        >
                            <i className={`ti ti-${t.icon}`} style={{fontSize: 20}}></i>
                            {t.label}
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
                            resetKnowledgeBase={resetKnowledgeBase}
                            isResettingKnowledge={isResettingKnowledge}
                            hasIndexedDocuments={hasIndexedDocuments}
                            showToast={showToast}
                        />
                    )}

                    {tab === 'privacy' && (
                        <PrivacyTab
                            user={user}
                            newEmail={email}
                            setNewEmail={setEmail}
                            handleUpdateEmail={onUpdateEmail}
                            newPassword={pass}
                            setNewPassword={setPass}
                            confirmPassword={confirm}
                            setConfirmPassword={setConfirm}
                            showNewPassword={showPass}
                            setShowNewPassword={setShowPass}
                            showConfirmPassword={showConfirm}
                            setShowConfirmPassword={setShowConfirm}
                            handleUpdatePassword={onUpdatePass}
                            isEmailLoading={emailLoading}
                            isPasswordLoading={passLoading}
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

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
