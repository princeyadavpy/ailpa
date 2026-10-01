import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Bot, User, Loader, Zap, Copy, CheckCheck,
  RefreshCw, ChevronDown, Wifi, WifiOff, Sparkles
} from 'lucide-react';
import { sendToAI, getAIStatus } from '../services/aiService';

// ─── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:11px;background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;color:#7dd3fc">$1</code>')
    .replace(/^(\d+)\.\s(.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:var(--accent-cyan);font-weight:700;min-width:16px">$1.</span><span>$2</span></div>')
    .replace(/^[-•]\s(.+)$/gm, '<div style="display:flex;gap:6px;margin:2px 0"><span style="color:var(--accent-indigo)">▸</span><span>$1</span></div>')
    .replace(/^(#{1,3})\s(.+)$/gm, (_, h, t) => `<div style="font-weight:700;color:var(--text-primary);margin:8px 0 4px;font-size:${h.length === 1 ? 14 : h.length === 2 ? 13 : 12}px">${t}</div>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--accent-cyan);text-decoration:underline">$1</a>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ─── Typing animation ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent-cyan)',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isAI = message.role === 'assistant';
  const isSystem = message.role === 'system';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSystem) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '6px 0',
      }}>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)',
          padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border-subtle)',
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      flexDirection: isAI ? 'row' : 'row-reverse',
      animation: 'fadeIn 0.25s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: isAI ? 'linear-gradient(135deg, #6366f1, #38bdf8)' : 'linear-gradient(135deg, #334155, #475569)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isAI ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
        marginTop: 2,
      }}>
        {isAI ? <Bot size={15} color="white" /> : <User size={14} color="white" />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '82%',
        background: isAI
          ? 'linear-gradient(135deg, rgba(13,31,58,0.9), rgba(17,35,57,0.9))'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isAI ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        padding: '12px 14px',
        position: 'relative',
        boxShadow: isAI ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
      }}>
        {isAI && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <Sparkles size={11} color="var(--accent-cyan)" />
            <span style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.06em' }}>
              AILPA AI ASSISTANT
            </span>
          </div>
        )}

        {message.typing ? (
          <TypingDots />
        ) : (
          <div
            style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}

        {/* Copy button */}
        {!message.typing && isAI && (
          <button
            onClick={handleCopy}
            title="Copy response"
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 3, borderRadius: 4,
              opacity: 0.6, transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
          >
            {copied ? <CheckCheck size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
          </button>
        )}

        {/* Timestamp */}
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: isAI ? 'left' : 'right' }}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}

// ─── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  'What is the root cause of this timeout error?',
  'How do I restart a service safely under high CPU load?',
  'What happened in INC-203 and how was it resolved?',
  'Show me the resolution steps for a zombie process issue',
  'What should I check before running systemctl restart?',
  'Explain the hybrid RAG search mechanism',
];

// ─── MAIN CHAT PANEL ──────────────────────────────────────────────────────────
export default function AIChatPanel({ incidentContext = null, minimal = false }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello! I'm **AILPA**, your AI Incident Investigation Assistant.

I can help you:
- **Analyze** error messages and identify root causes
- **Retrieve** similar historical incidents from the knowledge base
- **Generate** step-by-step resolution guidance
- **Explain** the AI investigation process

${incidentContext ? `I can see an active incident: **${incidentContext.id || 'New Incident'}** — ask me anything about it.` : 'Describe your incident or ask me anything about the platform.'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const aiStatus = getAIStatus();

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setShowSuggestions(false);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = { id: Date.now(), role: 'user', content: userText, timestamp: now };
    const typingMsg = { id: Date.now() + 1, role: 'assistant', content: '', typing: true, timestamp: now };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'system' && !m.typing)
        .map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userText });

      const aiReply = await sendToAI(history, incidentContext);

      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { id: Date.now() + 2, role: 'assistant', content: aiReply, timestamp: now },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: `**Error:** ${err.message}\n\nPlease check your API configuration in the \`.env\` file or switch to offline mode.`,
          timestamp: now,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, incidentContext]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: 'Chat cleared. How can I help with your next incident?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setShowSuggestions(true);
  };

  if (minimal) {
    // Compact floating variant (for landing page)
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(56,189,248,0.1))',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}>
            <Bot size={17} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>AILPA AI</div>
            <div style={{ fontSize: 10, color: aiStatus.isOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div className="pulse-dot" style={{ background: aiStatus.statusColor }} />
              {aiStatus.statusLabel}
            </div>
          </div>
          <button onClick={clearChat} title="Clear chat" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map(m => <MessageBubble key={m.id} message={m} />)}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED_PROMPTS.slice(0, 3).map(p => (
              <button key={p} onClick={() => sendMessage(p)} style={{
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 12, padding: '5px 10px', fontSize: 11, color: 'var(--accent-indigo)',
                cursor: 'pointer', transition: 'var(--transition)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this incident…"
            rows={1}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
              borderRadius: 12, padding: '9px 12px', color: 'var(--text-primary)',
              fontSize: 13, fontFamily: 'var(--font-sans)', resize: 'none',
              outline: 'none', lineHeight: 1.5, maxHeight: 100,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-indigo)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: !input.trim() || loading
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #6366f1, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)', flexShrink: 0,
              boxShadow: input.trim() ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {loading ? <Loader size={15} color="var(--text-muted)" style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={15} color={input.trim() ? 'white' : 'var(--text-muted)'} />}
          </button>
        </div>
      </div>
    );
  }

  // Full-size variant
  return (
    <div className="page-content fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: 0 }}>
      {/* Top Bar */}
      <div style={{
        padding: '14px 24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(56,189,248,0.05))',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99,102,241,0.4)',
        }}>
          <Bot size={20} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>AILPA AI Assistant</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {aiStatus.isOnline ? <Wifi size={11} color="var(--accent-emerald)" /> : <WifiOff size={11} color="var(--accent-amber)" />}
            <span style={{ color: aiStatus.statusColor }}>{aiStatus.statusLabel}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={clearChat} className="btn btn-secondary btn-sm">
            <RefreshCw size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Mode Banner */}
      {!aiStatus.isOnline && (
        <div style={{
          background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)',
          padding: '8px 24px', fontSize: 11, color: 'var(--accent-amber)',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <WifiOff size={12} />
          <strong>Offline Simulation Mode</strong> — Set <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 3 }}>VITE_AI_MODE=online</code> and add your API key in <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 3 }}>.env</code> to enable real AI responses.
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {messages.map(m => <MessageBubble key={m.id} message={m} />)}
        <div ref={endRef} />
      </div>

      {/* Suggested Prompts */}
      {showSuggestions && messages.length <= 1 && (
        <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Suggested questions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)} style={{
                background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 14, padding: '6px 12px', fontSize: 12, color: 'var(--accent-indigo)',
                cursor: 'pointer', transition: 'var(--transition)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.16)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{
        padding: '14px 24px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5,11,20,0.8)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16, padding: '10px 14px',
          transition: 'var(--transition)',
        }}
          onFocus={() => {}}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your incident or ask a question… (Enter to send, Shift+Enter for new line)"
            rows={2}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
              resize: 'none', lineHeight: 1.6, maxHeight: 120,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: !input.trim() || loading
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #6366f1, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)', flexShrink: 0,
              transform: input.trim() ? 'scale(1.05)' : 'scale(1)',
              boxShadow: input.trim() ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
            }}
          >
            {loading
              ? <Loader size={16} color="var(--text-muted)" style={{ animation: 'spin 0.7s linear infinite' }} />
              : <Send size={16} color={input.trim() ? 'white' : 'var(--text-muted)'} />
            }
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line · {aiStatus.isOnline ? `Connected to ${PROVIDER} ${MODEL}` : 'Offline simulation active'}
        </div>
      </div>
    </div>
  );
}
