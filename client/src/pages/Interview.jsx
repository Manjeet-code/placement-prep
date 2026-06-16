import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const COMPANIES = [
  { value: '', label: '🌐 General' },
  { value: 'google', label: '🔵 Google' },
  { value: 'amazon', label: '🟠 Amazon' },
  { value: 'microsoft', label: '🔷 Microsoft' },
  { value: 'meta', label: '🔵 Meta' },
  { value: 'apple', label: '⚫ Apple' },
  { value: 'flipkart', label: '🟡 Flipkart' },
  { value: 'swiggy', label: '🟠 Swiggy' },
  { value: 'zomato', label: '🔴 Zomato' },
  { value: 'razorpay', label: '🔵 Razorpay' },
  { value: 'cred', label: '⚫ CRED' },
  { value: 'meesho', label: '🟣 Meesho' },
  { value: 'tcs', label: '🔵 TCS' },
  { value: 'infosys', label: '🔷 Infosys' },
  { value: 'wipro', label: '🟢 Wipro' },
  { value: 'accenture', label: '🟣 Accenture' },
  { value: 'cognizant', label: '🔵 Cognizant' },
  { value: 'mckinsey', label: '🔵 McKinsey' },
  { value: 'deloitte', label: '🟢 Deloitte' },
  { value: 'goldman_sachs', label: '🔵 Goldman Sachs' },
  { value: 'jp_morgan', label: '🔷 JP Morgan' },
  { value: 'salesforce', label: '🔵 Salesforce' },
  { value: 'adobe', label: '🔴 Adobe' },
  { value: 'ibm', label: '🔵 IBM' },
  { value: 'oracle', label: '🔴 Oracle' },
];

const ROUNDS = [
  { value: 'technical', label: '💻 Technical' },
  { value: 'system_design', label: '🏗️ System Design' },
  { value: 'hr', label: '🤝 HR Round' },
];

export default function Interview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [stage, setStage] = useState('setup');
  const [form, setForm] = useState({ role: '', difficulty: 'medium', domain: 'General', company: '', round: 'technical' });
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [exchanges, setExchanges] = useState(0);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/interview/start', form);
      setInterviewId(res.data.interviewId);
      setMessages([{ role: 'assistant', content: res.data.message }]);
      setStage('interview');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start interview');
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await API.post('/interview/message', { interviewId, userMessage: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      setExchanges(res.data.totalExchanges);
    } catch (err) { alert('Failed to send message'); }
    finally { setLoading(false); }
  };

  const handleEnd = async () => {
    if (!window.confirm('End the interview and get feedback?')) return;
    setLoading(true);
    try {
      const res = await API.post('/interview/end', { interviewId });
      setFeedback(res.data.feedback);
      setStage('feedback');
    } catch (err) { alert('Failed to generate feedback'); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const selectedCompany = COMPANIES.find(c => c.value === form.company);
  const scoreColor = (score) => score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';

  const DiffBtn = ({ label, value, form, setForm }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = form.difficulty === value;
  return (
    <button type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setForm({ ...form, difficulty: value })}
      style={{
        ...s.diffBtn,
        ...(isActive ? s.diffActive : {}),
        ...(hovered && !isActive ? s.diffBtnHover : {}),
        transition: 'all 0.2s ease'
      }}>
      {label}
    </button>
  );
};

  // SETUP
  if (stage === 'setup') return (
    <div style={s.page}>
      <div style={s.orb1} /><div style={s.orb2} />
      <div style={s.setupCard}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Back</button>
        <h2 style={s.title}>Start Mock Interview</h2>
        <p style={s.subtitle}>Configure your session</p>
        <form onSubmit={handleStart}>
          <label style={s.label}>Job Role</label>
          <input style={s.input} placeholder="e.g. Frontend Developer, Data Analyst"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />

          <label style={s.label}>Target Company</label>
          <select style={s.input} value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}>
            {COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <label style={s.label}>Interview Round</label>
          <div style={s.diffRow}>
            {ROUNDS.map(r => (
              <button type="button" key={r.value}
                onClick={() => setForm({ ...form, round: r.value })}
                style={{ ...s.diffBtn, ...(form.round === r.value ? s.diffActive : {}) }}>
                {r.label}
              </button>
            ))}
          </div>

          {!form.company && (
            <>
              <label style={s.label}>Domain</label>
              <select style={s.input} value={form.domain}
                onChange={e => setForm({ ...form, domain: e.target.value })}>
                {['General', 'DSA', 'React', 'Node.js', 'System Design', 'HR & Behavioral', 'Python', 'Database & SQL'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </>
          )}

          <label style={s.label}>Difficulty</label>
          <div style={s.diffRow}>
            {['easy', 'medium', 'hard'].map(d => (
              <button type="button" key={d}
                onClick={() => setForm({ ...form, difficulty: d })}
                style={{ ...s.diffBtn, ...(form.difficulty === d ? s.diffActive : {}) }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <button type="submit" style={s.startBtn} disabled={loading}>
            <span style={s.btnShine} />
            {loading ? 'Starting...' : `🎤 Start ${selectedCompany?.label || 'General'} Interview`}
          </button>
        </form>
      </div>
    </div>
  );

  // FEEDBACK
  if (stage === 'feedback') return (
    <div style={s.page}>
      <div style={s.orb1} /><div style={s.orb2} />
      <div style={{ ...s.setupCard, maxWidth: '580px' }}>
        <h2 style={s.title}>Interview Feedback</h2>
        {form.company && (
          <p style={{ color: '#a78bfa', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            {selectedCompany?.label} — {form.round} round
          </p>
        )}

        <div style={s.scoreCircle}>
          <span style={s.scoreNum}>{feedback.score}</span>
          <span style={s.scoreLabel}>/ 100</span>
        </div>

        <div style={s.feedSection}>
          <h3 style={{ color: '#4ade80', marginBottom: '0.5rem', fontSize: '0.95rem' }}>✅ Strengths</h3>
          {feedback.strengths.map((item, i) => (
            <div key={i} style={s.feedItem}>• {item}</div>
          ))}
        </div>

        <div style={s.feedSection}>
          <h3 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '0.95rem' }}>⚠️ Improve</h3>
          {feedback.improvements.map((item, i) => (
            <div key={i} style={s.feedItem}>• {item}</div>
          ))}
        </div>

        <div style={s.feedSection}>
          <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem', fontSize: '0.95rem' }}>📝 Summary</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.88rem' }}>{feedback.summary}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/dashboard')} style={s.startBtn}>
            <span style={s.btnShine} />Back to Dashboard
          </button>
          <button onClick={() => { setStage('setup'); setMessages([]); setFeedback(null); }}
            style={{ ...s.startBtn, background: 'rgba(99,102,241,0.2)', boxShadow: 'none', border: '1px solid rgba(99,102,241,0.3)' }}>
            New Interview
          </button>
        </div>
      </div>
    </div>
  );

  // CHAT
  return (
    <div style={s.chatPage}>
      <div style={s.orb1} /><div style={s.orb2} />
      <div style={s.chatHeader}>
        <div>
          <span style={s.chatTitle}>
            🎤 {form.company ? `${selectedCompany?.label} — ` : ''}{form.role}
          </span>
          <span style={s.chatMeta}> · {form.round} · {form.difficulty}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={s.exchangeBadge}>{exchanges} exchanges</span>
          <button onClick={handleEnd} style={s.endBtn} disabled={loading}>
            End & Feedback
          </button>
        </div>
      </div>

      <div style={s.chatBody}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
            {msg.role === 'assistant' && <div style={s.avatar}>AI</div>}
            <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.userBubble : s.aiBubble) }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{ ...s.avatar, background: 'linear-gradient(135deg, #4c1d95, #6366f1)', marginLeft: '0.5rem', marginRight: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <div style={s.avatar}>AI</div>
            <div style={{ ...s.bubble, ...s.aiBubble, color: '#334155' }}>Typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputRow}>
        <textarea style={s.chatInput} rows={2}
          placeholder="Type your answer... (Enter to send)"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} disabled={loading} />
        <button onClick={handleSend} style={s.sendBtn} disabled={loading || !input.trim()}>
          <span style={s.btnShine} />
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' },
  orb1: { position: 'fixed', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
  setupCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '480px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' },
  feedbackCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '580px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' },
  backBtn: { background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.88rem', padding: 0, marginBottom: '1.25rem', fontWeight: '500' },
  title: { margin: '0 0 0.25rem', fontSize: '1.5rem', color: '#f1f5f9', fontWeight: '700', letterSpacing: '-0.5px' },
  subtitle: { color: '#475569', marginBottom: '1.5rem', fontSize: '0.88rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontWeight: '500', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '0.75rem 1rem', marginBottom: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0' },
  diffRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  diffBtn: { flex: 1, padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontWeight: '500', color: '#475569', fontSize: '0.85rem' },
  diffActive: { background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.35)' },
  startBtn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', boxShadow: '0 8px 25px rgba(99,102,241,0.4)', position: 'relative', overflow: 'hidden' },
  scoreCircle: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #6366f1)', border: '2px solid rgba(99,102,241,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 1.5rem', boxShadow: '0 0 40px rgba(99,102,241,0.3)' },
  scoreNum: { fontSize: '2.2rem', fontWeight: '700', color: '#a78bfa' },
  scoreLabel: { fontSize: '0.78rem', color: '#6b7280' },
  feedSection: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem' },
  feedItem: { color: '#94a3b8', margin: '0.35rem 0', lineHeight: 1.5, fontSize: '0.88rem' },
  chatPage: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' },
  chatTitle: { fontWeight: '600', fontSize: '1rem', color: '#e2e8f0' },
  chatMeta: { color: '#475569', fontSize: '0.82rem' },
  exchangeBadge: { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a78bfa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '500' },
  endBtn: { padding: '0.45rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.82rem' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #6366f1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.78rem', marginRight: '0.5rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
  bubble: { maxWidth: '70%', padding: '0.85rem 1.1rem', borderRadius: '16px', fontSize: '0.9rem', lineHeight: 1.6 },
  aiBubble: { background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.07)', borderTopLeftRadius: '4px' },
  userBubble: { background: 'linear-gradient(135deg, #4c1d95, #6366f1)', color: '#e9d5ff', borderTopRightRadius: '4px', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' },
  inputRow: { display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' },
  chatInput: { flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem', resize: 'none', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0' },
  sendBtn: { padding: '0 1.1rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' },
  diffBtnHover: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', transform: 'translateY(-1px)' },
};


const styles = { feedItem: { color: '#94a3b8', margin: '0.4rem 0', lineHeight: 1.5, fontSize: '0.88rem' } };