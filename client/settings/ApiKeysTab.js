// API Keys Tab Component
// 1. Allows users to manage custom API keys for Google


function ApiKeysTab() {
    const [geminiKeys, setGeminiKeys] = React.useState([]);
    const [activeKey, setActiveKey] = React.useState('');
    const [isAdding, setIsAdding] = React.useState(false);
    const [tempKey, setTempKey] = React.useState('');
    const [visibleKeys, setVisibleKeys] = React.useState({}); 
    const [testingKey, setTestingKey] = React.useState(null); 
    const [message, setMessage] = React.useState(null);

    // Load keys from localStorage on mount
    React.useEffect(() => {
        const storedKeys = JSON.parse(localStorage.getItem('saved_gemini_keys') || '[]');
        setGeminiKeys(storedKeys);
    }, []);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const [isSaving, setIsSaving] = React.useState(false);

    const verifyKey = async (apiKey) => {
        try {
            const res = await fetch(`${API_URL}/verify-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    api_key: apiKey
                })
            });
            if (!res.ok) {
                // If it's a 400/403/401, it's likely an invalid key. Return simple message.
                // We log the full error to console for debugging if needed.
                const errData = await res.json().catch(() => ({}));
                console.warn("API Verification Error:", errData); 
                throw new Error('Invalid API Key');
            }
            return true;
        } catch (e) {
            console.error(e);
            return e.message; 
        }
    };

    const handleSave = async () => {
        if (!tempKey.trim()) return;
        setIsSaving(true);
        
        const result = await verifyKey(tempKey.trim());
        
        if (result === true) {
            const newKey = { id: Date.now(), key: tempKey.trim(), createdAt: new Date().toISOString() };
            const updatedKeys = [...geminiKeys, newKey];
            
            localStorage.setItem('saved_gemini_keys', JSON.stringify(updatedKeys));
            setGeminiKeys(updatedKeys);
            
            // Notify Header to update
            window.dispatchEvent(new Event('geminiKeysUpdated'));
            
            showMessage(`Google Gemini key added`);
            setIsAdding(false);
            setTempKey('');
        } else {
            showMessage(result || 'Invalid API Key. Please check and try again.', 'error');
        }
        setIsSaving(false);
    };

    const handleDelete = (id) => {
        const keyToDelete = geminiKeys.find(k => k.id === id);
        const updatedKeys = geminiKeys.filter(k => k.id !== id);
        localStorage.setItem('saved_gemini_keys', JSON.stringify(updatedKeys));
        setGeminiKeys(updatedKeys);
        
        // Notify Header to update
        window.dispatchEvent(new Event('geminiKeysUpdated'));
        
        showMessage(`Key removed`);
    };

    const handleTest = async (id, key) => {
        setTestingKey(id);
        const result = await verifyKey(key);
        if (result === true) showMessage('Key verified successfully!', 'success');
        else showMessage(result || 'Invalid API Key', 'error');
        setTestingKey(null);
    };

    return (
        <div className="settings-tab">
            <div className="settings-section">
                <h2 className="settings-section-title">Bring Your Own Key (BYOK)</h2>
                <p className="settings-section-desc">
                    Manage up to 3 Google Gemini API keys. Use the toggle in the header to switch between them.
                </p>

                {message && (
                    <div className={`profile-message ${message.type}`} style={{marginBottom: 15}}>
                        <i className={`ti ti-${message.type === 'success' ? 'check' : 'alert-triangle'}`} style={{fontSize: 16}}></i>
                        {message.text}
                    </div>
                )}

                {!isAdding ? (
                    <button 
                        className="settings-btn-primary" 
                        onClick={() => setIsAdding(true)}
                        style={{marginBottom: 20, opacity: geminiKeys.length >= 3 ? 0.5 : 1, cursor: geminiKeys.length >= 3 ? 'not-allowed' : 'pointer'}}
                        disabled={geminiKeys.length >= 3}
                    >
                        <i className="ti ti-plus" style={{marginRight: 6}}></i>
                        {geminiKeys.length >= 3 ? 'Limit Reached (3/3)' : 'Add Google API Key'}
                    </button>
                ) : (
                    <div className="settings-form is-active" style={{
                        background: '#262626', 
                        padding: '20px', 
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid #404040',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <div style={{width: '100%'}}>
                            <label style={{display: 'block', marginBottom: 8, fontSize: 13, color: '#a3a3a3'}}>
                                Google Gemini API Key
                            </label>
                            <input
                                type="text"
                                placeholder="Paste your Google Gemini API Key"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                className="settings-input"
                                style={{width: '100%', fontFamily: 'monospace', height: '42px'}}
                                autoFocus
                            />
                        </div>

                        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                            <button 
                                className="settings-btn-secondary" 
                                onClick={() => {
                                    setIsAdding(false);
                                    setTempKey('');
                                }}
                                style={{width: '160px', height: '42px'}}
                            >
                                Cancel
                            </button>
                            <button 
                                className="settings-btn-primary" 
                                onClick={handleSave} 
                                disabled={!tempKey || isSaving}
                                style={{width: '160px', height: '42px'}}
                            >
                                {isSaving ? <i className="ti ti-loader-2" style={{animation: 'spin 1s linear infinite'}}></i> : 'Save'}
                            </button>
                        </div>
                    </div>
                )}

                {geminiKeys.length > 0 && (
                    <div>
                        <h3 style={{fontSize: 14, color: '#a3a3a3', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Saved Keys ({geminiKeys.length}/3)</h3>
                        <div className="keys-list" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                            {geminiKeys.map((item, index) => {
                                const isVisible = visibleKeys[item.id];
                                const isTesting = testingKey === item.id;

                                return (
                                    <div key={item.id} style={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        background: '#262626',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #404040',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12, flex: 1}}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 6, 
                                                background: '#333', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff'
                                            }}>
                                                <i className="ti ti-brand-google-filled" style={{fontSize: 18}}></i>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <div style={{fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8}}>
                                                    Gemini Key {index + 1}
                                                </div>
                                                <div style={{fontSize: 13, color: '#737373', fontFamily: 'monospace'}}>
                                                    {isVisible ? item.key : '••••••••••••••••••••••••'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{display: 'flex', gap: 6}}>
                                            <button 
                                                className="icon-btn" 
                                                onClick={() => setVisibleKeys(prev => ({ ...prev, [item.id]: !isVisible }))}
                                                style={{
                                                    width: 36, height: 36, padding: 0, 
                                                    background: 'transparent', border: 'none', 
                                                    color: '#a3a3a3', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title={isVisible ? "Hide Key" : "Show Key"}
                                            >
                                                <i className={`ti ti-eye${isVisible ? '-off' : ''}`} style={{fontSize: 20}}></i>
                                            </button>
                                            
                                            <button 
                                                className="icon-btn" 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.key);
                                                    showMessage('Key copied to clipboard');
                                                }}
                                                style={{
                                                    width: 36, height: 36, padding: 0, 
                                                    background: 'transparent', border: 'none', 
                                                    color: '#a3a3a3', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="Copy Key"
                                            >
                                                <i className="ti ti-copy" style={{fontSize: 20}}></i>
                                            </button>

                                            <button 
                                                className="icon-btn" 
                                                onClick={() => handleTest(item.id, item.key)}
                                                disabled={isTesting}
                                                style={{
                                                    width: 36, height: 36, padding: 0, 
                                                    background: 'transparent', border: 'none', 
                                                    color: isTesting ? '#3b82f6' : '#a3a3a3', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="Test Key"
                                            >
                                                <i className={`ti ti-${isTesting ? 'loader-2' : 'plug-connected'}`} 
                                                   style={{fontSize: 20, animation: isTesting ? 'spin 1s linear infinite' : 'none'}}></i>
                                            </button>

                                            <button 
                                                className="icon-btn"
                                                onClick={() => handleDelete(item.id)}
                                                style={{
                                                    width: 36, height: 36, padding: 0, 
                                                    background: 'transparent', border: 'none', 
                                                    color: '#ef4444', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="Delete Key"
                                            >
                                                <i className="ti ti-trash" style={{fontSize: 20}}></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <p style={{fontSize: 12, color: '#737373', marginTop: 20, display: 'flex', alignItems: 'center', gap: 6}}>
                    <i className="ti ti-lock"></i>
                    Keys are stored locally in your browser.
                </p>
                
                <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .icon-btn:hover { background: rgba(255,255,255,0.1) !important; border-radius: 6px; }
                `}</style>
            </div>
        </div>
    );
}
