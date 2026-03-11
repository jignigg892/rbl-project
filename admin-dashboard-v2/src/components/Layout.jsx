import React from 'react';
import { Box, Typography, IconButton, Badge } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Bell, Shield, Download } from 'lucide-react';

export default function Layout() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('dashboard');

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            maxWidth: '480px',
            mx: 'auto',
            backgroundColor: 'var(--bg-primary)',
            position: 'relative',
        }}>
            {/* MOBILE HEADER */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 2,
                borderBottom: '1px solid var(--border-subtle)',
                background: 'linear-gradient(to bottom, rgba(15,23,42,0.5), transparent)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                    }}>
                        <Shield size={20} color="white" fill="white" />
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontSize: '18px', fontWeight: 900, lineHeight: 1,
                            letterSpacing: '-0.02em', color: 'var(--text-primary)',
                        }}>
                            RBL<span style={{ color: '#10b981' }}>ADMIN</span>
                        </Typography>
                        <Typography sx={{
                            fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.15em',
                            fontFamily: '"JetBrains Mono", monospace',
                        }}>
                            Command Console v2.1
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" sx={{ color: 'var(--text-secondary)' }}>
                        <Badge badgeContent={0} color="error" variant="dot">
                            <Bell size={20} />
                        </Badge>
                    </IconButton>
                    <IconButton size="small" onClick={handleLogout} sx={{ color: 'var(--text-secondary)' }}>
                        <LogOut size={18} />
                    </IconButton>
                </Box>
            </Box>

            {/* MAIN CONTENT */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                pb: '80px',
            }}>
                <Outlet />
            </Box>

            {/* MOBILE BOTTOM NAV */}
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                py: 1.5,
                px: 2,
                backgroundColor: 'rgba(2, 6, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--border-subtle)',
                zIndex: 100,
            }}>
                <BottomNavBtn
                    icon={<LayoutDashboard size={22} />}
                    label="Dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <BottomNavBtn
                    icon={<MessageSquare size={22} />}
                    label="Signals"
                    active={activeTab === 'signals'}
                    onClick={() => setActiveTab('signals')}
                />
                <BottomNavBtn
                    icon={<Download size={22} />}
                    label="Export"
                    active={activeTab === 'export'}
                    onClick={() => setActiveTab('export')}
                />
            </Box>
        </Box>
    );
}

function BottomNavBtn({ icon, label, active, onClick }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                color: active ? '#10b981' : 'var(--text-muted)',
                transition: 'color 0.2s',
                py: 0.5,
                px: 2,
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            {icon}
            <Typography sx={{
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            }}>
                {label}
            </Typography>
        </Box>
    );
}
