function Toast({ message, type, onClose }) {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <i className={`ti ti-${type === 'success' ? 'check' : 'alert-triangle'}`} style={{fontSize: 18}}></i>
            <span>{message}</span>
            <button className="toast-close" onClick={onClose}>
                <i className="ti ti-x" style={{fontSize: 16}}></i>
            </button>
        </div>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <Toast key={t.id} message={t.text} type={t.type} onClose={() => removeToast(t.id)} />
            ))}
        </div>
    );
}
