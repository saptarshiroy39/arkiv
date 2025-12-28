function FileUpload({
    isDragOver: dragging,
    setIsDragOver: setDragging,
    handleDrop,
    handleFileSelect,
    fileInputRef: fileRef,
    files,
    setFiles,
    isUploading: uploading,
    handleUpload,
    status,
    processedFiles: processed,
    getFileIcon,
    messages,
    setMessages,
    setCurrentChatId,
    onClearChat
}) {
    const hasMessages = messages && messages.length > 0;
    
    return (
        <>
            <div className="section-title">Documents</div>
            
            <div 
                className={`dropzone ${dragging ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
            >
                <input ref={fileRef} type="file" multiple onChange={handleFileSelect} style={{display:'none'}} />
                <div className="dropzone-icon">
                    <i className="ti ti-upload" style={{fontSize: 24}}></i>
                </div>
                <div className="dropzone-text">Drop files here</div>
                <div className="dropzone-hint">PDF, Images, CSV, TXT, Markdown, Word, Excel, PPT</div>
            </div>

            {files.length > 0 && (
                <>
                    <div className="section-title" style={{marginTop: 16}}>Selected Files</div>
                    <div className="file-list">
                        {files.map((f, i) => (
                            <div key={i} className="file-item">
                                <i className={`ti ti-${getFileIcon(f.name)} file-item-icon`} style={{fontSize: 16}}></i>
                                <span className="file-item-name">{f.name}</span>
                                <button className="file-item-remove" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                    <i className="ti ti-x" style={{fontSize: 14}}></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                        {uploading ? (
                            <><i className="ti ti-loader-2 spin" style={{fontSize: 16}}></i> Processing...</>
                        ) : (
                            <><i className="ti ti-bolt" style={{fontSize: 16}}></i> Process {files.length} file(s)</>
                        )}
                    </button>
                </>
            )}

            {processed.length > 0 && (
                <>
                    <div className="section-title" style={{marginTop: 16}}>Indexed Files</div>
                    <div className="processed-files">
                        {processed.map((name, i) => (
                            <div key={i} className="processed-file">
                                <i className={`ti ti-${getFileIcon(name)} processed-file-icon`} style={{fontSize: 14, color: '#4ade80'}}></i>
                                <span className="processed-file-name">{name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {(status?.type === 'success' || hasMessages) && (
                hasMessages ? (
                    <div style={{display: 'flex', gap: 8}}>
                        {status?.type === 'success' ? (
                            <div className="status success" style={{flex: 1, margin: 0}}>
                                <i className="ti ti-check" style={{fontSize: 16}}></i>
                                {status.msg}
                            </div>
                        ) : (
                            <div className="status success" style={{flex: 1, margin: 0}}>
                                <i className="ti ti-check" style={{fontSize: 16}}></i>
                                {processed.length} file(s)
                            </div>
                        )}
                        <button 
                            className="status-action-btn" 
                            onClick={onClearChat}
                            title="Clear Chat"
                            style={{flex: 1}}
                        >
                            <i className="ti ti-trash" style={{fontSize: 16}}></i>
                            Clear
                        </button>
                    </div>
                ) : (
                    <div className="status success">
                        <i className="ti ti-check" style={{fontSize: 16}}></i>
                        {status.msg}
                    </div>
                )
            )}
        </>
    );
}
