const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const sb = useSupabase();

    useEffect(() => {
        if (!sb) {
            setLoading(false);
            return;
        }

        // initial session check
        sb.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // listen for changes
        const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [sb]);

    const value = {
        user,
        loading,
        isResetting,
        setIsResetting,
        
        signIn: (data) => sb.auth.signInWithPassword(data),
        signOut: () => sb.auth.signOut(),
        
        signUp: ({ email, password, name }) => {
            return sb.auth.signUp({
                email,
                password,
                options: { 
                    emailRedirectTo: window.location.origin,
                    data: { display_name: name, full_name: name }
                }
            });
        },
        
        resetPassword: (email) => sb.auth.resetPasswordForEmail(email),
        
        verifyOtp: (email, token, type = 'signup') => {
            return sb.auth.verifyOtp({ email, token, type });
        },
        
        resendOtp: (email, type = 'signup') => {
            return sb.auth.resend({ type, email });
        },
        
        updateProfile: (data) => sb.auth.updateUser({ data }),
        
        updateEmail: async (email) => {
            const res = await sb.auth.updateUser({ email });
            if (res.data?.user) setUser(res.data.user);
            return res;
        },
        
        updatePassword: (password) => sb.auth.updateUser({ password }),
        
        deleteAccount: async () => {
            const { data: { session } } = await sb.auth.getSession();
            if (!session) return { error: { message: 'No session' } };
            
            const res = await fetch(`${API_URL}/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            
            if (!res.ok) {
                const err = await res.json();
                return { error: { message: err.detail || 'Delete failed' } };
            }
            
            await sb.auth.signOut();
            return { error: null };
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}


// Auth Component (Login/Signup/OTP UI)

function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // mode flags
    const [mode, setMode] = useState('login'); // login, signup, forgot, verify, reset
    const [pendingEmail, setPendingEmail] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    const [resetDone, setResetDone] = useState(false);

    const { 
        signUp, signIn, resetPassword, verifyOtp, resendOtp, updatePassword, signOut, setIsResetting 
    } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);
        
        try {
            if (mode === 'verify') {
                if (otp.length !== 6) throw new Error('Enter 6-digit code');
                const { error } = await verifyOtp(pendingEmail, otp, 'signup');
                if (error) throw error;
            } else if (mode === 'forgot') {
                const { error } = await resetPassword(email);
                if (error) throw error;
                setResetEmail(email);
                setMode('reset');
                setEmail('');
            } else if (mode === 'signup') {
                if (password !== confirm) throw new Error('Passwords do not match');
                if (password.length < 6) throw new Error('Min 6 characters');
                const { error } = await signUp({ email, password, name });
                if (error) throw error;
                setPendingEmail(email);
                setMode('verify');
            } else {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onResend = async () => {
        setResending(true);
        setError(null);
        try {
            const { error } = await resendOtp(pendingEmail, 'signup');
            if (error) throw error;
            setMsg('New code sent!');
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    const onPasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (otp.length !== 6) throw new Error('Enter 6-digit code');
            if (password !== confirm) throw new Error('Passwords do not match');
            if (password.length < 6) throw new Error('Min 6 characters');
            
            setIsResetting(true);
            const { error: vo } = await verifyOtp(resetEmail, otp, 'recovery');
            if (vo) throw vo;
            const { error: up } = await updatePassword(password);
            if (up) throw up;
            
            await signOut();
            setIsResetting(false);
            setResetDone(true);
            setMode('login'); // go back to login after reset success
        } catch (err) {
            setIsResetting(false);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resendResetCode = async () => {
        setResending(true);
        setError(null);
        try {
            const { error } = await resetPassword(resetEmail);
            if (error) throw error;
            setMsg('New code sent!');
        } catch (err) {
            setError(err.message);
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
                    
                    {resetDone ? (
                        <>
                            <h2>Password Reset</h2>
                            <p className="auth-subtitle">Your password has been reset successfully!</p>
                            <button 
                                type="button"
                                className="primary-btn"
                                onClick={() => {
                                    setResetDone(false);
                                    setOtp('');
                                    setPassword('');
                                    setConfirm('');
                                    setResetEmail('');
                                    setError(null);
                                    setMsg(null);
                                }}
                            >
                                Log In Now
                            </button>
                        </>
                    ) : mode === 'reset' ? (
                        <>
                            <h2>Reset Password</h2>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to<br/>
                                <strong style={{color: '#ffffff7e'}}>{resetEmail}</strong>
                            </p>
                            <form onSubmit={onPasswordReset}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(val);
                                    }}
                                    maxLength={6}
                                    style={{textAlign: 'center', letterSpacing: '8px', fontSize: 20, fontWeight: 600}}
                                    autoFocus
                                    required
                                />
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowPass(!showPass)}
                                        tabIndex={-1}
                                    >
                                        <i className={`ti ti-eye${showPass ? '-off' : ''}`}></i>
                                    </button>
                                </div>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Confirm New Password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        tabIndex={-1}
                                    >
                                        <i className={`ti ti-eye${showConfirm ? '-off' : ''}`}></i>
                                    </button>
                                </div>
                                <button type="submit" disabled={loading || otp.length !== 6}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                            {error && <p className="error">{error}</p>}
                            {msg && <p className="message">{msg}</p>}
                            <p>
                                Didn't receive the code?
                                <button 
                                    onClick={resendResetCode} 
                                    className="toggle-auth"
                                    disabled={loading || resending}
                                >
                                    {resending ? 'Resending...' : 'Resend'}
                                </button>
                            </p>
                            <p>
                                <button onClick={() => {
                                    setMode('login');
                                    setOtp('');
                                    setPassword('');
                                    setConfirm('');
                                    setResetEmail('');
                                    setError(null);
                                    setMsg(null);
                                }} className="toggle-auth" style={{marginLeft: 0}}>
                                    ← Back to Sign In
                                </button>
                            </p>
                        </>
                    ) : mode === 'verify' ? (
                        <>
                            <h2>Verify Email</h2>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to<br/>
                                <strong style={{color: '#fff'}}>{pendingEmail}</strong>
                            </p>
                            <form onSubmit={onSubmit}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(val);
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
                            {msg && <p className="message">{msg}</p>}
                            <p>
                                Didn't receive the code?
                                <button 
                                    onClick={onResend} 
                                    className="toggle-auth"
                                    disabled={loading || resending}
                                >
                                    {resending ? 'Resending...' : 'Resend'}
                                </button>
                            </p>
                            <p>
                                <button onClick={() => {
                                    setMode('signup');
                                    setOtp('');
                                    setPendingEmail('');
                                    setError(null);
                                    setMsg(null);
                                }} className="toggle-auth" style={{marginLeft: 0}}>
                                    ← Back to Sign Up
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <h2>{mode === 'forgot' ? 'Reset Password' : (mode === 'signup' ? 'Create Account' : 'Welcome Back')}</h2>
                            <p className="auth-subtitle">
                                {mode === 'forgot'
                                    ? 'Enter your email to receive a reset code' 
                                    : (mode === 'signup'
                                        ? 'Start organizing your knowledge today' 
                                        : 'Sign in to continue to Arkiv')}
                            </p>
                            <form onSubmit={onSubmit}>
                                {mode === 'signup' && (
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
                                {mode !== 'forgot' && (
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowPass(!showPass)}
                                            tabIndex={-1}
                                        >
                                            <i className={`ti ti-eye${showPass ? '-off' : ''}`}></i>
                                        </button>
                                    </div>
                                )}
                                {mode === 'signup' && (
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Confirm Password"
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            tabIndex={-1}
                                        >
                                            <i className={`ti ti-eye${showConfirm ? '-off' : ''}`}></i>
                                        </button>
                                    </div>
                                )}
                                {mode === 'login' && (
                                    <button 
                                        type="button" 
                                        className="forgot-password-link"
                                        onClick={() => {
                                            setMode('forgot');
                                            setError(null);
                                            setMsg(null);
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Loading...' : (mode === 'forgot' ? 'Send Reset Code' : (mode === 'signup' ? 'Create Account' : 'Sign In'))}
                                </button>
                            </form>
                            {error && <p className="error">{error}</p>}
                            {msg && <p className="message">{msg}</p>}
                            {mode === 'forgot' ? (
                                <p>
                                    Remember your password?
                                    <button onClick={() => {
                                        setMode('login');
                                        setError(null);
                                        setMsg(null);
                                    }} className="toggle-auth">
                                        Sign In
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                                    <button onClick={() => {
                                        setMode(mode === 'signup' ? 'login' : 'signup');
                                        setEmail('');
                                        setPassword('');
                                        setConfirm('');
                                        setName('');
                                        setError(null);
                                        setMsg(null);
                                    }} className="toggle-auth">
                                        {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="auth-decorative-panel">
                <div className="auth-decorative-content">
                    <h1 className="auth-decorative-tagline">
                        <span style={{color: 'rgba(255,255,255,0.5)'}}>Your documents,</span><br/>
                        <span style={{color: '#fff'}}>Now conversational.</span>
                    </h1>
                </div>
            </div>
        </div>
    );
}
