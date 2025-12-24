// Header Component - Top Bar
// 1. Handles key selection for Gemini API
// 2. Snow toggle Easter egg


function Header({ snowEnabled, onToggleSnow }) {
    const [geminiKeys, setGeminiKeys] = React.useState([]);
    const [activeKey, setActiveKey] = React.useState('');

    const loadKeys = () => {
        const storedKeys = JSON.parse(localStorage.getItem('saved_gemini_keys') || '[]');
        setGeminiKeys(storedKeys);
        const current = localStorage.getItem('custom_api_key_google') || '';
        setActiveKey(current);
    };

    React.useEffect(() => {
        loadKeys();
        
        const handleUpdates = () => loadKeys();
        window.addEventListener('geminiKeysUpdated', handleUpdates);
        return () => window.removeEventListener('geminiKeysUpdated', handleUpdates);
    }, []);

    const handleKeySelect = (key) => {
        localStorage.setItem('custom_api_key_google', key);
        setActiveKey(key);
    };

    const SnowToggle = () => (
        <button 
            className={`snow-toggle-btn ${snowEnabled ? 'active' : ''}`}
            onClick={onToggleSnow}
        >
            <i className="ti ti-snowflake"></i>
        </button>
    );

    if (geminiKeys.length === 0) {
        return (
            <header className="header">
                <div className="header-left">
                    <SnowToggle />
                </div>
                <div className="header-center"></div>
                <div className="header-right"></div>
            </header>
        );
    }

    return (
        <header className="header">
            <div className="header-left">
                <SnowToggle />
            </div>

            <div className="header-center"></div>

            <div className="header-right" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div className="key-toggle-container">
                    <div className="key-toggle" style={{
                        display: 'flex',
                        background: '#262626',
                        padding: '4px',
                        borderRadius: '8px',
                        border: '1px solid #404040',
                        gap: '4px'
                    }}>
                        <button
                            onClick={() => handleKeySelect('')}
                            className={`key-toggle-btn ${activeKey === '' ? 'active' : ''}`}
                            style={{
                                padding: '8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeKey === '' ? '#fff' : 'transparent',
                                color: activeKey === '' ? '#000' : '#a3a3a3',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontFamily: 'inherit'
                            }}
                        >
                            <i className="ti ti-brain" style={{fontSize: 18}}></i>
                        </button>

                        {geminiKeys.map((k, i) => (
                            <button
                                key={k.id}
                                onClick={() => handleKeySelect(k.key)}
                                className={`key-toggle-btn ${activeKey === k.key ? 'active' : ''}`}
                                style={{
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeKey === k.key ? '#fff' : 'transparent',
                                    color: activeKey === k.key ? '#000' : '#a3a3a3',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <i className={`ti ti-hexagon-number-${i + 1}`} style={{fontSize: 18}}></i>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
