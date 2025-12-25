function PrivacyTab({
    user,
    newEmail: email,
    setNewEmail: setEmail,
    handleUpdateEmail: onUpdateEmail,
    newPassword: pass,
    setNewPassword: setPass,
    confirmPassword: confirm,
    setConfirmPassword: setConfirm,
    showNewPassword: showPass,
    setShowNewPassword: setShowPass,
    showConfirmPassword: showConfirm,
    setShowConfirmPassword: setShowConfirm,
    handleUpdatePassword: onUpdatePass,
    isEmailLoading: emailLoading,
    isPasswordLoading: passLoading,
    signOut,
    setShowDeleteModal: setShowDelete
}) {
    const PassInput = ({ val, set, show, setShow, placeholder }) => (
        <div className="password-input-wrapper" style={{position: 'relative', flex: '1 1 200px'}}>
            <input
                type={show ? 'text' : 'password'}
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="settings-input"
                style={{width: '100%', paddingRight: '40px', height: '42px'}}
            />
            <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShow(!show)}
                tabIndex={-1}
                style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#a3a3a3', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center'
                }}
            >
                <i className={`ti ti-eye${show ? '-off' : ''}`} style={{fontSize: 18}}></i>
            </button>
        </div>
    );

    return (
        <div className="settings-tab">
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
                <form onSubmit={onUpdateEmail} className="settings-form">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter New Email"
                        className="settings-input"
                    />
                    <button type="submit" className="settings-btn-primary" disabled={emailLoading} style={{width: '160px', height: '42px'}}>
                        {emailLoading ? 'Sending...' : 'Send Verification'}
                    </button>
                </form>
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Change Password</h2>
                <form onSubmit={onUpdatePass} className="settings-form" style={{display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center'}}>
                    <PassInput val={pass} set={setPass} show={showPass} setShow={setShowPass} placeholder="New password" />
                    <PassInput val={confirm} set={setConfirm} show={showConfirm} setShow={setShowConfirm} placeholder="Confirm new password" />
                    <button type="submit" className="settings-btn-primary" disabled={passLoading} style={{width: '160px', height: '42px', whiteSpace: 'nowrap'}}>
                        {passLoading ? 'Wait...' : 'Update'}
                    </button>
                </form>
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
