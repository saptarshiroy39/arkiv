function Sidebar({
    user,
    showHistory,
    setShowHistory,
    chatHistory: history,
    setChatHistory: setHistory,
    currentChatId: chatId,
    loadChat,
    deleteChat,
    startNewChat,
    isDragOver: dragging,
    setIsDragOver: setDragging,
    handleDrop: onDrop,
    handleFileSelect: onSelect,
    fileInputRef: fileRef,
    files,
    setFiles,
    isUploading: uploading,
    handleUpload: doUpload,
    status,
    processedFiles: processed,
    messages,
    setMessages,
    setCurrentChatId: setChatId,
    collapsed,
    showSidebar,
    setShowSidebar: toggle,
    signOut,
    showProfileMenu,
    setShowProfileMenu,
    profileMenuRef: menuRef,
    setShowProfile,
    onClearChat,
    onClearAll
}) {
    const getIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        const icons = {
            pdf: 'pdf', png: 'png', jpg: 'jpg', jpeg: 'jpg',
            gif: 'gif', webp: 'world-www', doc: 'file-type-doc',
            docx: 'file-type-docx', xls: 'file-type-xls',
            xlsx: 'file-type-xls', csv: 'csv', ppt: 'file-type-ppt',
            pptx: 'file-type-ppt', txt: 'txt', md: 'markdown'
        };
        return icons[ext] || 'file';
    };

    if (collapsed) {
        return (
            <aside className="sidebar collapsed">
                <div className="sidebar-logo-toggle" title="Expand" onClick={() => toggle(!showSidebar)}>
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
                    <div className="sidebar-icon" title="Upload Files" onClick={() => fileRef.current?.click()}>
                        <i className="ti ti-upload" style={{fontSize: 20}}></i>
                        <input ref={fileRef} type="file" multiple onChange={onSelect} style={{display:'none'}} />
                    </div>
                    <div className="sidebar-divider"></div>
                    {files.length > 0 && (
                        <div className="sidebar-icon process-icon" title={`Process ${files.length} file(s)`} onClick={doUpload}>
                            <i className={`ti ti-${uploading ? 'loader-2 spin' : 'bolt'}`} style={{fontSize: 20, color: '#2563eb'}}></i>
                            <span className="sidebar-badge">{files.length}</span>
                        </div>
                    )}
                    {processed.length > 0 && (
                        <div className="sidebar-icon active" title={`${processed.length} files indexed`}>
                            <i className="ti ti-files" style={{fontSize: 20, color: '#047857'}}></i>
                            <span className="sidebar-badge success">{processed.length}</span>
                        </div>
                    )}
                    {messages.length > 0 && (
                        <div className="sidebar-icon" title="Clear Chat" onClick={onClearChat}>
                            <i className="ti ti-trash" style={{fontSize: 20, color: '#b91c1c'}}></i>
                        </div>
                    )}

                </div>
                <div className="sidebar-profile-section" ref={menuRef}>
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
                    <div className="logo-text"><h1>Arkiv</h1></div>
                </div>
                <div className="sidebar-icon toggle-icon" title="Collapse" onClick={() => toggle(!showSidebar)}>
                    <i className="ti ti-layout-sidebar-left-collapse" style={{fontSize: 18}}></i>
                </div>
            </div>

            <div className="action-buttons">
                <button className={`btn-action ${!showHistory ? 'active' : ''}`} onClick={() => startNewChat()}>
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
                    chatHistory={history}
                    currentChatId={chatId}
                    loadChat={loadChat}
                    deleteChat={deleteChat}
                    onClearAll={onClearAll}
                />
            ) : (
                <FileUpload
                    isDragOver={dragging}
                    setIsDragOver={setDragging}
                    handleDrop={onDrop}
                    handleFileSelect={onSelect}
                    fileInputRef={fileRef}
                    files={files}
                    setFiles={setFiles}
                    isUploading={uploading}
                    handleUpload={doUpload}
                    status={status}
                    processedFiles={processed}
                    getFileIcon={getIcon}
                    messages={messages}
                    onClearChat={onClearChat}
                />
            )}

            <div className="sidebar-profile-section expanded" ref={menuRef}>
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
