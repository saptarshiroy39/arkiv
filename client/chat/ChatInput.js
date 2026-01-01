function ChatInput({ input, setInput, handleSubmit, indexReady: ready, isLoading: loading, inputRef, hasUnprocessedFiles }) {
    React.useEffect(() => {
        if (!input && inputRef.current) {
            inputRef.current.style.height = '56px';
        }
    }, [input, inputRef]);

    const canChat = ready && !hasUnprocessedFiles;
    const placeholder = hasUnprocessedFiles 
        ? "Process files first..." 
        : (ready ? "Ask a question..." : "Upload docs first...");

    return (
        <div className="input-area">
            <form onSubmit={handleSubmit} className="input-wrapper">
                <textarea
                    ref={inputRef}
                    className="input-field"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim() && canChat && !loading) {
                                handleSubmit(e);
                            }
                        }
                    }}
                    placeholder={placeholder}
                    disabled={!canChat || loading}
                    rows={1}
                    style={{resize: 'none', minHeight: '56px', maxHeight: '150px', overflowY: 'auto'}}
                />
                <button type="submit" className="btn-send" disabled={!input.trim() || !canChat || loading}>
                    {loading ? (
                        <i className="ti ti-loader-2 spin" style={{fontSize: 18}}></i>
                    ) : (
                        <i className="ti ti-send" style={{fontSize: 18}}></i>
                    )}
                </button>
            </form>
            <div className="input-hint">UPLOAD • PROCESS • CHAT</div>
        </div>
    );
}
