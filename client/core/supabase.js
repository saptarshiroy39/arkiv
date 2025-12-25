const SupabaseContext = createContext(null);

function SupabaseProvider({ children }) {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // fetch config and init client
        fetch(`${API_URL}/config`)
            .then(res => res.json())
            .then(cfg => {
                if (!cfg.url || !cfg.anon_key) {
                    throw new Error("Missing keys");
                }
                const sc = window.supabase.createClient(cfg.url, cfg.anon_key);
                setClient(sc);
                supabase = sc; // global ref
            })
            .catch(err => {
                console.error("Config failed:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="logo" style={{justifyContent: 'center'}}>
                    <div className="logo-icon lava-lamp-bg">
                        <i className="ti ti-brain" style={{fontSize: 20}}></i>
                    </div>
                    <div className="logo-text"><h1>Arkiv</h1></div>
                </div>
                <p style={{color: '#737373', marginTop: 20}}>Loading...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="logo" style={{justifyContent: 'center'}}>
                    <div className="logo-icon lava-lamp-bg">
                        <i className="ti ti-brain" style={{fontSize: 20}}></i>
                    </div>
                    <div className="logo-text"><h1>Arkiv</h1></div>
                </div>
                <p className="error" style={{marginTop: 20}}>Error: {error}</p>
            </div>
        </div>
    );

    return (
        <SupabaseContext.Provider value={client}>
            {children}
        </SupabaseContext.Provider>
    );
}

function useSupabase() {
    return useContext(SupabaseContext);
}
