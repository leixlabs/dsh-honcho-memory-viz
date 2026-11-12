/**
 * Host half of the Honcho memory explorer.
 *
 * A read-only JSON API over the memory stored on the user's Honcho server. The
 * Browser half renders it in a sidebar main panel. Credentials, the base URL,
 * the workspace and the peer name all come from the shared `~/.honcho/config.json`
 * (the same file dsh-honcho reads), with optional per-row config overrides.
 *
 * Routes are served under `/honcho-memory`, so the Client only fetches
 * same-origin JSON and never learns the API key.
 *
 * Transport: a keep-alive `node:http`/`node:https` agent with two sockets. The
 * self-hosted server on the LAN pays a name-resolution and connect cost per new
 * socket, so reusing sockets keeps a multi-request page load fast.
 */
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import http from 'node:http'
import https from 'node:https'

const PREFIX = '/honcho-memory'
const DEFAULT_BASE_URL = 'https://api.honcho.dev'
const DEFAULT_TIMEOUT_MS = 20000
const CONFIG_TTL_MS = 15000

/** Thrown for a non-2xx Honcho response, carrying the reason for the UI. */
class HonchoError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HonchoError'
    this.status = status
  }
}

const now = () => Date.now()

function encode(value) {
  return encodeURIComponent(String(value))
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return undefined
}

/** Expand `${NAME}` and `$NAME` from the environment, like dsh-honcho does. */
function expandEnv(value) {
  if (typeof value !== 'string') return undefined
  const whole = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/.exec(value.trim())
  if (whole) return process.env[whole[1]] ?? value
  return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => process.env[name] ?? '')
}

function normalizeBaseUrl(value) {
  let base = firstString(value) ?? DEFAULT_BASE_URL
  base = base.replace(/\/+$/, '')
  if (/\/v3$/i.test(base)) base = base.slice(0, -3)
  return base
}

function describeFailure(status, data) {
  const detail = data && typeof data === 'object' ? data.detail ?? data.error ?? data : data
  if (typeof detail === 'string' && detail.trim() !== '') return `HTTP ${status}: ${detail}`
  if (detail !== null && typeof detail === 'object') {
    try {
      const text = JSON.stringify(detail)
      if (text.length <= 400) return `HTTP ${status}: ${text}`
    } catch {
      /* fall through to the generic message */
    }
  }
  return `HTTP ${status} from the Honcho server`
}

/** One keep-alive transport shared by every request of this plugin instance. */
function createTransport(baseUrl) {
  const protocol = new URL(baseUrl).protocol
  const options = { keepAlive: true, maxSockets: 2, maxFreeSockets: 2, timeout: 30000 }
  return {
    agent: protocol === 'https:' ? new https.Agent(options) : new http.Agent(options),
    dispose() {
      this.agent.destroy()
    },
  }
}

function rawRequest(transport, target, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(target)
    const lib = url.protocol === 'https:' ? https : http
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const request = lib.request(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      agent: transport.agent,
    }, (response) => {
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve({
        status: response.statusCode ?? 0,
        text: Buffer.concat(chunks).toString('utf8'),
      }))
      response.on('error', reject)
    })
    request.setTimeout(timeoutMs, () => request.destroy(new Error(`request timed out after ${timeoutMs}ms`)))
    request.on('error', reject)
    if (options.body !== undefined) request.write(options.body)
    request.end()
  })
}

/** A tiny, dependency-free Honcho v3 REST client for read-only calls. */
function createClient(config, state) {
  const base = normalizeBaseUrl(config.baseUrl)
  const transport = state.transport ?? (state.transport = createTransport(base))
  const headers = { accept: 'application/json' }
  if (config.apiKey) headers.authorization = `Bearer ${config.apiKey}`
  if (config.userAgent) headers['user-agent'] = config.userAgent

  async function request(path, options = {}) {
    const url = new URL(`${base}/v3${path}`)
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
    const requestHeaders = { ...headers }
    let body
    if (options.body !== undefined) {
      requestHeaders['content-type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
    let exchange
    try {
      exchange = await rawRequest(transport, url, {
        method: options.method ?? 'GET',
        headers: requestHeaders,
        body,
        timeoutMs: options.timeoutMs ?? (config.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      })
    } catch (error) {
      throw new HonchoError(`无法连接 Honcho 服务器 ${base}：${error.message}`, 0)
    }
    let data = null
    if (exchange.text !== '') {
      try {
        data = JSON.parse(exchange.text)
      } catch {
        data = exchange.text
      }
    }
    if (exchange.status < 200 || exchange.status >= 300) {
      throw new HonchoError(describeFailure(exchange.status, data), exchange.status)
    }
    return data
  }

  async function list(path, { page = 1, size = 50, reverse = false, filters, timeoutMs } = {}) {
    return request(path, {
      method: 'POST',
      query: { page, size, ...(reverse ? { reverse: 'true' } : {}) },
      body: filters === undefined ? {} : { filters },
      timeoutMs,
    })
  }

  async function ping() {
    try {
      const exchange = await rawRequest(transport, `${base}/health`, { headers, timeoutMs: 5000 })
      return exchange.status >= 200 && exchange.status < 300
    } catch {
      return false
    }
  }

  return { baseUrl: base, request, list, ping, state }
}

const cache = new Map()

async function cached(key, ttlMs, produce, force = false) {
  const at = now()
  const hit = cache.get(key)
  if (!force && hit !== undefined && at - hit.at < ttlMs) return hit.value
  const value = await produce()
  cache.set(key, { at, value })
  return value
}

/** Read the shared integration config file; a missing or broken file is not fatal. */
async function readConfigFile(configPath) {
  try {
    const text = await readFile(configPath, 'utf8')
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

async function resolveConfig(config, state) {
  const at = now()
  if (state.config !== undefined && at - state.configAt < CONFIG_TTL_MS) return state.config
  const configPath = firstString(config.configPath, join(homedir(), '.honcho', 'config.json'))
  const file = await readConfigFile(configPath)
  const host = file.hosts && typeof file.hosts === 'object' ? file.hosts.dsh ?? {} : {}
  const auth = file.auth && typeof file.auth === 'object' ? file.auth : {}
  const resolved = {
    configPath,
    baseUrl: normalizeBaseUrl(firstString(config.baseUrl, host.baseUrl, file.baseUrl, process.env.HONCHO_URL)),
    workspace: firstString(config.workspace, host.workspace, file.workspace) ?? 'default',
    peerName: firstString(config.peerName, host.peerName, file.peerName) ?? 'user',
    apiKey: expandEnv(firstString(config.apiKey, host.apiKey, auth.apiKey, process.env.HONCHO_API_KEY)),
    timeoutMs: Number.isFinite(config.timeoutMs) && config.timeoutMs > 0 ? config.timeoutMs : DEFAULT_TIMEOUT_MS,
    userAgent: firstString(config.userAgent),
  }
  state.config = resolved
  state.configAt = at
  return resolved
}

function asItems(result) {
  return Array.isArray(result?.items) ? result.items : []
}

function asTotal(result, fallback = 0) {
  if (typeof result?.total === 'number') return result.total
  return Array.isArray(result?.items) ? result.items.length : fallback
}

/** Peer / session / conclusion totals for one workspace. */
function workspaceStats(client, workspaceId, force) {
  return cached(`stats:${workspaceId}`, 30000, async () => {
    const base = `/workspaces/${encode(workspaceId)}`
    const [peers, sessions, conclusions] = await Promise.all([
      client.list(`${base}/peers/list`, { size: 1 }),
      client.list(`${base}/sessions/list`, { size: 1 }),
      client.list(`${base}/conclusions/list`, { size: 1 }),
    ])
    return { peers: asTotal(peers), sessions: asTotal(sessions), conclusions: asTotal(conclusions) }
  }, force)
}

async function listWorkspaces(client, force) {
  return cached('workspaces', 30000, async () => {
    const result = await client.list('/workspaces/list', { size: 100 })
    const items = asItems(result)
    const withStats = await Promise.all(items.map(async (workspace) => {
      const id = String(workspace.id ?? '')
      let stats = { peers: 0, sessions: 0, conclusions: 0 }
      try {
        stats = await workspaceStats(client, id, false)
      } catch {
        /* a workspace that fails still lists, its counts stay zero */
      }
      return {
        id,
        createdAt: workspace.created_at ?? null,
        metadata: workspace.metadata ?? {},
        ...stats,
      }
    }))
    withStats.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.id.localeCompare(b.id))
    return withStats
  }, force)
}

function mapConclusion(item) {
  return {
    id: String(item.id ?? ''),
    content: String(item.content ?? ''),
    observerId: item.observer_id ?? null,
    observedId: item.observed_id ?? null,
    sessionId: item.session_id ?? null,
    createdAt: item.created_at ?? null,
    level: item.level ?? null,
  }
}

function mapMessage(item) {
  return {
    id: String(item.id ?? ''),
    content: String(item.content ?? ''),
    peerId: item.peer_id ?? null,
    sessionId: item.session_id ?? null,
    createdAt: item.created_at ?? null,
    tokenCount: typeof item.token_count === 'number' ? item.token_count : null,
  }
}

function mapSession(item) {
  return {
    id: String(item.id ?? ''),
    createdAt: item.created_at ?? null,
    isActive: item.is_active !== false,
    metadata: item.metadata ?? {},
  }
}

function mapPeer(item) {
  return {
    id: String(item.id ?? ''),
    createdAt: item.created_at ?? null,
    metadata: item.metadata ?? {},
  }
}

async function workspaceOverview(client, config, workspaceId, force) {
  return cached(`overview:${workspaceId}`, 15000, async () => {
    const base = `/workspaces/${encode(workspaceId)}`
    const [peersResult, sessionsResult, recentConclusions, queue, workspaces] = await Promise.all([
      client.list(`${base}/peers/list`, { size: 100 }),
      client.list(`${base}/sessions/list`, { page: 1, size: 12, reverse: true }),
      client.list(`${base}/conclusions/list`, { page: 1, size: 10, reverse: true }),
      client.request(`${base}/queue/status`).catch(() => null),
      listWorkspaces(client, false),
    ])
    const peers = asItems(peersResult).map(mapPeer)
    const sessions = asItems(sessionsResult).map(mapSession)
    const configuredPeer = peers.find((peer) => peer.id === config.peerName) ?? null
    let card = null
    let representation = null
    if (configuredPeer !== null) {
      const [cardResult, representationResult] = await Promise.all([
        client.request(`${base}/peers/${encode(configuredPeer.id)}/card`).catch(() => null),
        client.request(`${base}/peers/${encode(configuredPeer.id)}/representation`, { method: 'POST', body: {} }).catch(() => null),
      ])
      card = Array.isArray(cardResult?.peer_card) ? cardResult.peer_card : null
      representation = typeof representationResult?.representation === 'string' ? representationResult.representation : null
    }
    return {
      workspace: workspaceId,
      configuredPeer: config.peerName,
      stats: {
        peers: asTotal(peersResult, peers.length),
        sessions: asTotal(sessionsResult, sessions.length),
        conclusions: asTotal(recentConclusions),
      },
      queue: queue === null ? null : {
        total: queue.total_work_units ?? 0,
        pending: queue.pending_work_units ?? 0,
        inProgress: queue.in_progress_work_units ?? 0,
        completed: queue.completed_work_units ?? 0,
      },
      peers,
      sessions,
      recentConclusions: asItems(recentConclusions).map(mapConclusion),
      card,
      representation,
      workspaces,
    }
  }, force)
}

async function conclusionsPage(client, workspaceId, query) {
  const page = Math.max(1, Number.parseInt(query.get('page') ?? '1', 10) || 1)
  const size = Math.min(100, Math.max(1, Number.parseInt(query.get('size') ?? '30', 10) || 30))
  const filters = {}
  const observer = query.get('observer')
  const observed = query.get('observed')
  const session = query.get('session')
  const level = query.get('level')
  if (observer) filters.observer_id = observer
  if (observed) filters.observed_id = observed
  if (session) filters.session_id = session
  if (level) filters.level = level
  const base = `/workspaces/${encode(workspaceId)}`
  const result = await client.list(`${base}/conclusions/list`, { page, size, reverse: true, filters })
  return {
    items: asItems(result).map(mapConclusion),
    total: asTotal(result),
    page: result.page ?? page,
    size: result.size ?? size,
    pages: result.pages ?? 0,
    filters,
  }
}

async function sessionDetail(client, workspaceId, sessionId, query) {
  const page = Math.max(1, Number.parseInt(query.get('page') ?? '1', 10) || 1)
  const size = Math.min(100, Math.max(1, Number.parseInt(query.get('size') ?? '40', 10) || 40))
  const base = `/workspaces/${encode(workspaceId)}`
  const [sessionResult, summaries, messages] = await Promise.all([
    client.request(`${base}/sessions/${encode(sessionId)}`).catch(() => null),
    client.request(`${base}/sessions/${encode(sessionId)}/summaries`).catch(() => null),
    client.list(`${base}/sessions/${encode(sessionId)}/messages/list`, { page, size, reverse: true }),
  ])
  const short = summaries?.short_summary?.content
  const long = summaries?.long_summary?.content
  return {
    session: sessionResult === null ? { id: sessionId } : mapSession(sessionResult),
    summaries: {
      short: typeof short === 'string' && short !== '' ? short : null,
      long: typeof long === 'string' && long !== '' ? long : null,
    },
    messages: {
      items: asItems(messages).map(mapMessage),
      total: asTotal(messages),
      page: messages.page ?? page,
      size: messages.size ?? size,
      pages: messages.pages ?? 0,
    },
  }
}

async function peerDetail(client, config, workspaceId, peerId, query) {
  const page = Math.max(1, Number.parseInt(query.get('page') ?? '1', 10) || 1)
  const size = Math.min(100, Math.max(1, Number.parseInt(query.get('size') ?? '20', 10) || 20))
  const base = `/workspaces/${encode(workspaceId)}`
  const [cardResult, representationResult, about, byPeer] = await Promise.all([
    client.request(`${base}/peers/${encode(peerId)}/card`).catch(() => null),
    client.request(`${base}/peers/${encode(peerId)}/representation`, { method: 'POST', body: {} }).catch(() => null),
    client.list(`${base}/conclusions/list`, { page, size, reverse: true, filters: { observed_id: peerId } }),
    client.list(`${base}/conclusions/list`, { page: 1, size: 10, reverse: true, filters: { observer_id: peerId } }).catch(() => null),
  ])
  return {
    peer: { id: peerId },
    card: Array.isArray(cardResult?.peer_card) ? cardResult.peer_card : null,
    representation: typeof representationResult?.representation === 'string' ? representationResult.representation : null,
    about: {
      items: asItems(about).map(mapConclusion),
      total: asTotal(about),
      page: about.page ?? page,
      size: about.size ?? size,
      pages: about.pages ?? 0,
    },
    byPeer: {
      items: asItems(byPeer).map(mapConclusion),
      total: asTotal(byPeer),
    },
  }
}

function topEntries(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }))
}

/**
 * Relationship data for the graph tab. Peer totals are exact (list endpoints);
 * edges are counted inside the most recent conclusions, so the payload stays
 * bounded on a workspace with thousands of conclusions.
 */
async function graphData(client, config, workspaceId, force) {
  return cached(`graph:${workspaceId}`, 45000, async () => {
    const base = `/workspaces/${encode(workspaceId)}`
    const [peersResult, sessionsResult, totals, ...pages] = await Promise.all([
      client.list(`${base}/peers/list`, { size: 100 }),
      client.list(`${base}/sessions/list`, { page: 1, size: 200, reverse: true }).catch(() => null),
      workspaceStats(client, workspaceId, false).catch(() => null),
      client.list(`${base}/conclusions/list`, { page: 1, size: 100, reverse: true }),
      client.list(`${base}/conclusions/list`, { page: 2, size: 100, reverse: true }).catch(() => null),
      client.list(`${base}/conclusions/list`, { page: 3, size: 100, reverse: true }).catch(() => null),
    ])
    const conclusions = pages.flatMap((result) => asItems(result)).map(mapConclusion)
    const peers = asItems(peersResult).map(mapPeer)
    const observer = new Map()
    const observed = new Map()
    const sessionCount = new Map()
    const observeEdge = new Map()
    const sessionEdge = new Map()
    for (const conclusion of conclusions) {
      if (conclusion.observerId) observer.set(conclusion.observerId, (observer.get(conclusion.observerId) ?? 0) + 1)
      if (conclusion.observedId) observed.set(conclusion.observedId, (observed.get(conclusion.observedId) ?? 0) + 1)
      if (conclusion.sessionId) sessionCount.set(conclusion.sessionId, (sessionCount.get(conclusion.sessionId) ?? 0) + 1)
      if (conclusion.observerId && conclusion.observedId) {
        const key = `${conclusion.observerId}\u0000${conclusion.observedId}`
        observeEdge.set(key, (observeEdge.get(key) ?? 0) + 1)
      }
      if (conclusion.observedId && conclusion.sessionId) {
        const key = `${conclusion.observedId}\u0000${conclusion.sessionId}`
        sessionEdge.set(key, (sessionEdge.get(key) ?? 0) + 1)
      }
    }
    const peerIds = new Set(peers.map((peer) => peer.id))
    for (const id of [...observer.keys(), ...observed.keys()]) peerIds.add(id)
    const peerNodes = [...peerIds].map((id) => ({
      id,
      kind: 'peer',
      observerCount: observer.get(id) ?? 0,
      observedCount: observed.get(id) ?? 0,
    }))
    const sessionNodes = topEntries(sessionCount, 12).map((entry) => ({ id: entry.id, kind: 'session', count: entry.count }))
    const keptSessions = new Set(sessionNodes.map((node) => node.id))
    const edges = []
    for (const [key, count] of observeEdge) {
      const [from, to] = key.split('\u0000')
      if (peerIds.has(from) && peerIds.has(to)) edges.push({ from, to, kind: 'observe', count })
    }
    for (const [key, count] of sessionEdge) {
      const [from, to] = key.split('\u0000')
      if (peerIds.has(from) && keptSessions.has(to)) edges.push({ from, to, kind: 'session', count })
    }
    return {
      workspace: workspaceId,
      window: conclusions.length,
      peers: peerNodes,
      sessions: sessionNodes,
      edges,
      totals: totals ?? { peers: peerNodes.length, sessions: sessionNodes.length, conclusions: conclusions.length },
      configuredPeer: config.peerName,
    }
  }, force)
}

async function searchWorkspace(client, config, workspaceId, query) {
  const text = (query.get('q') ?? '').trim().slice(0, 300)
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.get('limit') ?? '12', 10) || 12))
  if (text === '') return { query: '', messages: [], conclusions: [], pair: null }
  const observer = firstString(query.get('observer')) ?? config.peerName
  const observed = firstString(query.get('observed')) ?? config.peerName
  const base = `/workspaces/${encode(workspaceId)}`
  const [messagesResult, conclusionsResult] = await Promise.all([
    client.request(`${base}/search`, { method: 'POST', body: { query: text, limit } }).catch((error) => ({ error })),
    client.request(`${base}/conclusions/query`, {
      method: 'POST',
      body: { query: text, top_k: limit, filters: { observer_id: observer, observed_id: observed } },
    }).catch((error) => ({ error })),
  ])
  const messages = Array.isArray(messagesResult) ? messagesResult.map(mapMessage) : []
  const conclusions = Array.isArray(conclusionsResult) ? conclusionsResult.map(mapConclusion) : []
  return {
    query: text,
    messages,
    conclusions,
    messagesError: Array.isArray(messagesResult) ? null : (messagesResult?.error?.message ?? '消息搜索失败'),
    conclusionsError: Array.isArray(conclusionsResult) ? null : (conclusionsResult?.error?.message ?? '结论搜索失败'),
    pair: { observer, observed },
  }
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

/**
 * Build the request handler. Exported separately from `apply` so the Host API
 * can be exercised in a plain Node process without the Harness.
 */
export function createApi(config = {}) {
  const state = {}
  async function handle(request) {
    const url = new URL(request.url, 'http://dsh.local')
    if (!url.pathname.startsWith(`${PREFIX}/api/`)) return json({ ok: false, error: 'Not found' }, 404)
    const route = url.pathname.slice(`${PREFIX}/api`.length)
    const query = url.searchParams
    const force = query.get('refresh') === '1'
    try {
      const resolved = await resolveConfig(config, state)
      const client = createClient(resolved, state)
      if (route === '/status') {
        const reachable = await client.ping()
        return json({
          ok: true,
          reachable,
          config: {
            baseUrl: resolved.baseUrl,
            workspace: resolved.workspace,
            peerName: resolved.peerName,
            configPath: resolved.configPath,
            apiKeySet: typeof resolved.apiKey === 'string' && resolved.apiKey !== '',
          },
        })
      }
      if (route === '/workspaces') {
        return json({
          ok: true,
          config: {
            baseUrl: resolved.baseUrl,
            workspace: resolved.workspace,
            peerName: resolved.peerName,
          },
          workspaces: await listWorkspaces(client, force),
        })
      }
      const workspaceId = firstString(query.get('ws')) ?? resolved.workspace
      if (route === '/overview') {
        return json({ ok: true, ...(await workspaceOverview(client, resolved, workspaceId, force)) })
      }
      if (route === '/conclusions') {
        return json({ ok: true, ...(await conclusionsPage(client, workspaceId, query)) })
      }
      if (route === '/sessions') {
        const page = Math.max(1, Number.parseInt(query.get('page') ?? '1', 10) || 1)
        const size = Math.min(100, Math.max(1, Number.parseInt(query.get('size') ?? '40', 10) || 40))
        const result = await client.list(`/workspaces/${encode(workspaceId)}/sessions/list`, { page, size, reverse: true })
        return json({
          ok: true,
          items: asItems(result).map(mapSession),
          total: asTotal(result),
          page: result.page ?? page,
          size: result.size ?? size,
          pages: result.pages ?? 0,
        })
      }
      if (route === '/session') {
        const sessionId = firstString(query.get('session'))
        if (sessionId === undefined) return json({ ok: false, error: '缺少 session 参数' }, 400)
        return json({ ok: true, ...(await sessionDetail(client, workspaceId, sessionId, query)) })
      }
      if (route === '/peer') {
        const peerId = firstString(query.get('peer'))
        if (peerId === undefined) return json({ ok: false, error: '缺少 peer 参数' }, 400)
        return json({ ok: true, ...(await peerDetail(client, resolved, workspaceId, peerId, query)) })
      }
      if (route === '/graph') {
        return json({ ok: true, ...(await graphData(client, resolved, workspaceId, force)) })
      }
      if (route === '/search') {
        return json({ ok: true, ...(await searchWorkspace(client, resolved, workspaceId, query)) })
      }
      if (route === '/refresh') {
        cache.clear()
        return json({ ok: true })
      }
      return json({ ok: false, error: `Unknown route ${route}` }, 404)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return json({ ok: false, error: message }, 502)
    }
  }
  return {
    handle,
    dispose() {
      if (state.transport !== undefined) state.transport.dispose()
      state.transport = undefined
      state.config = undefined
    },
  }
}

/** Services this plugin needs before it can register its routes. */
export const inject = ['webServer']

export function apply(ctx, config = {}) {
  const api = createApi(config)
  ctx.effect(() => {
    const disposeRoute = ctx.webServer.register({
      kind: 'prefix',
      path: PREFIX,
      resource: (request) => api.handle(request),
    })
    return () => {
      disposeRoute()
      api.dispose()
      cache.clear()
    }
  }, 'honcho-memory-viz: routes')
}
