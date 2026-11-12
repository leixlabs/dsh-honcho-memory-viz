// Smoke-test the browser half without a browser: load the module factory,
// run apply() against a fake Cordis context, and verify dictionary coverage.
import { readFileSync } from 'node:fs'

const path = new URL('../client.js', import.meta.url).href
const source = readFileSync(new URL(path), 'utf8')

let spec
globalThis.window = { __ModuleLoader__: { load: (value) => { spec = value } } }
await import(path)

if (spec.id !== 'dsh-honcho-memory-viz') throw new Error('module id mismatch: ' + spec.id)

const fakeReact = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: (initial) => ({ current: initial }),
  useCallback: (fn) => fn,
  Fragment: 'Fragment',
}

const registered = {}
const registrations = []
const injected = []
const ctx = {
  effect(fn, label) {
    const dispose = fn()
    return () => {
      if (typeof dispose === 'function') dispose()
    }
  },
  locale: {
    register(ns, dicts) {
      registered[ns] = dicts
      return () => {}
    },
    bind(ns) {
      return (key, vars) => {
        const dict = registered[ns] || {}
        let text = (dict.zh && dict.zh[key]) || (dict.en && dict.en[key]) || key
        if (vars) text = text.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m))
        return text
      }
    },
    resolveText(text) {
      return text
    },
  },
  slots: {
    inject(key, callback) {
      injected.push(key)
      callback()
      return () => {}
    },
    register(meta, component) {
      registrations.push({ meta, component })
      return () => {}
    },
  },
}

const plugin = spec.factory((name) => {
  if (name === 'react') return fakeReact
  throw new Error('unexpected require: ' + name)
})

console.log('inject:', JSON.stringify(plugin.inject))
plugin.apply(ctx)

console.log('effects registered, registrations:', registrations.map((entry) => entry.meta.name + '/' + (entry.meta.id || entry.meta.key)).join(', '))
console.log('slot injections:', injected.join(', '))
for (const entry of registrations) {
  if (typeof entry.meta.label === 'function') console.log(entry.meta.name, 'label =>', entry.meta.label())
  if (typeof entry.component !== 'function') throw new Error('registration without component: ' + entry.meta.name)
}

const dicts = registered.honchoMemory
if (!dicts) throw new Error('namespace not registered')
const zhKeys = Object.keys(dicts.zh).sort()
const enKeys = Object.keys(dicts.en).sort()
console.log('dict sizes: zh=' + zhKeys.length + ' en=' + enKeys.length)
const missingEn = zhKeys.filter((key) => !(key in dicts.en))
const extraEn = enKeys.filter((key) => !(key in dicts.zh))
console.log('zh-only keys:', JSON.stringify(missingEn), 'en-only keys:', JSON.stringify(extraEn))

const used = new Set()
for (const match of source.matchAll(/(?<![A-Za-z0-9_])t\('([^']+)'/g)) used.add(match[1])
const missingUsed = [...used].filter((key) => !(key in dicts.zh) || !(key in dicts.en))
console.log('t() keys used:', used.size, 'missing from dicts:', JSON.stringify(missingUsed))

// Render every top-level component with a fake dispatcher to catch obvious
// shape errors (hooks are stubbed, so this is a structural check only).
const components = registrations.map((entry) => [entry.meta.name, entry.component])
for (const [name, component] of components) {
  try {
    const tree = component({ size: 18, active: false })
    console.log('rendered', name, '->', tree && tree.type)
  } catch (error) {
    console.log('render failed', name, '->', error.message)
  }
}
