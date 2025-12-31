function DataTab({ chatHistory, onClearAll, onDeleteChat }) {
    return (
        <div className="settings-tab" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div className="settings-section inline-section danger-section" style={{flexShrink: 0}}>
                <h2 className="settings-section-title danger">Knowledge Base</h2>
                <button className="settings-btn-danger" onClick={onClearAll}>
                    <i className="ti ti-trash" style={{fontSize: 16}}></i> Erase All
                </button>
            </div>

            <div className="settings-section" style={{flexShrink: 0, paddingBottom: 0}}>
                <h2 className="settings-section-title" style={{marginBottom: 4}}>Chat History</h2>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: 4
            }}>
                {!chatHistory || chatHistory.length === 0 ? (
                    <p style={{fontSize: 13, color: '#737373', textAlign: 'center', marginTop: 20}}>
                        No chat history
                    </p>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {chatHistory.map(chat => (
                            <div 
                                key={chat.id} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 16px',
                                    background: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#262626';
                                    e.currentTarget.style.borderColor = '#404040';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#1a1a1a';
                                    e.currentTarget.style.borderColor = '#333';
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#262626',
                                    borderRadius: '8px',
                                    flexShrink: 0
                                }}>
                                    <i className="ti ti-message" style={{fontSize: 16, color: '#a3a3a3'}}></i>
                                </div>
                                <span style={{
                                    flex: 1,
                                    fontSize: '13px',
                                    color: '#e5e5e5',
                                    fontWeight: 500,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {chat.title}
                                </span>
                                <button 
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#737373',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={(e) => onDeleteChat(e, chat.id)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#333';
                                        e.currentTarget.style.color = '#ef4444';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#737373';
                                    }}
                                    title="Delete chat"
                                >
                                    <i className="ti ti-trash" style={{fontSize: 16}}></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
