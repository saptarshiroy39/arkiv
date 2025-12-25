function Main() {
    return (
        <SupabaseProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </SupabaseProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
