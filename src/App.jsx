import React from 'react'
import BookContainer from './components/book/BookContainer'
import Snow from './components/common/Snow'
import { AuthProvider } from './context/AuthContext'
import './styles/design.css' // Global design variables
import './styles/book.css'   // 3D Book Styles

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'white', background: 'rgba(0,0,0,0.8)', zIndex: 10000, position: 'fixed' }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <div className="scene-container">
                    <Snow />
                    <BookContainer />
                </div>
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
