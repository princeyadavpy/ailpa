import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DataIngestion from './pages/DataIngestion';
import KnowledgeBase from './pages/KnowledgeBase';
import NewIncident from './pages/NewIncident';
import Fingerprint from './pages/Fingerprint';
import RAGSearch from './pages/RAGSearch';
import SimilarIncidents from './pages/SimilarIncidents';
import Recommendation from './pages/Recommendation';
import Validation from './pages/Validation';
import LearningHistory from './pages/LearningHistory';
import AIChat from './pages/AIChat';
import { AppProvider, ToastProvider } from './context/AppContext';
import './index.css';

function PlatformLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ingestion" element={<DataIngestion />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/new-incident" element={<NewIncident />} />
          <Route path="/fingerprint" element={<Fingerprint />} />
          <Route path="/rag-search" element={<RAGSearch />} />
          <Route path="/similar-incidents" element={<SimilarIncidents />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/learning" element={<LearningHistory />} />
          <Route path="/ai-chat" element={<AIChat />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Routes>
            {/* Landing page — no sidebar/topbar */}
            <Route path="/" element={<Landing />} />
            {/* Platform shell — with sidebar + topbar */}
            <Route path="/*" element={<PlatformLayout />} />
          </Routes>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
