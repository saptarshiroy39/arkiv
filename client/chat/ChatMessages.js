function applyMath(text) {
    if (!text || typeof text !== 'string') return text;
    
    // block math
    let res = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        } catch (e) {
            return match;
        }
    });
    
    // inline math
    res = res.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
        if (match.includes('<') || match.includes('>')) return match;
        try {
            return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        } catch (e) {
            return match;
        }
    });
    
    return res;
}

function parse(content) {
    return marked.parse(applyMath(content));
}

function ChatMessages({ messages, isLoading: loading, messagesEndRef, user }) {
    const initial = (user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase();
    
    return (
        <div className="messages">
            {!messages.length ? (
                <div className="empty-state">
                    <div className="empty-icon lava-lamp-bg">
                        <i className="ti ti-brain" style={{fontSize: 28}}></i>
                    </div>
                    <h2 className="empty-title">Arkiv</h2>
                    <p className="empty-desc">AI-powered RAG for documents</p>
                    <div className="tips">
                        <div className="tip"><span className="tip-num">1</span><span className="tip-text">Upload Files</span></div>
                        <div className="tip"><span className="tip-num">2</span><span className="tip-text">Ask questions</span></div>
                        <div className="tip"><span className="tip-num">3</span><span className="tip-text">Get answers</span></div>
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.role} ${m.isError ? 'error' : ''}`}>
                            <div className="message-avatar">
                                {m.role === 'user' ? (
                                    <span className="avatar-initial">{initial}</span>
                                ) : m.isError ? (
                                    <i className="ti ti-alert-triangle" style={{fontSize: 20}}></i>
                                ) : (
                                    <i className="ti ti-brain" style={{fontSize: 20}}></i>
                                )}
                            </div>
                            <div className="message-body">
                                {m.role === 'assistant' ? (
                                    <div className="message-content" dangerouslySetInnerHTML={{__html: parse(m.content)}} />
                                ) : (
                                    <div className="message-content">{m.content}</div>
                                )}
                                <button className="btn-copy" onClick={() => navigator.clipboard.writeText(m.content)}>
                                    <i className="ti ti-copy" style={{fontSize: 14}}></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="typing">
                            <div className="message-avatar" style={{background: '#262626', color: '#fff'}}>
                                <i className="ti ti-brain" style={{fontSize: 20}}></i>
                            </div>
                            <div className="typing-dots">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
