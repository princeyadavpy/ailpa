import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, Search, Hash, Database, Layers, CheckCircle, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import { simulateSimilarIncidents } from '../data/sampleData';

const SEARCH_PHASES = [
  {
    id: 'semantic',
    label: 'Semantic Vector Search',
    icon: Layers,
    color: 'var(--accent-cyan)',
    desc: 'Embedding similarity search across 538 indexed incidents using cosine distance',
    steps: [
      'Encoding query fingerprint to 768-dim vector…',
      'Running ANN search via FAISS index…',
      'Scoring cosine similarity…',
      'Retrieved 12 semantic candidates',
    ],
    results: 12,
    duration: 2400,
  },
  {
    id: 'keyword',
    label: 'Keyword Matching',
    icon: Hash,
    color: 'var(--accent-indigo)',
    desc: 'BM25 keyword search on error messages, commands, and technical terms',
    steps: [
      'Tokenizing error signature keywords…',
      'BM25 scoring across error corpus…',
      'Matching command patterns…',
      'Retrieved 8 keyword candidates',
    ],
    results: 8,
    duration: 1600,
  },
  {
    id: 'metadata',
    label: 'Metadata Matching',
    icon: Database,
    color: 'var(--accent-violet)',
    desc: 'Exact filtering on node, environment, software version, and MOP step',
    steps: [
      'Applying node filter: Node-07…',
      'Matching environment: Production…',
      'Filtering software version: v2.3.x…',
      'Retrieved 5 metadata candidates',
    ],
    results: 5,
    duration: 1200,
  },
];

export default function RAGSearch() {
  const navigate = useNavigate();
  const toast = useToast();
  const { fingerprint, setSimilarIncidents, setInvestigationStep } = useApp();

  const [phase, setPhase] = useState(-1); // -1: idle, 0/1/2: running phase, 3: merging, 4: done
  const [phaseStep, setPhaseStep] = useState(-1);
  const [phaseDone, setPhaseDone] = useState([false, false, false]);
  const [merging, setMerging] = useState(false);
  const [done, setDone] = useState(false);

  const runSearch = () => {
    if (!fingerprint) {
      toast('error', 'No Fingerprint', 'Please complete fingerprint generation first.');
      return;
    }
    let p = 0;
    const runPhase = () => {
      if (p >= SEARCH_PHASES.length) {
        setPhase(3);
        setMerging(true);
        setTimeout(() => {
          const results = simulateSimilarIncidents(fingerprint);
          setSimilarIncidents(results);
          setInvestigationStep(3);
          setMerging(false);
          setDone(true);
          toast('success', 'Search Complete', '3 highly relevant historical incidents identified.');
        }, 1500);
        return;
      }
      setPhase(p);
      const steps = SEARCH_PHASES[p].steps;
      let s = 0;
      const stepInterval = setInterval(() => {
        setPhaseStep(s);
        s++;
        if (s >= steps.length) {
          clearInterval(stepInterval);
          setPhaseDone(prev => { const n = [...prev]; n[p] = true; return n; });
          setTimeout(() => { p++; setPhaseStep(-1); runPhase(); }, 300);
        }
      }, SEARCH_PHASES[p].duration / steps.length);
    };
    runPhase();
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Hybrid RAG Search</h2>
        <p>Multi-strategy retrieval combining semantic, keyword, and metadata search</p>
      </div>

      {!fingerprint && (
        <div className="alert alert-warning">
          <AlertCircle size={16} className="alert-icon" />
          <div>
            <div className="alert-title">Fingerprint Required</div>
            <div className="alert-body">Complete the AI fingerprinting step before running search.</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/fingerprint')}>
              Go to Fingerprinting
            </button>
          </div>
        </div>
      )}

      {fingerprint && (
        <>
          {/* Architecture Diagram */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Retrieval Architecture</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(56,189,248,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 4 }}>QUERY</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Incident Fingerprint</div>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
              <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: 4 }}>3 SEARCHES</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Semantic + Keyword + Metadata</div>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
              <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(139,92,246,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-violet)', marginBottom: 4 }}>MERGE</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RRF Re-ranking</div>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
              <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 4 }}>RESULTS</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ranked Incidents</div>
              </div>
            </div>
          </div>

          {/* Search Phase Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {SEARCH_PHASES.map((sp, i) => {
              const Icon = sp.icon;
              const isActive = phase === i && !phaseDone[i];
              const isDone = phaseDone[i];
              const isPending = phase < i && !isDone;

              return (
                <div key={sp.id} className="card" style={{
                  borderColor: isDone ? `rgba(16,185,129,0.3)` : isActive ? sp.color.replace('var(--', 'rgba(').replace(')', ',0.3)') : 'var(--border-subtle)',
                  opacity: isPending ? 0.6 : 1,
                  transition: 'var(--transition-slow)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 'var(--radius-md)', flexShrink: 0,
                      background: isDone ? 'rgba(16,185,129,0.15)' : `rgba(${sp.color.includes('cyan') ? '56,189,248' : sp.color.includes('indigo') ? '99,102,241' : '139,92,246'},0.12)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isDone ? <CheckCircle size={18} color="var(--accent-emerald)" /> : <Icon size={18} color={sp.color} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{sp.label}</span>
                        {isDone && <span className="badge badge-emerald">{sp.results} candidates</span>}
                        {isActive && <span className="badge badge-amber">Running…</span>}
                        {isPending && <span className="badge badge-gray">Pending</span>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sp.desc}</p>

                      {(isActive || isDone) && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {sp.steps.map((step, si) => {
                            const stepStatus = isDone ? 'done' : si <= phaseStep ? si < phaseStep ? 'done' : 'active' : 'pending';
                            return (
                              <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, opacity: stepStatus === 'pending' ? 0.4 : 1 }}>
                                <div style={{
                                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                                  background: stepStatus === 'done' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${stepStatus === 'done' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7
                                }}>
                                  {stepStatus === 'done' ? '✓' : ''}
                                </div>
                                <span style={{ color: stepStatus === 'active' ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Merge Phase */}
          {(merging || done) && (
            <div className="card" style={{ marginBottom: 20, borderColor: done ? 'rgba(16,185,129,0.3)' : 'rgba(56,189,248,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {done
                  ? <CheckCircle size={20} color="var(--accent-emerald)" />
                  : <div className="spinner" />}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {done ? 'Results Merged & Ranked' : 'Merging results via Reciprocal Rank Fusion…'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {done ? '3 high-relevance incidents identified from 25 total candidates' : 'De-duplicating and scoring across all three result sets…'}
                  </div>
                </div>
                {done && <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>Complete</span>}
              </div>
            </div>
          )}

          {/* Action */}
          <div style={{ display: 'flex', gap: 12 }}>
            {phase === -1 && !done && (
              <button className="btn btn-primary btn-lg" onClick={runSearch} style={{ flex: 1 }}>
                <Search size={16} /> Run Hybrid RAG Search
              </button>
            )}
            {done && (
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/similar-incidents')} style={{ flex: 1 }}>
                View Similar Incidents <ChevronRight size={14} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
