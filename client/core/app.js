// Main App Component - Application Root
// 1. Manages state for chat, files, sidebar, and renders main layout with Sidebar, Chat, and Settings


function App() {
    const { user, signOut, updateProfile, updateEmail, updatePassword, deleteAccount, passwordResetInProgress } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState(null);
    const [indexReady, setIndexReady] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);
    const [processedFiles, setProcessedFiles] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [tokenCount, setTokenCount] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [totalFilesProcessed, setTotalFilesProcessed] = useState(0);
    const [totalTokenCount, setTotalTokenCount] = useState(0);
    const [snowEnabled, setSnowEnabled] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const profileMenuRef = useRef(null);


    useEffect(() => {
        if (!user) return;
        
        const savedIndexReady = localStorage.getItem(`indexReady_${user.id}`);
        if (savedIndexReady === 'true') {
            setIndexReady(true);
        }
        
        const loadStats = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(`${API_URL}/stats`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (res.ok) {
                    const stats = await res.json();
                    setTotalFilesProcessed(stats.files_processed);
                    setTotalTokenCount(stats.tokens_used);
                }
            } catch (err) {
                console.error('Failed to load stats:', err);
            }
        };
        loadStats();
        
        const saved = localStorage.getItem(`chatHistory_${user.id}`);
        if (saved) setChatHistory(JSON.parse(saved));
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!user || passwordResetInProgress) {
        return <Auth />;
    }

    const estimateTokens = (text) => Math.ceil(text.length / 4);

    const saveToHistory = (msgs, files = [], tokens = 0) => {
        if (msgs.length === 0) return;
        const firstUserMsg = msgs.find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) + '...' : 'New Chat';
        const chat = {
            id: currentChatId || Date.now(),
            title,
            messages: msgs,
            files: files,
            tokens: tokens,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        let updated;
        if (currentChatId) {
            updated = chatHistory.map(c => c.id === currentChatId ? chat : c);
        } else {
            updated = [chat, ...chatHistory];
            setCurrentChatId(chat.id);
        }
        setChatHistory(updated);
        localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(updated));
    };

    const SUPPORTED_TYPES = [
        'application/pdf', 
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv', 'text/markdown', 'text/x-markdown'
    ];
    const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.txt', '.md', '.markdown'];

    const isFileSupported = (file) => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext) || SUPPORTED_TYPES.includes(file.type);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const validFiles = Array.from(e.dataTransfer.files).filter(isFileSupported);
        setFiles(prev => [...prev, ...validFiles]);
        setStatus(null);
    };

    const handleFileSelect = (e) => {
        const validFiles = Array.from(e.target.files).filter(isFileSupported);
        setFiles(prev => [...prev, ...validFiles]);
        setStatus(null);
    };

    const handleUpload = async () => {
        if (!files.length) return;
        setIsUploading(true);
        setStatus(null);

        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        
        const { data: { session } } = await supabase.auth.getSession();

        // Get custom API key for BYOK support
        const customKey = localStorage.getItem('custom_api_key_google');
        const headers = {
            'Authorization': `Bearer ${session.access_token}`,
        };
        if (customKey) {
            headers['X-Custom-Api-Key'] = customKey;
        }

        try {
            const res = await fetch(`${API_URL}/upload`, { 
                method: 'POST', 
                headers: headers,
                body: formData 
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Upload failed');
            const data = await res.json();
            const newFiles = files.map(f => f.name);
            setFiles([]);
            setProcessedFiles(prev => [...prev, ...newFiles]);
            setStatus({ type: 'success', msg: `Processed ${data.files_processed.length} file(s)` });
            const uploadTokens = (data.chunks_created || 1) * 500;
            setTokenCount(prev => prev + uploadTokens);
            try {
                const statsRes = await fetch(`${API_URL}/stats`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ files_delta: files.length, tokens_delta: uploadTokens })
                });
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    setTotalFilesProcessed(stats.files_processed);
                    setTotalTokenCount(stats.tokens_used);
                }
            } catch (e) { console.error('Stats update failed:', e); }
            setIndexReady(true);
            localStorage.setItem(`indexReady_${user.id}`, 'true');
        } catch (err) {
            setStatus({ type: 'error', msg: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const q = input.trim();
        const newMessages = [...messages, { role: 'user', content: q }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        const customKey = localStorage.getItem('custom_api_key_google');

        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        };

        if (customKey) {
            headers['X-Custom-Api-Key'] = customKey;
        }

        try {
            const res = await fetch(`${API_URL}/ask`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ question: q })
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Request failed');
            const data = await res.json();
            const finalMessages = [...newMessages, { role: 'assistant', content: data.answer }];
            setIsLoading(false);
            setMessages(finalMessages);
            const msgTokens = estimateTokens(q) + estimateTokens(data.answer);
            setTokenCount(prev => prev + msgTokens);
            try {
                const { data: { session: sess } } = await supabase.auth.getSession();
                const statsRes = await fetch(`${API_URL}/stats`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${sess.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tokens_delta: msgTokens })
                });
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    setTotalTokenCount(stats.tokens_used);
                }
            } catch (e) { console.error('Stats update failed:', e); }
            saveToHistory(finalMessages, processedFiles, tokenCount + msgTokens);
        } catch (err) {
            const finalMessages = [...newMessages, { role: 'assistant', content: err.message, isError: true }];
            setIsLoading(false);
            setMessages(finalMessages);
        } finally {
            inputRef.current?.focus();
        }
    };

    const startNewChat = () => {
        if (messages.length > 0) saveToHistory(messages, processedFiles, tokenCount);
        setMessages([]);
        setProcessedFiles([]);
        setTokenCount(0);
        setCurrentChatId(null);
        setShowHistory(false);
        setStatus(null);
    };

    const loadChat = (chat) => {
        if (messages.length > 0 && currentChatId !== chat.id) saveToHistory(messages, processedFiles, tokenCount);
        setMessages(chat.messages);
        setProcessedFiles(chat.files || []);
        setTokenCount(chat.tokens || 0);
        setCurrentChatId(chat.id);
        setShowHistory(false);
    };

    const deleteChat = (e, chatId) => {
        e.stopPropagation();
        const updated = chatHistory.filter(c => c.id !== chatId);
        setChatHistory(updated);
        localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(updated));
        if (currentChatId === chatId) {
            setMessages([]);
            setCurrentChatId(null);
        }
    };

    return (
        <div className="app">
            <Sidebar
                user={user}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                currentChatId={currentChatId}
                loadChat={loadChat}
                deleteChat={deleteChat}
                startNewChat={startNewChat}
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
                messages={messages}
                setMessages={setMessages}
                setCurrentChatId={setCurrentChatId}
                collapsed={!showSidebar}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                signOut={signOut}
                showProfileMenu={showProfileMenu}
                setShowProfileMenu={setShowProfileMenu}
                profileMenuRef={profileMenuRef}
                setShowProfile={setShowProfile}
            />

            <main className="main">
                {showProfile ? (
                    <SettingsPage
                        user={user}
                        onClose={() => setShowProfile(false)}
                        updateProfile={updateProfile}
                        updateEmail={updateEmail}
                        updatePassword={updatePassword}
                        signOut={signOut}
                        deleteAccount={deleteAccount}
                        filesProcessed={totalFilesProcessed}
                        tokenCount={totalTokenCount}
                    />
                ) : (
                    <>
                        <Header
                            tokenCount={tokenCount}
                            snowEnabled={snowEnabled}
                            onToggleSnow={() => setSnowEnabled(prev => !prev)}
                        />

                        <ChatMessages
                            messages={messages}
                            isLoading={isLoading}
                            messagesEndRef={messagesEndRef}
                            user={user}
                        />

                        <ChatInput
                            input={input}
                            setInput={setInput}
                            handleSubmit={handleSubmit}
                            indexReady={indexReady}
                            isLoading={isLoading}
                            inputRef={inputRef}
                        />
                    </>
                )}
            </main>
            <SnowEffect enabled={snowEnabled} />
        </div>
    );
}
