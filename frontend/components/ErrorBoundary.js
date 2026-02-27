import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Something went wrong.</Text>
                    <Text style={styles.error}>{this.state.error && this.state.error.toString()}</Text>
                    <Text style={styles.stack}>{this.state.errorInfo && this.state.errorInfo.componentStack}</Text>
                </ScrollView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', color: 'red', marginBottom: 10 },
    error: { fontSize: 16, color: 'black', marginBottom: 20 },
    stack: { fontSize: 12, color: 'gray', fontFamily: 'monospace' },
});

export default ErrorBoundary;
