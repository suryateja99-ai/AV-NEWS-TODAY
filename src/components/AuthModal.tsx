import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { GovtProofType } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    registerJournalist,
    loginJournalist,
    setIsProfileModalOpen,
    allJournalists,
  } = useNews();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cityDistrict, setCityDistrict] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [designation, setDesignation] = useState('AV Life Generalist / Bureau Reporter');
  const [bio, setBio] = useState('');
  const [govtProofType, setGovtProofType] = useState<GovtProofType>('aadhar');
  const [govtProofNumber, setGovtProofNumber] = useState('');
  const [govtProofDocumentUrl, setGovtProofDocumentUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email address and password.');
      return;
    }

    const res = loginJournalist(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginSuccess(res.message);
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setIsProfileModalOpen(true);
      }, 1000);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!fullName.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setRegisterError('Please fill in all basic mandatory personal details.');
      return;
    }

    if (!govtProofNumber.trim()) {
      setRegisterError('Government ID Proof number is mandatory for journalist accreditation.');
      return;
    }

    if (!govtProofDocumentUrl) {
      setRegisterError('Please upload a scanned copy or photo of your Government ID proof.');
      return;
    }

    if (!agreedTerms) {
      setRegisterError('Please accept the Press Council code of ethics and declaration.');
      return;
    }

    const res = registerJournalist({
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      cityDistrict: cityDistrict.trim(),
      state: state.trim(),
      designation: designation.trim() || 'AV Life Generalist',
      bio: bio.trim(),
      avatarUrl:
        avatarUrl.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      govtProofType,
      govtProofNumber: govtProofNumber.trim(),
      govtProofDocumentUrl,
    });

    if (!res.success) {
      setRegisterError(res.message);
    } else {
      setRegisterSuccess(res.message);
    }
  };

  const handleDocumentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setGovtProofDocumentUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleDoc = () => {
    setGovtProofDocumentUrl(
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    );
  };

  const loadDemoLogin = (emailStr: string, passStr: string) => {
    setLoginEmail(emailStr);
    setLoginPassword(passStr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#091226] border border-blue-900/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-700 via-blue-900 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded">
                  AV NEWS
                </span>
                <h3 className="font-black text-white text-base tracking-wide">
                  JOURNALIST & GENERALIST PORTAL
                </h3>
              </div>
              <p className="text-[11px] text-blue-200">
                Official Accreditation Network • Ayudh Vikas Foundation
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-blue-900/60 bg-[#060d1d]">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setLoginError('');
              setRegisterError('');
            }}
            className={`flex-1 py-3 text-xs font-black tracking-wider cursor-pointer border-b-2 transition-all ${
              authModalMode === 'login'
                ? 'border-red-600 text-white bg-blue-950/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            SIGN IN (LOGGED IN MEMBERS)
          </button>
          <button
            onClick={() => {
              setAuthModalMode('register');
              setLoginError('');
              setRegisterError('');
            }}
            className={`flex-1 py-3 text-xs font-black tracking-wider cursor-pointer border-b-2 transition-all ${
              authModalMode === 'register'
                ? 'border-red-600 text-white bg-blue-950/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            NEW REGISTRATION (WITH GOVT PROOF)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* ========================================================= */}
          {/* 1. SIGN IN MODE */}
          {/* ========================================================= */}
          {authModalMode === 'login' && (
            <div className="space-y-4">
              <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Accredited Journalist Access Notice:</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Only registrations reviewed and approved by the AV News Editorial Admin can log in.
                  Pending accounts must await accreditation verification.
                </p>
              </div>

              {loginError && (
                <div className="bg-red-950/70 border border-red-500/70 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="bg-emerald-950/70 border border-emerald-500/70 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. ravi.teja@avnews.in"
                      className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-transform active:scale-98 cursor-pointer"
                >
                  SIGN IN TO JOURNALIST DESK
                </button>
              </form>

              {/* Quick Demo Fill Buttons for Testing */}
              <div className="pt-2 border-t border-blue-900/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Demo credentials (click an account to fill the form):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadDemoLogin('ravi.teja@avnews.in', 'press123')}
                    className="p-2.5 rounded-lg bg-[#070e1e] border border-emerald-500/40 hover:bg-emerald-950/30 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">Demo login: Ravi Teja Varma</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                        APPROVED
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ravi.teja@avnews.in • press123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadDemoLogin('pooja.reddy@gmail.com', 'pooja123')}
                    className="p-2.5 rounded-lg bg-[#070e1e] border border-amber-500/40 hover:bg-amber-950/30 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">Pooja Reddy</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        PENDING APPROVAL
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      pooja.reddy@gmail.com • pooja123
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. REGISTRATION MODE */}
          {/* ========================================================= */}
          {authModalMode === 'register' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-500/50 rounded-xl p-3.5 text-xs text-amber-200">
                <span className="font-bold flex items-center gap-1.5 text-amber-400 mb-1">
                  <IdCard className="w-4 h-4" />
                  Mandatory Government ID Proof Required
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  To safeguard journalistic integrity and ensure authentic reporting, every
                  prospective AV Life Generalist must provide their official Government Proof (Aadhaar,
                  PAN, Driving License, or Voter ID). After submission, your registration goes to the
                  Admin Review queue. Upon editorial verification, you receive your Digital Press Card
                  with QR Code and login clearance.
                </p>
              </div>

              {registerError && (
                <div className="bg-red-950/70 border border-red-500/70 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {registerSuccess ? (
                <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-5 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-white">
                    Registration Submitted for Editorial Verification!
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {registerSuccess}
                  </p>
                  <div className="bg-[#060c1d] border border-blue-900/60 p-3 rounded-lg text-left text-xs space-y-1.5">
                    <p className="text-slate-400 text-[11px]">
                      Registered Name: <strong className="text-white">{fullName}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Email: <strong className="text-white">{email}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Govt Proof Type: <strong className="text-white uppercase">{govtProofType}</strong> ({govtProofNumber})
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Status:{' '}
                      <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                        PENDING ADMIN VERIFICATION
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      onClick={() => setAuthModalMode('login')}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Go to Sign In
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Section A: Basic Personal Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 uppercase tracking-wider border-b border-blue-900/50 pb-1">
                      <User className="w-3.5 h-3.5" />
                      <span>1. Personal & Contact Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Full Name (as per Govt ID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ramesh Chandra Reddy"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Email Address (Used for Login) *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. ramesh.reddy@gmail.com"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create secure password"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Mobile / Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98480 12345"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          City / District *
                        </label>
                        <input
                          type="text"
                          required
                          value={cityDistrict}
                          onChange={(e) => setCityDistrict(e.target.value)}
                          placeholder="e.g. Hyderabad, Warangal, Karimnagar"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Telangana / Andhra Pradesh"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Designation / Reporting Specialty
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="e.g. AV Life Generalist, Crime Bureau Reporter, Agriculture Ground Correspondent"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Mandatory Government ID Proof */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider border-b border-blue-900/50 pb-1">
                      <IdCard className="w-3.5 h-3.5" />
                      <span>2. Government Identity Verification (Mandatory)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Select Government Proof Type *
                        </label>
                        <select
                          value={govtProofType}
                          onChange={(e) => setGovtProofType(e.target.value as GovtProofType)}
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          <option value="aadhar">Aadhaar Card (UIDAI)</option>
                          <option value="pan">PAN Card (Income Tax Dept)</option>
                          <option value="driving_license">Driving License (RTO)</option>
                          <option value="voter_id">Voter ID (Election Commission)</option>
                          <option value="passport">Passport of India</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Govt Proof ID Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={govtProofNumber}
                          onChange={(e) => setGovtProofNumber(e.target.value)}
                          placeholder="e.g. 5421-8890-1234 or ABCDE1234F"
                          className="w-full bg-[#070e1e] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Document Upload Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-300">
                          Upload Government ID Proof Scan / Photo *
                        </label>
                        <button
                          type="button"
                          onClick={loadSampleDoc}
                          className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          Use Sample Proof Image
                        </button>
                      </div>

                      <div className="border-2 border-dashed border-blue-900/80 hover:border-blue-500/80 rounded-xl p-3 bg-[#060c1d] flex flex-col sm:flex-row items-center gap-3 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleDocumentFileUpload}
                          className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                        />
                        {govtProofDocumentUrl && (
                          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                            <img
                              src={govtProofDocumentUrl}
                              alt="Proof preview"
                              className="w-10 h-7 object-cover rounded"
                            />
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Proof Attached
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Journalist Headshot / Profile Photo (For Press ID Card)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                        />
                        {avatarUrl && (
                          <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="w-9 h-9 object-cover rounded-full border border-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <label className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-lg bg-[#060d1d] border border-blue-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 accent-red-600 cursor-pointer"
                    />
                    <span className="text-[11px] leading-relaxed text-slate-300">
                      I solemnly affirm that the provided identity proof and personal information
                      are true and authentic. I agree to abide by the Press Council of India
                      journalistic guidelines and AV News digital publishing standards.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs py-3 rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer tracking-wider"
                  >
                    SUBMIT REGISTRATION FOR ADMIN VERIFICATION
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
