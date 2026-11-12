// Exercise the Host API of the plugin against the live Honcho server.
const mod = await import(new URL('../index.js', import.meta.url).href)
const api = mod.createApi({})
const routes = [
  '/honcho-memory/api/status',
  '/honcho-memory/api/workspaces',
  '/honcho-memory/api/overview?ws=dsh',
  '/honcho-memory/api/overview?ws=hermes',
  '/honcho-memory/api/conclusions?ws=hermes&size=3',
  '/honcho-memory/api/conclusions?ws=hermes&size=2&observed=hermes&level=deductive',
  '/honcho-memory/api/sessions?ws=hermes&size=3',
  '/honcho-memory/api/session?ws=dsh&session=lei-projects&size=3',
  '/honcho-memory/api/peer?ws=hermes&peer=lei&size=3',
  '/honcho-memory/api/graph?ws=hermes',
  '/honcho-memory/api/search?ws=hermes&q=certificate&limit=3',
]
for (const route of routes) {
  const started = Date.now()
  const response = await api.handle(new Request('http://127.0.0.1:61914' + route))
  const text = await response.text()
  const elapsed = Date.now() - started
  let preview = text
  try {
    const data = JSON.parse(text)
    preview = JSON.stringify(data).slice(0, 260)
  } catch { /* keep text */ }
  console.log(`${response.status} ${elapsed}ms ${route}\n   ${preview}\n`)
}
