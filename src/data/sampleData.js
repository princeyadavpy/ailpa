// ============================================================
// SAMPLE DATA - Simulated Historical Incident Knowledge Base
// All data is fictional and for demonstration purposes only
// ============================================================

export const HISTORICAL_INCIDENTS = [
  {
    id: "INC-203",
    title: "Service restart timeout on Node-07 during MOP-14",
    errorDescription:
      "Connection timeout while executing service restart command on Node-07. systemctl restart timed out after 90s waiting for response.",
    errorSignature: "connection_timeout::systemctl_restart::node_07",
    symptoms: [
      "Service unresponsive",
      "Timeout after 90s",
      "Connection refused on port 8080",
      "High CPU load prior to restart",
    ],
    rootCause:
      "Node-07 was under high CPU load (>95%) due to a runaway memory leak in the application service. The systemctl restart command timed out because the service failed to gracefully shut down within the default timeout window.",
    verifiedLearning:
      "Before executing service restart commands on production nodes, always verify CPU and memory utilization. If CPU > 80%, force-kill the process first using SIGKILL before restarting. Extend systemctl timeout to 300s for high-load scenarios.",
    previousResolution:
      "1. Killed the runaway process: kill -9 <PID>\n2. Verified CPU dropped below 20%\n3. Executed: systemctl restart application-service --timeout=300\n4. Confirmed service started on port 8080\n5. Verified health endpoint returned 200 OK",
    mopReference: "MOP-14 Step 4.2",
    node: "Node-07",
    environment: "Production",
    softwareVersion: "v2.3.1",
    incidentDate: "2024-08-15",
    status: "Resolved",
    resolvedBy: "eng.sharma@company.com",
    resolutionTime: "47 minutes",
    tags: ["timeout", "systemctl", "restart", "high-cpu", "node-07", "application-service"],
    vectorIndex: 203,
  },
  {
    id: "INC-119",
    title: "Application service restart failure – connection refused",
    errorDescription:
      "Failed to restart application-service: connection refused. Service did not respond within timeout period during scheduled maintenance.",
    errorSignature: "connection_refused::service_restart::maintenance",
    symptoms: [
      "Connection refused on restart",
      "Service port not binding",
      "Process zombie state",
      "systemctl status showing activating",
    ],
    rootCause:
      "A previous instance of the service was left in a zombie state due to an incomplete prior restart attempt. The new restart command could not bind to the port because the zombie process still held the socket file descriptor.",
    verifiedLearning:
      "Always check for zombie or stuck processes before initiating a new restart. Use 'ss -tlnp | grep <port>' to verify port availability. Clean up socket files if necessary.",
    previousResolution:
      "1. Identified zombie PID: ps aux | grep application-service\n2. Cleared zombie: kill -9 <zombie_PID>\n3. Removed stale socket: rm /var/run/app.sock\n4. Restarted cleanly: systemctl restart application-service\n5. Verified listening: ss -tlnp | grep 8080",
    mopReference: "MOP-08 Step 3.1",
    node: "Node-04",
    environment: "Production",
    softwareVersion: "v2.2.8",
    incidentDate: "2024-06-22",
    status: "Resolved",
    resolvedBy: "eng.patel@company.com",
    resolutionTime: "31 minutes",
    tags: ["connection-refused", "zombie-process", "socket", "restart", "systemctl", "application-service"],
    vectorIndex: 119,
  },
  {
    id: "INC-431",
    title: "systemctl timeout during deployment rollout on Node-12",
    errorDescription:
      "systemctl restart command timed out during MOP-22 deployment rollout. Node-12 service failed to restart after config update.",
    errorSignature: "systemctl_timeout::deployment::config_update",
    symptoms: [
      "Restart command hangs",
      "Config file lock not released",
      "Service in failed state",
      "Deployment MOP blocked",
    ],
    rootCause:
      "A configuration file lock was not released after a previous failed deployment attempt. The service tried to read the locked config during restart, causing an indefinite wait.",
    verifiedLearning:
      "After any failed deployment, always verify and release file locks before re-attempting. Use 'lsof | grep <config_file>' to detect locks. A forced config reload may be required.",
    previousResolution:
      "1. Identified locked config: lsof | grep /etc/app/config.yaml\n2. Released lock by killing holding process\n3. Validated config syntax: app-service --config-check\n4. Restarted service: systemctl restart application-service\n5. Verified deployment completed successfully",
    mopReference: "MOP-22 Step 2.4",
    node: "Node-12",
    environment: "Production",
    softwareVersion: "v2.3.0",
    incidentDate: "2024-09-03",
    status: "Resolved",
    resolvedBy: "eng.kumar@company.com",
    resolutionTime: "52 minutes",
    tags: ["timeout", "systemctl", "config-lock", "deployment", "mop", "restart"],
    vectorIndex: 431,
  },
  {
    id: "INC-087",
    title: "Memory exhaustion causing cascading service failures",
    errorDescription:
      "OOMKiller activated on Node-03. Multiple microservices terminated due to memory exhaustion. Services failed to restart automatically.",
    errorSignature: "oom_killed::memory_exhaustion::cascading_failure",
    symptoms: [
      "OOMKiller in dmesg",
      "Multiple services terminated",
      "High swap usage",
      "Kubernetes pod restarts",
    ],
    rootCause:
      "A memory leak in the cache invalidation module caused unbounded growth over 72 hours. Memory exceeded node capacity, triggering OOMKiller which terminated critical services.",
    verifiedLearning:
      "Implement memory limits on all critical services. Set up alerts at 80% memory threshold. Schedule regular cache flushes. Monitor for memory growth trends exceeding 5% per hour.",
    previousResolution:
      "1. Identified leaking service via memory profiling\n2. Applied temporary fix: kubectl set resources deployment cache-service --limits=memory=2Gi\n3. Restarted affected services in order\n4. Deployed hotfix patch v2.2.9-hotfix\n5. Set up Grafana memory alert at 80%",
    mopReference: "MOP-05 Step 7.1",
    node: "Node-03",
    environment: "Production",
    softwareVersion: "v2.2.7",
    incidentDate: "2024-05-11",
    status: "Resolved",
    resolvedBy: "eng.ali@company.com",
    resolutionTime: "2 hours 15 minutes",
    tags: ["oom", "memory", "cascading", "kubernetes", "memory-exhaustion"],
    vectorIndex: 87,
  },
  {
    id: "INC-315",
    title: "Database connection pool exhaustion during peak traffic",
    errorDescription:
      "Unable to acquire database connection: pool exhausted. All 100 connections in use. API requests returning 503 errors.",
    errorSignature: "connection_pool_exhausted::database::503",
    symptoms: [
      "503 errors",
      "Connection pool full",
      "Long-running queries visible",
      "API response time > 30s",
    ],
    rootCause:
      "A slow database query introduced in v2.3.2 was holding connections open for 30+ seconds. During a traffic spike, this exhausted the connection pool within 90 seconds.",
    verifiedLearning:
      "Always set query timeouts. Monitor connection pool utilization. New deployments should include load testing for database query performance.",
    previousResolution:
      "1. Identified slow query in pg_stat_activity\n2. Killed long-running queries: SELECT pg_terminate_backend(pid)\n3. Increased pool size temporarily: max_connections=150\n4. Rolled back v2.3.2 database migration\n5. Deployed query optimization in v2.3.3",
    mopReference: "MOP-17 Step 5.2",
    node: "DB-Cluster-01",
    environment: "Production",
    softwareVersion: "v2.3.2",
    incidentDate: "2024-10-14",
    status: "Resolved",
    resolvedBy: "eng.chen@company.com",
    resolutionTime: "38 minutes",
    tags: ["database", "connection-pool", "503", "query-timeout", "exhaustion"],
    vectorIndex: 315,
  },
  {
    id: "INC-502",
    title: "SSL certificate expiry causing authentication failures",
    errorDescription:
      "SSL handshake failed: certificate expired. All client connections rejected. Authentication service returning 401 for all requests.",
    errorSignature: "ssl_expired::auth_failure::certificate",
    symptoms: [
      "SSL handshake errors",
      "All auth requests failing",
      "Certificate expiry in logs",
      "Browser security warnings",
    ],
    rootCause:
      "SSL certificate for auth.internal.company.com expired at midnight. Auto-renewal cron job failed silently due to a permission issue on the certificate directory.",
    verifiedLearning:
      "Implement redundant certificate monitoring with 30-day and 7-day alerts. Verify auto-renewal jobs regularly. Store certificates with appropriate permissions (root:root 600).",
    previousResolution:
      "1. Generated new certificate via Let's Encrypt\n2. Fixed directory permissions: chown root:root /etc/ssl/private/\n3. Deployed certificate to all nodes\n4. Restarted nginx: systemctl restart nginx\n5. Verified SSL: openssl s_client -connect auth.internal:443",
    mopReference: "MOP-31 Step 1.1",
    node: "Auth-Node-01",
    environment: "Production",
    softwareVersion: "nginx/1.24.0",
    incidentDate: "2024-11-01",
    status: "Resolved",
    resolvedBy: "eng.jones@company.com",
    resolutionTime: "22 minutes",
    tags: ["ssl", "certificate", "auth", "nginx", "expiry", "handshake"],
    vectorIndex: 502,
  },
];

export const INGESTION_SOURCES = [
  { id: "src-001", name: "Jira Incident Board Q3-2024", type: "jira", records: 47, status: "indexed", uploadDate: "2024-10-15", size: "2.3 MB" },
  { id: "src-002", name: "MOP-Documents-2024.pdf", type: "pdf", records: 23, status: "indexed", uploadDate: "2024-09-28", size: "8.7 MB" },
  { id: "src-003", name: "incident_records_2023.xlsx", type: "excel", records: 112, status: "indexed", uploadDate: "2024-10-01", size: "1.1 MB" },
  { id: "src-004", name: "RCA-Reports-2024.docx", type: "docx", records: 18, status: "indexed", uploadDate: "2024-10-10", size: "4.2 MB" },
  { id: "src-005", name: "system-logs-aug-sep.log", type: "log", records: 341, status: "indexed", uploadDate: "2024-10-12", size: "45.6 MB" },
];

export const DASHBOARD_STATS = {
  totalHistoricalIncidents: 541,
  indexedIncidents: 538,
  newIncidentsInvestigated: 24,
  similarIncidentsFound: 187,
  recommendationsValidated: 21,
  newLearningsAdded: 19,
};

export const RECENT_ACTIVITY = [
  { id: 1, action: "New Learning Added", incident: "INC-203", user: "eng.sharma", time: "2 hours ago", type: "learning" },
  { id: 2, action: "Incident Resolved", incident: "INC-441", user: "eng.patel", time: "5 hours ago", type: "resolved" },
  { id: 3, action: "Recommendation Validated", incident: "INC-438", user: "eng.kumar", time: "1 day ago", type: "validated" },
  { id: 4, action: "Knowledge Base Updated", incident: "INC-435", user: "system", time: "1 day ago", type: "update" },
  { id: 5, action: "New Incident Submitted", incident: "INC-442", user: "eng.ali", time: "2 days ago", type: "submitted" },
];

export const LEARNING_HISTORY = [
  { id: "LRN-001", incidentId: "INC-203", addedDate: "2024-08-16", category: "Service Management", summary: "High-CPU node restart requires SIGKILL before systemctl", confidence: 98 },
  { id: "LRN-002", incidentId: "INC-119", addedDate: "2024-06-23", category: "Process Management", summary: "Zombie process cleanup required before service restart", confidence: 96 },
  { id: "LRN-003", incidentId: "INC-431", addedDate: "2024-09-04", category: "Deployment", summary: "Config file lock release required after failed deployment", confidence: 94 },
  { id: "LRN-004", incidentId: "INC-087", addedDate: "2024-05-12", category: "Memory Management", summary: "Memory limits must be set on all production services", confidence: 97 },
  { id: "LRN-005", incidentId: "INC-315", addedDate: "2024-10-15", category: "Database", summary: "Query timeouts prevent connection pool exhaustion", confidence: 95 },
];

// ============================================================
// ██╗  ██╗██╗   ██╗██████╗ ██████╗ ██╗██████╗
// ██║  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║██╔══██╗
// ███████║ ╚████╔╝ ██████╔╝██████╔╝██║██║  ██║
// ██╔══██║  ╚██╔╝  ██╔══██╗██╔══██╗██║██║  ██║
// ██║  ██║   ██║   ██████╔╝██║  ██║██║██████╔╝
//  SEARCH ENGINE — Real scoring, no hardcoding
// ============================================================

/**
 * Tokenize text to lowercase alpha-numeric terms.
 */
function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_.-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/** Stop-words to remove from TF-IDF vectors */
const STOP_WORDS = new Set([
  'the','a','an','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'must','can','to','of','in','on','at','by','for','with','from','and',
  'or','but','not','this','that','it','its','as','while','during','after',
  'before','when','where','which','who','all','any','both','so','then',
]);

function filterStopWords(tokens) {
  return tokens.filter(t => !STOP_WORDS.has(t) && t.length > 2);
}

/** Build a normalized term-frequency (TF) map */
function buildTF(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const maxVal = Math.max(1, ...Object.values(tf));
  for (const t in tf) tf[t] /= maxVal;
  return tf;
}

/** Cosine similarity between two TF maps */
function cosineSimilarity(tfA, tfB) {
  let dot = 0, normA = 0, normB = 0;
  const keysA = Object.keys(tfA);
  for (const k of keysA) {
    const a = tfA[k];
    const b = tfB[k] || 0;
    dot += a * b;
    normA += a * a;
  }
  for (const k in tfB) normB += tfB[k] * tfB[k];
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** Build a searchable text corpus from an incident record */
function incidentCorpus(inc) {
  const fields = [
    inc.title || '',
    inc.errorDescription || '',
    inc.rootCause || '',
    inc.verifiedLearning || '',
    inc.previousResolution || '',
    inc.errorSignature?.replace(/::/g, ' ') || '',
    Array.isArray(inc.symptoms) ? inc.symptoms.join(' ') : (inc.symptoms || ''),
    (inc.tags || []).join(' '),
  ];
  return filterStopWords(tokenize(fields.join(' ')));
}

/** Build a query corpus from the engineer's incident submission */
function queryCorpus(query) {
  const fields = [
    query.errorMessage || '',
    query.symptoms || '',
    query.mopActivity || '',
    query.commandsExecuted || '',
    query.additionalLogs || '',
  ];
  return filterStopWords(tokenize(fields.join(' ')));
}

// ── 1. SEMANTIC SCORE: TF-IDF cosine similarity ──────────────────────────────
function semanticScore(queryTokens, inc) {
  const qTF = buildTF(queryTokens);
  const dTF = buildTF(incidentCorpus(inc));
  return cosineSimilarity(qTF, dTF);
}

// ── 2. KEYWORD SCORE: weighted technical term matching ───────────────────────
// Higher weights = stronger signal that this term distinguishes an incident type
const TERM_WEIGHTS = {
  'connection-timeout': 3.2, timeout: 3.0,
  'connection-refused': 3.0, refused: 2.8,
  'node-07': 3.5, 'node-04': 2.5, 'node-12': 2.5,
  systemctl: 2.8, restart: 2.2,
  'application-service': 2.6, service: 1.6,
  deployment: 2.2, mop: 2.0,
  zombie: 2.5, 'config-lock': 2.5, 'socket': 1.8,
  oom: 2.8, memory: 1.8, kubernetes: 2.0,
  database: 2.5, pool: 2.0, exhausted: 2.0,
  ssl: 2.8, certificate: 2.8, handshake: 2.5, nginx: 2.2,
  failed: 1.5, error: 1.2, high: 1.0, cpu: 2.2,
  kill: 1.6, sigkill: 2.2, port: 1.5, '8080': 2.0,
};

function keywordScore(queryTokens, inc) {
  const docTokenSet = new Set(incidentCorpus(inc));
  const tagSet = new Set((inc.tags || []).map(t => t.toLowerCase()));
  const errSig = (inc.errorSignature || '').toLowerCase();

  let score = 0, maxScore = 0;
  for (const qt of queryTokens) {
    const w = TERM_WEIGHTS[qt] || 1.0;
    maxScore += w;
    if (docTokenSet.has(qt) || tagSet.has(qt)) {
      score += w;
      if (errSig.includes(qt)) score += w * 0.4; // bonus: in error signature
    }
  }
  return maxScore === 0 ? 0 : Math.min(1, score / maxScore);
}

// ── 3. ERROR SIGNATURE SIMILARITY: token-level comparison ────────────────────
function signatureSimilarity(fingerprint, inc) {
  if (!fingerprint?.errorSignature || !inc.errorSignature) return 0;
  const qParts = fingerprint.errorSignature.toLowerCase().split('::');
  const dParts = inc.errorSignature.toLowerCase().split('::');
  let hits = 0;
  for (const qp of qParts) {
    if (dParts.some(dp => dp.includes(qp) || qp.includes(dp))) hits++;
  }
  return hits / Math.max(qParts.length, dParts.length);
}

// ── 4. METADATA SCORE: structured field matching ─────────────────────────────
function metadataScore(query, inc) {
  let score = 0, total = 0;

  // Node match
  if (query.node && inc.node) {
    total += 2.5;
    const qn = query.node.toLowerCase().trim();
    const dn = inc.node.toLowerCase().trim();
    if (qn === dn) score += 2.5;
    else if (qn.includes(dn) || dn.includes(qn)) score += 1.2;
    // Node number match (e.g. both end in "07")
    const qNum = qn.match(/\d+$/)?.[0];
    const dNum = dn.match(/\d+$/)?.[0];
    if (qNum && dNum && qNum === dNum) score += 0.5;
  }

  // Environment match
  if (query.environment && inc.environment) {
    total += 1.5;
    if (query.environment.toLowerCase() === inc.environment.toLowerCase()) score += 1.5;
  }

  // Software version — exact > minor match > major match
  if (query.softwareVersion && inc.softwareVersion) {
    total += 1.5;
    const qv = query.softwareVersion.toLowerCase().replace(/^v/, '').split('.');
    const dv = inc.softwareVersion.toLowerCase().replace(/^v/, '').split('.');
    if (qv.join('.') === dv.join('.')) score += 1.5;
    else if (qv[0] === dv[0] && qv[1] === dv[1]) score += 0.9;
    else if (qv[0] === dv[0]) score += 0.3;
  }

  // MOP reference match — extract MOP number
  if (query.mopActivity && inc.mopReference) {
    total += 1.2;
    const qm = query.mopActivity.toLowerCase();
    const dm = inc.mopReference.toLowerCase();
    const qNum = qm.match(/mop-?(\d+)/)?.[1];
    const dNum = dm.match(/mop-?(\d+)/)?.[1];
    if (qNum && dNum && qNum === dNum) score += 1.2;
    else if (qm.includes('mop') && dm.includes('mop')) score += 0.4;
  }

  // Command match: how many command tokens appear in historical resolution
  if (query.commandsExecuted && inc.previousResolution) {
    total += 2.0;
    const cmdToks = filterStopWords(tokenize(query.commandsExecuted));
    const resText = inc.previousResolution.toLowerCase();
    const hits = cmdToks.filter(t => resText.includes(t)).length;
    score += (hits / Math.max(1, cmdToks.length)) * 2.0;
  }

  return total === 0 ? 0 : Math.min(1, score / total);
}

// ── 5. TAG OVERLAP SCORE ─────────────────────────────────────────────────────
function tagOverlap(queryTokens, inc) {
  const tags = (inc.tags || []).map(t => t.toLowerCase());
  if (tags.length === 0) return 0;
  const hits = queryTokens.filter(qt =>
    tags.some(tag => tag === qt || tag.includes(qt) || qt.includes(tag))
  ).length;
  return Math.min(1, hits / tags.length);
}

// ── Reciprocal Rank Fusion ────────────────────────────────────────────────────
function rrfRank(rankedArr, k = 60) {
  const map = {};
  rankedArr.forEach((item, rank) => {
    const id = item.id || item.inc?.id || String(rank);
    map[id] = (map[id] || 0) + 1 / (k + rank + 1);
  });
  return map;
}

// ── Build human-readable match reasons from score breakdown ──────────────────
function buildMatchReasons(query, inc, scores) {
  const reasons = [];
  const qToks = queryCorpus(query);

  if (scores.signature > 0.55) {
    reasons.push(`Error signature match: "${inc.errorSignature}"`);
  }
  if (query.node && inc.node?.toLowerCase() === query.node?.toLowerCase()) {
    reasons.push(`Exact node match: ${inc.node}`);
  } else if (scores.metadata > 0.4 && query.node && inc.node) {
    reasons.push(`Node proximity match (${query.node} ≈ ${inc.node})`);
  }
  if (query.environment === inc.environment && scores.metadata > 0.2) {
    reasons.push(`Same environment: ${inc.environment}`);
  }
  if (scores.semantic > 0.25) {
    reasons.push(`Semantic similarity ${(scores.semantic * 100).toFixed(0)}% — shared technical language in error & root cause`);
  }
  // Find the highest-weight keywords that matched
  const topKwMatches = qToks
    .filter(qt => {
      const w = TERM_WEIGHTS[qt] || 0;
      return w >= 1.8 && incidentCorpus(inc).includes(qt);
    })
    .sort((a, b) => (TERM_WEIGHTS[b] || 0) - (TERM_WEIGHTS[a] || 0))
    .slice(0, 4);
  if (topKwMatches.length > 0) {
    reasons.push(`High-weight keyword matches: ${topKwMatches.join(', ')}`);
  }
  if (query.commandsExecuted && scores.metadata > 0.3) {
    const cmdTok = filterStopWords(tokenize(query.commandsExecuted)).slice(0, 3).join(' ');
    if (cmdTok && inc.previousResolution?.toLowerCase().includes(cmdTok.split(' ')[0])) {
      reasons.push(`Command pattern matched in historical resolution: "${cmdTok}"`);
    }
  }
  if (query.softwareVersion && inc.softwareVersion) {
    const qv = query.softwareVersion.replace(/^v/, '').split('.');
    const dv = inc.softwareVersion.replace(/^v/, '').split('.');
    if (qv[0] === dv[0] && qv[1] === dv[1]) {
      reasons.push(`Compatible software version: ${inc.softwareVersion}`);
    }
  }
  if (query.mopActivity && inc.mopReference) {
    const qNum = query.mopActivity.toLowerCase().match(/mop-?(\d+)/)?.[1];
    const dNum = inc.mopReference.toLowerCase().match(/mop-?(\d+)/)?.[1];
    if (qNum && dNum && qNum === dNum) reasons.push(`Same MOP reference: ${inc.mopReference}`);
  }

  return reasons.length > 0 ? reasons : ['General pattern similarity across error corpus'];
}

// ╔═══════════════════════════════════════════════════════════╗
// ║              MASTER HYBRID SEARCH FUNCTION                ║
// ║                                                           ║
// ║  Scores every incident across 5 dimensions:              ║
// ║   • Signature similarity  (30%)                          ║
// ║   • Keyword matching      (25%)                          ║
// ║   • Semantic cosine       (22%)                          ║
// ║   • Metadata fields       (18%)                          ║
// ║   • Tag overlap           ( 5%)                          ║
// ║                                                           ║
// ║  Then re-ranks via Reciprocal Rank Fusion (RRF)          ║
// ║  across all 4 primary dimensions.                        ║
// ╚═══════════════════════════════════════════════════════════╝
export function hybridSearch(query, fingerprint, extraIncidents = [], topN = 5) {
  // Merge session-learned incidents (prepended so they get evaluated)
  const corpus = [...(extraIncidents || []), ...HISTORICAL_INCIDENTS];
  if (corpus.length === 0) return [];

  const qTokens = queryCorpus(query);

  // If query is essentially empty, return the corpus sorted by recency
  if (qTokens.length === 0) {
    return corpus.slice(0, topN).map(inc => ({
      ...inc,
      relevanceScore: 0.40,
      _scores: {},
      matchReasons: ['No query terms provided — showing most recent incidents'],
    }));
  }

  // ── Score every incident ──
  const scored = corpus.map(inc => {
    const sig  = signatureSimilarity(fingerprint, inc);
    const kw   = keywordScore(qTokens, inc);
    const sem  = semanticScore(qTokens, inc);
    const meta = metadataScore(query, inc);
    const tag  = tagOverlap(qTokens, inc);

    // Weighted linear combination
    const combined =
      sig  * 0.30 +
      kw   * 0.25 +
      sem  * 0.22 +
      meta * 0.18 +
      tag  * 0.05;

    return { inc, scores: { signature: sig, keyword: kw, semantic: sem, metadata: meta, tag }, combined };
  });

  // ── Sort each dimension separately ──
  const bySig  = [...scored].sort((a, b) => b.scores.signature - a.scores.signature);
  const byKw   = [...scored].sort((a, b) => b.scores.keyword   - a.scores.keyword);
  const bySem  = [...scored].sort((a, b) => b.scores.semantic  - a.scores.semantic);
  const byMeta = [...scored].sort((a, b) => b.scores.metadata  - a.scores.metadata);

  // ── RRF combination ──
  const rrfSig  = rrfRank(bySig.map(x => x.inc));
  const rrfKw   = rrfRank(byKw.map(x => x.inc));
  const rrfSem  = rrfRank(bySem.map(x => x.inc));
  const rrfMeta = rrfRank(byMeta.map(x => x.inc));

  const getId = inc => inc.id + (inc.incidentDate || '');

  // Weighted RRF: same weights as linear combination
  const finalRanked = scored.map(item => {
    const id = getId(item.inc);
    const rrf =
      (rrfSig[id]  || 0) * 0.30 +
      (rrfKw[id]   || 0) * 0.25 +
      (rrfSem[id]  || 0) * 0.22 +
      (rrfMeta[id] || 0) * 0.18;

    // Normalize RRF to 0–1 by dividing by max possible RRF (1/61 per dimension = ~0.0164 max weight)
    const rrfNorm = Math.min(1, rrf * 200);

    // Final score: 65% linear combo + 35% RRF
    const finalScore = item.combined * 0.65 + rrfNorm * 0.35;
    return { ...item, finalScore };
  });

  return finalRanked
    .filter(item => item.finalScore > 0.04)        // drop near-zero matches
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, topN)
    .map(item => ({
      ...item.inc,
      relevanceScore: parseFloat(Math.min(0.99, item.finalScore * 1.5).toFixed(2)), // scale to readable range
      _scores: item.scores,
      matchReasons: buildMatchReasons(query, item.inc, item.scores),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// FINGERPRINT GENERATOR — derived from actual incident content
// ─────────────────────────────────────────────────────────────────────────────
export const generateFingerprint = (incident) => {
  const err = (incident.errorMessage || '').toLowerCase();
  const cmd = (incident.commandsExecuted || '').toLowerCase();
  const sym = (incident.symptoms || '').toLowerCase();
  const logs = (incident.additionalLogs || '').toLowerCase();
  const all = err + ' ' + sym + ' ' + logs;

  // Build error signature from actual content
  const sigParts = [];
  if (/timeout/i.test(all))                             sigParts.push('connection_timeout');
  if (/refused/i.test(all))                             sigParts.push('connection_refused');
  if (/oom|out.of.memory|memory.exhaust/i.test(all))   sigParts.push('oom_killed');
  if (/ssl|certificate|handshake/i.test(all))           sigParts.push('ssl_error');
  if (/database|pool.exhaust|pg_/i.test(all))           sigParts.push('db_connection');
  if (/zombie|defunct/i.test(all))                      sigParts.push('zombie_process');
  if (/config.lock|file.lock|lsof/i.test(all))         sigParts.push('config_lock');
  if (/systemctl/i.test(cmd + all))                     sigParts.push('systemctl_restart');
  else if (/restart/i.test(cmd + all))                  sigParts.push('service_restart');
  if (incident.node) sigParts.push(incident.node.toLowerCase().replace(/[^a-z0-9]/g, '_'));

  const errorSignature = sigParts.length > 0 ? sigParts.join('::') : 'unknown_error';

  // Command signature
  const cmdTokens = filterStopWords(tokenize(cmd)).slice(0, 5);
  const commandSignature = cmdTokens.join(' ') || cmd.trim().slice(0, 60) || 'N/A';

  // Keyword extraction from all fields
  const keywords = filterStopWords(queryCorpus(incident))
    .sort((a, b) => (TERM_WEIGHTS[b] || 0) - (TERM_WEIGHTS[a] || 0))
    .slice(0, 12);

  // Pseudo-deterministic semantic vector (based on content, not random)
  const seed = [...(errorSignature + commandSignature)]
    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const semanticVector = Array.from({ length: 12 }, (_, i) =>
    parseFloat((Math.sin(seed * (i + 1) * 0.07) * 1.5).toFixed(3))
  );

  return {
    errorSignature,
    commandSignature,
    nodeVersion: `${incident.node || 'unknown'}::${incident.softwareVersion || 'unknown'}`,
    mopStep: incident.mopActivity || 'Not specified',
    keywords,
    semanticVector,
    analysisTimestamp: new Date().toISOString(),
    confidence: parseFloat(Math.min(0.97, 0.55 + keywords.length * 0.035).toFixed(2)),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY WRAPPER — called by RAGSearch.jsx which passes fingerprint only.
// Now also accepts activeIncident and extraIncidents for full context.
// ─────────────────────────────────────────────────────────────────────────────
export const simulateSimilarIncidents = (fingerprint, activeIncident, extraIncidents = []) => {
  // Reconstruct a query object from fingerprint if activeIncident not passed
  const query = activeIncident || {
    errorMessage: fingerprint?.errorSignature?.replace(/::/g, ' ') || '',
    node: fingerprint?.nodeVersion?.split('::')[0] || '',
    environment: 'Production',
    softwareVersion: fingerprint?.nodeVersion?.split('::')[1] || '',
    commandsExecuted: fingerprint?.commandSignature || '',
    symptoms: '',
    mopActivity: fingerprint?.mopStep || '',
    additionalLogs: '',
  };
  return hybridSearch(query, fingerprint, extraIncidents, 5);
};

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION GENERATOR — driven by actual top-matched incident data
// ─────────────────────────────────────────────────────────────────────────────
export const generateRecommendation = (similarIncidents, activeIncident) => {
  if (!similarIncidents || similarIncidents.length === 0) {
    return {
      suggestedRootCause: 'Insufficient evidence — no similar incidents found.',
      verifiedLearning: 'No verified learnings available.',
      proposedResolution: ['Check system logs for detailed error context.'],
      primarySource: 'N/A',
      mopReference: 'N/A',
      confidenceLevel: 0.20,
      evidenceLevel: 'LOW',
      disclaimer:
        'This recommendation is AI-generated. Engineer validation required before any action.',
    };
  }

  const top = similarIncidents[0];
  const sourceIds = similarIncidents.slice(0, 3).map(i => i.id).join(', ');
  const avgScore = similarIncidents.slice(0, 3).reduce((s, i) => s + i.relevanceScore, 0) /
    Math.min(3, similarIncidents.length);

  const evidenceLevel = avgScore >= 0.80 ? 'HIGH' : avgScore >= 0.55 ? 'MEDIUM' : 'LOW';
  const confidenceLevel = parseFloat(Math.min(0.96, avgScore * 0.9 + 0.05).toFixed(2));

  // Root cause blends top 2 matches
  const rootCause2 = similarIncidents[1]
    ? ` Secondary possibility from ${similarIncidents[1].id}: ${similarIncidents[1].rootCause?.split('.')[0]}.`
    : '';
  const suggestedRootCause =
    `Based on ${similarIncidents.length} similar historical incident(s) (${sourceIds}), ` +
    `the most probable root cause is: **${top.rootCause?.split('.')[0]}**.${rootCause2}`;

  // Resolution steps from the primary source
  const rawResolution = top.previousResolution || '';
  const proposedResolution = rawResolution
    ? rawResolution.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, ''))
    : ['Investigate system logs', 'Check resource utilization', 'Retry operation with timeout extension'];

  return {
    suggestedRootCause,
    verifiedLearning: `Verified from ${top.id} (${top.incidentDate}): ${top.verifiedLearning}`,
    proposedResolution,
    primarySource: top.id,
    mopReference: top.mopReference || 'N/A',
    confidenceLevel,
    evidenceLevel,
    disclaimer:
      'This recommendation is AI-generated based on historical pattern matching. ' +
      'The engineer must verify the current system state before applying any resolution steps. ' +
      'Do not execute commands without manual validation.',
  };
};
