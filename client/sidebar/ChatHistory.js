// Chat History Component - History List
// 1. Displays list of past chats with load and delete actions


function ChatHistory({
    chatHistory,
    setChatHistory,
    currentChatId,
    loadChat,
    deleteChat,
    userId
}) {
    return (
        <div className="history-section">
            <div className="section-title">Chat History</div>
            {chatHistory.length === 0 ? (
                <p style={{fontSize: 12, color: '#525252', textAlign: 'center', marginTop: 20}}>No history yet</p>
            ) : (
                <>
                    <div className="history-list">
                        {chatHistory.map(chat => (
                            <div key={chat.id} className={`history-item ${currentChatId === chat.id ? 'active' : ''}`} onClick={() => loadChat(chat)}>
                                <i className="ti ti-message history-item-icon" style={{fontSize: 14}}></i>
                                <span className="history-item-text">{chat.title}</span>
                                <button className="file-item-remove" onClick={(e) => deleteChat(e, chat.id)}>
                                    <i className="ti ti-x" style={{fontSize: 12}}></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-danger" onClick={() => { setChatHistory([]); localStorage.removeItem(`chatHistory_${userId}`); }}>
                        <i className="ti ti-trash" style={{fontSize: 14}}></i>
                        Delete all chats
                    </button>
                </>
            )}
        </div>
    );
}

