function ChatHistory({
    chatHistory: history,
    setChatHistory: setHistory,
    currentChatId: chatId,
    loadChat,
    deleteChat,

    userId,
    onClearAll
}) {
    return (
        <div className="history-section">
            <div className="section-title">History</div>
            {!history.length ? (
                <p style={{fontSize: 12, color: '#525252', textAlign: 'center', marginTop: 20}}>Empty</p>
            ) : (
                <>
                    <div className="history-list">
                        {history.map(c => (
                            <div key={c.id} className={`history-item ${chatId === c.id ? 'active' : ''}`} onClick={() => loadChat(c)}>
                                <i className="ti ti-message history-item-icon" style={{fontSize: 14}}></i>
                                <span className="history-item-text">{c.title}</span>
                                <button className="file-item-remove" onClick={(e) => deleteChat(e, c.id)}>
                                    <i className="ti ti-x" style={{fontSize: 12}}></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-danger" onClick={onClearAll}>
                        <i className="ti ti-trash" style={{fontSize: 14}}></i>
                        Delete All
                    </button>
                </>
            )}
        </div>
    );
}

