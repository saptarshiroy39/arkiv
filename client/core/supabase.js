// Supabase Provider - Database Client Setup
// 1. Fetches config from server and initializes Supabase client with loading/error states


const SupabaseContext = createContext(null);

function SupabaseProvider({ children }) {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${API_URL}/config`);
                if (!response.ok) throw new Error('Failed to fetch config');
                const config = await response.json();
                if (!config.supabase_url || !config.supabase_anon_key) {
                    throw new Error("Supabase URL or anon key is missing in config");
                }
                const supabaseClient = window.supabase.createClient(config.supabase_url, config.supabase_anon_key);
                setClient(supabaseClient);
                supabase = supabaseClient;
            } catch (error) {
                console.error("Error loading Supabase config:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="logo" style={{justifyContent: 'center'}}>
                        <div className="logo-icon lava-lamp-bg">
                            <i className="ti ti-brain" style={{fontSize: 20}}></i>
                        </div>
                        <div className="logo-text">
                            <h1>Arkiv</h1>
                        </div>
                    </div>
                    <p style={{color: '#737373', marginTop: 20}}>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="logo" style={{justifyContent: 'center'}}>
                        <div className="logo-icon lava-lamp-bg">
                            <i className="ti ti-brain" style={{fontSize: 20}}></i>
                        </div>
                        <div className="logo-text">
                            <h1>Arkiv</h1>
                        </div>
                    </div>
                    <p className="error" style={{marginTop: 20}}>Error: {error}</p>
                </div>
            </div>
        );
    }

    return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

function useSupabase() {
    return useContext(SupabaseContext);
}
