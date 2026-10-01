import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Database, Brain, CheckSquare, BookOpen, TrendingUp, Zap,
  ArrowRight, Clock, AlertCircle, CheckCircle, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_STATS, RECENT_ACTIVITY, LEARNING_HISTORY, HISTORICAL_INCIDENTS } from '../data/sampleData';
import { useApp } from '../context/AppContext';

const AREA_DATA = [
  { month: 'May', incidents: 38, resolved: 35, learned: 31 },
  { month: 'Jun', incidents: 52, resolved: 49, learned: 44 },
  { month: 'Jul', incidents: 41, resolved: 40, learned: 37 },
  { month: 'Aug', incidents: 67, resolved: 63, learned: 59 },
  { month: 'Sep', incidents: 49, resolved: 47, learned: 45 },
  { month: 'Oct', incidents: 74, resolved: 71, learned: 68 },
];

const CATEGORY_DATA = [
  { name: 'Service Mgmt', value: 38, color: '#38bdf8' },
  { name: 'Database', value: 22, color: '#6366f1' },
  { name: 'Deployment', value: 18, color: '#8b5cf6' },
  { name: 'Memory', value: 14, color: '#10b981' },
  { name: 'Security', value: 8, color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const KPICard = ({ label, value, icon: Icon, color, delta }) => (
  <div className={`kpi-card ${color}`}>
    <div className={`kpi-icon ${color}`}><Icon size={18} /></div>
    <div className="kpi-value">{value.toLocaleString()}</div>
    <div className="kpi-label">{label}</div>
    {delta && <div className={`kpi-delta up`}>↑ {delta}</div>}
  </div>
);

const ActivityIcon = ({ type }) => {
  const map = {
    learning: { icon: BookOpen, color: 'var(--accent-violet)' },
    resolved: { icon: CheckCircle, color: 'var(--accent-emerald)' },
    validated: { icon: CheckSquare, color: 'var(--accent-cyan)' },
    update: { icon: Database, color: 'var(--accent-indigo)' },
    submitted: { icon: AlertCircle, color: 'var(--accent-amber)' },
  };
  const { icon: Icon, color } = map[type] || map['submitted'];
  return <Icon size={14} color={color} />;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { resolvedIncidents } = useApp();
  const [animated, setAnimated] = useState(false);

  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const stats = { ...DASHBOARD_STATS, newLearningsAdded: DASHBOARD_STATS.newLearningsAdded + resolvedIncidents.length };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Platform Overview</h2>
        <p>Real-time intelligence metrics and system health for the AI Incident Prevention Platform</p>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard label="Total Historical Incidents" value={stats.totalHistoricalIncidents} icon={Database} color="cyan" delta="+8 this week" />
        <KPICard label="Indexed Incidents" value={stats.indexedIncidents} icon={Brain} color="indigo" delta="99.4% indexed" />
        <KPICard label="Investigations Run" value={stats.newIncidentsInvestigated} icon={Activity} color="violet" delta="+3 today" />
        <KPICard label="Similar Incidents Found" value={stats.similarIncidentsFound} icon={TrendingUp} color="emerald" delta="87% match rate" />
        <KPICard label="Recommendations Validated" value={stats.recommendationsValidated} icon={CheckSquare} color="amber" />
        <KPICard label="New Learnings Added" value={stats.newLearningsAdded} icon={BookOpen} color="rose" delta={`+${resolvedIncidents.length} demo`} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Incident Trends (Last 6 Months)</span>
            <span className="badge badge-cyan">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={AREA_DATA} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lrnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="incidents" stroke="#38bdf8" fill="url(#incGrad)" strokeWidth={2} name="Incidents" />
              <Area type="monotone" dataKey="resolved" stroke="#6366f1" fill="url(#resGrad)" strokeWidth={2} name="Resolved" />
              <Area type="monotone" dataKey="learned" stroke="#10b981" fill="url(#lrnGrad)" strokeWidth={2} name="Learned" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {[['Incidents', '#38bdf8'], ['Resolved', '#6366f1'], ['Learned', '#10b981']].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 3, borderRadius: 2, background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Incident Categories</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {CATEGORY_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {CATEGORY_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <span className="badge badge-gray">Live Feed</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...RECENT_ACTIVITY].map(act => (
              <div key={act.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition)', cursor: 'default'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <ActivityIcon type={act.type} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{act.action}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{act.incident} · {act.user}</div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                  <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{act.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Submit New Incident', path: '/new-incident', color: 'var(--gradient-accent)', desc: 'Start AI-powered investigation' },
              { label: 'Browse Knowledge Base', path: '/knowledge-base', color: 'var(--gradient-primary)', desc: 'Search historical incidents' },
              { label: 'View AI Recommendations', path: '/recommendation', color: 'var(--gradient-success)', desc: 'Review pending recommendations' },
              { label: 'Learning History', path: '/learning', color: 'var(--gradient-warning)', desc: 'Track validated learnings' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left', width: '100%'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{ width: 8, height: 40, borderRadius: 4, background: a.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
