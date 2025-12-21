// Chat Input Component - Message Input Area
// 1. Auto-resizing textarea with send button
// 2. handles Enter key submission
// 3. handles shift + Enter for new line


function ChatInput({ input, setInput, handleSubmit, indexReady, isLoading, inputRef }) {
    // Reset textarea height when input is cleared (after submit)
    React.useEffect(() => {
        if (!input && inputRef.current) {
            inputRef.current.style.height = '56px';
        }
    }, [input, inputRef]);
    return (
        <div className="input-area">
            <form onSubmit={handleSubmit} className="input-wrapper">
                <textarea
                    ref={inputRef}
                    className="input-field"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim() && indexReady && !isLoading) {
                                handleSubmit(e);
                            }
                        }
                    }}
                    placeholder={indexReady ? "Ask a question..." : "Upload documents first..."}
                    disabled={!indexReady || isLoading}
                    rows={1}
                    style={{resize: 'none', minHeight: '56px', maxHeight: '150px', overflow: 'hidden'}}
                />
                <button type="submit" className="btn-send" disabled={!input.trim() || !indexReady || isLoading}>
                    {isLoading ? (
                        <i className="ti ti-loader-2 spin" style={{fontSize: 18}}></i>
                    ) : (
                        <i className="ti ti-send" style={{fontSize: 18}}></i>
                    )}
                </button>
            </form>
            <div className="input-hint">Arkive never makes mistakes</div>
        </div>
    );
}
