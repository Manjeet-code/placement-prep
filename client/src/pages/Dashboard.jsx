import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

// Hover helper component
const HoverCard = ({ children, style, hoverStyle, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...style, ...(hovered ? hoverStyle : {}), transition: 'all 0.3s ease' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'recruiter') { navigate('/recruiter'); return; }
     if (user?.role === 'admin') { navigate('/admin'); return; }
    API.get('/interview/my')
      .then(res => setInterviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const scoreColor = (score) => {
    if (score >= 75) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
  };

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((a, b) => a + (b.feedback?.score || 0), 0) / completed.length)
    : null;
  const bestScore = completed.length > 0
    ? Math.max(...completed.map(i => i.feedback?.score || 0))
    : null;

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Navbar */}
      <div style={s.nav}>
        <span style={s.logo}>PlacementPrep</span>
        <div style={s.navRight}>
          <span style={s.badge}>{user?.name}</span>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={s.body}>
        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroGlow} />
          <div style={s.heroTop} />
          <div>
            <h2 style={s.heroTitle}>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={s.heroSub}>Ready to ace your next interview?</p>
          </div>
          <button onClick={() => navigate('/interview')} style={s.startBtn}>
            <span style={s.btnShine} />
            🎤 Start Interview
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: 'Total Interviews', val: interviews.length, color: 'linear-gradient(135deg, #a78bfa, #6366f1)' },
            { label: 'Completed', val: completed.length, color: 'linear-gradient(135deg, #34d399, #10b981)' },
            { label: 'Average Score', val: avgScore ?? '—', color: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
            { label: 'Best Score', val: bestScore ?? '—', color: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
          ].map((stat, i) => (
            <div key={i} style={s.statCard}>
              <div style={s.statTop} />
              <div style={s.statLabel}>{stat.label}</div>
              <div style={{ ...s.statVal, background: stat.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        {/* Past Interviews */}
        <div style={s.sectionTitle}>Recent Interviews</div>

        {loading && <p style={{ color: '#475569' }}>Loading...</p>}

        {!loading && interviews.length === 0 && (
          <div style={s.empty}>
            <p style={{ color: '#475569', margin: 0 }}>No interviews yet. Start your first one! 🚀</p>
          </div>
        )}

        <div style={s.grid}>
          {interviews.map(iv => (
            <div key={iv._id} style={s.card}>
              <div style={s.cardTop} />
              <div style={s.cardHeader}>
                <span style={s.roleTag}>{iv.role}</span>
                <span style={{
                  ...s.statusTag,
                  background: iv.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)',
                  color: iv.status === 'completed' ? '#4ade80' : '#fbbf24',
                  border: `1px solid ${iv.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)'}`
                }}>{iv.status}</span>
              </div>
              <p style={s.cardMeta}>
                {iv.company ? `${iv.company.toUpperCase()} · ` : ''}{iv.domain} · {iv.difficulty}
              </p>
              {iv.feedback?.score !== undefined && (
                <div style={s.scoreRow}>
                  <span style={{ fontSize: '1.4rem', fontWeight: '700', color: scoreColor(iv.feedback.score) }}>
                    {iv.feedback.score}<span style={{ fontSize: '0.75rem', color: '#334155' }}>/100</span>
                  </span>
                  <span style={s.dateText}>{new Date(iv.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)', fontFamily: "'Inter', sans-serif", position: 'relative' },
  orb1: { position: 'fixed', top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', bottom: '-100px', right: '-100px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 },
  logo: { background: 'linear-gradient(135deg, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.3px' },
  navRight: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  badge: { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a78bfa', fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' },
  logoutBtn: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' },
  body: { padding: '1.5rem 1.75rem', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 5 },
  hero: { background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(99,102,241,0.1), 0 0 0 1px rgba(255,255,255,0.03) inset' },
  heroGlow: { position: 'absolute', top: '-50%', left: '-20%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%)', pointerEvents: 'none' },
  heroTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)' },
  heroTitle: { color: '#f1f5f9', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.3rem', letterSpacing: '-0.3px' },
  heroSub: { color: '#475569', fontSize: '0.88rem' },
  startBtn: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 8px 25px rgba(99,102,241,0.4)', position: 'relative', overflow: 'hidden' },
  btnShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)', pointerEvents: 'none' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.1rem 1.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  statTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' },
  statLabel: { color: '#475569', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' },
  statVal: { fontSize: '1.8rem', fontWeight: '700' },
  sectionTitle: { color: '#475569', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.75rem' },
  empty: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.1rem 1.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  cardTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  roleTag: { color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600' },
  statusTag: { fontSize: '0.7rem', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' },
  cardMeta: { color: '#334155', fontSize: '0.78rem', marginBottom: '0.75rem' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#1e293b', fontSize: '0.78rem' }
};