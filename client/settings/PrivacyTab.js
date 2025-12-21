// Privacy Tab Component - Email, Password, Logout, Delete
// 1. Handles email change, password change, session logout, and account deletion


function PrivacyTab({
    user,
    newEmail,
    setNewEmail,
    handleUpdateEmail,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleUpdatePassword,
    isEmailLoading,
    isPasswordLoading,
    signOut,
    setShowDeleteModal
}) {
    return (
        <div className="settings-tab">
            {/* Change Email */}
            <div className="settings-section">
                <h2 className="settings-section-title">Change Email</h2>
                <div className="email-status">
                    <p className="settings-section-desc">Current: <strong>{user?.email}</strong></p>
                    {user?.new_email && (
                        <p className="settings-section-desc pending">
                            <i className="ti ti-clock" style={{marginRight: 4}}></i>
                            Pending: <strong>{user.new_email}</strong>
                        </p>
                    )}
                </div>
                <form onSubmit={handleUpdateEmail} className="settings-form">
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email"
                        className="settings-input"
                    />
                    <button type="submit" className="settings-btn-primary" disabled={isEmailLoading} style={{width: '160px', height: '42px'}}>
                        {isEmailLoading ? 'Sending...' : 'Send Verification'}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="settings-section">
                <h2 className="settings-section-title">Change Password</h2>
                <form onSubmit={handleUpdatePassword} className="settings-form" style={{display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center'}}>
                    <div className="password-input-wrapper" style={{position: 'relative', flex: '1 1 200px'}}>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            className="settings-input"
                            style={{width: '100%', paddingRight: '40px', height: '42px'}}
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            tabIndex={-1}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#a3a3a3',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <i className={`ti ti-eye${showNewPassword ? '-off' : ''}`} style={{fontSize: 18}}></i>
                        </button>
                    </div>
                    <div className="password-input-wrapper" style={{position: 'relative', flex: '1 1 200px'}}>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="settings-input"
                            style={{width: '100%', paddingRight: '40px', height: '42px'}}
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#a3a3a3',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <i className={`ti ti-eye${showConfirmPassword ? '-off' : ''}`} style={{fontSize: 18}}></i>
                        </button>
                    </div>
                    <button type="submit" className="settings-btn-primary" disabled={isPasswordLoading} style={{width: '160px', height: '42px', whiteSpace: 'nowrap'}}>
                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Logout */}
            <div className="settings-section inline-section session-section">
                <h2 className="settings-section-title">Session</h2>
                <button className="settings-btn-secondary" onClick={signOut}>
                    <i className="ti ti-logout" style={{fontSize: 16}}></i>
                    Log out
                </button>
            </div>

            {/* Delete Account */}
            <div className="settings-section inline-section danger-section">
                <h2 className="settings-section-title danger">Danger Zone</h2>
                <button className="settings-btn-danger" onClick={() => setShowDeleteModal(true)}>
                    <i className="ti ti-trash" style={{fontSize: 16}}></i>
                    Delete Account
                </button>
            </div>
        </div>
    );
}
