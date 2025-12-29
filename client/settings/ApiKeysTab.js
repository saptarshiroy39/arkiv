function ApiKeysTab({ showToast }) {
    const [keys, setKeys] = React.useState([]);
    const [adding, setAdding] = React.useState(false);
    const [val, setVal] = React.useState('');
    const [visible, setVisible] = React.useState({}); 
    const [testId, setTestId] = React.useState(null); 
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('saved_gemini_keys') || '[]');
        setKeys(stored);
    }, []);

    const verify = async (apiKey) => {
        try {
            const res = await fetch(`${API_URL}/verify-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: apiKey })
            });
            if (!res.ok) throw new Error('Invalid Key');
            return true;
        } catch (e) {
            return e.message; 
        }
    };

    const onSave = async () => {
        if (!val.trim()) return;
        setSaving(true);
        const res = await verify(val.trim());
        if (res === true) {
            const newKey = { id: Date.now(), key: val.trim(), createdAt: new Date().toISOString() };
            const updated = [...keys, newKey];
            localStorage.setItem('saved_gemini_keys', JSON.stringify(updated));
            setKeys(updated);
            window.dispatchEvent(new Event('geminiKeysUpdated'));
            showToast('Key added');
            setAdding(false);
            setVal('');
        } else {
            showToast(res || 'Check key and try again', 'error');
        }
        setSaving(false);
    };

    const onDelete = (id) => {
        const updated = keys.filter(k => k.id !== id);
        localStorage.setItem('saved_gemini_keys', JSON.stringify(updated));
        setKeys(updated);
        window.dispatchEvent(new Event('geminiKeysUpdated'));
        showToast('Removed');
    };

    const onTest = async (id, key) => {
        setTestId(id);
        const res = await verify(key);
        if (res === true) showToast('Verified!', 'success');
        else showToast(res || 'Invalid', 'error');
        setTestId(null);
    };

    return (
        <div className="settings-tab">
            <div className="settings-section">
                <h2 className="settings-section-title">Bring Your Own Key (BYOK)</h2>
                <p className="settings-section-desc">Use toggle in the header to switch between keys.</p>

                {!adding ? (
                    <button 
                        className="settings-btn-primary" 
                        onClick={() => setAdding(true)}
                        style={{marginBottom: 20, opacity: keys.length >= 3 ? 0.5 : 1}}
                        disabled={keys.length >= 3}
                    >
                        <i className="ti ti-plus" style={{marginRight: 6}}></i>
                        {keys.length >= 3 ? 'Limit Reached' : 'Add Gemini API Key'}
                    </button>
                ) : (
                    <div className="session-section" style={{
                        display: 'flex', flexDirection: 'column', gap: '15px'
                    }}>
                        <div>
                            <label style={{display: 'block', marginBottom: 8, fontSize: 13, color: '#a3a3a3'}}>Google Gemini API Key</label>
                            <input
                                type="text" placeholder="Paste your Google Gemini API Key"
                                value={val} onChange={(e) => setVal(e.target.value)}
                                className="settings-input" style={{width: '100%', fontFamily: 'monospace', height: '42px'}}
                                autoFocus
                            />
                        </div>
                        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                            <button className="settings-btn-secondary" onClick={() => { setAdding(false); setVal(''); }} style={{width: '160px'}}>Cancel</button>
                            <button className="settings-btn-primary" onClick={onSave} disabled={!val || saving} style={{width: '160px'}}>
                                {saving ? <i className="ti ti-loader-2 spin" style={{fontSize: 18}}></i> : 'Save'}
                            </button>
                        </div>
                    </div>
                )}

                {keys.length > 0 && (
                    <div style={{marginTop: 20}}>
                        <h3 style={{fontSize: 14, color: '#a3a3a3', marginBottom: 10, textTransform: 'uppercase'}}>Saved Keys ({keys.length}/3)</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                            {keys.map((k, i) => {
                                const vis = visible[k.id];
                                const testing = testId === k.id;
                                return (
                                    <div key={k.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: '#262626', padding: '12px 16px', borderRadius: '8px',
                                        border: '1px solid #404040', flexWrap: 'wrap', gap: 8
                                    }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12, flex: 1}}>
                                            <div style={{width: 32, height: 32, borderRadius: 6, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <i className="ti ti-brand-google-filled" style={{fontSize: 18}}></i>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <div style={{fontWeight: 500}}>Key {i + 1}</div>
                                                <div style={{fontSize: 13, color: '#737373', fontFamily: 'monospace'}}>
                                                    {vis ? k.key : '••••••••••••'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0, marginLeft: 'auto'}}>
                                            <button className="icon-btn" onClick={() => setVisible(v => ({ ...v, [k.id]: !vis }))} title="View"><i className={`ti ti-eye${vis ? '-off' : ''}`} style={{fontSize: 20}}></i></button>
                                            <button className="icon-btn" onClick={() => { navigator.clipboard.writeText(k.key); showToast('Copied'); }} title="Copy"><i className="ti ti-copy" style={{fontSize: 20}}></i></button>
                                            <button className="icon-btn" onClick={() => onTest(k.id, k.key)} disabled={testing} title="Test">
                                                <i className={`ti ti-${testing ? 'loader-2 spin' : 'plug-connected'}`} style={{fontSize: 20, color: testing ? '#3b82f6' : 'inherit'}}></i>
                                            </button>
                                            <button className="icon-btn" onClick={() => onDelete(k.id)} title="Delete"><i className="ti ti-trash" style={{fontSize: 20, color: '#ef4444'}}></i></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <p style={{fontSize: 12, color: '#737373', marginTop: 20, display: 'flex', alignItems: 'center', gap: 6}}><i className="ti ti-lock"></i>Keys are stored locally in your browser.</p>
                <style>{`.icon-btn { width: 36px; height: 36px; background: transparent; border: none; color: #a3a3a3; cursor: pointer; display: flex; align-items: center; justify-content: center; } .icon-btn:hover { background: rgba(255,255,255,0.1); border-radius: 6px; }`}</style>
            </div>
        </div>
    );
}
