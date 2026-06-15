import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.card}>
        <div style={s.logoRow}><span style={s.logo}>PlacementPrep</span></div>
        <h2 style={s.title}>Create account</h2>
        <p style={s.subtitle}>Join PlacementPrep today</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} name="name" placeholder="Ravi Kumar"
            value={form.name} onChange={handleChange} required />

          <label style={s.label}>Email</label>
          <input style={s.input} name="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} required />

          <label style={s.label}>Password</label>
          <input style={s.input} name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} required />

          <label style={s.label}>I am a</label>
          <div style={s.roleRow}>
            {['student', 'recruiter'].map(r => (
              <button type="button" key={r}
                onClick={() => setForm({ ...form, role: r })}
                style={{ ...s.roleBtn, ...(form.role === r ? s.roleActive : {}) }}>
                {r === 'student' ? '👨‍🎓 Student' : '🏢 Recruiter'}
              </button>
            ))}
          </div>

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            type="submit" disabled={loading}>
            <span style={s.btnShine} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={s.linkRow}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#0a0a1a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', position: 'relative', overflow: 'hidden'
  },
  orb1: {
    position: 'fixed', top: '-100px', left: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  orb2: {
    position: 'fixed', bottom: '-100px', right: '-100px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px', padding: '2.5rem',
    width: '100%', maxWidth: '420px',
    position: 'relative', zIndex: 10,
    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
    backdropFilter: 'blur(20px)'
  },
  logoRow: { marginBottom: '1.5rem' },
  logo: {
    fontSize: '1.1rem', fontWeight: '700',
    background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
  },
  title: { color: '#f1f5f9', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.25rem' },
  subtitle: { color: '#64748b', fontSize: '0.88rem', marginBottom: '1.75rem' },
  label: { display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: '500' },
  input: {
    width: '100%', padding: '0.75rem 1rem', marginBottom: '1.1rem',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
    fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none'
  },
  roleRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' },
  roleBtn: {
    flex: 1, padding: '0.65rem', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
    color: '#64748b', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500'
  },
  roleActive: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.35)', color: '#a78bfa'
  },
  btn: {
    width: '100%', padding: '0.85rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(99,102,241,0.4)'
  },
  btnShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)',
    borderRadius: '12px 12px 0 0'
  },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171', borderRadius: '10px',
    padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: '1rem'
  },
  linkRow: { textAlign: 'center', color: '#475569', fontSize: '0.85rem', marginTop: '1.25rem' },
  link: { color: '#a78bfa', fontWeight: '500' }
};