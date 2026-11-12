# dsh-honcho-memory-viz

[![npm](https://img.shields.io/npm/v/dsh-honcho-memory-viz)](https://www.npmjs.com/package/dsh-honcho-memory-viz)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A **DeepSeek Harness (dsh) Web UI plugin** that adds a **Memory** panel to the
left sidebar: browse, search and visualize the memory stored on your
[Honcho](https://honcho.dev) server — peer cards, conclusions, sessions and
messages, semantic search, and a peer ↔ session relationship graph.

It is **read-only**. Your Honcho API key never leaves the Host process: the
browser only talks to a same-origin `/honcho-memory` route.

> 想直接看怎么装？跳到 [安装](#安装--install)。中文说明见
> [中文快速开始](#中文快速开始)。

## Features

| Tab | What it shows |
| --- | --- |
| **Overview** (概览) | Conclusion / session / peer counts, the derivation queue, core memory (peer card + representation), recent conclusions, recent sessions, workspace list |
| **Conclusions** (结论) | Paged conclusions, filterable by observer peer, observed peer, session and level (explicit / deductive); click a peer chip to drill down, click a session to see its source messages |
| **Sessions** (会话) | Session list with a message timeline and short/long summaries; load older messages page by page |
| **Graph** (图谱) | Peer observation relationships and session membership from the most recent conclusions; node size = activity; click a node to drill down |
| **Search** (搜索) | Semantic message search across all workspaces, plus conclusion search scoped to an observer/observed pair |

Extras:

- Workspace switcher in the top-right corner (e.g. `dsh`, `hermes`, …); the
  plugin lists every workspace on the server.
- Refresh button clears the Host caches and re-fetches.
- UI text follows the dsh interface language (English and Chinese shipped).
- Zero runtime dependencies; one shared keep-alive HTTP transport per plugin
  instance.

## Requirements

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) with the
  **Web UI** (`dsh web` / the desktop app), dsh `>= 0.2.0-rc.2`.
- A reachable **Honcho server**: Honcho Cloud (`https://api.honcho.dev`) or a
  self-hosted instance (`http://localhost:8000`, `http://macmini.local:8000`, …).
- Node.js `^22.19.0 || >=24.0.0` (the version bundled with dsh is fine).

## 安装 / Install

### Option A — in-app plugin manager (desktop app)

In the dsh Web UI open **Plugins**, choose *install bundle*, and enter:

```
dsh-honcho-memory-viz
```

or, from an agent session:

```
plugin_manager(install_bundle, target: "dsh-honcho-memory-viz")
```

Environment plugins installed into the Electron-managed `desktop` profile are
usually active right away (the app hot-loads them); restart dsh if the
**Memory** icon does not appear.

### Option B — dsh CLI (recommended for CLI profiles)

```bash
dsh plugin --profile <profile> add dsh-honcho-memory-viz
```

This installs the package into the profile's `node_modules` **and** appends it
to `dsh.profile.bundles` in `~/.dsh/profiles/<profile>/package.json`.
Restart dsh afterwards, then open the **Memory** icon in the left sidebar.
For the Electron-managed `desktop` profile the CLI still works, but the in-app
Plugin Manager (Option A) is the smoother path.

### Manual verification (optional)

The plugin should be listed as installed and enabled in the in-app Plugin
Manager. Note that the `desktop` profile is managed by the Electron app, so the
standalone CLI refuses `dsh --profile desktop --dump-config` ("managed
exclusively by the Electron application"); use the Plugin Manager for that
profile.

For CLI-managed profiles (e.g. a custom profile booted with `dsh web`) you can
also verify the composed row directly:

```bash
dsh --profile <profile> --dump-config | grep -A2 honcho-memory-viz
```

should print the bundle patch row:

```yaml
# == dsh-honcho-memory-viz
- id: honcho-memory-viz
  name: dsh-honcho-memory-viz
```

If the row is missing, the bundle was installed but not registered: add
`"dsh-honcho-memory-viz"` to `dsh.profile.bundles` in the profile's
`package.json` and restart.

### Uninstall

Desktop app: open the in-app Plugin Manager and remove/uninstall
`dsh-honcho-memory-viz`.

CLI profile:

```bash
dsh plugin --profile <profile> remove dsh-honcho-memory-viz
```

Then remove `dsh-honcho-memory-viz` from `dsh.profile.bundles` if it is still
listed, and restart.

## 配置 / Configuration

The plugin reads the **same config file as the official
[`@honcho-ai/dsh-honcho`](https://www.npmjs.com/package/@honcho-ai/dsh-honcho)
plugin**, so you normally configure Honcho once:

`~/.honcho/config.json` (`%USERPROFILE%\.honcho\config.json` on Windows):

```json
{
  "baseUrl": "http://macmini.local:8000",
  "peerName": "lei",
  "auth": { "apiKey": "${HONCHO_API_KEY}" },
  "hosts": {
    "dsh": { "workspace": "dsh" }
  }
}
```

Fields:

| Field | Meaning |
| --- | --- |
| `baseUrl` | Honcho server base URL. Defaults to `https://api.honcho.dev`. A trailing `/v3` is accepted and stripped. |
| `auth.apiKey` | Bearer token. Supports `${ENV_VAR}` expansion. Optional — omit it for a self-hosted server without auth. |
| `hosts.dsh.workspace` | Default workspace for dsh; overrides the root-level `workspace`. |
| `hosts.dsh.peerName` / `peerName` | Default observer peer name. |

Environment variables `HONCHO_URL` and `HONCHO_API_KEY` are also honoured (lowest
precedence).

Resolution order (highest first): plugin config → `hosts.dsh.*` → root fields →
environment → built-in defaults (`https://api.honcho.dev`, workspace `default`,
peer `user`).

Plugin config can be set through the bundle row (e.g. `config: { baseUrl,
workspace, peerName, timeoutMs, configPath, userAgent }`); `configPath` points
the plugin at a different config file.

## 用法 / Usage

Open the **Memory** icon in the left sidebar. The panel is read-only: it only
issues `GET` (and Honcho's read-style `POST .../list`) requests. Nothing is ever
written back to Honcho.

The workspace selector appears in the panel header once the workspace list has
loaded; the refresh button drops all caches (workspaces/stats 30 s, overview
15 s, graph 45 s) and re-fetches.

## Host API (read-only)

Everything the browser needs is served by the Host under `/honcho-memory`:

| Route | Purpose |
| --- | --- |
| `GET /api/workspaces` | Config + workspace list with per-workspace counts |
| `GET /api/overview?ws=` | Workspace overview: stats, queue, peer card, representation, recent conclusions/sessions |
| `GET /api/conclusions?ws=&page=&size=&observer=&observed=&session=&level=` | Paged conclusions |
| `GET /api/sessions?ws=&page=&size=` | Paged sessions |
| `GET /api/session?ws=&session=&page=&size=` | Session detail: summary + paged messages |
| `GET /api/peer?ws=&peer=&page=&size=` | Peer detail: card, representation, conclusions about/by it |
| `GET /api/graph?ws=` | Graph data from the latest ≤300 conclusions |
| `GET /api/search?ws=&q=&observer=&observed=&limit=` | Semantic search over messages and conclusions |
| `GET /api/status` | Resolved config and server reachability |
| `GET /api/refresh` | Clear the Host caches |

## Security notes

- The Honcho API key is only read in the **Host** process and sent to the
  Honcho server; the browser bundle never receives it.
- The Client half talks only to same-origin `/honcho-memory/api/*` routes, so no
  CORS/gateway changes are needed.
- The plugin is read-only and has no write, delete or admin endpoints.

## Development

```bash
git clone https://github.com/leixlabs/dsh-honcho-memory-viz.git
cd dsh-honcho-memory-viz

# link the local checkout into a profile (pnpm link protocol)
dsh plugin --profile desktop add link:$PWD

# the CLI registers the bundle automatically; verify:
dsh --profile desktop --dump-config | grep -A2 honcho-memory-viz
```

Then restart dsh. After that, editing `client.js` only needs a page refresh;
editing `index.js` (the Host half) needs a dsh restart.

Checks (no browser or network required):

```bash
npm run check        # node --check on both halves
npm test             # client module/slot/dictionary check + headless render test
```

`tests/host-test.mjs` and `tests/edge-test.mjs` exercise the HTTP API against a
real Honcho server and are run manually:

```bash
node tests/host-test.mjs
node tests/edge-test.mjs
```

Layout:

```
index.js            Host half: Honcho v3 REST reads, caches, /honcho-memory routes
client.js           Browser half: __ModuleLoader__ module, sidebar icon and main panel
cordis.patch.yml    Bundle patch: inserts the honcho-memory-viz row
locale/{en,zh}.json Plugin-manager title/description strings
icon.svg            Plugin icon
tests/              Offline + live check scripts
```

## 中文快速开始

1. 安装（dsh Web UI / 桌面版即可）：

   ```bash
   dsh plugin --profile desktop add dsh-honcho-memory-viz
   ```

   装完重启 dsh，左侧栏会出现「记忆」图标。

2. 配置：把 Honcho 服务器地址写进 `~/.honcho/config.json`（Windows 为
   `%USERPROFILE%\.honcho\config.json`）：

   ```json
   {
     "baseUrl": "http://macmini.local:8000",
     "peerName": "lei",
     "auth": { "apiKey": "local-no-auth" },
     "hosts": { "dsh": { "workspace": "dsh" } }
   }
   ```

   - 自建、无需认证的 Honcho 可以随便写一个占位 `apiKey`；`baseUrl` 不带 `/v3`
     也可以（插件会自动去掉）。
   - 和官方 `@honcho-ai/dsh-honcho` 共用同一个配置文件，配置一次即可。

3. 打开「记忆」面板：概览 / 结论 / 会话 / 图谱 / 搜索五个 tab，右上角可切换
   workspace，刷新按钮会清空缓存重新拉取。插件只读，不会写入 Honcho，API key
   不会进入浏览器。

4. 卸载：`dsh plugin --profile desktop remove dsh-honcho-memory-viz`，再从
   profile 的 `dsh.profile.bundles` 里删掉，重启 dsh。

## License

[MIT](./LICENSE) © 2026 Lei (leixlabs)

Honcho is a separate project by Plastic Labs; this plugin is an independent,
community-built read-only viewer and is not affiliated with Plastic Labs or
DeepSeek.
