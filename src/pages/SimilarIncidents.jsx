import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitMerge, ChevronRight, CheckCircle, AlertCircle, Eye, Tag, Server, Calendar, Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import { simulateSimilarIncidents } from '../data/sampleData';

function RelevanceBadge({ score }) {
  if (score >= 0.9) return <span className="badge badge-emerald">⬤ High Relevance</span>;
  if (score >= 0.7) return <span className="badge badge-amber">⬤ Medium Relevance</span>;
  return <span className="badge badge-rose">⬤ Low Relevance</span>;
}

function ScoreRing({ score }) {
  const pct = Math.round(score * 100);
  const cls = pct >= 90 ? 'high' : pct >= 70 ? 'medium' : 'low';
  return <div className={`score-ring ${cls}`}>{pct}%</div>;
}

function IncidentModal({ incident, onClose }) {
  if (!incident) return null;
  const score = Math.round(incident.relevanceScore * 100);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="incident-id">{incident.id}</span>
              <RelevanceBadge score={incident.relevanceScore} />
              <span className="badge badge-emerald">{incident.status}</span>
            </div>
            <div className="modal-title">{incident.title}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Match Reasons */}
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            <Target size={16} className="alert-icon" />
            <div>
              <div className="alert-title">Why this incident matched ({score}% relevance)</div>
              <ul style={{ marginTop: 6, marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {incident.matchReasons?.map(r => (
                  <li key={r} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {[
            { title: '🔴 Original Error', content: incident.errorDescription, mono: false },
            { title: '🎯 Root Cause', content: incident.rootCause, mono: false },
            { title: '✅ Verified Learning', content: incident.verifiedLearning, mono: false },
            { title: '🔧 Previous Resolution', content: incident.previousResolution, mono: true },
          ].map(s => (
            <div key={s.title} className="rec-section">
              <div className="rec-section-title">{s.title}</div>
              <div className={s.mono ? 'code-block' : 'rec-content'} style={{ whiteSpace: 'pre-wrap' }}>{s.content}</div>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
            {[['Node', incident.node], ['Environment', incident.environment], ['Version', incident.softwareVersion],
              ['Date', incident.incidentDate], ['Resolved By', incident.resolvedBy], ['MOP', incident.mopReference]].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimilarIncidents() {
  const navigate = useNavigate();
  const toast = useToast();
  const { similarIncidents, fingerprint, setSimilarIncidents, setInvestigationStep, setRecommendation } = useApp();
  const [selected, setSelected] = useState(null);
  const [chosenSources, setChosenSources] = useState([]);

  const incidents = similarIncidents.length > 0 ? similarIncidents : [];

  const toggleSource = (id) => {
    setChosenSources(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const proceed = () => {
    navigate('/recommendation');
    toast('info', 'Generating Recommendation', 'AI is synthesizing evidence from historical incidents…');
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Similar Past Incidents</h2>
        <p>Ranked historical incidents retrieved via Hybrid RAG — ordered by combined relevance score</p>
      </div>

      {incidents.length === 0 && (
        <div className="alert alert-warning">
          <AlertCircle size={16} className="alert-icon" />
          <div>
            <div className="alert-title">No Search Results</div>
            <div className="alert-body">Please complete the Hybrid RAG Search step first.</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/rag-search')}>
              Run Search
            </button>
          </div>
        </div>
      )}

      {incidents.length > 0 && (
        <>
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle size={16} className="alert-icon" />
            <div>
              <div className="alert-title">{incidents.length} Similar Incidents Found</div>
              <div className="alert-body">
                Retrieved via Hybrid RAG (semantic + keyword + metadata). Results ranked by Reciprocal Rank Fusion (RRF) score.
                Click any incident to view full details. Select sources to include in the AI recommendation.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {incidents.map((inc, rank) => (
              <div
                key={inc.id}
                className={`incident-card ${chosenSources.includes(inc.id) ? 'selected' : ''}`}
                style={{ cursor: 'default' }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Rank & Score */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>#{rank + 1}</div>
                    <ScoreRing score={inc.relevanceScore} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="incident-id">{inc.id}</span>
                      <RelevanceBadge score={inc.relevanceScore} />
                      <span className="badge badge-gray">{inc.environment}</span>
                    </div>

                    <div className="incident-title">{inc.title}</div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
                      {inc.errorDescription}
                    </div>

                    {/* Match Reasons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {inc.matchReasons?.map(r => (
                        <span key={r} style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 12,
                          background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
                          color: 'var(--accent-cyan)'
                        }}>
                          <Target size={9} style={{ display: 'inline', marginRight: 3 }} />{r}
                        </span>
                      ))}
                    </div>

                    {/* Summary Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                      {[
                        { label: 'Root Cause', val: inc.rootCause?.substring(0, 70) + '…' },
                        { label: 'Previous Resolution', val: inc.previousResolution?.split('\n')[0] },
                        { label: 'Verified Learning', val: inc.verifiedLearning?.substring(0, 70) + '…' },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Meta + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                          [Server, inc.node],
                          [Calendar, inc.incidentDate],
                          [Tag, inc.mopReference],
                        ].map(([Icon, val]) => (
                          <span key={val} style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Icon size={10} />{val}
                          </span>
                        ))}
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <button
                          className={`btn btn-sm ${chosenSources.includes(inc.id) ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleSource(inc.id)}
                        >
                          {chosenSources.includes(inc.id) ? <><CheckCircle size={11} /> Selected</> : 'Select as Source'}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(inc)}>
                          <Eye size={11} /> Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)' }}>
              {chosenSources.length > 0
                ? `${chosenSources.length} incident(s) selected as evidence sources`
                : 'Select incidents to include in the recommendation (optional)'}
            </div>
            <button className="btn btn-primary btn-lg" onClick={proceed}>
              Generate AI Recommendation <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}

      <IncidentModal incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
