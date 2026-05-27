import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Interview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [stage, setStage] = useState('setup'); // setup | interview | feedback
  const [form, setForm] = useState({ role: '', difficulty: 'medium', domain: 'General' });
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [exchanges, setExchanges] = useState(0);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post('/interview/message', {
        interviewId,
        userMessage: userMsg
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      setExchanges(res.data.totalExchanges);
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('End the interview and get feedback?')) return;
    setLoading(true);
    try {
      const res = await API.post('/interview/end', { interviewId });
      setFeedback(res.data.feedback);
      setStage('feedback');
    } catch (err) {
      alert('Failed to generate feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── SETUP SCREEN ──
  if (stage === 'setup') return (
    <div style={s.page}>
      <div style={s.setupCard}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Back</button>
        <h2 style={s.title}>Start Mock Interview</h2>
        <p style={s.subtitle}>Configure your interview session</p>

        <form onSubmit={handleStart}>
          <label style={s.label}>Job Role</label>
          <input style={s.input} placeholder="e.g. Frontend Developer, Data Analyst"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />

          <label style={s.label}>Domain / Focus Area</label>
          <select style={s.input} value={form.domain}
            onChange={e => setForm({ ...form, domain: e.target.value })}>
            <option>General</option>
            <option>DSA</option>
            <option>React</option>
            <option>Node.js</option>
            <option>System Design</option>
            <option>HR & Behavioral</option>
            <option>Python</option>
            <option>Database & SQL</option>
          </select>

          <label style={s.label}>Difficulty</label>
          <div style={s.diffRow}>
            {['easy', 'medium', 'hard'].map(d => (
              <button type="button" key={d} onClick={() => setForm({ ...form, difficulty: d })}
                style={{ ...s.diffBtn, ...(form.difficulty === d ? s.diffActive : {}) }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <button type="submit" style={s.startBtn} disabled={loading}>
            {loading ? 'Starting...' : '🎤 Start Interview'}
          </button>
        </form>
      </div>
    </div>
  );

  // ── FEEDBACK SCREEN ──
  if (stage === 'feedback') return (
    <div style={s.page}>
      <div style={s.feedbackCard}>
        <h2 style={s.title}>Interview Feedback</h2>

        {/* Score circle */}
        <div style={s.scoreCircle}>
          <span style={s.scoreNum}>{feedback.score}</span>
          <span style={s.scoreLabel}>/ 100</span>
        </div>

        <div style={s.feedSection}>
          <h3 style={{ color: '#22c55e' }}>✅ Strengths</h3>
          {feedback.strengths.map((s, i) => (
            <div key={i} style={styles.feedItem}>• {s}</div>
          ))}
        </div>

        <div style={s.feedSection}>
          <h3 style={{ color: '#f59e0b' }}>⚠️ Areas to Improve</h3>
          {feedback.improvements.map((s, i) => (
            <div key={i} style={styles.feedItem}>• {s}</div>
          ))}
        </div>

        <div style={s.feedSection}>
          <h3 style={{ color: '#6366f1' }}>📝 Summary</h3>
          <p style={{ color: '#444', lineHeight: 1.6 }}>{feedback.summary}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/dashboard')} style={s.startBtn}>
            Back to Dashboard
          </button>
          <button onClick={() => { setStage('setup'); setMessages([]); setFeedback(null); }}
            style={{ ...s.startBtn, background: '#6366f1' }}>
            New Interview
          </button>
        </div>
      </div>
    </div>
  );

  // ── CHAT SCREEN ──
  return (
    <div style={s.chatPage}>
      {/* Header */}
      <div style={s.chatHeader}>
        <div>
          <span style={s.chatTitle}>🎤 {form.role} Interview</span>
          <span style={s.chatMeta}> · {form.domain} · {form.difficulty}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={s.exchangeBadge}>{exchanges} exchanges</span>
          <button onClick={handleEnd} style={s.endBtn} disabled={loading}>
            End & Get Feedback
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={s.chatBody}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
            {msg.role === 'assistant' && (
              <div style={s.avatar}>AI</div>
            )}
            <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.userBubble : s.aiBubble) }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{ ...s.avatar, background: '#6366f1', marginLeft: '0.5rem', marginRight: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <div style={s.avatar}>AI</div>
            <div style={{ ...s.bubble, ...s.aiBubble, color: '#999' }}>Typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
            <div style={s.inputRow}>
        <textarea style={s.chatInput} rows={2}
          placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} disabled={loading} />
        <button onClick={handleSend} style={s.sendBtn} disabled={loading || !input.trim()}>
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}

// Styles
const s = {
  page: { minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  setupCard: { background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '480px' },
  feedbackCard: { background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '580px' },
  backBtn: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.95rem', padding: 0, marginBottom: '1rem' },
  title: { margin: '0 0 0.25rem', fontSize: '1.6rem', color: '#1a1a2e' },
  subtitle: { color: '#888', marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem 1rem', marginBottom: '1.2rem', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
  diffRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  diffBtn: { flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontWeight: '500', color: '#555' },
  diffActive: { background: '#6366f1', color: '#fff', border: '1.5px solid #6366f1' },
  startBtn: { width: '100%', padding: '0.85rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  scoreCircle: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 1.5rem' },
  scoreNum: { fontSize: '2.2rem', fontWeight: '700', color: '#fff' },
  scoreLabel: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' },
  feedSection: { background: '#f9f9f9', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  feedItem: { color: '#444', margin: '0.4rem 0', lineHeight: 1.5 },
  chatPage: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f4ff' },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chatTitle: { fontWeight: '700', fontSize: '1.1rem', color: '#1a1a2e' },
  chatMeta: { color: '#888', fontSize: '0.9rem' },
  exchangeBadge: { background: '#f0f4ff', color: '#6366f1', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  endBtn: { padding: '0.5rem 1.25rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', marginRight: '0.5rem', flexShrink: 0 },
  bubble: { maxWidth: '70%', padding: '0.85rem 1.1rem', borderRadius: '16px', fontSize: '0.95rem', lineHeight: 1.6 },
  aiBubble: { background: '#fff', color: '#1a1a2e', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTopLeftRadius: '4px' },
  userBubble: { background: '#6366f1', color: '#fff', borderTopRightRadius: '4px' },
  inputRow: { display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' },
  chatInput: { flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '0.95rem', resize: 'none', outline: 'none', fontFamily: 'inherit' },
  sendBtn: { padding: '0 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.3rem', cursor: 'pointer' },
};

const styles = { feedItem: { color: '#444', margin: '0.4rem 0', lineHeight: 1.5 } };

