import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Cpu, Hash, Server, Tag, Key, ChevronRight, AlertCircle, Zap, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import { generateFingerprint } from '../data/sampleData';

const ANALYSIS_STEPS = [
  { label: 'Tokenizing error description…', duration: 600 },
  { label: 'Extracting error signature patterns…', duration: 700 },
  { label: 'Identifying command signatures…', duration: 500 },
  { label: 'Resolving node & environment context…', duration: 500 },
  { label: 'Extracting technical keywords…', duration: 600 },
  { label: 'Computing semantic embedding vector…', duration: 800 },
  { label: 'Fingerprint generation complete ✓', duration: 400 },
];

export default function FingerprintPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { activeIncident, setFingerprint, fingerprint, setInvestigationStep } = useApp();

  const [analyzing, setAnalyzing] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [done, setDone] = useState(!!fingerprint);

  useEffect(() => {
    if (!activeIncident && !fingerprint) return;
    if (fingerprint) { setDone(true); return; }
    startAnalysis();
  }, [activeIncident]);

  const startAnalysis = () => {
    if (!activeIncident) {
      toast('error', 'No Incident', 'Please submit an incident first.');
      return;
    }
    setAnalyzing(true);
    setStepIdx(0);
    let i = 0;
    const run = () => {
      if (i >= ANALYSIS_STEPS.length) {
        const fp = generateFingerprint(activeIncident);
        setFingerprint(fp);
        setInvestigationStep(2);
        setAnalyzing(false);
        setDone(true);
        toast('success', 'Fingerprint Generated', 'Technical signature extracted. Ready for hybrid search.');
        return;
      }
      setStepIdx(i);
      setTimeout(() => { i++; run(); }, ANALYSIS_STEPS[i]?.duration || 500);
    };
    run();
  };

  const fp = fingerprint;
  const keywords = fp?.keywords || [];
  const vector = fp?.semanticVector || [];

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>AI Technical Fingerprinting</h2>
        <p>Automated extraction of the incident's technical signature for precise retrieval</p>
      </div>

      {!activeIncident && !fingerprint && (
        <div className="alert alert-warning">
          <AlertCircle size={16} className="alert-icon" />
          <div>
            <div className="alert-title">No Active Incident</div>
            <div className="alert-body">Please submit a new incident first to generate a fingerprint.</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/new-incident')}>
              Go to New Incident
            </button>
          </div>
        </div>
      )}

      {/* Incident summary bar */}
      {activeIncident && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={18} color="var(--accent-rose)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="incident-id">{activeIncident.id}</span>
                <span className="badge badge-amber">Under Investigation</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{activeIncident.errorMessage}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['Node', activeIncident.node], ['Env', activeIncident.environment], ['Version', activeIncident.softwareVersion]].filter(([, v]) => v).map(([l, v]) => (
                  <span key={l} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>{l}: {v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          {/* Analysis Progress */}
          {(analyzing || !done) && activeIncident && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={15} color="var(--accent-violet)" /> AI Analysis In Progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ANALYSIS_STEPS.map((step, i) => {
                  const status = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'pending';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: status === 'pending' ? 0.3 : 1 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: status === 'done' ? 'rgba(16,185,129,0.2)' : status === 'active' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${status === 'done' ? 'var(--accent-emerald)' : status === 'active' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                        animation: status === 'active' ? 'pulse-border 2s infinite' : 'none'
                      }}>
                        {status === 'done' ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 12, color: status === 'active' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fingerprint Result */}
          {done && fp && (
            <div className="card card-glow fade-in">
              <div className="card-header">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={16} color="var(--accent-violet)" /> Generated Technical Fingerprint
                </div>
                <div className="ai-badge">
                  <Zap size={11} /> AI Generated
                </div>
              </div>

              <div className="fingerprint-grid" style={{ marginBottom: 20 }}>
                {[
                  { key: 'Error Signature', val: fp.errorSignature, icon: Hash },
                  { key: 'Command Signature', val: fp.commandSignature, icon: Terminal },
                  { key: 'Node :: Version', val: fp.nodeVersion, icon: Server },
                  { key: 'MOP Step Context', val: fp.mopStep, icon: Key },
                  { key: 'Analysis Confidence', val: `${(fp.confidence * 100).toFixed(0)}%`, icon: Cpu },
                  { key: 'Generated At', val: new Date(fp.analysisTimestamp).toLocaleTimeString(), icon: Zap },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="fingerprint-item">
                      <div className="fingerprint-key" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon size={10} /> {item.key}
                      </div>
                      <div className="fingerprint-val">{item.val}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="rec-section-title"><Tag size={11} /> Technical Keywords</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {keywords.length > 0 ? keywords.map(kw => (
                    <span key={kw} className="tag-chip">{kw}</span>
                  )) : (
                    ['timeout', 'connection', 'restart', 'systemctl', 'service', 'node-07'].map(kw => (
                      <span key={kw} className="tag-chip">{kw}</span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div className="rec-section-title"><BarChart2 size={11} /> Semantic Embedding Vector (Simplified)</div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 50, padding: '0 4px' }}>
                  {(vector.length > 0 ? vector : Array.from({ length: 12 }, () => Math.random() * 2 - 1)).map((v, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 2, minHeight: 4,
                      height: `${Math.abs(v) * 45 + 5}px`,
                      background: v > 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                      opacity: 0.7
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  768-dimensional embedding (visualized as simplified bars) — positive dims in cyan, negative in violet
                </div>
              </div>

              <div className="disclaimer">
                <strong>Transparency:</strong> This fingerprint was generated by AI analysis of the submitted incident text. 
                It is used for retrieval purposes only and may not perfectly represent the root cause. 
                Engineer judgment is required for all diagnostic decisions.
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => navigate('/rag-search')}>
                  Proceed to Hybrid RAG Search <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {!done && !analyzing && activeIncident && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <button className="btn btn-primary btn-lg" onClick={startAnalysis}>
                <Brain size={16} /> Generate Fingerprint
              </button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>What is a Fingerprint?</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              A <strong style={{ color: 'var(--text-secondary)' }}>technical fingerprint</strong> is a structured, machine-readable representation of an incident extracted from unstructured text.
              <br /><br />
              It enables the AI to perform <strong style={{ color: 'var(--accent-cyan)' }}>precise hybrid retrieval</strong> by combining:
              <ul style={{ marginTop: 8, marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Semantic vector similarity</li>
                <li>Exact error signature matching</li>
                <li>Metadata filtering (node, env, version)</li>
                <li>Command pattern matching</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Fingerprint Components</div>
            {[
              { label: 'Error Signature', desc: 'Normalized error pattern' },
              { label: 'Command Signature', desc: 'Commands that triggered the issue' },
              { label: 'Node::Version', desc: 'Infrastructure context' },
              { label: 'MOP Step', desc: 'Operational procedure context' },
              { label: 'Keywords', desc: 'Technical keyword set' },
              { label: 'Vector', desc: '768-dim semantic embedding' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{c.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Terminal({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>; }
