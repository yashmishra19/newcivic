import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, AlertCircle, RefreshCw, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Hardcoded Admin Credentials
export const ADMIN_EMAIL = 'admin@civicwatch.com';
export const ADMIN_PASSWORD = 'CIVIC@ADMIN2026';
export const ADMIN_CODE = 'CWADMIN999';

// Mock User Credentials for testing
export const MOCK_USERS = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex@civicwatch.com',
    password: 'User@1234',
    phone: '9876543210',
    district: 'Kandivali West',
    role: 'user',
    reportsCount: 12,
    badge: 'Active Reporter',
    avatar: null,
    joinedAt: '2026-01-15',
  },
  {
    id: 2,
    name: 'Maya Lin',
    email: 'maya@civicwatch.com',
    password: 'User@1234',
    phone: '9123456780',
    district: 'Thakur Village',
    role: 'user',
    reportsCount: 34,
    badge: 'Civic Hero',
    avatar: null,
    joinedAt: '2025-11-20',
  },
  {
    id: 3,
    name: 'Robert Sterling',
    email: 'robert@civicwatch.com',
    password: 'User@1234',
    phone: '9988776655',
    district: 'Charkop',
    role: 'user',
    reportsCount: 7,
    badge: 'New Member',
    avatar: null,
    joinedAt: '2026-07-01',
  },
];

interface AuthScreenProps {
  onAuthSuccess: (authData: { role: 'admin' | 'user'; name: string; email: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [screen, setScreen] = useState<'splash' | 'login' | 'signup'>('splash');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [darkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('civicwatch_citizen_darkmode');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminAccessCode, setAdminAccessCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('Kandivali West');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // Pre-load mock users on first launch
  useEffect(() => {
    if (!localStorage.getItem('civicwatch_users')) {
      const usersToStore = MOCK_USERS.map((u) => ({
        ...u,
        password: btoa(u.password),
      }));
      localStorage.setItem('civicwatch_users', JSON.stringify(usersToStore));
    }
  }, []);

  // Splash Screen Timer
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => setScreen('login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleSwitchScreen = (newScreen: 'login' | 'signup') => {
    setErrorMsg(null);
    setScreen(newScreen);
  };

  const hashPassword = (password: string) => {
    try { return btoa(password); } catch (e) { return password; }
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsAuthenticating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const isTryingAdmin = loginEmail.toLowerCase().includes('admin');

      if (isTryingAdmin) {
        if (
          loginEmail.toLowerCase() === ADMIN_EMAIL &&
          loginPassword === ADMIN_PASSWORD &&
          adminAccessCode === ADMIN_CODE
        ) {
          const authData = {
            role: 'admin' as const,
            name: 'System Admin',
            email: loginEmail,
            loggedIn: true,
            loginTime: Date.now(),
          };
          localStorage.setItem('civicwatch_auth', JSON.stringify(authData));
          onAuthSuccess(authData);
          setIsAuthenticating(false);
          return;
        } else {
          setErrorMsg('Invalid admin credentials or access code.');
          setIsAuthenticating(false);
          return;
        }
      }

      const savedUsersRaw = localStorage.getItem('civicwatch_users');
      const users = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const user = users.find(
        (u: any) => u.email.toLowerCase() === loginEmail.toLowerCase()
      );

      if (user && user.password === hashPassword(loginPassword)) {
        const authData = {
          role: 'user' as const,
          name: user.name,
          email: user.email,
          district: user.district,
          loggedIn: true,
          loginTime: Date.now(),
        };
        localStorage.setItem('civicwatch_auth', JSON.stringify(authData));
        onAuthSuccess(authData);
      } else {
        setErrorMsg('Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMsg('All marked fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsAuthenticating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const savedUsersRaw = localStorage.getItem('civicwatch_users');
      const users = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

      const emailExists =
        signupEmail.toLowerCase() === ADMIN_EMAIL ||
        users.some((u: any) => u.email.toLowerCase() === signupEmail.toLowerCase());

      if (emailExists) {
        setErrorMsg('An account with this email already exists.');
        setIsAuthenticating(false);
        return;
      }

           // Save to Supabase citizens table
      console.log('Attempting Supabase insert for:', signupName, signupEmail);
      const { data: insertData, error: supaError } = await supabase.from('citizens').insert({
        name: signupName,
        email: signupEmail,
        phone: signupPhone || null,
        neighborhood: signupDistrict,
        status: 'pending',
        joined_date: new Date().toISOString().split('T')[0],
        last_activity: new Date().toISOString(),
      }).select();

      console.log('Supabase insert result:', insertData);
      console.log('Supabase insert error:', supaError);

      // Save to localStorage
      const newUser = {
        id: Date.now(),
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        district: signupDistrict,
        password: hashPassword(signupPassword),
        role: 'user',
        joinedAt: new Date().toISOString(),
        reportsCount: 0,
        badge: 'New Member',
      };

      localStorage.setItem(
        'civicwatch_users',
        JSON.stringify([...users, newUser])
      );

      // Auto login
      const authData = {
        role: 'user' as const,
        name: newUser.name,
        email: newUser.email,
        district: newUser.district,
        loggedIn: true,
        loginTime: Date.now(),
      };
      localStorage.setItem('civicwatch_auth', JSON.stringify(authData));
      onAuthSuccess(authData);

    } catch (err) {
      setErrorMsg('Signup failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Splash Screen
  if (screen === 'splash') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-[0_4px_20px_rgba(37,99,235,0.4)]">
            C
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">CivicWatch</h1>
          <p className="text-sm text-slate-400 font-medium">Report. Connect. Resolve.</p>
          <div className="mt-8 w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-blue-500 h-full rounded-full animate-loading-bar absolute left-0 w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8F9FA] bg-gradient-to-tr from-blue-50/40 via-white to-blue-50/20 text-slate-900'} flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]`}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-6 md:p-8 space-y-6 transition-colors duration-200">

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
            C
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">CivicWatch</span>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white mt-4">
            {screen === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {screen === 'login' ? 'Sign in to your account' : 'Register to report hazards & earn badges'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/45 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN */}
        {screen === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input type="email" required value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Contact support@civicwatch.com"); }}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input type={showLoginPassword ? 'text' : 'password'} required value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginEmail.toLowerCase().includes('admin') && (
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 dark:text-red-400 block mb-1">Admin Access Code</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-red-400 absolute left-3 top-3.5" />
                  <input type="password" required value={adminAccessCode}
                    onChange={(e) => setAdminAccessCode(e.target.value)} placeholder="Enter access code"
                    className="w-full bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/60 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/50 transition-all"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={isAuthenticating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all mt-6">
              {isAuthenticating ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Authenticating...</span></> : <span>Sign In</span>}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="mx-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Demo Credentials</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                onClick={() => { setLoginEmail('alex@civicwatch.com'); setLoginPassword('User@1234'); setAdminAccessCode(''); setErrorMsg(null); }}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 rounded-xl p-3 text-left transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">👤</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                </div>
                <p className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">Try as User</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 truncate">alex@civicwatch.com</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">User@1234</p>
              </button>

              <button type="button"
                onClick={() => { setLoginEmail(ADMIN_EMAIL); setLoginPassword(ADMIN_PASSWORD); setAdminAccessCode(ADMIN_CODE); setErrorMsg(null); }}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-red-300 dark:hover:border-red-500/50 rounded-xl p-3 text-left transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">🔐</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-red-500" />
                </div>
                <p className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">Try as Admin</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 truncate">admin@civicwatch.com</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Code: CWADMIN999</p>
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-450 font-medium">
              Don't have an account?{' '}
              <button type="button" onClick={() => handleSwitchScreen('signup')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign Up</button>
            </p>
          </form>
        )}

        {/* SIGNUP */}
        {screen === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input type="text" required value={signupName} onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input type={showSignupPassword ? 'text' : 'password'} required value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 chars"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input type={showSignupConfirmPassword ? 'text' : 'password'} required value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Neighborhood</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-500 absolute left-3 top-3.5" />
                <select value={signupDistrict} onChange={(e) => setSignupDistrict(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all cursor-pointer">
                  <option value="Kandivali West" className="dark:bg-slate-800">Kandivali West</option>
                  <option value="Kandivali East" className="dark:bg-slate-800">Kandivali East</option>
                  <option value="Thakur Village" className="dark:bg-slate-800">Thakur Village</option>
                  <option value="Charkop" className="dark:bg-slate-800">Charkop</option>
                  <option value="Poisar" className="dark:bg-slate-800">Poisar</option>
                  <option value="Samata Nagar" className="dark:bg-slate-800">Samata Nagar</option>
                  <option value="Akurli Road" className="dark:bg-slate-800">Akurli Road</option>
                  <option value="Mahavir Nagar" className="dark:bg-slate-800">Mahavir Nagar</option>
                  <option value="Lokhandwala Township" className="dark:bg-slate-800">Lokhandwala Township</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isAuthenticating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all mt-6">
              {isAuthenticating ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Creating Account...</span></> : <span>Create Account</span>}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-450 font-medium">
              Already have an account?{' '}
              <button type="button" onClick={() => handleSwitchScreen('login')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign In</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};