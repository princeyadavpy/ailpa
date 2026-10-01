import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Brain, Database, CheckCircle, ArrowRight, Play,
  Server, Clock, AlertTriangle, BookOpen, GitMerge,
  Shield, TrendingUp, Sparkles, ChevronRight, Wifi, WifiOff,
  Terminal, Activity, BarChart2, Lock
} from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';
import { getAIStatus } from '../services/aiService';

// ─── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [to]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

// ─── Timeline step animation ───────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { icon: AlertTriangle, label: 'Incident Submitted', desc: 'Engineer reports error', color: '#f43f5e', delay: 0 },
  { icon: Brain,         label: 'AI Fingerprinting', desc: 'Extracts technical signature', color: '#8b5cf6', delay: 400 },
  { icon: GitMerge,      label: 'Hybrid RAG Search', desc: 'Semantic + keyword retrieval', color: '#38bdf8', delay: 800 },
  { icon: Database,      label: 'Similar Incidents', desc: 'Ranks historical matches', color: '#6366f1', delay: 1200 },
  { icon: Sparkles,      label: 'AI Recommendation', desc: 'Evidence-based root cause', color: '#f59e0b', delay: 1600 },
  { icon: CheckCircle,   label: 'Engineer Validates', desc: 'Human confirms resolution', color: '#10b981', delay: 2000 },
  { icon: BookOpen,      label: 'Knowledge Saved', desc: 'Learning indexed for future', color: '#38bdf8', delay: 2400 },
];

// ─── Live scenario ticker ──────────────────────────────────────────────────────
const DEMO_SCENARIO = {
  id: 'INC-542',
  node: 'Node-07',
  env: 'Production',
  version: 'v2.3.1',
  error: 'Connection timeout while executing service restart command on Node-07',
  command: 'systemctl restart application-service',
  mop: 'MOP-14 Step 4.2',
  time: '14:32:01',
};

function LiveScenarioCard() {
  const [blinkState, setBlinkState] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBlinkState(s => !s), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(13,31,58,0.95), rgba(17,35,57,0.95))',
      border: '1px solid rgba(244,63,94,0.3)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      boxShadow: '0 0 40px rgba(244,63,94,0.1)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Pulse glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 120, height: 120,
        borderRadius: '50%', background: 'rgba(244,63,94,0.08)',
        animation: 'pulse 2s infinite',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: '#f43f5e',
          boxShadow: '0 0 8px #f43f5e',
          opacity: blinkState ? 1 : 0.3, transition: 'opacity 0.3s',
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Live Incident · {DEMO_SCENARIO.time}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
          {DEMO_SCENARIO.id}
        </span>
      </div>

      {/* Error */}
      <div style={{
        background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
        borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 14,
        fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fca5a5', lineHeight: 1.6,
      }}>
        <span style={{ color: '#f43f5e', marginRight: 8 }}>ERROR:</span>{DEMO_SCENARIO.error}
      </div>

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          [Server, 'Node', DEMO_SCENARIO.node],
          [Activity, 'Environment', DEMO_SCENARIO.env],
          [Terminal, 'Command', DEMO_SCENARIO.command],
          [Lock, 'MOP Step', DEMO_SCENARIO.mop],
        ].map(([Icon, label, value]) => (
          <div key={label} style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '8px 10px',
            display: 'flex', gap: 7, alignItems: 'flex-start',
          }}>
            <Icon size={12} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent-amber)' }}>
        <Brain size={12} />
        AI investigation started automatically…
      </div>
    </div>
  );
}

// ─── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: 'linear-gradient(135deg, var(--bg-card), rgba(17,35,57,0.8))',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <Icon size={19} color={color} />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const aiStatus = getAIStatus();

  // Auto-advance workflow steps
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % WORKFLOW_STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      overflowX: 'hidden',
    }}>

      {/* ── TOP NAV ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 60, display: 'flex', alignItems: 'center',
        padding: '0 40px', gap: 20,
        background: 'rgba(5,11,20,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}>
            <Zap size={17} color="white" />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>AILPA</span>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: -2 }}>Incident Intelligence</div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 24, marginLeft: 30, flex: 1 }}>
          {[['Features', '#features'], ['Workflow', '#workflow'], ['Demo', '#demo']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >{l}</a>
          ))}
        </div>

        {/* AI Mode indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: aiStatus.isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${aiStatus.isOnline ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
          borderRadius: 20, padding: '5px 12px', fontSize: 11,
          color: aiStatus.statusColor,
        }}>
          {aiStatus.isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          {aiStatus.statusLabel}
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
          Open Platform <ArrowRight size={12} />
        </button>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', paddingTop: 60,
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--accent-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--accent-cyan) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 480px', gap: 60, alignItems: 'center', width: '100%' }}>
          {/* Left: Hero text */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 20, padding: '6px 14px', marginBottom: 24,
              fontSize: 12, color: 'var(--accent-indigo)', fontWeight: 600,
            }}>
              <Sparkles size={12} /> AI-Powered Incident Intelligence Platform
            </div>

            <h1 style={{
              fontSize: 54, fontWeight: 800, lineHeight: 1.1,
              color: 'var(--text-primary)', marginBottom: 20,
            }}>
              Every Incident{' '}
              <span style={{
                background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Becomes
              </span>
              {' '}Organizational Knowledge
            </h1>

            <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32, maxWidth: 520 }}>
              AILPA learns from every resolved incident — helping engineers identify root causes faster,
              retrieve verified resolutions, and prevent recurring failures using AI and hybrid retrieval.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 36, marginBottom: 36 }}>
              {[
                ['541', 'Incidents Indexed'],
                ['87%', 'Recommendation Accuracy'],
                ['73%', 'Faster Resolution'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{ gap: 10 }}>
                <Play size={16} /> Launch Platform
                <ChevronRight size={14} />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/new-incident')} style={{ gap: 10 }}>
                <AlertTriangle size={15} /> Try Demo Scenario
              </button>
              <a href="#demo" className="btn btn-outline btn-lg" style={{ gap: 8, textDecoration: 'none' }}>
                <Brain size={15} /> Ask AI Now
              </a>
            </div>
          </div>

          {/* Right: Live scenario card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <LiveScenarioCard />

            {/* Workflow mini-steps */}
            <div style={{
              background: 'rgba(13,31,58,0.8)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                AI Investigation Progress
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {WORKFLOW_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = i < activeStep;
                  const isActive = i === activeStep;
                  return (
                    <div key={i} title={step.label} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isDone ? `${step.color}22` : isActive ? `${step.color}18` : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isDone ? step.color : isActive ? step.color : 'var(--border-subtle)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.4s ease',
                        boxShadow: isActive ? `0 0 12px ${step.color}60` : 'none',
                        animation: isActive ? 'pulse-border 1.5s infinite' : 'none',
                      }}>
                        <Icon size={12} color={isDone || isActive ? step.color : 'var(--text-muted)'} />
                      </div>
                      <div style={{ fontSize: 8, color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                        {step.label.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="progress-bar">
                  <div className="progress-fill gradient" style={{ width: `${(activeStep / (WORKFLOW_STEPS.length - 1)) * 100}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Platform Capabilities</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
            Nine Integrated Modules
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto' }}>
            From ingestion to learning — a complete incident lifecycle platform powered by hybrid AI retrieval.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[
            { icon: Database,      title: 'Historical Ingestion',      desc: 'Upload Jira, MOP docs, Excel records, RCA reports, and logs. Automated extraction and vector indexing.', color: '#38bdf8', delay: 0 },
            { icon: BookOpen,      title: 'Central Knowledge Base',    desc: 'Searchable repository with semantic vector indexing. Every incident, root cause, and resolution preserved.', color: '#6366f1', delay: 80 },
            { icon: AlertTriangle, title: 'Incident Submission',       desc: 'Engineer-facing form captures error, symptoms, commands, node, environment, and MOP context.', color: '#f43f5e', delay: 160 },
            { icon: Brain,         title: 'AI Fingerprinting',         desc: 'Extracts error signatures, command patterns, keywords, and 768-dim semantic embeddings from raw text.', color: '#8b5cf6', delay: 240 },
            { icon: GitMerge,      title: 'Hybrid RAG Search',         desc: 'Combines TF-IDF cosine similarity, BM25 keyword matching, and metadata filtering with RRF re-ranking.', color: '#38bdf8', delay: 320 },
            { icon: TrendingUp,    title: 'Ranked Similar Incidents',  desc: 'Returns top matches with relevance scores, match reasons, root causes, and verified resolutions.', color: '#10b981', delay: 400 },
            { icon: Sparkles,      title: 'AI Recommendation Engine',  desc: 'Generates evidence-backed root cause analysis and resolution steps with source citations.', color: '#f59e0b', delay: 480 },
            { icon: Shield,        title: 'Engineer Validation',       desc: 'Human remains the final decision maker. AI recommendations are always advisory, never autonomous.', color: '#10b981', delay: 560 },
            { icon: BarChart2,     title: 'Continuous Learning',       desc: 'Validated resolutions are indexed immediately and retrieved in future similar incidents.', color: '#6366f1', delay: 640 },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── WORKFLOW TIMELINE ─────────────────────────────────────────────── */}
      <section id="workflow" style={{ padding: '100px 0', background: 'rgba(10,22,40,0.5)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: 'var(--accent-violet)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>End-to-End Workflow</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
              From Error Message to Organizational Learning
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Every step transparent, every decision auditable, every resolution preserved.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto', paddingBottom: 20 }}>
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div style={{
                    flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    padding: '24px 12px',
                    background: 'linear-gradient(180deg, rgba(13,31,58,0.6), rgba(10,22,40,0.4))',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)', margin: '0 4px',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = step.color + '60'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: `${step.color}15`, border: `2px solid ${step.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 20px ${step.color}25`,
                    }}>
                      <Icon size={22} color={step.color} />
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${step.color}20`, border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: step.color }}>
                      {i + 1}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{step.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'var(--text-muted)', fontSize: 18, padding: '0 2px' }}>→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI DEMO SECTION ───────────────────────────────────────────────── */}
      <section id="demo" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ fontSize: 12, color: 'var(--accent-emerald)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Live AI Demo</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Ask the AI Anything
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
            Describe your incident, ask about historical patterns, or explore the system — the AI responds in real-time.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16,
            background: aiStatus.isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${aiStatus.isOnline ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12, color: aiStatus.statusColor,
          }}>
            {aiStatus.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {aiStatus.statusLabel}
            {!aiStatus.isOnline && ' · Configure .env to switch to Online mode'}
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28,
          alignItems: 'stretch',
        }}>
          {/* Scenario context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 24, background: 'linear-gradient(135deg, rgba(13,31,58,0.9), rgba(17,35,57,0.9))', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Active Demo Scenario
              </div>
              <LiveScenarioCard />
            </div>

            {/* Quick actions */}
            <div style={{ padding: 20, background: 'rgba(13,31,58,0.6)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Try These Prompts in the Chat →
              </div>
              {[
                { text: 'Why is the service timing out on Node-07?', icon: Brain },
                { text: 'What happened in similar incidents INC-203?', icon: Database },
                { text: 'Give me step-by-step resolution commands', icon: Terminal },
                { text: 'What should I monitor to prevent this?', icon: Activity },
              ].map(({ text, icon: Icon }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                  borderRadius: 10, marginBottom: 7, fontSize: 12, color: 'var(--text-muted)',
                  cursor: 'default',
                }}>
                  <Icon size={13} color="var(--accent-indigo)" />
                  "{text}"
                </div>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div style={{ height: 600 }}>
            <AIChatPanel
              minimal={true}
              incidentContext={DEMO_SCENARIO}
            />
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ────────────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 40px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(56,189,248,0.05))',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
          Ready to Transform Incident Response?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          Start with the full demo — no API key required in offline mode.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{ gap: 10 }}>
            <Zap size={16} /> Open Platform Dashboard
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/new-incident')} style={{ gap: 10 }}>
            <AlertTriangle size={15} /> Run Demo Scenario
          </button>
        </div>
        <div style={{ marginTop: 40, fontSize: 11, color: 'var(--text-muted)' }}>
          Built with React · Vite · Hybrid RAG · TF-IDF + BM25 + RRF · OpenAI / Anthropic / Gemini compatible
        </div>
      </section>
    </div>
  );
}
