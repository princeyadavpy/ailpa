import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb, ChevronRight, AlertCircle, CheckCircle, Zap,
  BookOpen, Shield, ExternalLink, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import { generateRecommendation } from '../data/sampleData';

const GEN_STEPS = [
  'Analyzing retrieved historical incidents…',
  'Extracting common root cause patterns…',
  'Cross-referencing verified learnings…',
  'Synthesizing resolution strategy…',
  'Validating evidence consistency…',
  'Generating confidence assessment…',
  'Recommendation ready ✓',
];

export default function Recommendation() {
  const navigate = useNavigate();
  const toast = useToast();
  const { similarIncidents, recommendation, setRecommendation, setInvestigationStep } = useApp();

  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [done, setDone] = useState(!!recommendation);

  useEffect(() => {
    if (recommendation) { setDone(true); return; }
    if (similarIncidents.length > 0 && !generating && !done) {
      startGeneration();
    }
  }, [similarIncidents]);

  const startGeneration = () => {
    if (similarIncidents.length === 0) {
      toast('error', 'No Evidence', 'Run the similarity search first.');
      return;
    }
    setGenerating(true);
    setStepIdx(0);
    let i = 0;
    const run = () => {
      if (i >= GEN_STEPS.length) {
        const rec = generateRecommendation(similarIncidents);
        setRecommendation(rec);
        setInvestigationStep(4);
        setGenerating(false);
        setDone(true);
        toast('success', 'Recommendation Generated', 'AI evidence-based recommendation ready for engineer review.');
        return;
      }
      setStepIdx(i);
      setTimeout(() => { i++; run(); }, 600);
    };
    run();
  };

  const rec = recommendation;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>AI Recommendation Engine</h2>
        <p>Evidence-based root cause analysis and resolution strategy generated from historical incidents</p>
      </div>

      {!similarIncidents.length && !rec && (
        <div className="alert alert-warning">
          <AlertCircle size={16} className="alert-icon" />
          <div>
            <div className="alert-title">No Evidence Available</div>
            <div className="alert-body">Complete the similarity search to provide evidence for the recommendation.</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/rag-search')}>
              Run Search
            </button>
          </div>
        </div>
      )}

      {(generating || !done) && similarIncidents.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-glow)' }}>
          <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={15} color="var(--accent-amber)" /> Generating AI Recommendation…
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GEN_STEPS.map((step, i) => {
              const status = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'pending';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: status === 'pending' ? 0.3 : 1 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: status === 'done' ? 'rgba(16,185,129,0.2)' : status === 'active' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${status === 'done' ? 'var(--accent-emerald)' : status === 'active' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700
                  }}>
                    {status === 'done' ? '✓' : status === 'active' ? '…' : ''}
                  </div>
                  <span style={{ fontSize: 12, color: status === 'active' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="progress-bar">
              <div className="progress-fill gradient" style={{ width: `${Math.round(((stepIdx + 1) / GEN_STEPS.length) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {done && rec && (
        <div className="fade-in">
          {/* Critical Disclaimer */}
          <div className="disclaimer" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Shield size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent-amber)' }} />
            <div>
              <strong>IMPORTANT – AI-Generated Recommendation:</strong> {rec.disclaimer}
            </div>
          </div>

          {/* Evidence Level */}
          <div className="evidence-bar" style={{ marginBottom: 20 }}>
            <span className={`evidence-level ${rec.evidenceLevel}`}>{rec.evidenceLevel} EVIDENCE</span>
            <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
            <div style={{ flex: 1, maxWidth: 140 }}>
              <div className="progress-bar">
                <div className="progress-fill gradient" style={{ width: `${Math.round(rec.confidenceLevel * 100)}%` }} />
              </div>
            </div>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {Math.round(rec.confidenceLevel * 100)}%
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              Based on {similarIncidents.length} historical incidents
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={15} color="var(--accent-rose)" /> Suggested Root Cause
                  </span>
                  <div className="ai-badge"><Zap size={11} /> AI Inference</div>
                </div>
                <div className="rec-content" dangerouslySetInnerHTML={{ __html: rec.suggestedRootCause.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={15} color="var(--accent-emerald)" /> Verified Learning (from INC-203)
                  </span>
                  <span className="badge badge-emerald">Verified Historical</span>
                </div>
                <div className="rec-content">{rec.verifiedLearning}</div>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={15} color="var(--accent-cyan)" /> Proposed Resolution Steps
                  </span>
                  <div className="ai-badge"><Zap size={11} /> AI Generated</div>
                </div>
                <ol className="rec-steps">
                  {rec.proposedResolution.map((step, i) => (
                    <li key={i} className="rec-step">
                      <div className="rec-step-num">{i + 1}</div>
                      <div className="rec-step-cmd">{step}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Evidence Sources</div>
                {similarIncidents.map((inc, i) => (
                  <div key={inc.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                    borderBottom: i < similarIncidents.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'var(--accent-emerald)' : i === 1 ? 'var(--accent-amber)' : 'var(--accent-rose)'
                    }} />
                    <div style={{ flex: 1 }}>
                      <span className="incident-id" style={{ fontSize: 11 }}>{inc.id}</span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{inc.title?.substring(0, 45)}…</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {Math.round(inc.relevanceScore * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>MOP Reference</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <ExternalLink size={12} color="var(--accent-indigo)" />
                  <span style={{ fontSize: 12, color: 'var(--accent-indigo)' }}>{rec.mopReference}</span>
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={13} /> Recommendation Transparency
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Every element of this recommendation is:
                  <ul style={{ marginTop: 6, marginLeft: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <li>Sourced from verified historical incidents</li>
                    <li>Clearly labeled as AI-generated vs. verified</li>
                    <li>Linked to specific evidence</li>
                    <li>Subject to engineer validation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => navigate('/validation')}>
              Proceed to Engineer Validation <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
