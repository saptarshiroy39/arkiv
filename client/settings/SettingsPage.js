// Settings Page Component - Main Settings Wrapper
// 1. Manages tabs and state, renders GeneralTab, PrivacyTab, and BillingTab components


function SettingsPage({ user, onClose, updateProfile, updateEmail, updatePassword, signOut, deleteAccount, filesProcessed, tokenCount }) {
    const [activeTab, setActiveTab] = useState('general');
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) return;
        
        setIsLoading(true);
        try {
            const { error } = await updateProfile({ 
                display_name: displayName.trim(),
                full_name: displayName.trim()
            });
            if (error) throw error;
            showMessage('Display name updated successfully!');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) {
            showMessage('Please enter a new email address', 'error');
            return;
        }
        
        setIsEmailLoading(true);
        try {
            const { error } = await updateEmail(newEmail.trim());
            if (error) throw error;
            showMessage('Verification email sent! Please check your new email inbox and click the link to confirm.');
            setNewEmail('');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setIsEmailLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return;
        
        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        setIsPasswordLoading(true);
        try {
            const { error } = await updatePassword(newPassword);
            if (error) throw error;
            showMessage('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        
        setIsLoading(true);
        try {
            const { error } = await deleteAccount();
            if (error) throw error;
            showMessage('Account deleted successfully.');
        } catch (error) {
            showMessage(error.message || 'Failed to delete account', 'error');
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: 'user-circle' },
        { id: 'privacy', label: 'Security', icon: 'shield-lock' },
        { id: 'apikeys', label: 'API Keys', icon: 'key' },
        { id: 'billing', label: 'Billing', icon: 'credit-card' },
        { id: 'about', label: 'About', icon: 'info-octagon' }
    ];

    return (
        <div className="settings-page">
            {/* Settings Header */}
            <div className="settings-header">
                <button className="profile-back-btn" onClick={onClose}>
                    <i className="ti ti-arrow-left" style={{fontSize: 18}}></i>
                    Back
                </button>
                <h1 className="settings-title">Settings</h1>
            </div>

            {message && (
                <div className={`profile-message ${message.type}`}>
                    <i className={`ti ti-${message.type === 'success' ? 'check' : 'alert-triangle'}`} style={{fontSize: 16}}></i>
                    {message.text}
                </div>
            )}

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <nav className="settings-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <i className={`ti ti-${tab.icon}`} style={{fontSize: 18}}></i>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="settings-content">
                    {activeTab === 'general' && (
                        <GeneralTab
                            user={user}
                            displayName={displayName}
                            setDisplayName={setDisplayName}
                            handleUpdateName={handleUpdateName}
                            isLoading={isLoading}
                            tokenCount={tokenCount}
                            filesProcessed={filesProcessed}
                        />
                    )}

                    {activeTab === 'privacy' && (
                        <PrivacyTab
                            user={user}
                            newEmail={newEmail}
                            setNewEmail={setNewEmail}
                            handleUpdateEmail={handleUpdateEmail}
                            newPassword={newPassword}
                            setNewPassword={setNewPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                            showNewPassword={showNewPassword}
                            setShowNewPassword={setShowNewPassword}
                            showConfirmPassword={showConfirmPassword}
                            setShowConfirmPassword={setShowConfirmPassword}
                            handleUpdatePassword={handleUpdatePassword}
                            isEmailLoading={isEmailLoading}
                            isPasswordLoading={isPasswordLoading}
                            signOut={signOut}
                            setShowDeleteModal={setShowDeleteModal}
                        />
                    )}

                    {activeTab === 'apikeys' && (
                        <ApiKeysTab />
                    )}

                    {activeTab === 'billing' && (
                        <BillingTab />
                    )}

                    {activeTab === 'about' && (
                        <AboutTab />
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Delete Account</h3>
                        <p className="modal-desc">
                            This action cannot be undone. All your data will be permanently deleted.
                        </p>
                        <p className="modal-desc">
                            Type <strong>DELETE</strong> to confirm:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            className="settings-input"
                        />
                        <div className="modal-actions">
                            <button 
                                className="settings-btn-secondary" 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="settings-btn-danger" 
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
