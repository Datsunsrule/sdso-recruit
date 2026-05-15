import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { PatrolLogo, Btn } from '../components/ui';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const [badge, setBadge] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleLogin() {
    if (!badge || !pin) { setError('Enter badge number and PIN'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(badge, pin);
      setToken(data.token);
      setUser(data.user);
      if (data.default_location) useAuthStore.getState().setCurrentLocation(data.default_location);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid badge or PIN');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="h-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('/bronco-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
      }}
    >
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.32) 100%)' }}
      />

      <div
        ref={cardRef}
        className={`relative z-10 w-full max-w-xs mx-4 rounded-2xl p-7 ${shake ? 'shake' : ''}`}
        style={{ background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(3px)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <PatrolLogo size={60} />
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#e8dfc0', marginTop: 12 }}>
            PatrolRMS
          </h1>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginTop: 2, textAlign: 'center' }}>
            San Clemente Sheriff's Office
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">Badge Number</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="e.g. C003"
              className="w-full bg-white/15 border border-white/25 rounded-lg px-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-white/60 text-sm"
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 8))}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="4–8 digits"
              className="w-full bg-white/15 border border-white/25 rounded-lg px-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-white/60 text-sm tracking-widest"
              inputMode="numeric"
              maxLength={8}
            />
          </div>

          {error && (
            <p className="text-xs text-red-300 font-medium text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-1 py-3 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: '#c8760a', boxShadow: '0 2px 12px rgba(200,118,10,0.45)' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-white/30 text-[10px] mt-5 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
