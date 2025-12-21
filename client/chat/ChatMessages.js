// Chat Messages Component - Message Display
// 1. Renders chat messages list, empty state, user/assistant avatars, and copy buttons
// 2. Handles typing indicator for loading state


function ChatMessages({ messages, isLoading, messagesEndRef, user }) {
    const userInitial = (user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase();
    
    return (
        <div className="messages">
            {messages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="ti ti-brain" style={{fontSize: 28}}></i>
                    </div>
                    <h2 className="empty-title">Arkiv</h2>
                    <p className="empty-desc">AI-powered RAG for documents</p>
                    <div className="tips">
                        {['Upload Files', 'Ask questions', 'Get answers'].map((tip, i) => (
                            <div key={i} className="tip">
                                <span className="tip-num">{i + 1}</span>
                                <span className="tip-text">{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                            <div className="message-avatar">
                                {msg.role === 'user' ? (
                                    <span className="avatar-initial">{userInitial}</span>
                                ) : msg.isError ? (
                                    <i className="ti ti-alert-triangle" style={{fontSize: 20}}></i>
                                ) : (
                                    <i className="ti ti-brain" style={{fontSize: 20}}></i>
                                )}
                            </div>
                            <div className="message-body">
                                {msg.role === 'assistant' ? (
                                    <div className="message-content" dangerouslySetInnerHTML={{__html: marked.parse(msg.content)}} />
                                ) : (
                                    <div className="message-content">{msg.content}</div>
                                )}
                                <button 
                                    className="btn-copy" 
                                    onClick={() => { navigator.clipboard.writeText(msg.content); }}
                                    title="Copy to clipboard"
                                >
                                    <i className="ti ti-copy" style={{fontSize: 14}}></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
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
