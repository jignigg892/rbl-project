import { createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        secondary: {
            main: '#d4a853',
        },
        background: {
            default: '#020617',
            paper: '#0f172a',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        divider: 'rgba(255, 255, 255, 0.06)',
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        h1: { fontWeight: 900 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        button: { fontWeight: 700, textTransform: 'none' },
    },
    shape: { borderRadius: 16 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                },
            },
        },
    },
});

export default theme;
