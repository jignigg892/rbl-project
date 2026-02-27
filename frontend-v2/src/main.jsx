import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL APP CRASH:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#020617',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '40px',
                    fontFamily: 'sans-serif'
                }}>
                    <h2 style={{ color: '#0055eb', marginBottom: '10px', fontSize: '24px' }}>System Interrupted</h2>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px', maxWidth: '300px' }}>
                        The application encountered an initialization error.
                    </p>

                    {/* Diagnostic Info */}
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '15px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#64748b',
                        marginBottom: '30px',
                        textAlign: 'left',
                        maxWidth: '90%'
                    }}>
                        Error: {this.state.error?.toString()}
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            backgroundColor: '#0055eb',
                            color: 'white',
                            border: 'none',
                            padding: '15px 40px',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(0, 85, 235, 0.3)'
                        }}
                    >
                        RECONNECT
                    </button>

                    <p style={{ marginTop: '20px', fontSize: '10px', color: '#475569', fontWeight: 'bold', letterSpacing: '2px' }}>
                        CORE SERVICE STATUS: OFFLINE
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
    // Signal to index.html that React is mounted
    window.__carbon_mounted = true;
}
