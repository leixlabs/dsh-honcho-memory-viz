// Render-test the browser half with a tiny React hook runtime. This catches
// structural render errors (bad props, undefined access, wrong element shapes)
// without a browser.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

const clientUrl = new URL('../client.js', import.meta.url)
const source = readFileSync(clientUrl, 'utf8')
const marker = "return { inject: ['slots', 'locale'], apply }"
if (!source.includes(marker)) throw new Error('export marker not found')
const built = source.replace(marker, "return { inject: ['slots', 'locale'], apply, __components: { MemoryPanel, OverviewTab, ConclusionsTab, SessionsTab, SessionDetailView, GraphView, SearchTab, PeerDetailView, PanelIcon } }")
const builtPath = new URL('./client.test-build.mjs', import.meta.url)
writeFileSync(builtPath, built)

function makeRuntime() {
  const stack = []
  const React = {
    createElement(type, props, ...children) {
      const merged = Object.assign({}, props || {})
      if (children.length === 1) merged.children = children[0]
      else if (children.length > 1) merged.children = children
      return { type, props: merged }
    },
    Fragment: Symbol('Fragment'),
    useState(initial) {
      const frame = stack[stack.length - 1]
      const index = frame.index++
      if (index >= frame.hooks.length) {
        frame.hooks[index] = [typeof initial === 'function' ? initial() : initial, (value) => {
          frame.hooks[index][0] = typeof value === 'function' ? value(frame.hooks[index][0]) : value
        }]
      }
      return frame.hooks[index]
    },
    useRef(initial) {
      const frame = stack[stack.length - 1]
      const index = frame.index++
      if (index >= frame.hooks.length) frame.hooks[index] = { current: initial }
      return frame.hooks[index]
    },
    useMemo(fn) {
      const frame = stack[stack.length - 1]
      frame.index++
      return fn()
    },
    useCallback(fn) {
      const frame = stack[stack.length - 1]
      frame.index++
      return fn
    },
    useEffect() {
      stack[stack.length - 1].index++
    },
  }
  let hostCount = 0
  function renderNode(node) {
    if (node === null || node === undefined || node === false || node === true) return null
    if (typeof node === 'string' || typeof node === 'number') {
      hostCount++
      return node
    }
    if (Array.isArray(node)) return node.map(renderNode)
    if (typeof node.type === 'function') {
      stack.push({ hooks: [], index: 0 })
      let output
      try {
        output = node.type(node.props)
      } finally {
        stack.pop()
      }
      return renderNode(output)
    }
    hostCount++
    return renderNode(node.props.children)
  }
  return {
    React,
    render(node) {
      hostCount = 0
      renderNode(node)
      return hostCount
    },
  }
}

let spec
globalThis.window = {
  __ModuleLoader__: { load: (value) => { spec = value } },
  location: { reload() {} },
}
globalThis.document = { baseURI: 'http://127.0.0.1:61914/' }
globalThis.fetch = () => new Promise(() => {})

await import(builtPath.href)

const runtime = makeRuntime()
const registered = {}
const registrations = []
const ctx = {
  effect(fn) { const dispose = fn(); return () => { if (typeof dispose === 'function') dispose() } },
  locale: {
    register(ns, dicts) { registered[ns] = dicts; return () => {} },
    bind(ns) {
      return (key, vars) => {
        const dict = registered[ns] || {}
        let text = (dict.zh && dict.zh[key]) || (dict.en && dict.en[key]) || key
        if (vars) text = text.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m))
        return text
      }
    },
    resolveText(text) { return text },
  },
  slots: {
    inject(key, callback) { callback(); return () => {} },
    register(meta, component) { registrations.push({ meta, component }); return () => {} },
  },
}
const plugin = spec.factory((name) => {
  if (name === 'react') return runtime.React
  throw new Error('unexpected require: ' + name)
})
plugin.apply(ctx)
const C = plugin.__components

const overviewReady = { status: 'ready', error: null, data: {
  workspace: 'hermes', configuredPeer: 'lei',
  stats: { peers: 10, sessions: 469, conclusions: 7220 },
  queue: { total: 1444, pending: 1292, inProgress: 0, completed: 152 },
  peers: [{ id: 'lei' }, { id: 'hermes' }, { id: 'architect' }],
  sessions: [{ id: '20261105_110717_264e11', createdAt: '2026-11-05T03:07:17.676094Z', isActive: true }],
  recentConclusions: [
    { id: 'c1', content: 'hermes is a software agent.', observerId: 'lei', observedId: 'hermes', sessionId: '20261105_110717_264e11', createdAt: '2026-11-05T03:07:17.676094Z' },
  ],
  card: ['IDENTITY: Name: 磊 / lei', 'ATTRIBUTE: Primary language: Chinese'],
  representation: '## Explicit Observations\n\n[2026-11-05 11:07:17] hermes is a software agent.',
  workspaces: [
    { id: 'hermes', createdAt: '2026-06-03T07:52:05.026970Z', peers: 10, sessions: 469, conclusions: 7220 },
    { id: 'dsh', createdAt: '2026-11-07T11:08:50.260102Z', peers: 2, sessions: 1, conclusions: 2 },
  ],
} }

const sessionDetail = { status: 'ready', sessionId: '20261105_110717_264e11', page: 1, error: null, data: {
  session: { id: '20261105_110717_264e11', createdAt: '2026-11-05T03:07:17.676094Z', isActive: true },
  summaries: { short: '用户 lei 正在测试。', long: null },
  messages: { items: [{ id: 'm1', content: '你好', peerId: 'lei', sessionId: 's', createdAt: '2026-11-05T03:07:20.000Z', tokenCount: 3 }], total: 1, page: 1, size: 40, pages: 1 },
} }

const graphData = {
  workspace: 'hermes', window: 300, configuredPeer: 'lei',
  peers: [
    { id: 'lei', kind: 'peer', observerCount: 142, observedCount: 9 },
    { id: 'hermes', kind: 'peer', observerCount: 158, observedCount: 291 },
    { id: 'architect', kind: 'peer', observerCount: 0, observedCount: 4 },
  ],
  sessions: [{ id: '20261105_110717_264e11', kind: 'session', count: 42 }, { id: '20260603_161150_972588', kind: 'session', count: 17 }],
  edges: [
    { from: 'lei', to: 'hermes', kind: 'observe', count: 291 },
    { from: 'hermes', to: 'lei', kind: 'observe', count: 9 },
    { from: 'hermes', to: '20261105_110717_264e11', kind: 'session', count: 42 },
  ],
  totals: { peers: 10, sessions: 469, conclusions: 7220 },
}

const noop = () => {}
const cases = [
  ['PanelIcon', { size: 18, active: true }],
  ['MemoryPanel', {}],
  ['OverviewTab', { overview: overviewReady, workspaces: overviewReady.data.workspaces, workspace: 'hermes', onTab: noop, onPeer: noop, onSession: noop, onWorkspace: noop }],
  ['ConclusionsTab', { state: { status: 'ready', items: overviewReady.data.recentConclusions, total: 2, page: 1, pages: 1, filters: { observed: 'hermes', level: 'explicit' }, error: null }, overview: overviewReady, onFilter: noop, onClear: noop, onPage: noop, onPeer: noop, onSession: noop }],
  ['SessionsTab', { sessions: { status: 'ready', items: overviewReady.data.sessions, total: 1, page: 1, pages: 1, error: null }, detail: sessionDetail, onOpen: noop, onPage: noop, onDetailPage: noop, onPeer: noop }],
  ['SessionDetailView', { detail: sessionDetail, onPage: noop, onPeer: noop }],
  ['GraphView', { data: graphData, onPeer: noop, onSession: noop }],
  ['SearchTab', { state: { status: 'ready', q: 'certificate', error: null, data: { query: 'certificate', pair: { observer: 'lei', observed: 'hermes' }, messages: [{ id: 'm1', content: '证书', peerId: 'lei', sessionId: 's', createdAt: '2026-11-05T03:07:20.000Z', tokenCount: 3 }], conclusions: overviewReady.data.recentConclusions, messagesError: null, conclusionsError: null } }, overview: overviewReady, pair: { observer: 'lei', observed: 'hermes' }, onPair: noop, onRerun: noop, onPeer: noop, onSession: noop }],
  ['PeerDetailView', { state: { status: 'ready', id: 'hermes', error: null, data: { peer: { id: 'hermes' }, card: ['IDENTITY: Hermes Agent'], representation: 'rep', about: { items: overviewReady.data.recentConclusions, total: 1, page: 1, size: 20, pages: 1 }, byPeer: { items: [], total: 0 } } }, onBack: noop, onRetry: noop, onPeer: noop, onSession: noop }],
]

let failed = 0
for (const [name, props] of cases) {
  try {
    const count = runtime.render(runtime.React.createElement(C[name], props))
    console.log('PASS', name, 'host nodes:', count)
  } catch (error) {
    failed++
    console.log('FAIL', name, '->', error.stack.split('\n').slice(0, 4).join(' | '))
  }
}
console.log(failed === 0 ? 'ALL RENDER CHECKS PASSED' : failed + ' RENDER CHECKS FAILED')
rmSync(builtPath, { force: true })
if (failed !== 0) process.exitCode = 1
