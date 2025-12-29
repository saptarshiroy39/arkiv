function App() {
    const { user, signOut, updateProfile, deleteAccount } = useAuth();
    
    if (!user) return <Auth />;
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);
    const [resetting, setResetting] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [indexReady, setIndexReady] = useState(false);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1000);
    const [sidebarPref, setSidebarPref] = useState(true);
    const prevWidth = useRef(window.innerWidth);

    useEffect(() => {
        const outside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', outside);
        return () => document.removeEventListener('mousedown', outside);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const showToast = (text, type = 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toggleSidebar = (val) => {
        const next = typeof val === 'function' ? val(showSidebar) : val;
        setShowSidebar(next);
        setSidebarPref(next);
    };

    useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            const prev = prevWidth.current;

            if (w < 1000 && prev >= 1000) {
                setShowSidebar(false);
            } else if (w >= 1000 && prev < 1000) {
                setShowSidebar(sidebarPref);
            }
            prevWidth.current = w;
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [sidebarPref]);

    const [dragging, setDragging] = useState(false);
    const [processed, setProcessed] = useState([]);
    const [history, setHistory] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const fileRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        
        const ready = localStorage.getItem(`ready_${user.id}`);
        if (ready === 'true') setIndexReady(true);
        
        const saved = localStorage.getItem(`history_${user.id}`);
        if (saved) setHistory(JSON.parse(saved));
    }, [user]);

    useEffect(() => {
        if (!user) return;
        localStorage.setItem(`history_${user.id}`, JSON.stringify(history));
    }, [history, user]);

    const saveChat = (msgs, files = [], explicitId = null) => {
        if (!msgs.length && !files.length) return;
        
        setHistory(prevHistory => {
            const first = msgs.find(m => m.role === 'user');
            const title = first ? first.content.slice(0, 30) + '...' : 'New Chat';
            const targetId = explicitId || chatId || Date.now();
            
            const exists = prevHistory.some(c => c.id === targetId);
            
            const chatObj = {
                id: targetId,
                title,
                messages: msgs,
                files: files,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };

            if (!exists && !chatId) {
                setChatId(targetId);
            }

            if (exists) {
                return prevHistory.map(c => c.id === targetId ? chatObj : c);
            } else {
                return [chatObj, ...prevHistory];
            }
        });
    };

    const isSupported = (f) => {
        const exts = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.txt', '.md'];
        const name = f.name.toLowerCase();
        return exts.some(e => name.endsWith(e));
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const valid = Array.from(e.dataTransfer.files).filter(isSupported);
        setFiles(prev => [...prev, ...valid]);
        setStatus(null);
    };

    const onFileSelect = (e) => {
        const valid = Array.from(e.target.files).filter(isSupported);
        setFiles(prev => [...prev, ...valid]);
        setStatus(null);
    };

    const doUpload = async () => {
        if (!files.length) return;
        

        setUploading(true);
        setStatus(null);

        const form = new FormData();
        files.forEach(f => form.append('files', f));
        
        const { data: { session } } = await supabase.auth.getSession();
        const key = localStorage.getItem('custom_api_key_google');
        const headers = { 'Authorization': `Bearer ${session.access_token}` };
        if (key) headers['X-Custom-Api-Key'] = key;
        
        let activeChatId = chatId;
        if (!activeChatId) {
            activeChatId = Date.now();
            setChatId(activeChatId);
        }
        headers['X-Chat-Id'] = String(activeChatId);

        try {
            const res = await fetch(`${API_URL}/upload`, { 
                method: 'POST', 
                headers,
                body: form
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Upload failed');
            
            const data = await res.json();
            const names = files.map(f => f.name);
            setFiles([]);
            setProcessed(prev => [...prev, ...names]);
            setStatus({ type: 'success', msg: `${data.processed?.length || names.length} file(s)` });
            setIndexReady(true);
            localStorage.setItem(`ready_${user.id}`, 'true');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const onSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const val = input.trim();
        const next = [...messages, { role: 'user', content: val }];
        setMessages(next);
        setInput('');
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        const key = localStorage.getItem('custom_api_key_google');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        };
        if (key) headers['X-Custom-Api-Key'] = key;

        let activeChatId = chatId;
        if (!activeChatId) {
            activeChatId = Date.now();
            setChatId(activeChatId);
        }

        try {
            const res = await fetch(`${API_URL}/ask`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text: val, chat_id: String(activeChatId) })
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
            
            const data = await res.json();
            const final = [...next, { role: 'assistant', content: data.text }];
            setLoading(false);
            setMessages(final);
            saveChat(final, processed, activeChatId);
        } catch (err) {
            setLoading(false);
            setMessages([...next, { role: 'assistant', content: err.message, isError: true }]);
        } finally {
            inputRef.current?.focus();
        }
    };

    const startNew = () => {
        if (messages.length) saveChat(messages, processed);
        setMessages([]);
        setProcessed([]);
        setChatId(null);
        setShowHistory(false);
        setStatus(null);
    };

    const loadChat = (chat) => {
        if (messages.length && chatId !== chat.id) saveChat(messages, processed);
        setMessages(chat.messages);
        setProcessed(chat.files || []);
        setChatId(chat.id);
        setShowHistory(false);
    };

    const clearDocs = async (isGlobal = false) => {
        setResetting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const key = localStorage.getItem('custom_api_key_google');
            const headers = { 'Authorization': `Bearer ${session.access_token}` };
            if (key) headers['X-Custom-Api-Key'] = key;
            
            if (!isGlobal && chatId) {
                headers['X-Chat-Id'] = String(chatId);
                const res = await fetch(`${API_URL}/clear-data`, { method: 'DELETE', headers });
                if (!res.ok) throw new Error('Reset failed');
            } else if (isGlobal) {
                const allIds = history.map(c => c.id).filter(Boolean);
                const uniqueIds = [...new Set(allIds)];
                
                const promises = uniqueIds.map(id => {
                    const h = { ...headers, 'X-Chat-Id': String(id) };
                    return fetch(`${API_URL}/clear-data`, { method: 'DELETE', headers: h });
                });
                
                promises.push(fetch(`${API_URL}/clear-data`, { method: 'DELETE', headers }));
                
                await Promise.all(promises);
            }
            
            if (isGlobal) {
                setProcessed([]);
                setMessages([]);
                setHistory([]);
                setIndexReady(false);
                localStorage.removeItem(`ready_${user.id}`);
                setChatId(null);
            } else {
                setProcessed([]);
                setIndexReady(false);
            }
            
            setStatus(null);
            return { success: true };
        } catch (err) {
            return { error: { message: err.message } };
        } finally {
            setResetting(false);
        }
    };
    
    const onClearCurrentChat = async () => {
        if (!chatId) {
             setMessages([]);
             return;
        }
        
        await clearDocs(false);
        setMessages([]);
        setProcessed([]);
        setHistory(prev => prev.filter(c => c.id !== chatId));
        setChatId(null);
    };

    const onChatDelete = async (e, id) => {
        e.stopPropagation();
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const key = localStorage.getItem('custom_api_key_google');
            const headers = { 
                'Authorization': `Bearer ${session.access_token}`,
                'X-Chat-Id': String(id)
            };
            if (key) headers['X-Custom-Api-Key'] = key;
            await fetch(`${API_URL}/clear-data`, { method: 'DELETE', headers });
        } catch (err) {
            console.error('Failed to clear chat data:', err);
        }
        
        setHistory(prev => prev.filter(c => c.id !== id));
        if (chatId === id) {
            setMessages([]);
            setProcessed([]);
            setChatId(null);
        }
    };

    return (
        <div className="app">
            <Sidebar
                user={user}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                chatHistory={history}
                setChatHistory={setHistory}
                currentChatId={chatId}
                loadChat={loadChat}
                deleteChat={onChatDelete}
                startNewChat={startNew}
                isDragOver={dragging}
                setIsDragOver={setDragging}
                handleDrop={onDrop}
                handleFileSelect={onFileSelect}
                fileInputRef={fileRef}
                files={files}
                setFiles={setFiles}
                isUploading={uploading}

                handleUpload={doUpload}
                status={status}
                processedFiles={processed}
                messages={messages}
                setMessages={setMessages}
                setCurrentChatId={setChatId}
                onClearChat={onClearCurrentChat}
                onClearAll={() => clearDocs(true)}
                collapsed={!showSidebar}
                showSidebar={showSidebar}
                setShowSidebar={toggleSidebar}
                signOut={signOut}
                showProfileMenu={showProfileMenu}
                setShowProfileMenu={setShowProfileMenu}
                profileMenuRef={menuRef}
                setShowProfile={setShowProfile}
            />

            <main className="main">
                {showProfile ? (
                    <SettingsPage
                        user={user}
                        onClose={() => setShowProfile(false)}
                        updateProfile={updateProfile}
                        signOut={signOut}
                        deleteAccount={deleteAccount}
                    />
                ) : (
                    <>
                        <Header />

                        <ChatMessages
                            messages={messages}
                            isLoading={loading}
                            messagesEndRef={scrollRef}
                            user={user}
                        />

                        <ChatInput
                            input={input}
                            setInput={setInput}
                            handleSubmit={onSend}
                            indexReady={indexReady}
                            isLoading={loading}
                            inputRef={inputRef}
                            hasUnprocessedFiles={files.length > 0}
                        />
                    </>
                )}
            </main>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
