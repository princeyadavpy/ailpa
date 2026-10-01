# AILPA – AI Incident Learning & Prevention Agent

> **Every resolved incident becomes organizational knowledge.**

A professional, interactive, end-to-end demo of an AI-powered incident intelligence platform. Engineers submit incidents, AI investigates using hybrid RAG search, retrieves similar historical incidents, and generates evidence-based recommendations — with every validated resolution indexed back into the knowledge base.

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/<your-username>/ailpa.git
cd ailpa

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set VITE_AI_MODE=offline (no API key needed) or online + your key

# Start the development server
npm run dev
```

Open **http://localhost:5173** — the landing page IS the live demo scenario.

---

## 🤖 AI Mode Configuration

Edit `.env` to switch between modes:

| Setting | Value | Description |
|---|---|---|
| `VITE_AI_MODE` | `offline` | Built-in simulation engine (no API key needed) |
| `VITE_AI_MODE` | `online` | Calls a real LLM API |
| `VITE_AI_PROVIDER` | `openai` \| `anthropic` \| `gemini` | Which provider to use |
| `VITE_AI_MODEL` | `gpt-4o`, `claude-3-5-sonnet-20241022`, etc. | Model selection |

### Online mode — supported providers

```env
# OpenAI
VITE_AI_MODE=online
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o
VITE_OPENAI_API_KEY=sk-...

# Anthropic Claude
VITE_AI_MODE=online
VITE_AI_PROVIDER=anthropic
VITE_AI_MODEL=claude-3-5-sonnet-20241022
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
VITE_AI_MODE=online
VITE_AI_PROVIDER=gemini
VITE_AI_MODEL=gemini-1.5-pro
VITE_GEMINI_API_KEY=AIza...
```

---

## 📦 Nine Modules

| Module | Path | Description |
|---|---|---|
| 1 | `/ingestion` | Historical data ingestion (Jira, PDF, Excel, DOCX, Logs) |
| 2 | `/knowledge-base` | Central searchable incident knowledge base |
| 3 | `/new-incident` | Engineer incident submission form |
| 4 | `/fingerprint` | AI technical fingerprinting |
| 5 | `/rag-search` | Hybrid RAG: Semantic + Keyword + Metadata |
| 6 | `/similar-incidents` | Ranked historical incident matches |
| 7 | `/recommendation` | AI evidence-based recommendation engine |
| 8 | `/validation` | Engineer validation & resolution |
| 9 | `/learning` | Continuous learning history |
| + | `/ai-chat` | Live AI chat assistant |

---

## 🧠 Hybrid Search Engine

The search engine (`src/data/sampleData.js`) implements real scoring — no hardcoded results:

| Dimension | Weight | Algorithm |
|---|---|---|
| Error Signature | 30% | Token-level signature comparison |
| Keyword Matching | 25% | BM25-style weighted term frequency |
| Semantic Similarity | 22% | TF-IDF cosine similarity |
| Metadata Matching | 18% | Node / env / version / MOP field scoring |
| Tag Overlap | 5% | Set intersection |

Results combined via **Reciprocal Rank Fusion (RRF)** across all dimensions.

---

## 🎬 Demo Scenario

**New Incident:**
- Node: `Node-07` · Environment: `Production` · Version: `v2.3.1`
- Error: `Connection timeout while executing service restart command on Node-07`
- Command: `systemctl restart application-service`
- MOP: `MOP-14 Step 4.2`

**Expected AI Flow:**
1. Fingerprint extraction: `connection_timeout::systemctl_restart::node_07`
2. Hybrid search retrieves: **INC-203** (94%), **INC-119** (78%), **INC-431** (71%)
3. Recommendation references INC-203's verified resolution
4. Engineer validates and saves → new learning indexed

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI Providers:** OpenAI / Anthropic / Google Gemini
- **Search:** TF-IDF + BM25 + Reciprocal Rank Fusion (client-side)
- **Styling:** Custom CSS design system (dark theme, glassmorphism)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AIChatPanel.jsx    # AI chat interface (online/offline)
│   ├── Sidebar.jsx        # Navigation
│   └── Topbar.jsx         # Page header
├── context/
│   └── AppContext.jsx     # Global state + toast system
├── data/
│   └── sampleData.js      # Historical incidents + hybrid search engine
├── pages/
│   ├── Landing.jsx        # Landing page — the scenario showcase
│   ├── Dashboard.jsx      # Overview KPIs and charts
│   ├── DataIngestion.jsx  # Module 1
│   ├── KnowledgeBase.jsx  # Module 2
│   ├── NewIncident.jsx    # Module 3
│   ├── Fingerprint.jsx    # Module 4
│   ├── RAGSearch.jsx      # Module 5
│   ├── SimilarIncidents.jsx # Module 6
│   ├── Recommendation.jsx # Module 7
│   ├── Validation.jsx     # Module 8
│   ├── LearningHistory.jsx # Module 9
│   └── AIChat.jsx         # AI chat page
└── services/
    └── aiService.js       # Online/offline AI service layer
```

---

## ⚠️ Security Notes

- **Never commit `.env`** — it's in `.gitignore`
- Use `.env.example` as the template
- API keys are read from environment variables via `import.meta.env`
- All AI responses in offline mode are clearly labeled `[SIMULATED]`

---

## 📄 License

MIT — built for demonstration purposes. All incident data is fictional.
