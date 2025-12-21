// Main Entry Point - Application Bootstrap
// 1. Wraps App with Supabase and Auth providers, renders to DOM


function AppWrapper() {
    return (
        <SupabaseProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </SupabaseProvider>
    );
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<AppWrapper />);
