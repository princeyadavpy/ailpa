import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Tag, Calendar, Server, SortAsc, X } from 'lucide-react';
import { HISTORICAL_INCIDENTS } from '../data/sampleData';
import { useApp } from '../context/AppContext';

const ENVS = ['All', 'Production', 'Staging', 'Development'];
const CATS = ['All', 'Service Management', 'Database', 'Deployment', 'Memory', 'Security'];

function IncidentDetailModal({ incident, onClose }) {
  if (!incident) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="incident-id">{incident.id}</span>
            <div className="modal-title" style={{ marginTop: 4 }}>{incident.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-emerald">{incident.status}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          {/* Meta Row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              [Server, incident.node],
              [Calendar, incident.incidentDate],
              [Tag, incident.softwareVersion],
            ].map(([Icon, val]) => (
              <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
                <Icon size={11} />{val}
              </div>
            ))}
            <span className="badge badge-cyan">{incident.mopReference}</span>
          </div>

          {[
            { title: '🔴 Error Description', content: incident.errorDescription, mono: false },
            { title: '🔑 Error Signature', content: incident.errorSignature, mono: true },
            { title: '🎯 Root Cause', content: incident.rootCause, mono: false },
            { title: '✅ Verified Learning', content: incident.verifiedLearning, mono: false },
            { title: '🔧 Previous Resolution', content: incident.previousResolution, mono: true },
          ].map(section => (
            <div key={section.title} className="rec-section">
              <div className="rec-section-title">{section.title}</div>
              <div className={section.mono ? 'code-block' : 'rec-content'} style={{ whiteSpace: 'pre-wrap' }}>
                {section.content}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14 }}>
            <div className="rec-section-title">🏷️ Tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {incident.tags.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            {[
              ['Resolved By', incident.resolvedBy],
              ['Resolution Time', incident.resolutionTime],
              ['Environment', incident.environment],
              ['MOP Reference', incident.mopReference],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const { resolvedIncidents } = useApp();
  const [query, setQuery] = useState('');
  const [envFilter, setEnvFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const allIncidents = useMemo(() => [...resolvedIncidents, ...HISTORICAL_INCIDENTS], [resolvedIncidents]);

  const filtered = useMemo(() => {
    return allIncidents.filter(inc => {
      const matchQ = !query || [inc.title, inc.errorDescription, inc.rootCause, inc.id, ...inc.tags]
        .some(f => f?.toLowerCase().includes(query.toLowerCase()));
      const matchEnv = envFilter === 'All' || inc.environment === envFilter;
      return matchQ && matchEnv;
    });
  }, [allIncidents, query, envFilter]);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Central Knowledge Base</h2>
        <p>Searchable repository of {allIncidents.length} incidents with semantic vector indexing</p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
          <Search size={14} />
          <input placeholder="Search incidents, errors, root causes, tags…" value={query}
            onChange={e => setQuery(e.target.value)} />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ENVS.map(e => (
            <button key={e} onClick={() => setEnvFilter(e)}
              className={`btn btn-sm ${envFilter === e ? 'btn-primary' : 'btn-secondary'}`}>
              {e}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} of {allIncidents.length} incidents
        </div>
      </div>

      {/* Vector Index Status */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <Server size={16} className="alert-icon" />
        <div>
          <div className="alert-title">Semantic Vector Index Active</div>
          <div className="alert-body">
            {allIncidents.length} incidents indexed with 768-dimensional embeddings using simulated FAISS vector store. 
            Hybrid retrieval combines semantic similarity, keyword matching, and metadata filtering.
            {resolvedIncidents.length > 0 && ` · ${resolvedIncidents.length} new learning(s) indexed from demo session.`}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Title / Error</th>
                <th>Node</th>
                <th>Root Cause (Summary)</th>
                <th>MOP Ref</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id + inc.incidentDate}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {inc._new && <span className="badge badge-emerald" style={{ fontSize: 8 }}>NEW</span>}
                      <span className="incident-id">{inc.id}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 12, marginBottom: 3 }}>{inc.title || inc.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{inc.errorDescription}</div>
                  </td>
                  <td><span className="badge badge-gray"><Server size={9} /> {inc.node}</span></td>
                  <td style={{ maxWidth: 200, fontSize: 11, color: 'var(--text-muted)' }}>
                    {inc.rootCause?.substring(0, 80)}…
                  </td>
                  <td><span className="badge badge-cyan">{inc.mopReference}</span></td>
                  <td style={{ fontSize: 11 }}>{inc.incidentDate}</td>
                  <td>
                    <span className={`badge ${inc.status === 'Resolved' ? 'badge-emerald' : 'badge-amber'}`}>{inc.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(inc)}>
                      <Eye size={11} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No incidents found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
