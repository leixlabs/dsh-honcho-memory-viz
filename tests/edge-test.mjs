// Edge-case checks for the Host API: missing parameters and an unreachable base URL.
const mod = await import(new URL('../index.js', import.meta.url).href)

const bad = mod.createApi({ baseUrl: 'http://127.0.0.1:1', apiKey: 'x', timeoutMs: 2000 })
const down = await bad.handle(new Request('http://dsh.local/honcho-memory/api/workspaces'))
console.log('unreachable workspaces ->', down.status, (await down.text()).slice(0, 160))

const api = mod.createApi({})
const noSession = await api.handle(new Request('http://dsh.local/honcho-memory/api/session?ws=dsh'))
console.log('missing session ->', noSession.status, (await noSession.text()).slice(0, 120))

const noPeer = await api.handle(new Request('http://dsh.local/honcho-memory/api/peer?ws=dsh'))
console.log('missing peer ->', noPeer.status, (await noPeer.text()).slice(0, 120))

const unknown = await api.handle(new Request('http://dsh.local/honcho-memory/api/nope'))
console.log('unknown route ->', unknown.status, (await unknown.text()).slice(0, 120))

const refresh = await api.handle(new Request('http://dsh.local/honcho-memory/api/refresh'))
console.log('refresh ->', refresh.status, (await refresh.text()).slice(0, 120))
