# AILPA - AI Incident Learning & Prevention Agent

AILPA is an intelligent incident investigation platform designed for SREs and DevOps teams. It uses a Hybrid RAG (Retrieval-Augmented Generation) engine to analyze technical incidents, find historical patterns, and generate evidence-based resolution recommendations.

## 🌟 Features

*   **Hybrid RAG Search**: Combines semantic (TF-IDF cosine), keyword (weighted BM25), metadata, and error signature matching using Reciprocal Rank Fusion (RRF).
*   **AI Recommendation Engine**: Generates root cause analysis and resolution steps backed by historical incident evidence.
*   **Continuous Learning Loop**: Engineer-validated resolutions are immediately indexed into the knowledge base.
*   **Interactive Chat Assistant**: Chat with AILPA to diagnose issues, with support for OpenAI, Anthropic, and Gemini.
*   **Offline Simulation Mode**: Fully functional demo mode with built-in scenarios (no API keys required).
*   **Modern Dashboard UI**: Built with React, Vite, and Tailwind-inspired custom CSS featuring glassmorphism and micro-animations.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/ailpa.git
    cd ailpa
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory (or edit the existing one):
    ```env
    VITE_AI_MODE=offline # Set to "online" to use real APIs
    VITE_AI_PROVIDER=openai # openai | anthropic | gemini
    VITE_OPENAI_API_KEY=your-api-key
    VITE_AI_MODEL=gpt-4o
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## 🧩 Architecture

*   **Frontend**: React + Vite
*   **Routing**: React Router v6
*   **Icons**: Lucide React
*   **AI Integration**: Direct API integration (OpenAI/Anthropic/Gemini) with graceful fallback to a local simulation engine.
*   **State Management**: React Context API (`AppContext`, `ToastContext`)

## 📄 License
MIT
