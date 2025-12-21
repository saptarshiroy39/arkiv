// File Upload Component - Drag & Drop Zone
// 1. Dropzone, file list, process button, and indexed files display


function FileUpload({
    isDragOver,
    setIsDragOver,
    handleDrop,
    handleFileSelect,
    fileInputRef,
    files,
    setFiles,
    isUploading,
    handleUpload,
    status,
    processedFiles,
    getFileIcon
}) {
    return (
        <>
            <div className="section-title">Documents</div>
            
            <div 
                className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.md,.markdown" onChange={handleFileSelect} style={{display:'none'}} />
                <div className="dropzone-icon">
                    <i className="ti ti-upload" style={{fontSize: 24}}></i>
                </div>
                <div className="dropzone-text">Drop files here</div>
                <div className="dropzone-hint">PDF, Images, CSV, TXT, Markdown,<br/>Word, Excel, PowerPoint</div>
            </div>

            {files.length > 0 && (
                <>
                    <div className="section-title" style={{marginTop: 16}}>Selected Files</div>
                    <div className="file-list">
                        {files.map((file, i) => (
                            <div key={i} className="file-item">
                                <i className={`ti ti-${getFileIcon(file.name)} file-item-icon`} style={{fontSize: 16}}></i>
                                <span className="file-item-name">{file.name}</span>
                                <button className="file-item-remove" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                    <i className="ti ti-x" style={{fontSize: 14}}></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? (
                            <><i className="ti ti-loader-2 spin" style={{fontSize: 16}}></i> Processing...</>
                        ) : (
                            <><i className="ti ti-bolt" style={{fontSize: 16}}></i> Process {files.length} file(s)</>
                        )}
                    </button>
                </>
            )}

            {processedFiles.length > 0 && (
                <>
                    <div className="section-title" style={{marginTop: 16}}>Indexed Files</div>
                    <div className="processed-files">
                        {processedFiles.map((name, i) => (
                            <div key={i} className="processed-file">
                                <i className={`ti ti-${getFileIcon(name)} processed-file-icon`} style={{fontSize: 14, color: '#4ade80'}}></i>
                                <span className="processed-file-name">{name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {status && (
                <div className={`status ${status.type}`}>
                    <i className={`ti ti-${status.type === 'success' ? 'check' : 'alert-triangle'}`} style={{fontSize: 16}}></i>
                    {status.msg}
                </div>
            )}
        </>
    );
}
