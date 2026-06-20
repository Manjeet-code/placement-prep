import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#4ade80', '#fbbf24', '#f87171', '#60a5fa'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [companyPopularity, setCompanyPopularity] = useState([]);
  const [domainPopularity, setDomainPopularity] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recruiterActivity, setRecruiterActivity] = useState([]);
  const [companySuccess, setCompanySuccess] = useState([]);

useEffect(() => {
  const fetchAll = async () => {
    try {
      const [ov, sd, dt, cp, dp, ts, ra, cs] = await Promise.all([
        API.get('/admin/overview'),
        API.get('/admin/score-distribution'),
        API.get('/admin/daily-trend'),
        API.get('/admin/company-popularity'),
        API.get('/admin/domain-popularity'),
        API.get('/admin/top-students'),
        API.get('/admin/recruiter-activity'),
        API.get('/admin/company-success-rate')
      ]);
      setOverview(ov.data);
      setScoreDistribution(sd.data);
      setDailyTrend(dt.data);
      setCompanyPopularity(cp.data);
      setDomainPopularity(dp.data);
      setTopStudents(ts.data);
      setRecruiterActivity(ra.data);
      setCompanySuccess(cs.data);
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchAll();
}, []);

  if (loading) return (
    <div style={s.page}>
      <p style={{ color: '#475569', padding: '2rem' }}>Loading analytics...</p>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📊 Admin Analytics</h1>
          <p style={s.subtitle}>Welcome, {user?.name}</p>
        </div>
        <button onClick={logout} style={s.logoutBtn}>Logout</button>
      </div>

      <div style={s.body}>
        {/* Overview Stats */}
        <div style={s.statsGrid}>
          <StatCard label="Total Students" val={overview.totalStudents} color="linear-gradient(135deg, #a78bfa, #6366f1)" />
          <StatCard label="Total Recruiters" val={overview.totalRecruiters} color="linear-gradient(135deg, #60a5fa, #3b82f6)" />
          <StatCard label="Total Interviews" val={overview.totalInterviews} color="linear-gradient(135deg, #34d399, #10b981)" />
          <StatCard label="Completed" val={overview.completedInterviews} color="linear-gradient(135deg, #fbbf24, #f59e0b)" />
          <StatCard label="Platform Avg Score" val={overview.avgScore} color="linear-gradient(135deg, #f87171, #ef4444)" />
          <StatCard label="Total Shortlists" val={overview.totalShortlists} color="linear-gradient(135deg, #f472b6, #ec4899)" />
        </div>

        {/* Charts Row 1 */}
        <div style={s.chartsRow}>
          <ChartCard title="Score Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={s.tooltip} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Interviews — Last 7 Days">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={s.tooltip} />
                <Line type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div style={s.chartsRow}>
          <ChartCard title="Most Popular Companies">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={companyPopularity} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#475569" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="company" type="category" stroke="#475569" fontSize={11} width={80} />
                <Tooltip contentStyle={s.tooltip} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Domain Popularity">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={domainPopularity}
                  dataKey="count"
                  nameKey="domain"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  label={({ domain, percent }) => `${domain} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {domainPopularity.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={s.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Top Students */}
        <ChartCard title="🏆 Top 5 Students">
          <div style={s.topList}>
            {topStudents.map((st, i) => (
              <div key={i} style={s.topRow}>
                <div style={s.topRank}>#{i + 1}</div>
                <div style={s.topAvatar}>{st.name[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.topName}>{st.name}</div>
                  <div style={s.topEmail}>{st.email}</div>
                </div>
                <div style={s.topStats}>
                  <span style={s.topScore}>{st.avgScore}/100</span>
                  <span style={s.topCount}>{st.totalInterviews} interviews</span>
                </div>
              </div>
            ))}
            {topStudents.length === 0 && (
              <p style={{ color: '#475569', textAlign: 'center' }}>No data yet</p>
            )}
          </div>
        </ChartCard>
        {/* Recruiter Activity */}
<ChartCard title="🏢 Recruiter Activity">
  <div style={s.topList}>
    {recruiterActivity.map((rec, i) => (
      <div key={i} style={s.recRow}>
        <div style={s.topAvatar}>{rec.name[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={s.topName}>{rec.name}</div>
          <div style={s.topEmail}>{rec.email}</div>
        </div>
        <div style={s.recStats}>
          <span style={s.recShortlist}>⭐ {rec.shortlistCount} shortlisted</span>
          <span style={s.recDate}>
            Last active: {new Date(rec.lastActive).toLocaleDateString()}
          </span>
        </div>
      </div>
    ))}
    {recruiterActivity.length === 0 && (
      <p style={{ color: '#475569', textAlign: 'center' }}>No recruiters yet</p>
    )}
  </div>
</ChartCard>

{/* Company Success Rate */}
<ChartCard title="🎯 Company-wise Success Rate">
  <ResponsiveContainer width="100%" height={Math.max(240, companySuccess.length * 40)}>
    <BarChart data={companySuccess} layout="vertical" margin={{ left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
      <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={11} />
      <YAxis dataKey="company" type="category" stroke="#475569" fontSize={11} width={90} />
      <Tooltip
        contentStyle={s.tooltip}
        formatter={(value, name) => [`${value}${name === 'avgScore' ? '/100' : '%'}`, name === 'avgScore' ? 'Avg Score' : 'Success Rate']}
      />
      <Bar dataKey="avgScore" fill="#6366f1" radius={[0, 6, 6, 0]} name="avgScore" />
    </BarChart>
  </ResponsiveContainer>

  <div style={s.successTable}>
    {companySuccess.map((c, i) => (
      <div key={i} style={s.successRow}>
        <span style={s.successCompany}>{c.company.toUpperCase()}</span>
        <div style={s.successStats}>
          <span style={s.successAvg}>Avg: {c.avgScore}/100</span>
          <span style={{
            ...s.successRate,
            color: c.successRate >= 60 ? '#4ade80' : c.successRate >= 30 ? '#fbbf24' : '#f87171'
          }}>
            {c.successRate}% pass rate
          </span>
          <span style={s.successAttempts}>{c.totalAttempts} attempts</span>
        </div>
      </div>
    ))}
    {companySuccess.length === 0 && (
      <p style={{ color: '#475569', textAlign: 'center' }}>No company data yet</p>
    )}
  </div>
</ChartCard>
      </div>
    </div>
  );
}

const StatCard = ({ label, val, color }) => (
  <div style={s.statCard}>
    <div style={s.statTop} />
    <div style={s.statLabel}>{label}</div>
    <div style={{ ...s.statVal, background: color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {val}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={s.chartCard}>
    <div style={s.chartTop} />
    <h3 style={s.chartTitle}>{title}</h3>
    {children}
  </div>
);

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)', fontFamily: "'Inter', sans-serif", position: 'relative' },
  orb1: { position: 'fixed', top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', bottom: '-100px', right: '-100px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 },
  title: { margin: 0, background: 'linear-gradient(135deg, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.2rem', fontWeight: '700' },
  subtitle: { margin: '0.25rem 0 0', color: '#475569', fontSize: '0.85rem' },
  logoutBtn: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
  body: { padding: '1.5rem 1.75rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1rem 1.1rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  statTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' },
  statLabel: { color: '#475569', fontSize: '0.68rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: '500' },
  statVal: { fontSize: '1.6rem', fontWeight: '700' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  chartCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: '1rem' },
  chartTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' },
  chartTitle: { color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' },
  tooltip: { background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' },
  topList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  topRow: { display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem 1rem' },
  topRank: { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.78rem', flexShrink: 0 },
  topAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #6366f1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem', flexShrink: 0 },
  topName: { color: '#e2e8f0', fontWeight: '600', fontSize: '0.88rem' },
  topEmail: { color: '#334155', fontSize: '0.75rem' },
  topStats: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
  topScore: { color: '#4ade80', fontWeight: '700', fontSize: '0.95rem' },
  topCount: { color: '#475569', fontSize: '0.72rem' },
  recRow: { display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem 1rem' },
recStats: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' },
recShortlist: { color: '#a78bfa', fontWeight: '600', fontSize: '0.82rem' },
recDate: { color: '#475569', fontSize: '0.72rem' },
successTable: { marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
successRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 0.9rem' },
successCompany: { color: '#e2e8f0', fontWeight: '600', fontSize: '0.82rem' },
successStats: { display: 'flex', gap: '1rem', alignItems: 'center' },
successAvg: { color: '#a78bfa', fontSize: '0.78rem', fontWeight: '500' },
successRate: { fontSize: '0.78rem', fontWeight: '600' },
successAttempts: { color: '#475569', fontSize: '0.75rem' },
};