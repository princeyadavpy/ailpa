import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Table, File, Code, Database,
  CheckCircle, Clock, AlertCircle, Loader, X, Plus, Eye
} from 'lucide-react';
import { INGESTION_SOURCES } from '../data/sampleData';
import { useToast } from '../context/AppContext';

const FILE_TYPE_ICONS = {
  jira: { icon: Database, color: 'var(--accent-cyan)', label: 'Jira' },
  pdf: { icon: FileText, color: 'var(--accent-rose)', label: 'PDF' },
  excel: { icon: Table, color: 'var(--accent-emerald)', label: 'Excel' },
  docx: { icon: File, color: 'var(--accent-indigo)', label: 'DOCX' },
  log: { icon: Code, color: 'var(--accent-amber)', label: 'Log' },
  csv: { icon: Table, color: 'var(--accent-emerald)', label: 'CSV' },
};

const StatusBadge = ({ status }) => {
  const map = {
    indexed: { cls: 'badge-emerald', icon: CheckCircle, label: 'Indexed' },
    processing: { cls: 'badge-amber', icon: Clock, label: 'Processing' },
    failed: { cls: 'badge-rose', icon: AlertCircle, label: 'Failed' },
  };
  const s = map[status] || map['indexed'];
  const Icon = s.icon;
  return (
    <span className={`badge ${s.cls}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

const EXTRACTION_STEPS = [
  'Parsing file format…',
  'Extracting incident records…',
  'Classifying error types…',
  'Identifying root causes…',
  'Extracting resolutions & learnings…',
  'Generating semantic vectors…',
  'Indexing to knowledge base…',
  'Ingestion complete ✓',
];

export default function DataIngestion() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [sources, setSources] = useState(INGESTION_SOURCES);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [dragover, setDragover] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [viewSource, setViewSource] = useState(null);

  const simulateIngestion = (fileName, fileType) => {
    setUploading(true);
    setProgress(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const pct = Math.round((step / EXTRACTION_STEPS.length) * 100);
      setProgress(pct);
      setCurrentStep(EXTRACTION_STEPS[step - 1] || '');

      if (step >= EXTRACTION_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          const newSrc = {
            id: `src-${Date.now()}`,
            name: fileName,
            type: fileType,
            records: Math.floor(Math.random() * 50) + 10,
            status: 'indexed',
            uploadDate: new Date().toISOString().split('T')[0],
            size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
          };
          setSources(prev => [newSrc, ...prev]);
          setNewFile(null);
          toast('success', 'Ingestion Complete', `${fileName} successfully indexed into the knowledge base.`);
        }, 500);
      }
    }, 500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const typeMap = { pdf: 'pdf', docx: 'docx', xlsx: 'excel', xls: 'excel', csv: 'csv', log: 'log', txt: 'log' };
    setNewFile({ name: file.name, type: typeMap[ext] || 'pdf' });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const typeMap = { pdf: 'pdf', docx: 'docx', xlsx: 'excel', xls: 'excel', csv: 'csv', log: 'log', txt: 'log' };
    setNewFile({ name: file.name, type: typeMap[ext] || 'pdf' });
  };

  const handleDemo = () => {
    simulateIngestion('incident_report_Q4_2024.xlsx', 'excel');
  };

  const totalRecords = sources.reduce((sum, s) => sum + s.records, 0);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h2>Historical Data Ingestion</h2>
        <p>Upload and process incident data from multiple sources into the AI knowledge base</p>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Data Sources', value: sources.length, color: 'cyan' },
          { label: 'Total Records', value: totalRecords, color: 'indigo' },
          { label: 'Indexed', value: sources.filter(s => s.status === 'indexed').length, color: 'emerald' },
          { label: 'Processing', value: uploading ? 1 : 0, color: 'amber' },
        ].map(s => (
          <div key={s.label} className={`kpi-card ${s.color}`}>
            <div className="kpi-value" style={{ fontSize: 26 }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Sources Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ingested Sources</span>
            <span className="badge badge-emerald">{sources.filter(s => s.status === 'indexed').length} Indexed</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Records</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sources.map(src => {
                  const t = FILE_TYPE_ICONS[src.type] || FILE_TYPE_ICONS.pdf;
                  const Icon = t.icon;
                  return (
                    <tr key={src.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon size={14} color={t.color} />
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 12 }}>{src.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{t.label}</span></td>
                      <td style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{src.records}</td>
                      <td>{src.size}</td>
                      <td>{src.uploadDate}</td>
                      <td><StatusBadge status={src.status} /></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewSource(src)}>
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Upload New Source</span>
            </div>

            {!uploading ? (
              <>
                <div
                  className={`upload-zone ${dragover ? 'dragover' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={handleDrop}
                >
                  <div className="upload-zone-icon"><Upload size={24} /></div>
                  <h3>{newFile ? newFile.name : 'Drop files here'}</h3>
                  <p>{newFile ? `Ready to ingest (${newFile.type})` : 'PDF, DOCX, Excel, CSV, Jira export, Log files'}</p>
                  <input ref={fileRef} type="file" onChange={handleFileChange} style={{ display: 'none' }}
                    accept=".pdf,.docx,.xlsx,.xls,.csv,.log,.txt" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {newFile ? (
                    <>
                      <button className="btn btn-primary" style={{ flex: 1 }}
                        onClick={() => simulateIngestion(newFile.name, newFile.type)}>
                        <Upload size={13} /> Ingest File
                      </button>
                      <button className="btn btn-secondary" onClick={() => setNewFile(null)}>
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleDemo}>
                      <Plus size={13} /> Demo Ingestion
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Loader size={14} color="var(--accent-cyan)" style={{ animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Processing…</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill gradient" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {EXTRACTION_STEPS.map((step, i) => {
                    const stepPct = ((i + 1) / EXTRACTION_STEPS.length) * 100;
                    const done = progress >= stepPct;
                    const active = currentStep === step;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, opacity: done || active ? 1 : 0.35 }}>
                        {done ? <CheckCircle size={12} color="var(--accent-emerald)" /> :
                          active ? <Loader size={12} color="var(--accent-cyan)" style={{ animation: 'spin 0.7s linear infinite' }} /> :
                            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--border-subtle)' }} />}
                        <span style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Supported Sources</div>
            {Object.entries(FILE_TYPE_ICONS).map(([key, val]) => {
              const Icon = val.icon;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <Icon size={13} color={val.color} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{val.label} Files</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source Details Modal */}
      {viewSource && (
        <div className="modal-overlay" onClick={() => setViewSource(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="incident-id">{viewSource.id}</span>
                <div className="modal-title">{viewSource.name}</div>
              </div>
              <button className="modal-close" onClick={() => setViewSource(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-success">
                <CheckCircle size={16} className="alert-icon" />
                <div>
                  <div className="alert-title">Successfully Indexed</div>
                  <div className="alert-body">This source has been fully processed and {viewSource.records} incident records are available for retrieval.</div>
                </div>
              </div>
              {[
                ['Source ID', viewSource.id, 'mono'],
                ['File Name', viewSource.name, ''],
                ['Type', viewSource.type.toUpperCase(), ''],
                ['Records Extracted', viewSource.records, 'mono'],
                ['File Size', viewSource.size, ''],
                ['Indexed Date', viewSource.uploadDate, ''],
                ['Status', viewSource.status, ''],
              ].map(([label, val, cls]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className={`info-value ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
