function ChatInput({ input, setInput, handleSubmit, indexReady: ready, isLoading: loading, inputRef }) {
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
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim() && ready && !loading) {
                                handleSubmit(e);
                            }
                        }
                    }}
                    placeholder={ready ? "Ask a question..." : "Upload documents first..."}
                    disabled={!ready || loading}
                    rows={1}
                    style={{resize: 'none', minHeight: '56px', maxHeight: '150px', overflowY: 'auto'}}
                />
                <button type="submit" className="btn-send" disabled={!input.trim() || !ready || loading}>
                    {loading ? (
                        <i className="ti ti-loader-2 spin" style={{fontSize: 18}}></i>
                    ) : (
                        <i className="ti ti-send" style={{fontSize: 18}}></i>
                    )}
                </button>
            </form>
            <div className="input-hint">Arkive never makes mistakes.</div>
        </div>
    );
}
