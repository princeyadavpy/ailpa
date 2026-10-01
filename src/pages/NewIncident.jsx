import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Zap, Server, AlertCircle, Terminal, FileText, Upload, ChevronRight, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/AppContext';

const DEMO_SCENARIO = {
  errorMessage: 'Connection timeout while executing service restart command on Node-07.',
  symptoms: 'Service became unresponsive after MOP step 4.2. HTTP health check returning connection refused. Port 8080 not accepting connections. systemctl shows "activating" state indefinitely.',
  mopActivity: 'Service Restart – MOP-14 Step 4.2',
  commandsExecuted: 'systemctl restart application-service',
  node: 'Node-07',
  environment: 'Production',
  softwareVersion: 'v2.3.1',
  additionalLogs: '[2024-08-15 14:32:01] INFO: Starting service restart\n[2024-08-15 14:32:01] WARN: High CPU load detected (97%)\n[2024-08-15 14:33:31] ERROR: Timeout waiting for application-service to start\n[2024-08-15 14:33:31] ERROR: Connection refused on port 8080',
  reportedBy: 'eng.demo@company.com',
  priority: 'P1',
};

export default function NewIncident() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setActiveIncident, setInvestigationStep } = useApp();

  const [form, setForm] = useState({
    errorMessage: '', symptoms: '', mopActivity: '', commandsExecuted: '',
    node: '', environment: '', softwareVersion: '', additionalLogs: '',
    reportedBy: '', priority: 'P2',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const loadDemo = () => {
    setForm(DEMO_SCENARIO);
    toast('info', 'Demo Scenario Loaded', 'Connection timeout scenario pre-filled. Click Submit to start AI investigation.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.errorMessage.trim()) {
      toast('error', 'Validation Error', 'Error message / description is required.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const incident = {
        ...form,
        id: `INC-${500 + Math.floor(Math.random() * 100)}`,
        submittedAt: new Date().toISOString(),
        status: 'Investigating',
      };
      setActiveIncident(incident);
      setInvestigationStep(1);
      setSubmitting(false);
      toast('success', 'Incident Submitted', `${incident.id} created. Starting AI investigation…`);
      setTimeout(() => navigate('/fingerprint'), 600);
    }, 1200);
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>New Incident Submission</h2>
        <p>Submit a new incident to trigger the AI investigation workflow</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          {/* Demo Banner */}
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            <Info size={16} className="alert-icon" />
            <div>
              <div className="alert-title">Demo Scenario Available</div>
              <div className="alert-body">
                Load the pre-built "Node-07 Connection Timeout" scenario to walk through the complete AI workflow end-to-end.
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={loadDemo}>
                <Zap size={12} /> Load Demo Scenario
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={15} color="var(--accent-rose)" /> Incident Details
              </div>

              <div className="form-group">
                <label className="form-label">Error Message / Description <span>*</span></label>
                <textarea className="form-textarea" style={{ minHeight: 80 }}
                  placeholder="Describe the error message exactly as it appeared…"
                  value={form.errorMessage} onChange={e => set('errorMessage', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms Observed</label>
                <textarea className="form-textarea"
                  placeholder="List all observed symptoms, behaviors, and indicators…"
                  value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                    <option>P0 – Critical</option>
                    <option>P1 – High</option>
                    <option value="P2">P2 – Medium</option>
                    <option>P3 – Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reported By</label>
                  <input className="form-input" type="email" placeholder="engineer@company.com"
                    value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={15} color="var(--accent-cyan)" /> Technical Context
              </div>

              <div className="form-group">
                <label className="form-label">Activity / MOP Being Performed</label>
                <input className="form-input" placeholder="e.g. Service Restart – MOP-14 Step 4.2"
                  value={form.mopActivity} onChange={e => set('mopActivity', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Commands Executed</label>
                <textarea className="form-textarea" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                  placeholder="systemctl restart application-service"
                  value={form.commandsExecuted} onChange={e => set('commandsExecuted', e.target.value)} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Node / Host</label>
                  <input className="form-input" placeholder="e.g. Node-07" value={form.node}
                    onChange={e => set('node', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Environment</label>
                  <select className="form-select" value={form.environment} onChange={e => set('environment', e.target.value)}>
                    <option value="">Select environment…</option>
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                    <option>DR / Failover</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Software Version</label>
                <input className="form-input" placeholder="e.g. v2.3.1"
                  value={form.softwareVersion} onChange={e => set('softwareVersion', e.target.value)} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="var(--accent-violet)" /> Additional Logs
              </div>
              <textarea className="form-textarea" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, minHeight: 120 }}
                placeholder="Paste relevant log lines, stack traces, or error output here…"
                value={form.additionalLogs} onChange={e => set('additionalLogs', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ flex: 1 }}>
                {submitting ? (
                  <><div className="spinner" style={{ width: 16, height: 16 }} /> Starting Investigation…</>
                ) : (
                  <><Zap size={16} /> Submit Incident & Start AI Investigation <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Investigation Workflow</div>
            {[
              { step: 1, label: 'Submission', desc: 'Engineer submits incident', active: true },
              { step: 2, label: 'Fingerprinting', desc: 'AI extracts technical signature' },
              { step: 3, label: 'Hybrid RAG Search', desc: 'Semantic + keyword retrieval' },
              { step: 4, label: 'Similar Incidents', desc: 'Ranked historical matches' },
              { step: 5, label: 'Recommendation', desc: 'AI generates evidence-based fix' },
              { step: 6, label: 'Validation', desc: 'Engineer reviews & confirms' },
              { step: 7, label: 'Learning', desc: 'Knowledge base updated' },
            ].map(s => (
              <div key={s.step} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                borderBottom: s.step < 7 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: s.active ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${s.active ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: s.active ? 'white' : 'var(--text-muted)'
                }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Required Fields</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Only the <strong style={{ color: 'var(--accent-rose)' }}>Error Description</strong> is mandatory.
              More detail improves AI fingerprint accuracy and match quality.
              <div style={{ marginTop: 10, padding: '10px', background: 'rgba(56,189,248,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.15)' }}>
                💡 Providing node, version, and commands executed increases relevance scores by up to 40%.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
