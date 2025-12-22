// Sidebar Component - Main Navigation Panel
// 1. Wraps FileUpload, ChatHistory, and ProfileDropdown components


function Sidebar({
    user,
    showHistory,
    setShowHistory,
    chatHistory,
    setChatHistory,
    currentChatId,
    loadChat,
    deleteChat,
    startNewChat,
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
    messages,
    setMessages,
    setCurrentChatId,
    collapsed,
    showSidebar,
    setShowSidebar,
    signOut,
    showProfileMenu,
    setShowProfileMenu,
    profileMenuRef,
    setShowProfile
}) {
    // Helper function to get file icon
    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'pdf',
            'png': 'png',
            'jpg': 'jpg',
            'jpeg': 'jpg',
            'gif': 'gif',
            'webp': 'world-www',
            'doc': 'file-type-doc',
            'docx': 'file-type-docx',
            'xls': 'file-type-xls',
            'xlsx': 'file-type-xls',
            'csv': 'csv',
            'ppt': 'file-type-ppt',
            'pptx': 'file-type-ppt',
            'txt': 'txt',
            'md': 'markdown',
            'markdown': 'markdown'
        };
        return iconMap[ext] || 'file';
    };

    if (collapsed) {
        return (
            <aside className="sidebar collapsed">
                <div className="sidebar-logo-toggle" title="Expand" onClick={() => setShowSidebar(!showSidebar)}>
                    <div className="logo-icon-small lava-lamp-bg">
                        <i className="ti ti-brain" style={{fontSize: 20}}></i>
                    </div>
                    <div className="expand-icon">
                        <i className="ti ti-layout-sidebar-left-expand" style={{fontSize: 20}}></i>
                    </div>
                </div>
                <div className="sidebar-icons-group">
                    <div className="sidebar-icon" title="New Chat" onClick={() => startNewChat()}>
                        <i className="ti ti-message-plus" style={{fontSize: 20}}></i>
                    </div>
                    <div className="sidebar-icon" title={showHistory ? "Chat" : "History"} onClick={() => setShowHistory(!showHistory)}>
                        <i className={`ti ti-${showHistory ? 'arrow-back-up-double' : 'history'}`} style={{fontSize: 20}}></i>
                    </div>
                    <div className="sidebar-icon" title="Upload Files" onClick={() => fileInputRef.current?.click()}>
                        <i className="ti ti-upload" style={{fontSize: 20}}></i>
                        <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.md,.markdown" onChange={handleFileSelect} style={{display:'none'}} />
                    </div>
                    <div className="sidebar-divider"></div>
                    {files.length > 0 && (
                        <div className="sidebar-icon process-icon" title={`Process ${files.length} file(s)`} onClick={handleUpload}>
                            <i className={`ti ti-${isUploading ? 'loader-2 spin' : 'bolt'}`} style={{fontSize: 20, color: '#3b82f6'}}></i>
                            <span className="sidebar-badge">{files.length}</span>
                        </div>
                    )}
                    {processedFiles.length > 0 && (
                        <div className="sidebar-icon active" title={`${processedFiles.length} files indexed`}>
                            <i className="ti ti-files" style={{fontSize: 20, color: '#4ade80'}}></i>
                            <span className="sidebar-badge success">{processedFiles.length}</span>
                        </div>
                    )}
                    {messages.length > 0 && (
                        <div className="sidebar-icon" title="Clear Chat" onClick={() => { setMessages([]); setCurrentChatId(null); }}>
                            <i className="ti ti-trash" style={{fontSize: 20, color: '#f87171'}}></i>
                        </div>
                    )}
                    {status?.type === 'error' && (
                        <div className="sidebar-icon error-indicator" title={status.msg}>
                            <i className="ti ti-alert-triangle" style={{fontSize: 20, color: '#f87171'}}></i>
                        </div>
                    )}
                </div>
                <div className="sidebar-profile-section" ref={profileMenuRef}>
                    <ProfileDropdown
                        user={user}
                        showProfileMenu={showProfileMenu}
                        setShowProfileMenu={setShowProfileMenu}
                        setShowProfile={setShowProfile}
                        signOut={signOut}
                        collapsed={true}
                    />
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-top-row">
                <div className="logo">
                    <div className="logo-icon lava-lamp-bg">
                        <i className="ti ti-brain" style={{fontSize: 20}}></i>
                    </div>
                    <div className="logo-text">
                        <h1>Arkiv</h1>
                    </div>
                </div>
                <div className="sidebar-icon toggle-icon" title="Collapse" onClick={() => setShowSidebar(!showSidebar)}>
                    <i className="ti ti-layout-sidebar-left-collapse" style={{fontSize: 18}}></i>
                </div>
            </div>

            <div className="action-buttons">
                <button className={`btn-action ${!showHistory ? 'active' : ''}`} onClick={() => { startNewChat(); }}>
                    <i className="ti ti-message-plus" style={{fontSize: 16}}></i>
                    New
                </button>
                <button className={`btn-action ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(!showHistory)}>
                    <i className={`ti ti-${showHistory ? 'arrow-back-up-double' : 'history'}`} style={{fontSize: 16}}></i>
                    {showHistory ? 'Chat' : 'History'}
                </button>
            </div>

            {showHistory ? (
                <ChatHistory
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                    currentChatId={currentChatId}
                    loadChat={loadChat}
                    deleteChat={deleteChat}
                    userId={user.id}
                />
            ) : (
                <FileUpload
                    isDragOver={isDragOver}
                    setIsDragOver={setIsDragOver}
                    handleDrop={handleDrop}
                    handleFileSelect={handleFileSelect}
                    fileInputRef={fileInputRef}
                    files={files}
                    setFiles={setFiles}
                    isUploading={isUploading}
                    handleUpload={handleUpload}
                    status={status}
                    processedFiles={processedFiles}
                    getFileIcon={getFileIcon}
                />
            )}

            <div className="sidebar-profile-section expanded" ref={profileMenuRef}>
                <ProfileDropdown
                    user={user}
                    showProfileMenu={showProfileMenu}
                    setShowProfileMenu={setShowProfileMenu}
                    setShowProfile={setShowProfile}
                    signOut={signOut}
                    collapsed={false}
                />
            </div>
        </aside>
    );
}
