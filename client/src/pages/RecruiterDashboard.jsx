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
  const [shortlistHover, setShortlistHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { if (tab === 'shortlisted') fetchShortlisted(); }, [tab]);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/recruiter/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlisted = async () => {
    try {
      const res = await API.get('/recruiter/shortlisted');
      setShortlisted(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openDetail = async (studentId) => {
    setSelected(studentId);
    setDetailLoading(true);
    try {
      const res = await API.get(`/recruiter/students/${studentId}`);
      setDetail(res.data);
    } catch (err) {
      console.error(err);
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
      alert('Shortlist update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setShortlistLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (!score && score !== 0) return '#475569';
    if (score >= 75) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
  };

  const filteredStudents = students.filter(st =>
    minScore === 0 || (st.avgScore !== null && st.avgScore >= minScore)
  );

  // Student Card with hover
  const StudentCard = ({ st, isShortlistCard = false }) => {
    const [hovered, setHovered] = useState(false);
    const id = isShortlistCard ? st.student._id : st._id;
    const name = isShortlistCard ? st.student.name : st.name;
    const email = isShortlistCard ? st.student.email : st.email;
    const totalInterviews = st.totalInterviews;
    const avgScore = st.avgScore;

    return (
      <div
        onClick={() => openDetail(id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...s.card,
          ...(selected === id ? s.cardActive : {}),
          ...(hovered && selected !== id ? s.cardHover : {}),
          transition: 'all 0.25s ease'
        }}>
        <div style={s.cardTop}>
          <div style={s.avatar}>{name[0].toUpperCase()}</div>
          <div>
            <div style={s.name}>{name}</div>
            <div style={s.email}>{email}</div>
          </div>
        </div>
        <div style={s.statsRow}>
          <span style={s.statBadge}>📝 {totalInterviews} interviews</span>
          {avgScore !== null ? (
            <span style={{ ...s.statBadge, color: scoreColor(avgScore), fontWeight: '700' }}>
              Avg: {avgScore}/100
            </span>
          ) : (
            <span style={{ ...s.statBadge, color: '#334155' }}>No interviews</span>
          )}
          {!isShortlistCard && st.bestScore !== null && (
            <span style={{ ...s.statBadge, color: scoreColor(st.bestScore) }}>
              Best: {st.bestScore}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Tab Button with hover
  const TabBtn = ({ label, value }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { setTab(value); setSelected(null); }}
        style={{
          ...s.tab,
          ...(tab === value ? s.tabActive : {}),
          ...(hovered && tab !== value ? s.tabHover : {}),
          transition: 'all 0.2s ease'
        }}>
        {label}
      </button>
    );
  };

  // Score Filter Button with hover
  const ScoreBtn = ({ score }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setMinScore(score)}
        style={{
          ...s.scoreBtn,
          ...(minScore === score ? s.scoreBtnActive : {}),
          ...(hovered && minScore !== score ? s.scoreBtnHover : {}),
          transition: 'all 0.2s ease'
        }}>
        {score === 0 ? 'All' : `${score}+`}
      </button>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Recruiter Portal 🏢</h1>
          <p style={s.subtitle}>Welcome, {user?.name}</p>
        </div>
        <button
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          onClick={logout}
          style={{
            ...s.logoutBtn,
            ...(logoutHover ? s.logoutBtnHover : {}),
            transition: 'all 0.2s ease'
          }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <TabBtn label={`All Students (${filteredStudents.length})`} value="students" />
        <TabBtn label={`Shortlisted ⭐ (${shortlisted.length})`} value="shortlisted" />

        {tab === 'students' && (
          <div style={s.filterRow}>
            <span style={s.filterLabel}>Min Score:</span>
            <div style={s.scoreButtons}>
              {[0, 50, 60, 70, 80, 90].map(score => (
                <ScoreBtn key={score} score={score} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={s.body}>
        {/* Left Panel */}
        <div style={s.list}>
          {loading && <p style={{ color: '#475569', padding: '1rem' }}>Loading...</p>}

          {tab === 'students' && !loading && filteredStudents.length === 0 && (
            <p style={{ color: '#475569', padding: '1rem', fontSize: '0.85rem' }}>
              {minScore > 0 ? `Koi student nahi ${minScore}+ score ke saath` : 'Koi student nahi'}
            </p>
          )}

          {tab === 'students' && !loading && filteredStudents.map(st => (
            <StudentCard key={st._id} st={st} />
          ))}

          {tab === 'shortlisted' && shortlisted.map(s => (
            <StudentCard key={s._id} st={s} isShortlistCard={true} />
          ))}

          {tab === 'shortlisted' && shortlisted.length === 0 && (
            <p style={{ color: '#475569', padding: '1rem', fontSize: '0.85rem' }}>
              No shortlisted students yet.
            </p>
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
            <p style={{ color: '#475569', padding: '2rem' }}>Loading profile...</p>
          )}

          {detail && !detailLoading && (
            <div>
              {/* Student Header */}
              <div style={s.detailHeader}>
                <div style={s.detailTop} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ ...s.avatar, width: '52px', height: '52px', fontSize: '1.3rem' }}>
                    {detail.student.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.1rem', fontWeight: '600' }}>
                      {detail.student.name}
                    </h2>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>
                      {detail.student.email}
                    </p>
                  </div>
                </div>

                {/* Shortlist Button with hover */}
                <button
                  onMouseEnter={() => setShortlistHover(true)}
                  onMouseLeave={() => setShortlistHover(false)}
                  onClick={() => toggleShortlist(detail.student._id)}
                  disabled={shortlistLoading}
                  style={{
                    padding: '0.55rem 1.1rem',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: shortlistLoading ? 'not-allowed' : 'pointer',
                    opacity: shortlistLoading ? 0.7 : 1,
                    background: detail.isShortlisted
                      ? 'rgba(251,191,36,0.15)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: detail.isShortlisted ? '#fbbf24' : '#fff',
                    border: detail.isShortlisted
                      ? '1px solid rgba(251,191,36,0.3)'
                      : 'none',
                    transform: shortlistHover ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: shortlistHover
                      ? detail.isShortlisted
                        ? '0 8px 20px rgba(251,191,36,0.2)'
                        : '0 8px 25px rgba(99,102,241,0.5)'
                      : detail.isShortlisted
                        ? 'none'
                        : '0 4px 15px rgba(99,102,241,0.3)',
                    transition: 'all 0.25s ease'
                  }}>
                  {shortlistLoading ? 'Saving...' : detail.isShortlisted ? '⭐ Shortlisted' : '+ Shortlist'}
                </button>
              </div>

              {/* Interview History */}
              <h3 style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' }}>
                Interview History ({detail.interviews.length})
              </h3>

              {detail.interviews.length === 0 && (
                <p style={{ color: '#475569' }}>No completed interviews yet.</p>
              )}

              {detail.interviews.map(iv => (
                <IvCard key={iv._id} iv={iv} scoreColor={scoreColor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Interview card with hover
const IvCard = ({ iv, scoreColor }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
        border: hovered ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.25s ease'
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '0.9rem' }}>{iv.role}</span>
        <span style={{ fontWeight: '700', color: scoreColor(iv.feedback?.score), fontSize: '1.1rem' }}>
          {iv.feedback?.score}/100
        </span>
      </div>
      <p style={{ color: '#334155', fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
        {iv.domain} · {iv.difficulty} · {new Date(iv.createdAt).toLocaleDateString()}
      </p>
      {iv.feedback?.strengths && (
        <div style={{ marginBottom: '0.25rem' }}>
          <span style={{ color: '#4ade80', fontWeight: '600', fontSize: '0.82rem' }}>✅ </span>
          <span style={{ color: '#475569', fontSize: '0.82rem' }}>{iv.feedback.strengths.join(', ')}</span>
        </div>
      )}
      {iv.feedback?.improvements && (
        <div style={{ marginBottom: '0.25rem' }}>
          <span style={{ color: '#fbbf24', fontWeight: '600', fontSize: '0.82rem' }}>⚠️ </span>
          <span style={{ color: '#475569', fontSize: '0.82rem' }}>{iv.feedback.improvements.join(', ')}</span>
        </div>
      )}
      {iv.feedback?.summary && (
        <p style={{ color: '#334155', fontSize: '0.82rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
          "{iv.feedback.summary}"
        </p>
      )}
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)', fontFamily: "'Inter', sans-serif", position: 'relative' },
  orb1: { position: 'fixed', top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', bottom: '-100px', right: '-100px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 },
  title: { margin: 0, background: 'linear-gradient(135deg, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1rem', fontWeight: '700' },
  subtitle: { margin: 0, color: '#475569', fontSize: '0.8rem' },
  logoutBtn: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' },
  logoutBtnHover: { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', transform: 'translateY(-1px)', boxShadow: '0 4px 15px rgba(239,68,68,0.2)' },
  tabs: { display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 5 },
  tab: { padding: '0.45rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontWeight: '500', color: '#475569', fontSize: '0.85rem' },
  tabActive: { background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' },
  tabHover: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', transform: 'translateY(-1px)' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' },
  filterLabel: { color: '#475569', fontSize: '0.82rem', fontWeight: '500', whiteSpace: 'nowrap' },
  scoreButtons: { display: 'flex', gap: '0.4rem' },
  scoreBtn: { padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', color: '#475569' },
  scoreBtnActive: { background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' },
  scoreBtnHover: { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', transform: 'translateY(-1px)' },
  body: { display: 'flex', height: 'calc(100vh - 105px)', position: 'relative', zIndex: 5 },
  list: { width: '360px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', padding: '0.75rem' },
  card: { padding: '0.9rem 1rem', borderRadius: '12px', marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' },
  cardActive: { border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.1)' },
  cardHover: { border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)', transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #6366f1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
  name: { fontWeight: '600', color: '#e2e8f0', fontSize: '0.88rem' },
  email: { color: '#334155', fontSize: '0.75rem' },
  statsRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  statBadge: { fontSize: '0.72rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', padding: '2px 8px', borderRadius: '20px' },
  detail: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  emptyDetail: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.95rem' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.1rem 1.25rem', borderRadius: '14px', position: 'relative', overflow: 'hidden' },
  detailTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' },
};