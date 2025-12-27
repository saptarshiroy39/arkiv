const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
        
        sendMagicLink: async ({ email, name }) => {
            return sb.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: name ? { display_name: name, full_name: name } : undefined
                }
            });
        },

        loginWithGoogle: async () => {
            return sb.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
        },

        signOut: () => sb.auth.signOut(),
        
        verifyOtp: (email, token, type = 'magiclink') => {
            return sb.auth.verifyOtp({ email, token, type });
        },
        
        updateProfile: (data) => sb.auth.updateUser({ data }),
        
        updateEmail: async (email) => {
            const res = await sb.auth.updateUser({ email });
            if (res.data?.user) setUser(res.data.user);
            return res;
        },
        
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
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [mode, setMode] = useState('login'); // login, signup
    
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const { sendMagicLink, loginWithGoogle, verifyOtp } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);
        
        try {
            if (otpSent) {
                // Verify OTP
                if (otp.length !== 6) throw new Error('Enter 6-digit code');
                const { error } = await verifyOtp(email, otp, 'email');
                if (error) throw error;
                // Success - session established automatically
            } else {
                // Send OTP
                const { error } = await sendMagicLink({ 
                    email, 
                    name: mode === 'signup' ? name : undefined 
                });
                if (error) throw error;
                setOtpSent(true);
                setMsg('Code sent to your email!');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onChangeMode = (newMode) => {
        setMode(newMode);
        setOtpSent(false);
        setOtp('');
        setError(null);
        setMsg(null);
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
                    
                    {!otpSent && (
                        <>
                            <h2>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
                            <p className="auth-subtitle">
                                {mode === 'signup' 
                                    ? 'Start organizing your knowledge today' 
                                    : 'Sign in to continue to Arkiv'}
                            </p>

                            <button 
                                type="button"
                                className="google-auth-btn"
                                onClick={loginWithGoogle}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    width: '100%', padding: '12px', background: '#fff', color: '#0f0f0f',
                                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                                    fontWeight: '500', marginBottom: '20px', transition: 'background 0.2s',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <i className="ti ti-brand-google-filled" style={{fontSize: 18}}></i>
                                Continue with Google
                            </button>
                            
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#525252', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>
                                <div style={{height: '1px', flex: 1, background: '#333'}}></div>
                                OR
                                <div style={{height: '1px', flex: 1, background: '#333'}}></div>
                            </div>
                        </>
                    )}

                    {otpSent && (
                        <>
                            <h2>Verify Email</h2>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to<br/>
                                <strong style={{color: '#fff'}}>{email}</strong>
                            </p>
                        </>
                    )}

                    <form onSubmit={onSubmit}>
                        {!otpSent && mode === 'signup' && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        )}
                        
                        {!otpSent ? (
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter 6-digit Code"
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
                        )}

                        <button type="submit" disabled={loading || (otpSent && otp.length !== 6)}>
                            {loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify Code' : 'Send Code')}
                        </button>
                    </form>

                    {error && <p className="error">{error}</p>}
                    {msg && <p style={{color: '#4ade80', marginTop: 16, textAlign: 'center', fontSize: '14px'}}>{msg}</p>}

                    <p>
                        {otpSent ? (
                            <>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setResending(true);
                                        setError(null);
                                        sendMagicLink({ email, name: mode === 'signup' ? name : undefined })
                                            .then(({ error }) => {
                                                if (error) setError(error.message);
                                                else setMsg('Code resent!');
                                            })
                                            .finally(() => setResending(false));
                                    }} 
                                    className="toggle-auth" 
                                    style={{marginLeft: 0}}
                                    disabled={resending}
                                >
                                    {resending ? 'Sending...' : 'Resend Code'}
                                </button>
                                <span style={{margin: '0 8px', color: '#525252'}}>|</span>
                                <button onClick={() => setOtpSent(false)} className="toggle-auth" style={{marginLeft: 0}}>
                                    ← Back
                                </button>
                            </>
                        ) : (
                            <>
                                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                                <button onClick={() => onChangeMode(mode === 'signup' ? 'login' : 'signup')} className="toggle-auth">
                                    {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                                </button>
                            </>
                        )}
                    </p>
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
