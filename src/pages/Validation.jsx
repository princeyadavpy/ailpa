import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, CheckCircle, XCircle, AlertCircle, BookOpen,
  ChevronRight, User, Clock, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/AppContext';

export default function Validation() {
  const navigate = useNavigate();
  const toast = useToast();
  const { activeIncident, recommendation, similarIncidents, addToKnowledgeBase, setInvestigationStep } = useApp();

  const [rootCauseDecision, setRootCauseDecision] = useState(null); // 'confirm' | 'reject'
  const [actualResolution, setActualResolution] = useState('');
  const [engineerNotes, setEngineerNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = rootCauseDecision && actualResolution.trim();

  const handleSubmit = () => {
    if (!canSubmit) {
      toast('error', 'Incomplete Validation', 'Please select a root cause decision and enter the actual resolution.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const resolvedInc = {
        id: `INC-${540 + Math.floor(Math.random() * 50)}`,
        _new: true,
        title: activeIncident?.errorMessage?.substring(0, 80) || 'New resolved incident',
        errorDescription: activeIncident?.errorMessage || '',
        errorSignature: 'connection_timeout::systemctl_restart::node_07',
        symptoms: activeIncident?.symptoms || '',
        rootCause: rootCauseDecision === 'confirm'
          ? recommendation?.suggestedRootCause?.replace(/\*\*(.*?)\*\*/g, '$1') || actualResolution
          : `Engineer-determined root cause: ${actualResolution}`,
        verifiedLearning: `Validated by engineer on ${new Date().toLocaleDateString()}. ${engineerNotes}`,
        previousResolution: actualResolution,
        mopReference: activeIncident?.mopActivity || recommendation?.mopReference || 'MOP-14',
        node: activeIncident?.node || 'Node-07',
        environment: activeIncident?.environment || 'Production',
        softwareVersion: activeIncident?.softwareVersion || 'v2.3.1',
        incidentDate: new Date().toISOString().split('T')[0],
        status: 'Resolved',
        resolvedBy: activeIncident?.reportedBy || 'eng.demo@company.com',
        resolutionTime: '< 1 hour',
        tags: ['demo', 'timeout', 'systemctl', 'validated'],
        vectorIndex: Math.floor(Math.random() * 1000),
      };
      addToKnowledgeBase(resolvedInc);
      setInvestigationStep(5);
      setSubmitting(false);
      setSubmitted(true);
      toast('success', 'Incident Resolved & Learned', `${resolvedInc.id} has been added to the knowledge base and indexed.`);
    }, 1800);
  };

  if (!recommendation && !activeIncident) {
    return (
      <div className="page-content fade-in">
        <div className="alert alert-warning">
          <AlertCircle size={16} className="alert-icon" />
          <div>
            <div className="alert-title">No Active Investigation</div>
            <div className="alert-body">Please complete the full investigation workflow first.</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/new-incident')}>
              Start Investigation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page-content fade-in">
        <div className="page-header">
          <h2>Engineer Validation & Action</h2>
        </div>
        <div className="card card-glow" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={34} color="var(--accent-emerald)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>Incident Resolved & Knowledge Base Updated</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14, maxWidth: 480, margin: '0 auto 24px' }}>
            The validated resolution has been recorded and the incident has been indexed into the knowledge base. 
            Future investigations will benefit from this new learning.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/learning')}>
              <BookOpen size={14} /> View Learning History
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/knowledge-base')}>
              Browse Knowledge Base
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/new-incident')}>
              Submit Another Incident
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Engineer Validation & Action</h2>
        <p>You are the final decision-maker. Review the AI recommendation and document the actual resolution.</p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: 20 }}>
        <Shield size={16} className="alert-icon" />
        <div>
          <div className="alert-title">Engineer Authority Reminder</div>
          <div className="alert-body">
            The AI recommendation is advisory only. The engineer must verify system state, apply professional judgment, 
            and document the actual resolution. The system will not execute any commands automatically.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          {/* Recommendation Summary */}
          {recommendation && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">AI Recommendation Summary</span>
                <span className="badge badge-amber">Awaiting Validation</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}
                dangerouslySetInnerHTML={{ __html: recommendation.suggestedRootCause?.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Evidence:</strong> {similarIncidents.length} historical incidents · {Math.round(recommendation.confidenceLevel * 100)}% confidence · {recommendation.evidenceLevel} evidence
              </div>
            </div>
          )}

          {/* Root Cause Decision */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Step 1 – Root Cause Decision <span style={{ color: 'var(--accent-rose)', marginLeft: 4 }}>*</span></div>
            <div className="validation-grid">
              <div
                className={`validation-option ${rootCauseDecision === 'confirm' ? 'selected-confirm' : ''}`}
                onClick={() => setRootCauseDecision('confirm')}
              >
                <CheckCircle size={24} color={rootCauseDecision === 'confirm' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>Confirm Root Cause</div>
                <p>AI-suggested root cause matches actual findings</p>
              </div>
              <div
                className={`validation-option ${rootCauseDecision === 'reject' ? 'selected-reject' : ''}`}
                onClick={() => setRootCauseDecision('reject')}
              >
                <XCircle size={24} color={rootCauseDecision === 'reject' ? 'var(--accent-rose)' : 'var(--text-muted)'} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>Different Root Cause</div>
                <p>Actual root cause differs from AI suggestion</p>
              </div>
            </div>
          </div>

          {/* Actual Resolution */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Step 2 – Actual Resolution Performed <span style={{ color: 'var(--accent-rose)', marginLeft: 4 }}>*</span></div>
            <div className="form-group">
              <label className="form-label">Document exactly what was done to resolve the incident</label>
              <textarea className="form-textarea" style={{ minHeight: 130, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                placeholder="1. Checked CPU usage: top -bn1&#10;2. Killed stuck process: kill -9 <PID>&#10;3. Restarted service: systemctl restart application-service --timeout=300&#10;4. Verified health: curl http://Node-07:8080/health"
                value={actualResolution} onChange={e => setActualResolution(e.target.value)} />
            </div>
          </div>

          {/* Engineer Notes */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Step 3 – Engineer Notes & Learnings</div>
            <div className="form-group">
              <label className="form-label">Additional observations, improvements, or learnings for future reference</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }}
                placeholder="Any additional context, improvements to monitoring, MOP corrections, or recommendations for future incidents…"
                value={engineerNotes} onChange={e => setEngineerNotes(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Recommendation Feedback</label>
              <select className="form-select" value={feedback} onChange={e => setFeedback(e.target.value)}>
                <option value="">Rate the AI recommendation accuracy…</option>
                <option value="5">⭐⭐⭐⭐⭐ Excellent – Perfectly accurate</option>
                <option value="4">⭐⭐⭐⭐ Good – Mostly correct</option>
                <option value="3">⭐⭐⭐ Fair – Partially helpful</option>
                <option value="2">⭐⭐ Poor – Mostly incorrect</option>
                <option value="1">⭐ Not helpful</option>
              </select>
            </div>
          </div>

          <button className="btn btn-success btn-lg" style={{ width: '100%' }}
            disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving Resolution & Updating Knowledge Base…</>
            ) : (
              <><CheckCircle size={16} /> Validate & Save to Knowledge Base <ChevronRight size={14} /></>
            )}
          </button>
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Incident Context</div>
            {activeIncident && (
              <>
                {[
                  ['Incident ID', activeIncident.id, 'mono'],
                  ['Status', 'Under Investigation', ''],
                  ['Node', activeIncident.node, ''],
                  ['Environment', activeIncident.environment, ''],
                  ['Version', activeIncident.softwareVersion, 'mono'],
                  ['MOP Activity', activeIncident.mopActivity, ''],
                ].filter(([, v]) => v).map(([l, v, c]) => (
                  <div key={l} className="info-row">
                    <span className="info-label">{l}</span>
                    <span className={`info-value ${c}`}>{v}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>What Happens Next</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: CheckSquare, label: 'Root cause confirmed', desc: 'Your decision is recorded' },
                { icon: BookOpen, label: 'Resolution stored', desc: 'Actual steps preserved' },
                { icon: User, label: 'Feedback captured', desc: 'Improves future AI accuracy' },
                { icon: Clock, label: 'Knowledge indexed', desc: 'Available for future searches' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ display: 'flex', gap: 8 }}>
                    <Icon size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.desc}</div>
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
