// Authentication - Auth Context and Login/Signup UI
// 1. Provides auth context with signIn, signUp, password reset, OTP verification, and profile management


const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordResetInProgress, setPasswordResetInProgress] = useState(false);
    const supabaseClient = useSupabase();

    useEffect(() => {
        if (!supabaseClient) {
            setLoading(false);
            return;
        };

        const getSession = async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabaseClient]);

    const handleSignOut = () => {
        return supabaseClient.auth.signOut();
    };

    const handleSignIn = (data) => {
        return supabaseClient.auth.signInWithPassword(data);
    };

    const value = {
        signUp: (data) => {
            const { email, password, name } = data;
            const redirectTo = window.location.origin;
            return supabaseClient.auth.signUp({
                email,
                password,
                options: { 
                    emailRedirectTo: redirectTo,
                    data: {
                        display_name: name,
                        full_name: name
                    }
                }
            });
        },
        signIn: handleSignIn,
        signOut: handleSignOut,
        resetPassword: (email) => {
            return supabaseClient.auth.resetPasswordForEmail(email);
        },
        verifyOtp: (email, token, type = 'signup') => {
            return supabaseClient.auth.verifyOtp({
                email,
                token,
                type: type
            });
        },
        resendOtp: (email, type = 'signup') => {
            return supabaseClient.auth.resend({
                type: type,
                email: email
            });
        },
        updateProfile: (data) => {
            return supabaseClient.auth.updateUser({
                data: data
            });
        },
        updateEmail: async (newEmail) => {
            const result = await supabaseClient.auth.updateUser({
                email: newEmail
            });
            if (result.data?.user) {
                setUser(result.data.user);
            }
            return result;
        },
        updatePassword: (newPassword) => {
            return supabaseClient.auth.updateUser({
                password: newPassword
            });
        },
        deleteAccount: async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                return { error: { message: 'No active session' } };
            }
            
            const response = await fetch(`${API_URL}/account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return { error: { message: errorData.detail || 'Failed to delete account' } };
            }
            
            await supabaseClient.auth.signOut();
            return { error: null };
        },
        user,
        passwordResetInProgress,
        setPasswordResetInProgress,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

function useAuth() {
    return useContext(AuthContext);
}


// Auth Component (Login/Signup/OTP UI)

function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [passwordResetComplete, setPasswordResetComplete] = useState(false);
    const { signUp, signIn, resetPassword, verifyOtp, resendOtp, updatePassword, signOut, setPasswordResetInProgress } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            if (isVerifyingOtp) {
                if (otp.length !== 6) {
                    throw new Error('Please enter a 6-digit code');
                }
                const { error } = await verifyOtp(pendingEmail, otp, 'signup');
                if (error) throw error;
            } else if (isForgotPassword) {
                const { error } = await resetPassword(email);
                if (error) throw error;
                setResetEmail(email);
                setIsResettingPassword(true);
                setIsForgotPassword(false);
                setEmail('');
            } else if (isSignUp) {
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                const { error } = await signUp({ email, password, name });
                if (error) throw error;
                setPendingEmail(email);
                setIsVerifyingOtp(true);
            } else {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResending(true);
        setError(null);
        try {
            const { error } = await resendOtp(pendingEmail, 'signup');
            if (error) throw error;
            setMessage('New code sent to your email!');
        } catch (error) {
            setError(error.message);
        } finally {
            setResending(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (otp.length !== 6) {
                throw new Error('Please enter a 6-digit code');
            }
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            setPasswordResetInProgress(true);
            const { error: verifyError } = await verifyOtp(resetEmail, otp, 'recovery');
            if (verifyError) throw verifyError;
            const { error: updateError } = await updatePassword(password);
            if (updateError) throw updateError;
            await signOut();
            setPasswordResetInProgress(false);
            setPasswordResetComplete(true);
            setIsResettingPassword(false);
        } catch (error) {
            setPasswordResetInProgress(false);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendPasswordResetOtp = async () => {
        setResending(true);
        setError(null);
        try {
            const { error } = await resetPassword(resetEmail);
            if (error) throw error;
            setMessage('New code sent to your email!');
        } catch (error) {
            setError(error.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-section">
                <div className="auth-form">
                    <div className="logo" style={{justifyContent: 'center', marginBottom: 32}}>
                        <div className="logo-icon lava-lamp-bg">
                            <i className="ti ti-brain" style={{fontSize: 20}}></i>
                        </div>
                        <div className="logo-text">
                            <h1>Arkiv</h1>
                        </div>
                    </div>
                    
                    {passwordResetComplete ? (
                        <>
                            <h2>Password Reset</h2>
                            <p className="auth-subtitle">Your password has been reset successfully!</p>
                            <button 
                                type="button"
                                className="primary-btn"
                                onClick={() => {
                                    setPasswordResetComplete(false);
                                    setOtp('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setResetEmail('');
                                    setError(null);
                                    setMessage(null);
                                }}
                            >
                                Log In Now
                            </button>
                        </>
                    ) : isResettingPassword ? (
                        <>
                            <h2>Reset Password</h2>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to<br/>
                                <strong style={{color: '#fff'}}>{resetEmail}</strong>
                            </p>
                            <form onSubmit={handlePasswordReset}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(value);
                                    }}
                                    maxLength={6}
                                    style={{textAlign: 'center', letterSpacing: '8px', fontSize: 20, fontWeight: 600}}
                                    autoFocus
                                    required
                                />
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                                    </button>
                                </div>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        <i className={`ti ti-eye${showConfirmPassword ? '-off' : ''}`}></i>
                                    </button>
                                </div>
                                <button type="submit" disabled={loading || otp.length !== 6}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                            {error && <p className="error">{error}</p>}
                            {message && <p className="message">{message}</p>}
                            <p>
                                Didn't receive the code?
                                <button 
                                    onClick={handleResendPasswordResetOtp} 
                                    className="toggle-auth"
                                    disabled={loading || resending}
                                >
                                    {resending ? 'Resending...' : 'Resend'}
                                </button>
                            </p>
                            <p>
                                <button onClick={() => {
                                    setIsResettingPassword(false);
                                    setOtp('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setResetEmail('');
                                    setError(null);
                                    setMessage(null);
                                }} className="toggle-auth" style={{marginLeft: 0}}>
                                    ← Back to Sign In
                                </button>
                            </p>
                        </>
                    ) : isVerifyingOtp ? (
                        <>
                            <h2>Verify Email</h2>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to<br/>
                                <strong style={{color: '#fff'}}>{pendingEmail}</strong>
                            </p>
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(value);
                                    }}
                                    maxLength={6}
                                    style={{textAlign: 'center', letterSpacing: '8px', fontSize: 20, fontWeight: 600}}
                                    autoFocus
                                    required
                                />
                                <button type="submit" disabled={loading || otp.length !== 6}>
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>
                            {error && <p className="error">{error}</p>}
                            {message && <p className="message">{message}</p>}
                            <p>
                                Didn't receive the code?
                                <button 
                                    onClick={handleResendOtp} 
                                    className="toggle-auth"
                                    disabled={loading || resending}
                                >
                                    {resending ? 'Resending...' : 'Resend'}
                                </button>
                            </p>
                            <p>
                                <button onClick={() => {
                                    setIsVerifyingOtp(false);
                                    setOtp('');
                                    setPendingEmail('');
                                    setError(null);
                                    setMessage(null);
                                }} className="toggle-auth" style={{marginLeft: 0}}>
                                    ← Back to Sign Up
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <h2>{isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}</h2>
                            <p className="auth-subtitle">
                                {isForgotPassword 
                                    ? 'Enter your email to receive a reset code' 
                                    : (isSignUp 
                                        ? 'Start organizing your knowledge today' 
                                        : 'Sign in to continue to Arkiv')}
                            </p>
                            <form onSubmit={handleSubmit}>
                                {isSignUp && !isForgotPassword && (
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                )}
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {!isForgotPassword && (
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                                        </button>
                                    </div>
                                )}
                                {isSignUp && !isForgotPassword && (
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            <i className={`ti ti-eye${showConfirmPassword ? '-off' : ''}`}></i>
                                        </button>
                                    </div>
                                )}
                                {!isSignUp && !isForgotPassword && (
                                    <button 
                                        type="button" 
                                        className="forgot-password-link"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setError(null);
                                            setMessage(null);
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Loading...' : (isForgotPassword ? 'Send Reset Code' : (isSignUp ? 'Create Account' : 'Sign In'))}
                                </button>
                            </form>
                            {error && <p className="error">{error}</p>}
                            {message && <p className="message">{message}</p>}
                            {isForgotPassword ? (
                                <p>
                                    Remember your password?
                                    <button onClick={() => {
                                        setIsForgotPassword(false);
                                        setError(null);
                                        setMessage(null);
                                    }} className="toggle-auth">
                                        Sign In
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                    <button onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setEmail('');
                                        setPassword('');
                                        setConfirmPassword('');
                                        setName('');
                                        setError(null);
                                        setMessage(null);
                                    }} className="toggle-auth">
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="auth-decorative-panel">
                <div className="auth-decorative-content">
                    <h1 className="auth-decorative-tagline">Your Second Brain,<br/>Supercharged.</h1>
                    <p className="auth-decorative-subtitle">Chat with your documents</p>
                    <div className="auth-formats-container">
                        <div className="auth-formats-rail">
                            <div className="auth-formats-track">
                                <span className="auth-format-badge">PDF</span>
                                <span className="auth-format-badge">Word</span>
                                <span className="auth-format-badge">Excel</span>
                                <span className="auth-format-badge">PowerPoint</span>
                                <span className="auth-format-badge">Images</span>
                                <span className="auth-format-badge">CSV</span>
                                <span className="auth-format-badge">Markdown</span>
                                <span className="auth-format-badge">Text</span>
                                <span className="auth-format-badge">PDF</span>
                                <span className="auth-format-badge">Word</span>
                                <span className="auth-format-badge">Excel</span>
                                <span className="auth-format-badge">PowerPoint</span>
                                <span className="auth-format-badge">Images</span>
                                <span className="auth-format-badge">CSV</span>
                                <span className="auth-format-badge">Markdown</span>
                                <span className="auth-format-badge">Text</span>
                            </div>
                        </div>
                        <div className="auth-formats-rail">
                            <div className="auth-formats-track reverse">
                                <span className="auth-format-badge">Images</span>
                                <span className="auth-format-badge">CSV</span>
                                <span className="auth-format-badge">PDF</span>
                                <span className="auth-format-badge">Markdown</span>
                                <span className="auth-format-badge">Excel</span>
                                <span className="auth-format-badge">Text</span>
                                <span className="auth-format-badge">Word</span>
                                <span className="auth-format-badge">PowerPoint</span>
                                <span className="auth-format-badge">Images</span>
                                <span className="auth-format-badge">CSV</span>
                                <span className="auth-format-badge">PDF</span>
                                <span className="auth-format-badge">Markdown</span>
                                <span className="auth-format-badge">Excel</span>
                                <span className="auth-format-badge">Text</span>
                                <span className="auth-format-badge">Word</span>
                                <span className="auth-format-badge">PowerPoint</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
