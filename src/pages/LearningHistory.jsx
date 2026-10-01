import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Search, Eye, TrendingUp, Zap, Star, Clock, User
} from 'lucide-react';
import { LEARNING_HISTORY, HISTORICAL_INCIDENTS } from '../data/sampleData';
import { useApp } from '../context/AppContext';

const CONF_COLOR = (c) => c >= 95 ? 'var(--accent-emerald)' : c >= 85 ? 'var(--accent-amber)' : 'var(--accent-rose)';

export default function LearningHistory() {
  const navigate = useNavigate();
  const { resolvedIncidents } = useApp();
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState(null);

  // Combine static learnings with newly added ones from demo
  const newLearnings = resolvedIncidents.map((inc, i) => ({
    id: `LRN-NEW-${i + 1}`,
    incidentId: inc.id,
    addedDate: inc.incidentDate,
    category: 'Service Management',
    summary: `Validated resolution for: ${inc.title?.substring(0, 60) || inc.errorDescription?.substring(0, 60) || 'Incident'}`,
    confidence: Math.floor(Math.random() * 10) + 88,
    _new: true,
    incident: inc,
  }));

  const allLearnings = [...newLearnings, ...LEARNING_HISTORY];

  const filtered = allLearnings.filter(l =>
    !query || [l.id, l.incidentId, l.category, l.summary].some(f => f?.toLowerCase().includes(query.toLowerCase()))
  );

  const selectedDetail = detailId ? filtered.find(l => l.id === detailId) : null;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Continuous Learning History</h2>
        <p>Every resolved incident becomes organizational knowledge — tracking {allLearnings.length} validated learnings</p>
      </div>

      {/* Stats Row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Learnings', value: allLearnings.length, color: 'cyan' },
          { label: 'Added This Session', value: newLearnings.length, color: 'emerald' },
          { label: 'Avg Confidence', value: `${Math.round(allLearnings.reduce((s, l) => s + l.confidence, 0) / allLearnings.length)}%`, color: 'indigo' },
          { label: 'Categories', value: [...new Set(allLearnings.map(l => l.category))].length, color: 'violet' },
        ].map(s => (
          <div key={s.label} className={`kpi-card ${s.color}`}>
            <div className="kpi-value" style={{ fontSize: 24 }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* New Learning Banner */}
      {newLearnings.length > 0 && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <CheckCircle size={16} className="alert-icon" />
          <div>
            <div className="alert-title">🎉 New Learning Added This Session</div>
            <div className="alert-body">
              {newLearnings.length} new incident(s) validated during this demo session have been added to the knowledge base and are now searchable.
              Try submitting the same scenario again — the AI will now retrieve this newly learned incident in its search results.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/knowledge-base')}>
                Browse Knowledge Base
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/new-incident')}>
                Submit Similar Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Learning Explained */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={15} color="var(--accent-cyan)" /> How the Learning Loop Works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { step: '1', label: 'Incident Submitted', color: 'var(--accent-rose)' },
            { step: '2', label: 'AI Investigates', color: 'var(--accent-violet)' },
            { step: '3', label: 'Engineer Validates', color: 'var(--accent-amber)' },
            { step: '4', label: 'Resolution Recorded', color: 'var(--accent-cyan)' },
            { step: '5', label: 'Knowledge Indexed', color: 'var(--accent-emerald)' },
          ].map((s, i) => (
            <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', border: `2px solid ${s.color}`,
                background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', fontSize: 13, fontWeight: 700, color: s.color
              }}>{s.step}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{s.label}</div>
              {i < 4 && <div style={{ position: 'absolute', right: -5, top: 16, fontSize: 16, color: 'var(--text-muted)' }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={14} />
          <input placeholder="Search learnings by category, incident ID, or keyword…"
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {/* Learnings Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Validated Learnings</span>
            <span className="badge badge-cyan">{filtered.length} records</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Learning ID</th>
                  <th>Incident</th>
                  <th>Category</th>
                  <th>Summary</th>
                  <th>Confidence</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} onClick={() => setDetailId(l.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {l._new && <span className="badge badge-emerald" style={{ fontSize: 8 }}>NEW</span>}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)' }}>{l.id}</span>
                      </div>
                    </td>
                    <td><span className="incident-id" style={{ fontSize: 11 }}>{l.incidentId}</span></td>
                    <td><span className="badge badge-indigo">{l.category}</span></td>
                    <td style={{ maxWidth: 220, fontSize: 11 }}>{l.summary}</td>
                    <td>
                      <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 60 }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${l.confidence}%`, background: CONF_COLOR(l.confidence) }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: CONF_COLOR(l.confidence), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{l.confidence}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 11 }}>{l.addedDate}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm"><Eye size={11} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div>
          {selectedDetail ? (
            <div className="card fade-in">
              <div className="card-header">
                <span className="card-title">Learning Detail</span>
                {selectedDetail._new && <span className="badge badge-emerald">New</span>}
              </div>
              <div>
                {[
                  ['Learning ID', selectedDetail.id, 'mono'],
                  ['Incident ID', selectedDetail.incidentId, 'mono'],
                  ['Category', selectedDetail.category, ''],
                  ['Date Added', selectedDetail.addedDate, ''],
                  ['Confidence', `${selectedDetail.confidence}%`, 'mono'],
                ].map(([l, v, c]) => (
                  <div key={l} className="info-row">
                    <span className="info-label">{l}</span>
                    <span className={`info-value ${c}`}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16 }}>
                  <div className="rec-section-title"><BookOpen size={11} /> Summary</div>
                  <div className="rec-content">{selectedDetail.summary}</div>
                </div>
                {selectedDetail.incident && (
                  <div style={{ marginTop: 14 }}>
                    <div className="rec-section-title"><CheckCircle size={11} /> Validated Resolution</div>
                    <div className="code-block" style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
                      {selectedDetail.incident.previousResolution}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <BookOpen size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click a learning to view details</div>
            </div>
          )}

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-title" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} color="var(--accent-cyan)" /> Platform Impact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Mean Resolution Time', before: '4.2 hrs', after: '47 min', icon: Clock },
                { label: 'Recurring Incidents', before: '38%', after: '7%', icon: TrendingUp },
                { label: 'Avg Recommendation Accuracy', before: '—', after: '87%', icon: Star },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <Icon size={13} color="var(--accent-cyan)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: 6 }}>{m.before}</span>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>→ {m.after}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
