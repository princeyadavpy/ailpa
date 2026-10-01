// ============================================================
// AI SERVICE — Online / Offline mode switcher
// Reads VITE_AI_MODE from environment:
//   "online"  → calls real LLM API (OpenAI / Anthropic / Gemini)
//   "offline" → uses built-in simulation engine (no API key needed)
// ============================================================

const MODE     = import.meta.env.VITE_AI_MODE     || 'offline';
const PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'openai';
const MODEL    = import.meta.env.VITE_AI_MODEL    || 'gpt-4o';

export const isOnline = MODE === 'online';
export const aiProvider = PROVIDER;
export const aiModel = MODEL;

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are AILPA (AI Incident Learning & Prevention Agent), an expert AI assistant embedded inside an enterprise incident investigation platform.

Your role is to help engineers investigate, diagnose, and resolve technical incidents by:
1. Analyzing error messages, symptoms, and commands for root cause patterns
2. Referencing historical incident knowledge when relevant
3. Generating clear, actionable resolution steps
4. Explaining WHY a root cause is likely and WHAT evidence supports it
5. Asking clarifying questions when more information would improve accuracy

Communication style:
- Be precise and technical — speak like a senior SRE
- Always label AI-generated suggestions vs verified historical facts
- Never claim certainty; use phrases like "most likely", "evidence suggests", "based on similar incidents"
- Format resolution steps as numbered lists
- Keep explanations concise but complete

You have access to historical incident records and always reference them (INC-XXX) when applicable.
If the user's incident does not match any known pattern, say so clearly and suggest investigation paths.`;

// ─── OFFLINE SIMULATION RESPONSES ─────────────────────────────────────────────
const OFFLINE_SCENARIOS = {
  timeout: {
    keywords: ['timeout', 'timed out', 'connection timeout', 'systemctl', 'restart'],
    response: (msg) => `**[SIMULATED – Offline Mode]**

Based on the error pattern I'm detecting in your message, this looks like a **service restart timeout** scenario.

**🔍 Pattern Analysis:**
- Error type: \`connection_timeout::systemctl_restart\`
- High probability match with **INC-203** (94% relevance)

**🎯 Most Likely Root Cause:**
The service failed to gracefully shut down within the default timeout window — typically caused by:
1. High CPU load (>80%) preventing clean process termination
2. A zombie/stuck process holding the port or socket
3. A config file lock not released from a prior failed attempt

**✅ Recommended Resolution Steps:**
1. \`top -bn1 | grep 'Cpu\\|Mem'\` — Check if CPU is >80%
2. \`systemctl status application-service\` — Identify the stuck PID
3. \`kill -9 <PID>\` — Force-kill if CPU is high
4. Wait ~10 seconds for resources to free
5. \`systemctl restart application-service --timeout=300\` — Restart with extended timeout
6. \`curl http://<node>:8080/health\` — Verify service recovery

**📚 Historical Evidence:**
- **INC-203** (Aug 2024): Identical timeout on Node-07 due to CPU spike — resolved in 47 min
- **INC-431** (Sep 2024): Systemctl timeout caused by config lock — resolved in 52 min

> ⚠️ This is an AI suggestion. Verify system state before executing any commands.`,
  },
  memory: {
    keywords: ['memory', 'oom', 'out of memory', 'killed', 'kubernetes', 'pod'],
    response: () => `**[SIMULATED – Offline Mode]**

**🔍 Pattern:** Memory exhaustion / OOMKiller activation detected.

**🎯 Root Cause Analysis:**
Memory leak causing unbounded growth — matches **INC-087** (87% relevance).

**✅ Resolution:**
1. Check OOMKiller: \`dmesg | grep -i oom\`
2. Identify leaking service: \`ps aux --sort=-%mem | head -10\`
3. Set temporary limits: \`kubectl set resources deployment <name> --limits=memory=2Gi\`
4. Restart affected services in dependency order
5. Set up memory alerts at 80% threshold

📚 **Reference:** INC-087 — Memory leak in cache module, resolved with kubectl resource limits + hotfix.`,
  },
  ssl: {
    keywords: ['ssl', 'certificate', 'expired', 'handshake', 'tls', '401', 'auth'],
    response: () => `**[SIMULATED – Offline Mode]**

**🔍 Pattern:** SSL/TLS certificate failure detected.

**🎯 Root Cause:** Certificate expiry — matches **INC-502** (91% relevance).

**✅ Resolution:**
1. Verify expiry: \`openssl x509 -enddate -noout -in /path/to/cert.pem\`
2. Check auto-renewal: \`certbot renew --dry-run\`
3. Fix permissions: \`chown root:root /etc/ssl/private/ && chmod 700 /etc/ssl/private/\`
4. Force renew: \`certbot renew --force-renewal\`
5. Reload nginx: \`systemctl reload nginx\`

📚 **Reference:** INC-502 — Cert expiry due to cron permission issue, resolved in 22 min.`,
  },
  database: {
    keywords: ['database', 'connection pool', 'pool exhausted', 'pg_', 'postgres', '503'],
    response: () => `**[SIMULATED – Offline Mode]**

**🔍 Pattern:** Database connection pool exhaustion detected.

**🎯 Root Cause:** Slow queries holding connections — matches **INC-315** (88% relevance).

**✅ Resolution:**
1. View slow queries: \`SELECT pid, query, state, query_start FROM pg_stat_activity WHERE state != 'idle';\`
2. Kill long-running: \`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query_start < NOW() - INTERVAL '30 seconds';\`
3. Increase pool temporarily: edit \`max_connections=150\` in postgresql.conf
4. Reload: \`systemctl reload postgresql\`
5. Investigate which deployment introduced the slow query

📚 **Reference:** INC-315 — Pool exhaustion from v2.3.2 slow query, resolved in 38 min.`,
  },
  generic: {
    keywords: [],
    response: (msg) => {
      const words = msg.toLowerCase().split(' ').filter(w => w.length > 3);
      return `**[SIMULATED – Offline Mode]**

I've analyzed your message and here's my assessment:

**🔍 Incident Analysis:**
I'm detecting a technical incident description. To provide the most accurate diagnosis, let me ask:

1. **What is the exact error message?** (copy the full message if possible)
2. **What node/environment is affected?** (e.g., Node-07, Production)  
3. **What command were you running** when this occurred?
4. **What changed recently?** (deployment, config update, traffic spike?)

**💡 General Guidance:**
Based on the terms I'm seeing, check:
- System resource utilization: \`top\`, \`free -h\`, \`df -h\`
- Service status: \`systemctl status <service>\`
- Recent logs: \`journalctl -u <service> -n 100 --no-pager\`
- Network connectivity: \`ss -tlnp\`

> Submit the full incident details using the **New Incident** form for AI fingerprinting and historical matching.`;
    },
  },
};

function detectOfflineScenario(message) {
  const lower = message.toLowerCase();
  for (const [key, scenario] of Object.entries(OFFLINE_SCENARIOS)) {
    if (key === 'generic') continue;
    if (scenario.keywords.some(kw => lower.includes(kw))) return scenario;
  }
  return OFFLINE_SCENARIOS.generic;
}

async function offlineResponse(messages) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const scenario = detectOfflineScenario(lastUser);
  const text = scenario.response(lastUser);

  // Simulate typing delay proportional to response length
  await new Promise(r => setTimeout(r, 800 + text.length * 1.2));
  return text;
}

// ─── ONLINE: OpenAI ────────────────────────────────────────────────────────────
async function callOpenAI(messages) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  if (!apiKey || apiKey === 'your-openai-api-key-here') throw new Error('OpenAI API key not configured.');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response from OpenAI.';
}

// ─── ONLINE: Anthropic Claude ─────────────────────────────────────────────────
async function callAnthropic(messages) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || 'https://api.anthropic.com/v1/messages';
  if (!apiKey || apiKey === 'your-anthropic-api-key-here') throw new Error('Anthropic API key not configured.');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL || 'claude-3-5-sonnet-20241022',
      system: SYSTEM_PROMPT,
      messages: messages.filter(m => m.role !== 'system'),
      max_tokens: 1200,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || 'No response from Claude.';
}

// ─── ONLINE: Google Gemini ────────────────────────────────────────────────────
async function callGemini(messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiModel = MODEL || 'gemini-1.5-pro';
  const endpoint = import.meta.env.VITE_AI_ENDPOINT ||
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') throw new Error('Gemini API key not configured.');

  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n---\nBegin conversation:' }] },
    { role: 'model', parts: [{ text: 'Understood. I am AILPA, ready to help investigate incidents.' }] },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.4, maxOutputTokens: 1200 } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
}

// ─── MASTER SEND FUNCTION ─────────────────────────────────────────────────────
/**
 * Send a message to the AI (online or offline).
 * @param {Array} messages   – Conversation history [{role, content}]
 * @param {object} context   – Optional incident context to prepend
 * @returns {Promise<string>} – AI response text
 */
export async function sendToAI(messages, context = null) {
  const enrichedMessages = context
    ? [
        {
          role: 'user',
          content: `[Incident Context]\n${JSON.stringify(context, null, 2)}\n\n[Engineer Message]\n${messages[messages.length - 1]?.content}`,
        },
        ...messages.slice(0, -1),
      ].reverse()
    : messages;

  if (!isOnline) {
    return offlineResponse(enrichedMessages);
  }

  try {
    switch (PROVIDER) {
      case 'anthropic': return await callAnthropic(enrichedMessages);
      case 'gemini':    return await callGemini(enrichedMessages);
      default:          return await callOpenAI(enrichedMessages);
    }
  } catch (err) {
    console.warn('[AILPA] Online AI failed, falling back to offline:', err.message);
    // Graceful fallback to offline simulation
    return `**⚠️ Online AI Unavailable** — falling back to simulation.\n\n${await offlineResponse(enrichedMessages)}`;
  }
}

/**
 * Generate a fingerprint explanation from the AI.
 */
export async function explainFingerprint(incident, fingerprint) {
  const prompt = `Analyze this incident and explain the technical fingerprint that was extracted:

**Incident:**
- Error: ${incident.errorMessage}
- Node: ${incident.node}
- Command: ${incident.commandsExecuted}
- Version: ${incident.softwareVersion}

**Extracted Fingerprint:**
- Error Signature: ${fingerprint.errorSignature}
- Command Signature: ${fingerprint.commandSignature}
- Keywords: ${fingerprint.keywords?.join(', ')}

Explain in 2-3 sentences why this fingerprint accurately captures the incident's technical identity and how it will be used to find similar historical incidents.`;

  return sendToAI([{ role: 'user', content: prompt }]);
}

/**
 * Get mode status info for display in UI.
 */
export function getAIStatus() {
  return {
    mode: MODE,
    provider: isOnline ? PROVIDER : 'simulation',
    model: isOnline ? MODEL : 'built-in',
    isOnline,
    statusLabel: isOnline ? `Online · ${PROVIDER} · ${MODEL}` : 'Offline · Simulation Engine',
    statusColor: isOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)',
  };
}
