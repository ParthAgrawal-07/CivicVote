// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/Toast';

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();

  const [form, setForm]       = useState({ studentId: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [otpState, setOtpState] = useState(null); // { userId }
  const [otp, setOtp]           = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.email || !form.password) {
      toast('Please fill in all fields.', 'red'); return;
    }
    setLoading(true);
    try {
      const result = await login(form);
      if (result.requiresOtp) {
        setOtpState({ userId: result.userId });
        toast('Verification code sent to your college email.');
      }
    } catch (err) {
      toast(err.response?.data?.error || 'Invalid credentials.', 'red');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast('Enter the 6-digit code.', 'red'); return; }
    setLoading(true);
    try {
      await verifyOtp(otpState.userId, otp);
      toast('Email verified! Welcome to CivicVote.');
    } catch (err) {
      toast(err.response?.data?.error || 'Invalid or expired code.', 'red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">

      {/* ── Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-accent p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-28 -right-16 w-72 h-72 rounded-full border-[50px] border-white/[0.04]" />
        <div className="absolute -bottom-16 -left-12 w-52 h-52 rounded-full border-[36px] border-white/[0.04]" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="font-serif text-2xl text-white tracking-tight">CivicVote</span>
          <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-white/50 border border-white/20 px-2 py-1 rounded-full">Secured</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-serif text-4xl text-white leading-tight mb-4 font-normal">
            Your voice.<br/>Your campus.<br/>Your vote.
          </h1>
          <p className="text-sm text-white/55 leading-relaxed">
            A secure, anonymous, and transparent platform for Student Body Government elections.
          </p>
        </div>

        <ul className="relative z-10 space-y-3">
          {[
            ['shield', 'One vote per student — duplicates blocked and logged'],
            ['eye-off', 'Anonymous ballots — identity never linked to vote'],
            ['file-text', 'Full audit log — every event timestamped'],
            ['bar-chart', 'Live admin dashboard with real-time results'],
          ].map(([icon, text]) => (
            <li key={icon} className="flex items-start gap-3 text-xs text-white/60">
              <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FeatherIcon name={icon} size={12} color="rgba(255,255,255,0.8)" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {!otpState ? (
            <>
              <h2 className="font-serif text-3xl font-normal mb-1.5">Sign in</h2>
              <p className="text-sm text-ink-3 mb-7">Use your college credentials to access your ballot.</p>

              <div className="notice-info mb-5">
                <FeatherIcon name="shield" size={14} color="#2e6da4" className="flex-shrink-0 mt-0.5" />
                <span>Your identity is verified but your vote stays completely anonymous. Each student may cast only one vote per election.</span>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Student ID</label>
                    <input className="field-input" placeholder="STU-2024-001" value={form.studentId} onChange={set('studentId')} />
                  </div>
                  <div>
                    <label className="field-label">Year</label>
                    <select className="field-input">
                      {[1,2,3,4].map(y => <option key={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="field-label">College email</label>
                  <input type="email" className="field-input" placeholder="you@college.edu" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="field-label">Password</label>
                  <input type="password" className="field-input" placeholder="••••••••" value={form.password} onChange={set('password')} />
                </div>
                <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in securely'}
                </button>
              </form>

              <p className="text-center text-xs text-ink-4 mt-4 leading-snug">
                Session is encrypted. Votes are anonymous and tamper-proof.
              </p>

              {/* Demo shortcut */}
              <div className="flex gap-2 mt-5 pt-5 border-t border-black/10">
                <button className="flex-1 btn-secondary text-xs" onClick={() => {
                  setForm({ studentId: 'STU-2024-001', email: 'alex.patel@college.edu', password: 'Student@123' });
                }}>Demo: Student</button>
                <button className="flex-1 btn-secondary text-xs" onClick={() => {
                  setForm({ studentId: 'ADM-001', email: 'admin@college.edu', password: 'Admin@123' });
                }}>Demo: Admin</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-normal mb-1.5">Verify your email</h2>
              <p className="text-sm text-ink-3 mb-7">Enter the 6-digit code sent to your college email.</p>
              <form onSubmit={handleOtp} className="space-y-4">
                <div>
                  <label className="field-label">Verification code</label>
                  <input
                    className="field-input text-center text-2xl tracking-[0.5em] font-bold"
                    maxLength={6} placeholder="——————"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify and sign in'}
                </button>
                <button type="button" className="btn-secondary w-full" onClick={() => setOtpState(null)}>
                  Back to sign in
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// Inline icon helper (uses Feather icon paths)
function FeatherIcon({ name, size = 16, color = 'currentColor', className = '' }) {
  const paths = {
    shield:      'M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5L12 1z',
    'eye-off':   'M1 1l22 22M6.7 6.7C4.3 8.1 2.6 10 2 12c1.7 6.5 10 10.3 10 10.3s1.7-.7 3.6-2M10 5.1A10 10 0 0 1 12 5c7 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2',
    'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
    'bar-chart': 'M18 20V10M12 20V4M6 20v-6',
    check:       'M20 6L9 17l-5-5',
    alert:       'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    clock:       'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
    plus:        'M12 5v14M5 12h14',
    trash:       'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    edit:        'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

export { FeatherIcon };
