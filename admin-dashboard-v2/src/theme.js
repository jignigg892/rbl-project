import { createTheme } from '@mui/material/styles';

const rblBlue = '#0A3A6A';
const rblRed = '#E31837';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: rblBlue,
        },
        secondary: {
            main: rblRed,
        },
        background: {
            default: '#F4F6F8',
            paper: '#FFFFFF',
        },
        success: {
            main: '#28A745',
        },
        warning: {
            main: '#FFC107',
        },
        error: {
            main: rblRed,
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            color: rblBlue,
        },
        h5: {
            fontWeight: 600,
            color: '#333333',
        },
        h6: {
            fontWeight: 600,
            color: '#444444',
        },
        subtitle1: {
            color: '#666666',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                containedPrimary: {
                    boxShadow: '0 4px 6px rgba(10, 58, 106, 0.2)',
                    '&:hover': {
                        boxShadow: '0 6px 10px rgba(10, 58, 106, 0.3)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    backgroundColor: '#F9FAFB',
                    color: '#555555',
                },
            },
        },
    },
});

export default theme;
