import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'recruiter') { navigate('/recruiter'); return; }
    API.get('/interview/my')
      .then(res => setInterviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const scoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Welcome, {user?.name} 👋</h1>
          <p style={s.subtitle}>Ready to ace your next interview?</p>
        </div>
        <button onClick={logout} style={s.logoutBtn}>Logout</button>
      </div>

      <div style={s.heroCard}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>Start a Mock Interview</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0' }}>
            Practice with AI and get instant feedback
          </p>
        </div>
        <button onClick={() => navigate('/interview')} style={s.startBtn}>
          🎤 Start Now
        </button>
      </div>

      <h3 style={s.sectionTitle}>Past Interviews</h3>
      {loading && <p style={{ color: '#888' }}>Loading...</p>}
      {!loading && interviews.length === 0 && (
        <div style={s.emptyState}>
          <p>No interviews yet. Start your first one above! 🚀</p>
        </div>
      )}

      <div style={s.grid}>
        {interviews.map(iv => (
          <div key={iv._id} style={s.card}>
            <div style={s.cardTop}>
              <span style={s.roleTag}>{iv.role}</span>
              <span style={{
                ...s.statusTag,
                background: iv.status === 'completed' ? '#dcfce7' : '#fef9c3',
                color: iv.status === 'completed' ? '#16a34a' : '#ca8a04'
              }}>{iv.status}</span>
            </div>
            <p style={s.cardMeta}>{iv.domain} · {iv.difficulty}</p>
            {iv.feedback?.score !== undefined && (
              <div style={s.scoreRow}>
                <span style={{ ...s.score, color: scoreColor(iv.feedback.score) }}>
                  {iv.feedback.score}/100
                </span>
                <span style={s.cardDate}>{new Date(iv.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f0f4ff', padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { margin: 0, fontSize: '1.6rem', color: '#1a1a2e' },
  subtitle: { color: '#888', margin: '0.25rem 0 0' },
  logoutBtn: { padding: '0.5rem 1.25rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  heroCard: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  startBtn: { padding: '0.75rem 1.5rem', background: '#fff', color: '#6366f1', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  sectionTitle: { color: '#1a1a2e', marginBottom: '1rem' },
  emptyState: { background: '#fff', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  roleTag: { fontWeight: '700', color: '#1a1a2e', fontSize: '0.95rem' },
  statusTag: { fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '20px' },
  cardMeta: { color: '#888', fontSize: '0.85rem', margin: '0.25rem 0 0.75rem' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  score: { fontWeight: '700', fontSize: '1.1rem' },
  cardDate: { color: '#aaa', fontSize: '0.8rem' }
};