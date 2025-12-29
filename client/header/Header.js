function Header() {
    const [keys, setKeys] = React.useState([]);
    const [sel, setSel] = React.useState('');

    const refresh = () => {
        const stored = JSON.parse(localStorage.getItem('saved_gemini_keys') || '[]');
        setKeys(stored);
        setSel(localStorage.getItem('custom_api_key_google') || '');
    };

    React.useEffect(() => {
        refresh();
        window.addEventListener('geminiKeysUpdated', refresh);
        return () => window.removeEventListener('geminiKeysUpdated', refresh);
    }, []);

    const onKeyClick = (key) => {
        localStorage.setItem('custom_api_key_google', key);
        setSel(key);
    };

    return (
        <header className="header">
            <div className="header-left"></div>
            <div className="header-center"></div>
            <div className="header-right">
                {keys.length > 0 && (
                    <div className="key-toggle" style={{
                        display: 'flex', background: '#262626', padding: '4px',
                        borderRadius: '8px', border: '1px solid #404040', gap: '4px'
                    }}>
                        <button
                            onClick={() => onKeyClick('')}
                            className={`key-toggle-btn ${sel === '' ? 'active' : ''}`}
                            style={{
                                padding: '8px', borderRadius: '6px', border: 'none',
                                background: sel === '' ? '#fff' : 'transparent',
                                color: sel === '' ? '#000' : '#a3a3a3',
                                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                                gap: '6px', fontFamily: 'inherit'
                            }}
                        >
                            <i className="ti ti-brain" style={{fontSize: 18}}></i>
                        </button>

                        {keys.map((k, i) => (
                            <button
                                key={k.id}
                                onClick={() => onKeyClick(k.key)}
                                className={`key-toggle-btn ${sel === k.key ? 'active' : ''}`}
                                style={{
                                    padding: '8px', borderRadius: '6px', border: 'none',
                                    background: sel === k.key ? '#fff' : 'transparent',
                                    color: sel === k.key ? '#000' : '#a3a3a3',
                                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                                    gap: '6px', fontFamily: 'inherit'
                                }}
                            >
                                <i className={`ti ti-hexagon-number-${i + 1}`} style={{fontSize: 18}}></i>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
