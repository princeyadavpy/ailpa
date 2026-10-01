import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';

const PAGE_META = {
  '/dashboard': { title: 'Overview Dashboard', subtitle: 'AI Incident Intelligence Platform' },
  '/ingestion': { title: 'Historical Data Ingestion', subtitle: 'Module 1 – Upload & manage incident data sources' },
  '/knowledge-base': { title: 'Central Knowledge Base', subtitle: 'Module 2 – Searchable incident repository with semantic indexing' },
  '/new-incident': { title: 'New Incident Submission', subtitle: 'Module 3 – Submit a new incident for AI investigation' },
  '/fingerprint': { title: 'AI Technical Fingerprinting', subtitle: 'Module 4 – Extract technical signature from incident details' },
  '/rag-search': { title: 'Hybrid RAG Search', subtitle: 'Module 5 – Semantic + keyword + metadata retrieval' },
  '/similar-incidents': { title: 'Similar Past Incidents', subtitle: 'Module 6 – Ranked historical matches with relevance scores' },
  '/recommendation': { title: 'AI Recommendation Engine', subtitle: 'Module 7 – Evidence-based root cause & resolution recommendations' },
  '/validation': { title: 'Engineer Validation & Action', subtitle: 'Module 8 – Review, validate, and document resolution' },
  '/learning': { title: 'Continuous Learning History', subtitle: 'Module 9 – Knowledge base update log and learning records' },
  '/ai-chat': { title: 'AI Assistant', subtitle: 'Chat with AILPA – Ask about incidents, root causes, or resolutions' },
};

export default function Topbar() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || PAGE_META['/'];

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{meta.title}</div>
        <div className="topbar-subtitle">{meta.subtitle}</div>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-badge">
        <div className="pulse-dot" />
        System Online
      </div>

      <button style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        width: 34, height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-muted)',
        transition: 'var(--transition)'
      }}>
        <Bell size={15} />
      </button>

      <div style={{
        width: 32, height: 32,
        background: 'var(--gradient-accent)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer'
      }}>
        <User size={14} color="white" />
      </div>
    </header>
  );
}
