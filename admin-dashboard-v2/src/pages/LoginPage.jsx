import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Alert, InputAdornment } from '@mui/material';
import { User, Lock, Shield, Cpu } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('https://rbl-project-5sfk.onrender.com/api/auth/login', { username, password });
            localStorage.setItem('adminToken', res.data.token);
            navigate('/');
            // Force a hard reload if the PrivateRoute doesn't catch the token update immediately
            setTimeout(() => window.location.reload(), 100);
        } catch (err) {
            setError('ACCESS DENIED: Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]"></div>

            <Container maxWidth="xs" className="relative z-10 animate-slide-up">
                <Box className="text-center mb-10">
                    <div className="inline-flex w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 animate-pulse-emerald">
                        <Shield size={36} className="text-white" fill="white" />
                    </div>
                    <Typography variant="h3" className="font-black tracking-tight text-white mb-2">RBL<span className="text-emerald-500">ADMIN</span></Typography>
                    <div className="flex items-center justify-center gap-2">
                        <Cpu size={14} className="text-slate-500" />
                        <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-[0.2em]">Secure Node Interface v2.0</Typography>
                    </div>
                </Box>

                <Paper className="p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 shadow-2xl">
                    {error && (
                        <Alert
                            severity="error"
                            variant="filled"
                            className="mb-6 rounded-2xl font-bold bg-red-500/10 text-red-400 border border-red-500/20"
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Operator Identity</label>
                            <TextField
                                fullWidth
                                placeholder="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <User size={18} className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '1.25rem',
                                        backgroundColor: 'rgba(2, 6, 23, 0.4)',
                                        color: 'white',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
                                        '&:hover fieldset': { borderColor: 'rgba(16, 185, 129, 0.3)' },
                                        '&.Mui-focused fieldset': { borderColor: '#10b981' },
                                    },
                                    '& input::placeholder': { color: 'rgba(148, 163, 184, 0.4)', opacity: 1 }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Access Vector</label>
                            <TextField
                                fullWidth
                                placeholder="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={18} className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '1.25rem',
                                        backgroundColor: 'rgba(2, 6, 23, 0.4)',
                                        color: 'white',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
                                        '&:hover fieldset': { borderColor: 'rgba(16, 185, 129, 0.3)' },
                                        '&.Mui-focused fieldset': { borderColor: '#10b981' },
                                    },
                                    '& input::placeholder': { color: 'rgba(148, 163, 184, 0.4)', opacity: 1 }
                                }}
                            />
                        </div>

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            disabled={loading}
                            className="haptic-button py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/10"
                            sx={{
                                mt: 2,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                '&:hover': { background: '#10b981' },
                                '&.Mui-disabled': { background: 'rgba(16, 185, 129, 0.2)', color: 'rgba(255,255,255,0.2)' }
                            }}
                        >
                            {loading ? 'Authorizing...' : 'Initialize Session'}
                        </Button>
                    </form>
                </Paper>

                <Box className="mt-10 flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <Typography variant="caption" className="text-slate-600 font-bold uppercase tracking-widest">Encrypted Line Secured</Typography>
                </Box>
            </Container>
        </Box>
    );
}
