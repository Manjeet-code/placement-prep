import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [btnHover, setBtnHover] = useState(false);

// button mein:
<button
  onMouseEnter={() => setBtnHover(true)}
  onMouseLeave={() => setBtnHover(false)}
  style={{ ...s.btn, ...(btnHover ? s.btnHover : {}), opacity: loading ? 0.7 : 1, transition: 'all 0.3s ease' }}
  type="submit" disabled={loading}>
  <span style={s.btnShine} />
  {loading ? 'Logging in...' : 'Login'}
</button>

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.card}>
        <div style={s.cardGlow} />
        <div style={s.cardTop} />
        <div style={s.logoRow}>
          <span style={s.logo}>PlacementPrep</span>
        </div>
        <h2 style={s.title}>Welcome back</h2>
        <p style={s.subtitle}>Login to continue your prep</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} name="email" type="email"
            placeholder="you@example.com"
            value={form.email} onChange={handleChange} required />

          <label style={s.label}>Password</label>
          <input style={s.input} name="password" type="password"
            placeholder="••••••••"
            value={form.password} onChange={handleChange} required />

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            type="submit" disabled={loading}>
            <span style={s.btnShine} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={s.linkRow}>
          Don't have an account? <Link to="/register" style={s.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '420px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset' },
  cardGlow: { position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents: 'none' },
  cardTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' },
  logoRow: { marginBottom: '1.5rem' },
  logo: { background: 'linear-gradient(135deg, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.3px' },
  title: { color: '#f1f5f9', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '-0.5px' },
  subtitle: { color: '#475569', fontSize: '0.9rem', marginBottom: '1.75rem' },
  label: { display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '1.1rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.85rem', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 25px rgba(99,102,241,0.4)' },
  btnShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)', borderRadius: '12px 12px 0 0', pointerEvents: 'none' },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' },
  linkRow: { textAlign: 'center', color: '#475569', fontSize: '0.85rem', marginTop: '1.25rem' },
  link: { color: '#a78bfa', fontWeight: '500' },
  btnHover: { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 15px 40px rgba(99,102,241,0.6)' },
};