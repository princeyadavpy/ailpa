import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Database, FilePlus2, Brain,
  GitMerge, Lightbulb, CheckSquare, BookOpen, Zap, ChevronRight,
  MessageSquare, Home
} from 'lucide-react';
import { getAIStatus } from '../services/aiService';

const NAV_ITEMS = [
  { group: 'Overview', items: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  ]},
  { group: 'Data & Knowledge', items: [
    { path: '/ingestion', icon: Upload, label: 'Data Ingestion' },
    { path: '/knowledge-base', icon: Database, label: 'Knowledge Base' },
  ]},
  { group: 'Investigation', items: [
    { path: '/new-incident', icon: FilePlus2, label: 'New Incident', badge: '!' },
    { path: '/fingerprint', icon: Brain, label: 'AI Fingerprint' },
    { path: '/rag-search', icon: GitMerge, label: 'Hybrid RAG Search' },
    { path: '/similar-incidents', icon: GitMerge, label: 'Similar Incidents' },
    { path: '/recommendation', icon: Lightbulb, label: 'AI Recommendation' },
  ]},
  { group: 'Resolution', items: [
    { path: '/validation', icon: CheckSquare, label: 'Validation & Action' },
    { path: '/learning', icon: BookOpen, label: 'Learning History' },
  ]},
  { group: 'AI Assistant', items: [
    { path: '/ai-chat', icon: MessageSquare, label: 'AI Chat', badge: 'AI' },
  ]},
];

export default function Sidebar() {
  const location = useLocation();
  const aiStatus = getAIStatus();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={18} color="white" />
        </div>
        <h1>AILPA</h1>
        <p>AI Incident Intelligence Platform</p>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Home size={10} /> Back to Landing
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(section => (
          <div key={section.group}>
            <div className="nav-section-label">{section.group}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = item.end
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  end={item.end}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          background: aiStatus.isOnline
            ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))'
            : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.04))',
          border: `1px solid ${aiStatus.isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div className="pulse-dot" style={{ background: aiStatus.statusColor }} />
            <span style={{ color: aiStatus.statusColor, fontWeight: 600 }}>
              {aiStatus.isOnline ? 'Online Mode' : 'Offline Mode'}
            </span>
          </div>
          <div style={{ fontSize: 10 }}>{aiStatus.statusLabel}</div>
        </div>
      </div>
    </aside>
  );
}
