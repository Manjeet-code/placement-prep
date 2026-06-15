import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [shortlistLoading, setShortlistLoading] = useState(false);

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { if (tab === 'shortlisted') fetchShortlisted(); }, [tab]);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/recruiter/students');
      setStudents(res.data);
    } catch (err) {
      console.error('fetchStudents error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlisted = async () => {
    try {
      const res = await API.get('/recruiter/shortlisted');
      setShortlisted(res.data);
    } catch (err) {
      console.error('fetchShortlisted error:', err);
    }
  };

  const openDetail = async (studentId) => {
    setSelected(studentId);
    setDetailLoading(true);
    try {
      const res = await API.get(`/recruiter/students/${studentId}`);
      setDetail(res.data);
    } catch (err) {
      console.error('openDetail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleShortlist = async (studentId) => {
    setShortlistLoading(true);
    try {
      const res = await API.post(`/recruiter/shortlist/${studentId}`);
      alert(res.data.message);
      setDetail(prev => ({ ...prev, isShortlisted: res.data.shortlisted }));
      fetchStudents();
      if (tab === 'shortlisted') fetchShortlisted();
    } catch (err) {
      console.error('toggleShortlist error:', err);
      alert('Shortlist update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setShortlistLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (!score && score !== 0) return '#aaa';
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // Score filter apply karo
  const filteredStudents = students.filter(st =>
    minScore === 0 || (st.avgScore !== null && st.avgScore >= minScore)
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Recruiter Portal 🏢</h1>
          <p style={s.subtitle}>Welcome, {user?.name}</p>
        </div>
        <button onClick={logout} style={s.logoutBtn}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button onClick={() => { setTab('students'); setSelected(null); }}
          style={{ ...s.tab, ...(tab === 'students' ? s.tabActive : {}) }}>
          All Students ({filteredStudents.length})
        </button>
        <button onClick={() => { setTab('shortlisted'); setSelected(null); }}
          style={{ ...s.tab, ...(tab === 'shortlisted' ? s.tabActive : {}) }}>
          Shortlisted ⭐ ({shortlisted.length})
        </button>

        {/* Score Filter */}
        {tab === 'students' && (
          <div style={s.filterRow}>
            <span style={s.filterLabel}>Min Score:</span>
            <div style={s.scoreButtons}>
              {[0, 50, 60, 70, 80, 90].map(score => (
                <button key={score}
                  onClick={() => setMinScore(score)}
                  style={{
                    ...s.scoreBtn,
                    ...(minScore === score ? s.scoreBtnActive : {})
                  }}>
                  {score === 0 ? 'All' : `${score}+`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={s.body}>
        {/* Left Panel */}
        <div style={s.list}>
          {loading && <p style={{ color: '#888', padding: '1rem' }}>Loading...</p>}

          {/* Students List */}
          {tab === 'students' && !loading && filteredStudents.length === 0 && (
            <p style={{ color: '#888', padding: '1rem' }}>
              {minScore > 0 ? `Koi student nahi ${minScore}+ score ke saath` : 'Koi student nahi'}
            </p>
          )}

          {tab === 'students' && !loading && filteredStudents.map(st => (
            <div key={st._id} onClick={() => openDetail(st._id)}
              style={{ ...s.card, ...(selected === st._id ? s.cardActive : {}) }}>
              <div style={s.cardTop}>
                <div style={s.avatar}>{st.name[0].toUpperCase()}</div>
                <div>
                  <div style={s.name}>{st.name}</div>
                  <div style={s.email}>{st.email}</div>
                </div>
              </div>
              <div style={s.statsRow}>
                <span style={s.statBadge}>📝 {st.totalInterviews} interviews</span>
                {st.avgScore !== null ? (
                  <span style={{ ...s.statBadge, color: scoreColor(st.avgScore), fontWeight: '700' }}>
                    Avg: {st.avgScore}/100
                  </span>
                ) : (
                  <span style={{ ...s.statBadge, color: '#aaa' }}>No interviews</span>
                )}
                {st.bestScore !== null && (
                  <span style={{ ...s.statBadge, color: scoreColor(st.bestScore) }}>
                    Best: {st.bestScore}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Shortlisted List */}
          {tab === 'shortlisted' && shortlisted.map(s => (
            <div key={s._id} onClick={() => openDetail(s.student._id)}
              style={{ ...styles.card, ...(selected === s.student._id ? styles.cardActive : {}) }}>
              <div style={styles.cardTop}>
                <div style={styles.avatar}>{s.student.name[0].toUpperCase()}</div>
                <div>
                  <div style={styles.name}>{s.student.name}</div>
                  <div style={styles.email}>{s.student.email}</div>
                </div>
              </div>
              <div style={styles.statsRow}>
                <span style={styles.statBadge}>📝 {s.totalInterviews} interviews</span>
                {s.avgScore !== null && (
                  <span style={{ ...styles.statBadge, color: scoreColor(s.avgScore), fontWeight: '700' }}>
                    Avg: {s.avgScore}/100
                  </span>
                )}
              </div>
            </div>
          ))}

          {tab === 'shortlisted' && shortlisted.length === 0 && (
            <p style={{ color: '#888', padding: '1rem' }}>No shortlisted students yet.</p>
          )}
        </div>

        {/* Right Panel */}
        <div style={s.detail}>
          {!selected && (
            <div style={s.emptyDetail}>
              <p>👈 Select a student to view their profile</p>
            </div>
          )}

          {detailLoading && (
            <p style={{ color: '#888', padding: '2rem' }}>Loading profile...</p>
          )}

          {detail && !detailLoading && (
            <div>
              {/* Student Header */}
              <div style={s.detailHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ ...s.avatar, width: '52px', height: '52px', fontSize: '1.3rem' }}>
                    {detail.student.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: '#1a1a2e' }}>{detail.student.name}</h2>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{detail.student.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleShortlist(detail.student._id)}
                  disabled={shortlistLoading}
                  style={{
                    ...s.shortlistBtn,
                    background: detail.isShortlisted ? '#fef9c3' : '#6366f1',
                    color: detail.isShortlisted ? '#ca8a04' : '#fff',
                    opacity: shortlistLoading ? 0.7 : 1,
                    cursor: shortlistLoading ? 'not-allowed' : 'pointer'
                  }}>
                  {shortlistLoading ? 'Saving...' : detail.isShortlisted ? '⭐ Shortlisted' : '+ Shortlist'}
                </button>
              </div>

              {/* Interview History */}
              <h3 style={{ color: '#1a1a2e', marginBottom: '0.75rem' }}>
                Interview History ({detail.interviews.length})
              </h3>

              {detail.interviews.length === 0 && (
                <p style={{ color: '#888' }}>No completed interviews yet.</p>
              )}

              {detail.interviews.map(iv => (
                <div key={iv._id} style={s.ivCard}>
                  <div style={s.ivTop}>
                    <span style={s.roleTag}>{iv.role}</span>
                    <span style={{ fontWeight: '700', color: scoreColor(iv.feedback?.score), fontSize: '1.1rem' }}>
                      {iv.feedback?.score}/100
                    </span>
                  </div>
                  <p style={s.ivMeta}>
                    {iv.domain} · {iv.difficulty} · {new Date(iv.createdAt).toLocaleDateString()}
                  </p>
                  {iv.feedback?.strengths && (
                    <div style={s.feedRow}>
                      <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.85rem' }}>✅ Strengths: </span>
                      <span style={{ color: '#555', fontSize: '0.85rem' }}>{iv.feedback.strengths.join(', ')}</span>
                    </div>
                  )}
                  {iv.feedback?.improvements && (
                    <div style={s.feedRow}>
                      <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '0.85rem' }}>⚠️ Improve: </span>
                      <span style={{ color: '#555', fontSize: '0.85rem' }}>{iv.feedback.improvements.join(', ')}</span>
                    </div>
                  )}
                  {iv.feedback?.summary && (
                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{iv.feedback.summary}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a1a', fontFamily: "'Inter', sans-serif", position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 },
  title: { margin: 0, fontSize: '1rem', background: 'linear-gradient(135deg, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' },
  subtitle: { margin: 0, color: '#aecbf3', fontSize: '0.8rem' },
  logoutBtn: { background: 'rgba(250, 5, 5, 0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' },
  tabs: { display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', alignItems: 'center' },
  tab: { padding: '0.45rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontWeight: '500', color: '#475569', fontSize: '0.85rem' },
  tabActive: { background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' },
  filterLabel: { color: '#475569', fontSize: '0.82rem', fontWeight: '500', whiteSpace: 'nowrap' },
  scoreButtons: { display: 'flex', gap: '0.4rem' },
  scoreBtn: { padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '500', color: '#475569' },
  scoreBtnActive: { background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' },
  body: { display: 'flex', height: 'calc(100vh - 100px)' },
  list: { width: '340px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', padding: '0.75rem' },
  card: { padding: '0.9rem 1rem', borderRadius: '12px', marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' },
  cardActive: { border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #6366f1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
  name: { fontWeight: '600', color: '#e2e8f0', fontSize: '0.88rem' },
  email: { color: '#475569', fontSize: '0.75rem' },
  statsRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  statBadge: { fontSize: '0.72rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569', padding: '2px 8px', borderRadius: '20px' },
  detail: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  emptyDetail: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.95rem' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.1rem 1.25rem', borderRadius: '14px' },
  shortlistBtn: { padding: '0.5rem 1.1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  ivCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem' },
  ivTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' },
  roleTag: { fontWeight: '600', color: '#e2e8f0', fontSize: '0.9rem' },
  ivMeta: { color: '#334155', fontSize: '0.78rem', margin: '0 0 0.5rem' },
  feedRow: { marginBottom: '0.25rem' }
};
const styles = s;