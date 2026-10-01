import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ===================== TOAST CONTEXT =====================
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, body, duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, body }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-icon" style={{ marginTop: 2 }}>
              {t.type === 'success' && <CheckCircle size={16} color="var(--accent-emerald)" />}
              {t.type === 'error' && <AlertCircle size={16} color="var(--accent-rose)" />}
              {t.type === 'info' && <Info size={16} color="var(--accent-cyan)" />}
              {t.type === 'warning' && <AlertTriangle size={16} color="var(--accent-amber)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="toast-title">{t.title}</div>
              {t.body && <div className="toast-body">{t.body}</div>}
            </div>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ===================== APP STATE CONTEXT =====================
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeIncident, setActiveIncident] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [resolvedIncidents, setResolvedIncidents] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [investigationStep, setInvestigationStep] = useState(0);

  const addToKnowledgeBase = useCallback((incident) => {
    setResolvedIncidents(prev => [incident, ...prev]);
    setKnowledgeBase(prev => [incident, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      activeIncident, setActiveIncident,
      fingerprint, setFingerprint,
      similarIncidents, setSimilarIncidents,
      recommendation, setRecommendation,
      resolvedIncidents, addToKnowledgeBase,
      knowledgeBase,
      investigationStep, setInvestigationStep,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
