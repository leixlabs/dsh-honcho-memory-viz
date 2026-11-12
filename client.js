window.__ModuleLoader__.load({
  id: 'dsh-honcho-memory-viz',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'honchoMemory'
    const PANEL_ID = 'honcho-memory'
    const API_BASE = '/honcho-memory/api'

    // Localized text, replaced by ctx.locale.bind(NS) in apply().
    let t = (key) => key

    const zh = {
      panel: '记忆',
      title: 'Honcho 记忆',
      tabOverview: '概览',
      tabConclusions: '结论',
      tabSessions: '会话',
      tabGraph: '图谱',
      tabSearch: '搜索',
      refresh: '刷新',
      refreshing: '刷新中…',
      workspace: '工作区',
      peer: 'peer',
      searchPlaceholder: '语义搜索记忆…',
      statConclusions: '结论',
      statSessions: '会话',
      statPeers: 'Peers',
      statQueue: '待处理队列',
      queuePending: '待处理',
      queueInProgress: '进行中',
      queueCompleted: '已完成',
      coreMemory: '核心记忆',
      peerCard: 'Peer 卡片',
      representation: '表征',
      cardEmpty: '还没有 peer card。Honcho 会在积累足够材料后由 Dream 生成。',
      representationEmpty: '还没有表征。',
      recentConclusions: '最近结论',
      recentSessions: '最近会话',
      workspaces: '工作区',
      viewAll: '查看全部',
      about: '关于',
      observedBy: '由 {peer} 观察',
      allPeers: '全部 peer',
      allLevels: '全部层级',
      levelExplicit: '显式',
      levelDeductive: '推导',
      levelLabel: '层级',
      observingPeer: '关于 peer',
      prev: '上一页',
      next: '下一页',
      pageInfo: '第 {page} / {pages} 页 · 共 {total} 条',
      noConclusions: '该工作区还没有结论。Honcho 的 Deriver 会在后台从会话消息中推导结论。',
      noSessions: '该工作区还没有会话。',
      selectSession: '在左侧选择一个会话，查看摘要和消息。',
      sessionSummary: '会话摘要',
      messages: '消息',
      noMessages: '这个会话还没有消息。',
      noSummary: '该会话还没有摘要。',
      messageCount: '{n} 条消息',
      graphTitle: '记忆关系图',
      graphHint: '节点与边基于最近 {n} 条结论；节点大小表示活跃度。',
      graphEmpty: '结论还不够，暂时画不出关系图。',
      graphPeerLegend: 'Peer',
      graphSessionLegend: '会话',
      graphClickHint: '点击节点可下钻：Peer → 相关结论，会话 → 消息记录。',
      searchResults: '搜索结果',
      searchHint: '在右上角输入关键词，按回车搜索消息与结论。',
      searchMessages: '消息',
      searchConclusions: '结论',
      searchEmpty: '没有找到相关内容。',
      searchPairHint: '结论检索范围：{observer} 观察 {observed}',
      peerDetail: 'Peer 详情',
      back: '返回',
      conclusionsAbout: '关于该 peer 的结论',
      conclusionsBy: '由该 peer 观察的结论',
      unknown: '未知',
      justNow: '刚刚',
      minutesAgo: '{n} 分钟前',
      hoursAgo: '{n} 小时前',
      daysAgo: '{n} 天前',
      loading: '加载中…',
      retry: '重试',
      refreshFailed: '刷新失败：{error}',
      unreachable: '无法连接 Honcho 服务器',
      unreachableHint: '请检查 ~/.honcho/config.json 里的 baseUrl，以及服务器是否在线。',
      requestFailed: '请求失败：{error}',
      emptyWorkspace: '该工作区没有数据。',
      totalRecords: '共 {n} 条',
      observer: '观察者',
      observed: '被观察者',
      filterClear: '清除筛选',
      tokens: '{n} tokens',
      current: '当前',
    }

    const en = {
      panel: 'Memory',
      title: 'Honcho memory',
      tabOverview: 'Overview',
      tabConclusions: 'Conclusions',
      tabSessions: 'Sessions',
      tabGraph: 'Graph',
      tabSearch: 'Search',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      workspace: 'Workspace',
      peer: 'peer',
      searchPlaceholder: 'Search memory…',
      statConclusions: 'Conclusions',
      statSessions: 'Sessions',
      statPeers: 'Peers',
      statQueue: 'Pending queue',
      queuePending: 'pending',
      queueInProgress: 'in progress',
      queueCompleted: 'completed',
      coreMemory: 'Core memory',
      peerCard: 'Peer card',
      representation: 'Representation',
      cardEmpty: 'No peer card yet. Honcho derives one once there is enough material.',
      representationEmpty: 'No representation yet.',
      recentConclusions: 'Recent conclusions',
      recentSessions: 'Recent sessions',
      workspaces: 'Workspaces',
      viewAll: 'View all',
      about: 'About',
      observedBy: 'observed by {peer}',
      allPeers: 'All peers',
      allLevels: 'All levels',
      levelExplicit: 'Explicit',
      levelDeductive: 'Deductive',
      levelLabel: 'Level',
      observingPeer: 'About peer',
      prev: 'Previous',
      next: 'Next',
      pageInfo: 'Page {page} of {pages} · {total} total',
      noConclusions: 'No conclusions in this workspace yet. Honcho derives them from session messages in the background.',
      noSessions: 'No sessions in this workspace yet.',
      selectSession: 'Select a session on the left to see its summary and messages.',
      sessionSummary: 'Session summary',
      messages: 'Messages',
      noMessages: 'This session has no messages yet.',
      noSummary: 'No summary for this session yet.',
      messageCount: '{n} messages',
      graphTitle: 'Memory relationship graph',
      graphHint: 'Nodes and edges are counted from the most recent {n} conclusions; node size reflects activity.',
      graphEmpty: 'Not enough conclusions to draw a graph yet.',
      graphPeerLegend: 'Peer',
      graphSessionLegend: 'Session',
      graphClickHint: 'Click a node to drill down: a peer to its conclusions, a session to its messages.',
      searchResults: 'Search results',
      searchHint: 'Type a query in the top-right corner and press Enter to search messages and conclusions.',
      searchMessages: 'Messages',
      searchConclusions: 'Conclusions',
      searchEmpty: 'Nothing matched.',
      searchPairHint: 'Conclusion scope: {observer} observing {observed}',
      peerDetail: 'Peer details',
      back: 'Back',
      conclusionsAbout: 'Conclusions about this peer',
      conclusionsBy: 'Conclusions observed by this peer',
      unknown: 'Unknown',
      justNow: 'just now',
      minutesAgo: '{n} min ago',
      hoursAgo: '{n} h ago',
      daysAgo: '{n} d ago',
      loading: 'Loading…',
      retry: 'Retry',
      refreshFailed: 'Refresh failed: {error}',
      unreachable: 'Cannot reach the Honcho server',
      unreachableHint: 'Check the baseUrl in ~/.honcho/config.json and whether the server is running.',
      requestFailed: 'Request failed: {error}',
      emptyWorkspace: 'This workspace has no data.',
      totalRecords: '{n} total',
      observer: 'Observer',
      observed: 'Observed',
      filterClear: 'Clear filters',
      tokens: '{n} tokens',
      current: 'current',
    }

    // ------------------------------------------------------------------
    // Small helpers
    // ------------------------------------------------------------------
    function api(route, params) {
      const url = new URL(API_BASE + route, document.baseURI)
      for (const [key, value] of Object.entries(params || {})) {
        if (value === undefined || value === null || value === '') continue
        url.searchParams.set(key, String(value))
      }
      return fetch(url, { headers: { accept: 'application/json' } }).then(async (response) => {
        let data = null
        try {
          data = await response.json()
        } catch {
          data = null
        }
        if (!response.ok || (data && data.ok === false)) {
          throw new Error((data && data.error) || 'HTTP ' + response.status)
        }
        return data
      })
    }

    function num(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '0'
      return new Intl.NumberFormat().format(value)
    }

    function shortId(id, max) {
      const text = String(id || '')
      const limit = max || 26
      if (text.length <= limit) return text
      return text.slice(0, Math.max(4, limit - 10)) + '…' + text.slice(-6)
    }

    function formatTime(iso) {
      if (!iso) return ''
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return String(iso)
      const diff = (Date.now() - date.getTime()) / 1000
      if (diff < 60) return t('justNow')
      if (diff < 3600) return t('minutesAgo', { n: Math.floor(diff / 60) })
      if (diff < 86400) return t('hoursAgo', { n: Math.floor(diff / 3600) })
      if (diff < 7 * 86400) return t('daysAgo', { n: Math.floor(diff / 86400) })
      try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
      } catch {
        return date.toISOString().slice(0, 10)
      }
    }

    function levelText(level) {
      if (level === 'explicit') return t('levelExplicit')
      if (level === 'deductive') return t('levelDeductive')
      return String(level || '')
    }

    function sum(values) {
      return values.reduce((total, value) => total + value, 0)
    }

    // ------------------------------------------------------------------
    // Theme-aware styles
    // ------------------------------------------------------------------
    const C = {
      bg: 'var(--dsw-alias-bg-base)',
      layer1: 'var(--dsw-alias-bg-layer-1)',
      layer2: 'var(--dsw-alias-bg-layer-2)',
      border: 'var(--dsw-alias-border-l1)',
      borderStrong: 'var(--dsw-alias-border-l2)',
      text: 'var(--dsw-alias-label-primary)',
      muted: 'var(--dsw-alias-label-secondary)',
      brand: 'var(--dsw-alias-brand-primary)',
      success: 'var(--dsw-alias-state-success-primary)',
      warn: 'var(--dsw-alias-state-warn-primary)',
      error: 'var(--dsw-alias-state-error-primary)',
      idle: 'var(--dsw-alias-state-idle-primary)',
    }

    const S = {
      root: {
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        color: C.text,
        fontFamily: 'inherit',
        fontSize: 13,
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 22px',
        borderBottom: '1px solid ' + C.border,
        flexWrap: 'wrap',
      },
      brandMark: {
        width: 30,
        height: 30,
        borderRadius: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2f6fed, #7a3df0)',
        color: '#fff',
        flex: '0 0 auto',
      },
      title: { fontSize: 15, fontWeight: 600, lineHeight: 1.2 },
      subtitle: { fontSize: 11.5, color: C.muted, marginTop: 2 },
      grow: { flex: 1 },
      input: {
        width: 220,
        background: C.layer2,
        border: '1px solid ' + C.border,
        color: 'inherit',
        borderRadius: 8,
        padding: '7px 10px',
        fontSize: 12.5,
        fontFamily: 'inherit',
        outline: 'none',
      },
      select: {
        background: C.layer2,
        border: '1px solid ' + C.border,
        color: 'inherit',
        borderRadius: 8,
        padding: '7px 8px',
        fontSize: 12.5,
        fontFamily: 'inherit',
        outline: 'none',
        maxWidth: 210,
      },
      tabBar: {
        display: 'flex',
        alignItems: 'stretch',
        gap: 2,
        padding: '0 18px',
        borderBottom: '1px solid ' + C.border,
        flexWrap: 'wrap',
      },
      tab: {
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: C.muted,
        padding: '9px 12px',
        fontSize: 13,
        fontFamily: 'inherit',
        cursor: 'pointer',
      },
      tabActive: { color: C.text, borderBottomColor: C.brand, fontWeight: 600 },
      content: {
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        padding: '18px 22px 40px',
      },
      grid: {
        display: 'grid',
        gap: 12,
      },
      card: {
        background: C.layer1,
        border: '1px solid ' + C.border,
        borderRadius: 10,
        padding: '14px 16px',
        minWidth: 0,
      },
      cardTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: C.muted,
        letterSpacing: '0.02em',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      h2: { fontSize: 14, fontWeight: 600, margin: '0 0 10px' },
      row: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '9px 8px',
        borderRadius: 8,
        borderBottom: '1px solid ' + C.border,
      },
      rowLast: { borderBottom: 'none' },
      rowText: { flex: 1, minWidth: 0 },
      rowTitle: { fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' },
      meta: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        marginTop: 5,
        fontSize: 11,
        color: C.muted,
      },
      badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '1px 7px',
        borderRadius: 999,
        border: '1px solid ' + C.border,
        background: C.layer2,
        fontSize: 10.5,
        color: C.muted,
        whiteSpace: 'nowrap',
      },
      badgeBrand: { borderColor: C.brand, color: C.brand, background: 'transparent' },
      action: {
        background: 'transparent',
        border: '1px solid ' + C.border,
        color: 'inherit',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 12,
        fontFamily: 'inherit',
        cursor: 'pointer',
      },
      actionPrimary: {
        background: C.brand,
        border: '1px solid ' + C.brand,
        color: '#fff',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 12,
        fontFamily: 'inherit',
        cursor: 'pointer',
      },
      statValue: { fontSize: 22, fontWeight: 650, lineHeight: 1.1, marginTop: 4 },
      statLabel: { fontSize: 11.5, color: C.muted },
      statHint: { fontSize: 11, color: C.muted, marginTop: 4 },
      empty: {
        padding: '26px 10px',
        textAlign: 'center',
        color: C.muted,
        fontSize: 12.5,
        lineHeight: 1.6,
      },
      errorBox: {
        border: '1px solid ' + C.border,
        borderLeft: '3px solid ' + C.error,
        background: C.layer1,
        borderRadius: 10,
        padding: '14px 16px',
      },
      errorTitle: { fontSize: 13.5, fontWeight: 600, color: C.error, marginBottom: 6 },
      errorText: { fontSize: 12.5, color: C.muted, lineHeight: 1.6, wordBreak: 'break-word' },
      pre: {
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: 12.5,
        lineHeight: 1.65,
        color: C.text,
        fontFamily: 'inherit',
      },
      listScroll: { maxHeight: 320, overflow: 'auto', margin: '-4px -4px 0', padding: '0 4px' },
      pager: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 12,
        fontSize: 11.5,
        color: C.muted,
      },
      bullet: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        padding: '4px 0',
        fontSize: 12.5,
        lineHeight: 1.55,
      },
      dot: { width: 5, height: 5, borderRadius: 999, background: C.brand, marginTop: 7, flex: '0 0 auto' },
      sessionLayout: {
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 320px) minmax(0, 1fr)',
        gap: 14,
        alignItems: 'start',
      },
      sessionList: {
        background: C.layer1,
        border: '1px solid ' + C.border,
        borderRadius: 10,
        overflow: 'hidden',
      },
      sessionRow: {
        padding: '9px 12px',
        borderBottom: '1px solid ' + C.border,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      sessionRowActive: { background: C.layer2 },
      messageLayout: {
        display: 'flex',
        gap: 10,
        padding: '10px 2px',
        borderBottom: '1px solid ' + C.border,
      },
      avatar: {
        width: 26,
        height: 26,
        borderRadius: 8,
        background: C.layer2,
        border: '1px solid ' + C.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: C.muted,
        flex: '0 0 auto',
      },
      graphWrap: {
        background: C.layer1,
        border: '1px solid ' + C.border,
        borderRadius: 10,
        padding: '8px 10px 12px',
      },
      legend: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        alignItems: 'center',
        padding: '8px 6px 2px',
        fontSize: 11.5,
        color: C.muted,
      },
      searchBar: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        marginBottom: 14,
      },
    }

    const CSS = [
      '.hmv-btn{background:transparent;border:1px solid ' + C.border + ';color:inherit;border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;cursor:pointer}',
      '.hmv-btn:hover:not(:disabled){background:' + C.layer2 + '}',
      '.hmv-btn:disabled{opacity:.5;cursor:default}',
      '.hmv-rowlink{cursor:pointer}',
      '.hmv-rowlink:hover{background:' + C.layer2 + '}',
      '.hmv-input:focus{border-color:' + C.brand + '}',
      '.hmv-node{cursor:pointer}',
      '.hmv-node:hover circle{filter:brightness(1.15)}',
      '.hmv-scroll::-webkit-scrollbar{width:8px;height:8px}',
      '.hmv-scroll::-webkit-scrollbar-thumb{background:' + C.borderStrong + ';border-radius:8px}',
      '.hmv-scroll::-webkit-scrollbar-track{background:transparent}',
    ].join('\n')

    // ------------------------------------------------------------------
    // Shared presentational pieces
    // ------------------------------------------------------------------
    function Badge(props) {
      return h('span', { style: Object.assign({}, S.badge, props.brand ? S.badgeBrand : null) }, props.children)
    }

    function SectionCard(props) {
      return h('section', { style: Object.assign({}, S.card, props.style) },
        props.title !== undefined
          ? h('div', { style: S.cardTitle }, props.icon ? h('span', { style: { display: 'inline-flex' } }, props.icon) : null, props.title, props.extra ? h('span', { style: { marginLeft: 'auto', fontWeight: 400 } }, props.extra) : null)
          : null,
        props.children,
      )
    }

    function EmptyState(props) {
      return h('div', { style: S.empty }, props.children)
    }

    function ErrorState(props) {
      return h('div', { style: S.errorBox },
        h('div', { style: S.errorTitle }, props.title || t('unreachable')),
        h('div', { style: S.errorText }, props.error || ''),
        props.hint ? h('div', { style: Object.assign({}, S.errorText, { marginTop: 8 }) }, props.hint) : null,
        props.onRetry ? h('button', { type: 'button', className: 'hmv-btn', style: { marginTop: 12 }, onClick: props.onRetry }, t('retry')) : null,
      )
    }

    function Pager(props) {
      const total = props.total || 0
      const pages = props.pages || 1
      return h('div', { style: S.pager },
        h('button', { type: 'button', className: 'hmv-btn', disabled: props.page <= 1, onClick: () => props.onPage(props.page - 1) }, t('prev')),
        h('span', null, t('pageInfo', { page: props.page, pages, total: num(total) })),
        h('button', { type: 'button', className: 'hmv-btn', disabled: props.page >= pages, onClick: () => props.onPage(props.page + 1) }, t('next')),
      )
    }

    function Spinner() {
      return h('div', { style: Object.assign({}, S.empty, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }) },
        h('span', { style: { width: 14, height: 14, border: '2px solid ' + C.border, borderTopColor: C.brand, borderRadius: 999, display: 'inline-block', animation: 'hmv-spin 0.8s linear infinite' } }),
        t('loading'),
      )
    }

    function PeerChip(props) {
      const label = props.id || t('unknown')
      if (!props.onClick) return h(Badge, null, label)
      return h('button', {
        type: 'button',
        className: 'hmv-btn',
        style: { padding: '1px 7px', fontSize: 10.5, borderRadius: 999 },
        title: label,
        onClick: props.onClick,
      }, label)
    }

    // ------------------------------------------------------------------
    // Overview
    // ------------------------------------------------------------------
    function StatCard(props) {
      return h('button', {
        type: 'button',
        className: 'hmv-btn',
        style: Object.assign({}, S.card, {
          textAlign: 'left',
          cursor: props.onClick ? 'pointer' : 'default',
          display: 'block',
          width: '100%',
          fontFamily: 'inherit',
          color: 'inherit',
        }),
        onClick: props.onClick,
      },
        h('div', { style: S.statLabel }, props.label),
        h('div', { style: S.statValue }, props.value),
        props.hint ? h('div', { style: S.statHint }, props.hint) : null,
      )
    }

    function ConclusionRow(props) {
      const item = props.item
      return h('div', { style: S.row },
        h('div', { style: S.dot }),
        h('div', { style: S.rowText },
          h('div', { style: S.rowTitle }, item.content),
          h('div', { style: S.meta },
            item.observedId ? h('span', null, t('about'), ' ', h(PeerChip, { id: item.observedId, onClick: props.onObserved ? () => props.onObserved(item.observedId) : undefined })) : null,
            item.observerId ? h('span', null, t('observedBy', { peer: item.observerId })) : null,
            item.sessionId ? h('button', {
              type: 'button',
              className: 'hmv-btn',
              style: { padding: '1px 7px', fontSize: 10.5, borderRadius: 999 },
              onClick: () => props.onSession && props.onSession(item.sessionId),
              title: item.sessionId,
            }, shortId(item.sessionId, 22)) : null,
            h('span', null, formatTime(item.createdAt)),
          ),
        ),
      )
    }

    function SessionRow(props) {
      const session = props.session
      return h('div', {
        style: Object.assign({}, S.row, { cursor: 'pointer', borderBottom: 'none' }),
        className: 'hmv-rowlink',
        onClick: () => props.onOpen(session.id),
      },
        h('span', { style: { width: 6, height: 6, borderRadius: 999, background: session.isActive ? C.success : C.idle, marginTop: 7, flex: '0 0 auto' } }),
        h('div', { style: S.rowText },
          h('div', { style: Object.assign({}, S.rowTitle, { fontFamily: 'inherit' }) }, shortId(session.id, 40)),
          h('div', { style: S.meta }, h('span', null, formatTime(session.createdAt))),
        ),
      )
    }

    function OverviewTab(props) {
      const data = props.overview.data
      const peers = data.peers || []
      const sessions = data.sessions || []
      const recent = data.recentConclusions || []
      const queue = data.queue
      const workspaces = data.workspaces || props.workspaces || []
      const stats = data.stats || { peers: 0, sessions: 0, conclusions: 0 }
      return h('div', null,
        h('div', { style: Object.assign({}, S.grid, { gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 16 }) },
          h(StatCard, { label: t('statConclusions'), value: num(stats.conclusions), onClick: () => props.onTab('conclusions') }),
          h(StatCard, { label: t('statSessions'), value: num(stats.sessions), onClick: () => props.onTab('sessions') }),
          h(StatCard, { label: t('statPeers'), value: num(stats.peers), onClick: () => props.onTab('conclusions') }),
          h(StatCard, {
            label: t('statQueue'),
            value: queue ? num(queue.pending) : '—',
            hint: queue ? t('queuePending') + ' · ' + t('queueInProgress') + ' ' + num(queue.inProgress) + ' · ' + t('queueCompleted') + ' ' + num(queue.completed) : '',
          }),
        ),
        h('div', { style: Object.assign({}, S.grid, { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 16 }) },
          h(SectionCard, { title: t('coreMemory') + ' · ' + t('peerCard'), extra: data.configuredPeer ? h(Badge, { brand: true }, data.configuredPeer) : null },
            data.card && data.card.length > 0
              ? h('div', null, data.card.map((line, index) => h('div', { key: index, style: S.bullet }, h('span', { style: S.dot }), h('span', null, line))))
              : h(EmptyState, null, t('cardEmpty')),
          ),
          h(SectionCard, { title: t('representation'), extra: data.configuredPeer ? h(Badge, null, data.configuredPeer) : null },
            data.representation && data.representation.trim() !== ''
              ? h('div', { style: Object.assign({}, S.listScroll, { maxHeight: 280 }) }, h('pre', { style: S.pre }, data.representation))
              : h(EmptyState, null, t('representationEmpty')),
          ),
        ),
        h('div', { style: Object.assign({}, S.grid, { gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }) },
          h(SectionCard, {
            title: t('recentConclusions'),
            extra: h('button', { type: 'button', className: 'hmv-btn', style: { fontSize: 11, padding: '3px 8px' }, onClick: () => props.onTab('conclusions') }, t('viewAll')),
          },
            recent.length > 0
              ? h('div', { style: S.listScroll }, recent.map((item) => h(ConclusionRow, { key: item.id, item, onObserved: props.onPeer, onSession: props.onSession })))
              : h(EmptyState, null, t('noConclusions')),
          ),
          h(SectionCard, {
            title: t('recentSessions'),
            extra: h('button', { type: 'button', className: 'hmv-btn', style: { fontSize: 11, padding: '3px 8px' }, onClick: () => props.onTab('sessions') }, t('viewAll')),
          },
            sessions.length > 0
              ? h('div', null, sessions.map((session) => h(SessionRow, { key: session.id, session, onOpen: props.onSession })))
              : h(EmptyState, null, t('noSessions')),
          ),
          h(SectionCard, { title: t('workspaces') },
            workspaces.length > 0
              ? h('div', null, workspaces.map((workspace) => {
                const active = workspace.id === props.workspace
                return h('div', {
                  key: workspace.id,
                  style: Object.assign({}, S.row, { cursor: 'pointer', borderBottom: 'none' }, active ? { background: C.layer2, borderRadius: 8 } : null),
                  className: 'hmv-rowlink',
                  onClick: () => props.onWorkspace(workspace.id),
                },
                  h('div', { style: S.rowText },
                    h('div', { style: S.rowTitle }, workspace.id, active ? h('span', { style: { marginLeft: 8 } }, h(Badge, { brand: true }, t('current'))) : null),
                    h('div', { style: S.meta },
                      h('span', null, t('statConclusions') + ' ' + num(workspace.conclusions)),
                      h('span', null, t('statSessions') + ' ' + num(workspace.sessions)),
                      h('span', null, t('statPeers') + ' ' + num(workspace.peers)),
                      h('span', null, formatTime(workspace.createdAt)),
                    ),
                  ),
                )
              }))
              : h(EmptyState, null, t('emptyWorkspace')),
          ),
        ),
      )
    }

    // ------------------------------------------------------------------
    // Conclusions
    // ------------------------------------------------------------------
    function ConclusionsTab(props) {
      const state = props.state
      const data = props.overview.data
      const peers = (data && data.peers) || []
      const filters = state.filters || {}
      const hasFilter = Boolean(filters.observed || filters.level || filters.session)
      return h('div', null,
        h('div', { style: S.searchBar },
          h('label', { style: { fontSize: 11.5, color: C.muted } }, t('observingPeer')),
          h('select', {
            style: S.select,
            value: filters.observed || '',
            onChange: (event) => props.onFilter({ observed: event.target.value }),
          },
            h('option', { value: '' }, t('allPeers')),
            peers.map((peer) => h('option', { key: peer.id, value: peer.id }, peer.id)),
          ),
          h('label', { style: { fontSize: 11.5, color: C.muted } }, t('levelLabel')),
          h('select', {
            style: S.select,
            value: filters.level || '',
            onChange: (event) => props.onFilter({ level: event.target.value }),
          },
            h('option', { value: '' }, t('allLevels')),
            h('option', { value: 'explicit' }, t('levelExplicit')),
            h('option', { value: 'deductive' }, t('levelDeductive')),
          ),
          filters.session ? h(Badge, { brand: true }, t('tabSessions') + ': ' + shortId(filters.session, 24)) : null,
          hasFilter ? h('button', { type: 'button', className: 'hmv-btn', onClick: props.onClear }, t('filterClear')) : null,
          props.extra,
        ),
        state.status === 'error' ? h(ErrorState, { title: t('requestFailed', { error: '' }), error: state.error, onRetry: () => props.onPage(state.page) }) : null,
        state.status === 'loading' ? h(Spinner) : null,
        state.status === 'ready' && state.items.length === 0 ? h(EmptyState, null, t('noConclusions')) : null,
        state.status === 'ready' && state.items.length > 0
          ? h('div', { style: Object.assign({}, S.card, { padding: '6px 10px' }) },
            state.items.map((item) => h(ConclusionRow, { key: item.id, item, onObserved: props.onPeer, onSession: props.onSession })),
          )
          : null,
        state.status === 'ready' && state.total > 0 ? h(Pager, { page: state.page, pages: state.pages || 1, total: state.total, onPage: props.onPage }) : null,
      )
    }

    // ------------------------------------------------------------------
    // Sessions
    // ------------------------------------------------------------------
    function MessageRow(props) {
      const message = props.message
      const initial = (message.peerId || '?').slice(0, 1).toUpperCase()
      return h('div', { style: S.messageLayout },
        h('div', { style: S.avatar }, initial),
        h('div', { style: S.rowText },
          h('div', { style: S.meta },
            h(PeerChip, { id: message.peerId, onClick: props.onPeer ? () => props.onPeer(message.peerId) : undefined }),
            h('span', null, formatTime(message.createdAt)),
            message.tokenCount ? h('span', null, t('tokens', { n: num(message.tokenCount) })) : null,
          ),
          h('div', { style: Object.assign({}, S.rowTitle, { marginTop: 5, whiteSpace: 'pre-wrap' }) }, message.content),
        ),
      )
    }

    function SessionDetailView(props) {
      const state = props.detail
      if (state.status === 'loading') return h(Spinner)
      if (state.status === 'error') return h(ErrorState, { title: t('requestFailed', { error: '' }), error: state.error, onRetry: () => props.onPage(state.page) })
      if (state.status !== 'ready' || !state.data) return h(EmptyState, null, t('selectSession'))
      const data = state.data
      const summaries = data.summaries || {}
      return h('div', null,
        h('div', { style: Object.assign({}, S.card, { marginBottom: 14 }) },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
            h('div', { style: S.h2 }, shortId(data.session.id, 60)),
            h(Badge, null, t('messageCount', { n: num(data.messages.total) })),
            h(Badge, null, formatTime(data.session.createdAt)),
          ),
          summaries.short ? h('div', { style: Object.assign({}, S.listScroll, { marginTop: 10, maxHeight: 220 }) }, h('pre', { style: S.pre }, summaries.short)) : h(EmptyState, null, t('noSummary')),
          summaries.long && summaries.long !== summaries.short ? h('details', { style: { marginTop: 8 } },
            h('summary', { style: { cursor: 'pointer', fontSize: 12, color: C.muted } }, t('sessionSummary') + ' (long)'),
            h('pre', { style: Object.assign({}, S.pre, { marginTop: 8 }) }, summaries.long),
          ) : null,
        ),
        h('div', { style: Object.assign({}, S.card, { padding: '6px 12px' }) },
          data.messages.items.length > 0
            ? data.messages.items.map((message) => h(MessageRow, { key: message.id, message, onPeer: props.onPeer }))
            : h(EmptyState, null, t('noMessages')),
          data.messages.total > 0
            ? h(Pager, { page: data.messages.page, pages: data.messages.pages || 1, total: data.messages.total, onPage: props.onPage })
            : null,
        ),
      )
    }

    function SessionsTab(props) {
      const state = props.sessions
      const detail = props.detail
      return h('div', { style: S.sessionLayout },
        h('div', null,
          h('div', { style: S.sessionList },
            state.status === 'ready' && state.items.length > 0
              ? state.items.map((session) => h('div', {
                key: session.id,
                style: Object.assign({}, S.sessionRow, detail.sessionId === session.id ? S.sessionRowActive : null),
                className: 'hmv-rowlink',
                onClick: () => props.onOpen(session.id),
              },
                h('span', { style: { width: 6, height: 6, borderRadius: 999, background: session.isActive ? C.success : C.idle, flex: '0 0 auto' } }),
                h('div', { style: { flex: 1, minWidth: 0 } },
                  h('div', { style: { fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, session.id),
                  h('div', { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, formatTime(session.createdAt)),
                ),
              ))
              : state.status === 'loading' ? h(Spinner) : h(EmptyState, null, t('noSessions')),
          ),
          state.status === 'ready' && state.total > 0 ? h(Pager, { page: state.page, pages: state.pages || 1, total: state.total, onPage: props.onPage }) : null,
        ),
        h(SessionDetailView, { detail, onPage: props.onDetailPage, onPeer: props.onPeer }),
      )
    }

    // ------------------------------------------------------------------
    // Graph
    // ------------------------------------------------------------------
    function GraphView(props) {
      const data = props.data
      const layout = React.useMemo(() => {
        if (!data) return null
        const peers = [...(data.peers || [])].sort((a, b) => (b.observedCount + b.observerCount) - (a.observedCount + a.observerCount))
        const sessions = [...(data.sessions || [])].sort((a, b) => b.count - a.count)
        const width = 880
        const height = 560
        const cx = width / 2
        const cy = height / 2 - 6
        const peerRadius = 210
        const sessionRadius = 100
        const position = new Map()
        peers.forEach((peer, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(1, peers.length)
          position.set('p:' + peer.id, { x: cx + peerRadius * Math.cos(angle), y: cy + peerRadius * Math.sin(angle) })
        })
        sessions.forEach((session, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(1, sessions.length)
          position.set('s:' + session.id, { x: cx + sessionRadius * Math.cos(angle), y: cy + sessionRadius * Math.sin(angle) })
        })
        const peerNode = (peer) => {
          const weight = (peer.observedCount || 0) + (peer.observerCount || 0)
          return 8 + Math.min(16, Math.sqrt(weight) * 2.2)
        }
        const sessionNode = (session) => 5 + Math.min(10, Math.sqrt(session.count || 0) * 2.4)
        return { width, height, peers, sessions, position, peerNode, sessionNode }
      }, [data])

      if (!layout) return h(Spinner)
      if (layout.peers.length === 0) return h(EmptyState, null, t('graphEmpty'))
      const edges = data.edges || []
      const maxCount = Math.max(1, ...edges.map((edge) => edge.count))
      return h('div', null,
        h('div', { style: S.graphWrap },
          h('svg', {
            viewBox: '0 0 ' + layout.width + ' ' + layout.height,
            width: '100%',
            style: { display: 'block', maxHeight: '62vh' },
            role: 'img',
            'aria-label': t('graphTitle'),
          },
            edges.filter((edge) => edge.kind === 'session').map((edge, index) => {
              const from = layout.position.get('s:' + edge.to)
              const to = layout.position.get('p:' + edge.from)
              if (!from || !to) return null
              return h('line', {
                key: 'se-' + index,
                x1: to.x, y1: to.y, x2: from.x, y2: from.y,
                style: { stroke: C.idle, strokeWidth: 1, strokeDasharray: '3 4', opacity: 0.55 },
              })
            }),
            edges.filter((edge) => edge.kind === 'observe').map((edge, index) => {
              const from = layout.position.get('p:' + edge.from)
              const to = layout.position.get('p:' + edge.to)
              if (!from || !to) return null
              return h('line', {
                key: 'oe-' + index,
                x1: from.x, y1: from.y, x2: to.x, y2: to.y,
                style: {
                  stroke: C.brand,
                  strokeWidth: 1 + Math.min(3.5, (edge.count / maxCount) * 3.5),
                  opacity: 0.16 + Math.min(0.5, (edge.count / maxCount) * 0.5),
                },
              })
            }),
            layout.sessions.map((session) => {
              const position = layout.position.get('s:' + session.id)
              if (!position) return null
              const radius = layout.sessionNode(session)
              return h('g', {
                key: 's:' + session.id,
                className: 'hmv-node',
                transform: 'translate(' + position.x + ',' + position.y + ')',
                onClick: () => props.onSession(session.id),
              },
                h('title', null, session.id + ' · ' + t('graphSessionLegend') + ' ' + session.count),
                h('circle', { r: radius, style: { fill: C.layer1, stroke: C.idle, strokeWidth: 1.4 } }),
                h('circle', { r: Math.max(2, radius - 3), style: { fill: C.idle, opacity: 0.25 } }),
                h('text', {
                  x: radius + 5,
                  y: 3,
                  textAnchor: 'start',
                  style: { fill: C.muted, fontSize: 9 },
                }, shortId(session.id, 12)),
              )
            }),
            layout.peers.map((peer) => {
              const position = layout.position.get('p:' + peer.id)
              if (!position) return null
              const radius = layout.peerNode(peer)
              const active = peer.id === data.configuredPeer
              return h('g', {
                key: 'p:' + peer.id,
                className: 'hmv-node',
                transform: 'translate(' + position.x + ',' + position.y + ')',
                onClick: () => props.onPeer(peer.id),
              },
                h('title', null, peer.id + ' · ' + t('about') + ' ' + peer.observedCount + ' · ' + t('observer') + ' ' + peer.observerCount),
                h('circle', { r: radius, style: { fill: C.layer1, stroke: active ? C.brand : C.borderStrong, strokeWidth: active ? 2.2 : 1.4 } }),
                h('circle', { r: Math.max(3, radius - 4), style: { fill: C.brand, opacity: active ? 0.85 : 0.55 } }),
                h('text', {
                  x: 0,
                  y: -radius - 7,
                  textAnchor: 'middle',
                  style: { fill: C.text, fontSize: 11, fontWeight: active ? 600 : 400 },
                }, shortId(peer.id, 16)),
              )
            }),
          ),
          h('div', { style: S.legend },
            h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 9, height: 9, borderRadius: 999, background: C.brand, opacity: 0.7 } }), t('graphPeerLegend')),
            h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 8, height: 8, borderRadius: 999, border: '1.4px solid ' + C.idle } }), t('graphSessionLegend')),
            h('span', { style: { flex: 1 } }),
            h('span', null, t('graphHint', { n: num(data.window || 0) })),
          ),
        ),
        h('div', { style: Object.assign({}, S.empty, { paddingTop: 10, fontSize: 11.5 }) }, t('graphClickHint')),
      )
    }

    // ------------------------------------------------------------------
    // Search
    // ------------------------------------------------------------------
    function SearchTab(props) {
      const state = props.state
      const overview = props.overview.data
      const peers = (overview && overview.peers) || []
      const pair = props.pair
      return h('div', null,
        h('div', { style: S.searchBar },
          h('span', { style: { fontSize: 13, fontWeight: 600 } }, t('searchResults')),
          state.q ? h(Badge, { brand: true }, state.q) : null,
          h('span', { style: { flex: 1 } }),
          h('label', { style: { fontSize: 11.5, color: C.muted } }, t('observer')),
          h('select', { style: S.select, value: pair.observer, onChange: (event) => props.onPair({ observer: event.target.value }) },
            peers.map((peer) => h('option', { key: peer.id, value: peer.id }, peer.id)),
          ),
          h('label', { style: { fontSize: 11.5, color: C.muted } }, t('observed')),
          h('select', { style: S.select, value: pair.observed || '', onChange: (event) => props.onPair({ observed: event.target.value }) },
            h('option', { value: '' }, t('allPeers')),
            peers.map((peer) => h('option', { key: peer.id, value: peer.id }, peer.id)),
          ),
          h('button', { type: 'button', className: 'hmv-btn', onClick: props.onRerun }, t('tabSearch')),
        ),
        state.status === 'loading' ? h(Spinner) : null,
        state.status === 'error' ? h(ErrorState, { title: t('requestFailed', { error: '' }), error: state.error, onRetry: props.onRerun }) : null,
        state.status === 'idle' ? h(EmptyState, null, t('searchHint')) : null,
        state.status === 'ready' && state.data
          ? h('div', null,
            h('div', { style: Object.assign({}, S.meta, { marginBottom: 10 }) },
              h('span', null, t('searchPairHint', { observer: state.data.pair.observer, observed: state.data.pair.observed })),
            ),            h(SectionCard, { title: t('searchMessages') + ' · ' + num(state.data.messages.length), style: { marginBottom: 14 } },
              state.data.messagesError ? h(EmptyState, null, state.data.messagesError) : null,
              state.data.messages.length === 0 && !state.data.messagesError ? h(EmptyState, null, t('searchEmpty')) : null,
              state.data.messages.map((message) => h(MessageRow, { key: message.id, message, onPeer: props.onPeer })),
            ),
            h(SectionCard, { title: t('searchConclusions') + ' · ' + num(state.data.conclusions.length) },
              state.data.conclusionsError ? h(EmptyState, null, state.data.conclusionsError) : null,
              state.data.conclusions.length === 0 && !state.data.conclusionsError ? h(EmptyState, null, t('searchEmpty')) : null,
              state.data.conclusions.map((item) => h(ConclusionRow, { key: item.id, item, onObserved: props.onPeer, onSession: props.onSession })),
            ),
          )
          : null,
      )
    }

    // ------------------------------------------------------------------
    // Peer detail
    // ------------------------------------------------------------------
    function PeerDetailView(props) {
      const state = props.state
      if (state.status === 'loading') return h(Spinner)
      if (state.status === 'error') return h(ErrorState, { title: t('requestFailed', { error: '' }), error: state.error, onRetry: props.onRetry })
      if (state.status !== 'ready' || !state.data) return h(EmptyState, null, t('emptyWorkspace'))
      const data = state.data
      return h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
          h('button', { type: 'button', className: 'hmv-btn', onClick: props.onBack }, '← ' + t('back')),
          h('div', { style: { fontSize: 14, fontWeight: 600 } }, t('peerDetail') + ' · ' + data.peer.id),
        ),
        h('div', { style: Object.assign({}, S.grid, { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 14 }) },
          h(SectionCard, { title: t('peerCard') },
            data.card && data.card.length > 0
              ? h('div', null, data.card.map((line, index) => h('div', { key: index, style: S.bullet }, h('span', { style: S.dot }), h('span', null, line))))
              : h(EmptyState, null, t('cardEmpty')),
          ),
          h(SectionCard, { title: t('representation') },
            data.representation && data.representation.trim() !== ''
              ? h('div', { style: Object.assign({}, S.listScroll, { maxHeight: 280 }) }, h('pre', { style: S.pre }, data.representation))
              : h(EmptyState, null, t('representationEmpty')),
          ),
        ),
        h(SectionCard, { title: t('conclusionsAbout') + ' · ' + t('totalRecords', { n: num(data.about.total) }), style: { marginBottom: 14 } },
          data.about.items.length > 0
            ? h('div', null, data.about.items.map((item) => h(ConclusionRow, { key: item.id, item, onObserved: props.onPeer, onSession: props.onSession })))
            : h(EmptyState, null, t('noConclusions')),
        ),
        h(SectionCard, { title: t('conclusionsBy') + ' · ' + t('totalRecords', { n: num(data.byPeer.total) }) },
          data.byPeer.items.length > 0
            ? h('div', null, data.byPeer.items.map((item) => h(ConclusionRow, { key: item.id, item, onObserved: props.onPeer, onSession: props.onSession })))
            : h(EmptyState, null, t('noConclusions')),
        ),
      )
    }

    // ------------------------------------------------------------------
    // The panel itself
    // ------------------------------------------------------------------
    function MemoryPanel() {
      const [boot, setBoot] = React.useState({ status: 'loading', error: null })
      const [bootNonce, setBootNonce] = React.useState(0)
      const [workspaces, setWorkspaces] = React.useState([])
      const [config, setConfig] = React.useState(null)
      const [workspace, setWorkspace] = React.useState(null)
      const [tab, setTab] = React.useState('overview')
      const [overview, setOverview] = React.useState({ status: 'idle', data: null, error: null })
      const [conclusions, setConclusions] = React.useState({ status: 'idle', items: [], total: 0, page: 1, pages: 1, filters: {}, error: null })
      const [sessions, setSessions] = React.useState({ status: 'idle', items: [], total: 0, page: 1, pages: 1, error: null })
      const [detail, setDetail] = React.useState({ status: 'idle', sessionId: null, data: null, page: 1, error: null })
      const [peer, setPeer] = React.useState(null)
      const [graph, setGraph] = React.useState({ status: 'idle', data: null, error: null })
      const [search, setSearch] = React.useState({ status: 'idle', q: '', data: null, error: null })
      const [pair, setPair] = React.useState({ observer: '', observed: '' })
      const [query, setQuery] = React.useState('')
      const [refreshing, setRefreshing] = React.useState(false)
      const [notice, setNotice] = React.useState(null)
      const generation = React.useRef(0)
      const workspaceRef = React.useRef(null)

      const loadOverview = React.useCallback((targetWorkspace, force) => {
        setOverview({ status: 'loading', data: null, error: null })
        return api('/overview', { ws: targetWorkspace, refresh: force ? 1 : undefined })
          .then((data) => {
            if (workspaceRef.current !== targetWorkspace) return
            setOverview({ status: 'ready', data, error: null })
            setNotice(null)
          })
          .catch((error) => {
            if (workspaceRef.current !== targetWorkspace) return
            setOverview({ status: 'error', data: null, error: error.message })
          })
      }, [])

      const loadConclusions = React.useCallback((targetWorkspace, page, filters) => {
        const activeFilters = filters || {}
        setConclusions((previous) => Object.assign({}, previous, { status: 'loading', filters: activeFilters, error: null }))
        const params = { ws: targetWorkspace, page, size: 30 }
        if (activeFilters.observed) params.observed = activeFilters.observed
        if (activeFilters.level) params.level = activeFilters.level
        if (activeFilters.session) params.session = activeFilters.session
        return api('/conclusions', params)
          .then((data) => {
            if (workspaceRef.current !== targetWorkspace) return
            setConclusions({ status: 'ready', items: data.items, total: data.total, page: data.page, pages: data.pages, filters: activeFilters, error: null })
          })
          .catch((error) => {
            if (workspaceRef.current !== targetWorkspace) return
            setConclusions((previous) => Object.assign({}, previous, { status: 'error', error: error.message }))
          })
      }, [])

      const loadSessions = React.useCallback((targetWorkspace, page) => {
        setSessions((previous) => Object.assign({}, previous, { status: 'loading', error: null }))
        return api('/sessions', { ws: targetWorkspace, page, size: 40 })
          .then((data) => {
            if (workspaceRef.current !== targetWorkspace) return
            setSessions({ status: 'ready', items: data.items, total: data.total, page: data.page, pages: data.pages, error: null })
          })
          .catch((error) => {
            if (workspaceRef.current !== targetWorkspace) return
            setSessions((previous) => Object.assign({}, previous, { status: 'error', error: error.message }))
          })
      }, [])

      const loadSession = React.useCallback((targetWorkspace, sessionId, page) => {
        setDetail({ status: 'loading', sessionId, data: null, page: page || 1, error: null })
        return api('/session', { ws: targetWorkspace, session: sessionId, page: page || 1, size: 40 })
          .then((data) => {
            if (workspaceRef.current !== targetWorkspace) return
            setDetail({ status: 'ready', sessionId, data, page: data.messages.page || 1, error: null })
          })
          .catch((error) => {
            if (workspaceRef.current !== targetWorkspace) return
            setDetail({ status: 'error', sessionId, data: null, page: page || 1, error: error.message })
          })
      }, [])

      const loadPeer = React.useCallback((targetWorkspace, peerId) => {
        setPeer({ status: 'loading', id: peerId, data: null, error: null })
        return api('/peer', { ws: targetWorkspace, peer: peerId, size: 20 })
          .then((data) => {
            if (workspaceRef.current !== targetWorkspace) return
            setPeer({ status: 'ready', id: peerId, data, error: null })
          })
          .catch((error) => {
            if (workspaceRef.current !== targetWorkspace) return
            setPeer({ status: 'error', id: peerId, data: null, error: error.message })
          })
      }, [])

      const loadGraph = React.useCallback((targetWorkspace, force) => {
        setGraph({ status: 'loading', data: null, error: null })
        return api('/graph', { ws: targetWorkspace, refresh: force ? 1 : undefined })
          .then((data) => {
            if (workspaceRef.current !== targetWorkspace) return
            setGraph({ status: 'ready', data, error: null })
          })
          .catch((error) => {
            if (workspaceRef.current !== targetWorkspace) return
            setGraph({ status: 'error', data: null, error: error.message })
          })
      }, [])

      const selectWorkspace = React.useCallback((id) => {
        if (id === workspaceRef.current) return
        generation.current += 1
        workspaceRef.current = id
        setWorkspace(id)
        setTab('overview')
        setPeer(null)
        setDetail({ status: 'idle', sessionId: null, data: null, page: 1, error: null })
        setConclusions({ status: 'idle', items: [], total: 0, page: 1, pages: 1, filters: {}, error: null })
        setSessions({ status: 'idle', items: [], total: 0, page: 1, pages: 1, error: null })
        setGraph({ status: 'idle', data: null, error: null })
        setSearch({ status: 'idle', q: '', data: null, error: null })
        loadOverview(id, false)
      }, [loadOverview])

      React.useEffect(() => {
        let cancelled = false
        setBoot({ status: 'loading', error: null })
        api('/workspaces')
          .then((data) => {
            if (cancelled) return
            const list = data.workspaces || []
            setWorkspaces(list)
            setConfig(data.config || null)
            const preferred = data.config && data.config.workspace
            const initial = list.find((entry) => entry.id === preferred) || list[0]
            if (!initial) {
              setBoot({ status: 'ready', error: null })
              return
            }
            generation.current += 1
            workspaceRef.current = initial.id
            setWorkspace(initial.id)
            setPair({ observer: (data.config && data.config.peerName) || '', observed: '' })
            setBoot({ status: 'ready', error: null })
            setOverview({ status: 'loading', data: null, error: null })
            api('/overview', { ws: initial.id })
              .then((overviewData) => {
                if (cancelled || workspaceRef.current !== initial.id) return
                setOverview({ status: 'ready', data: overviewData, error: null })
              })
              .catch((error) => {
                if (cancelled || workspaceRef.current !== initial.id) return
                setOverview({ status: 'error', data: null, error: error.message })
              })
          })
          .catch((error) => {
            if (cancelled) return
            setBoot({ status: 'error', error: error.message })
          })
        return () => {
          cancelled = true
        }
      }, [bootNonce])

      const showTab = React.useCallback((nextTab) => {
        setPeer(null)
        setTab(nextTab)
        if (workspaceRef.current === null) return
        if (nextTab === 'conclusions' && conclusions.status === 'idle') loadConclusions(workspaceRef.current, 1, conclusions.filters)
        if (nextTab === 'sessions' && sessions.status === 'idle') loadSessions(workspaceRef.current, 1)
        if (nextTab === 'graph' && graph.status === 'idle') loadGraph(workspaceRef.current, false)
      }, [conclusions.status, conclusions.filters, graph.status, loadConclusions, loadGraph, loadSessions, sessions.status])

      const openSession = React.useCallback((sessionId) => {
        const target = workspaceRef.current
        if (target === null) return
        setPeer(null)
        setTab('sessions')
        if (sessions.status === 'idle') loadSessions(target, 1)
        loadSession(target, sessionId, 1)
      }, [loadSession, loadSessions, sessions.status])

      const openPeer = React.useCallback((peerId) => {
        const target = workspaceRef.current
        if (target === null) return
        loadPeer(target, peerId)
      }, [loadPeer])

      const refresh = React.useCallback(() => {
        const target = workspaceRef.current
        if (target === null || refreshing) return
        setRefreshing(true)
        const tasks = [
          api('/workspaces', { refresh: 1 }).then((data) => setWorkspaces(data.workspaces || [])).catch(() => undefined),
          loadOverview(target, true),
        ]
        if (tab === 'conclusions' && conclusions.status !== 'idle') tasks.push(loadConclusions(target, conclusions.page, conclusions.filters))
        if (tab === 'sessions') {
          tasks.push(loadSessions(target, sessions.page || 1))
          if (detail.sessionId) tasks.push(loadSession(target, detail.sessionId, detail.page))
        }
        if (tab === 'graph') tasks.push(loadGraph(target, true))
        Promise.all(tasks)
          .then(() => setNotice(null))
          .catch((error) => setNotice(t('refreshFailed', { error: error.message })))
          .finally(() => setRefreshing(false))
      }, [conclusions.filters, conclusions.page, conclusions.status, detail.page, detail.sessionId, loadConclusions, loadGraph, loadOverview, loadSession, loadSessions, refreshing, sessions.page, tab])

      const runSearch = React.useCallback((text, chosenPair) => {
        const target = workspaceRef.current
        const value = String(text || '').trim()
        if (target === null || value === '') return
        const effectivePair = chosenPair || pair
        setTab('search')
        setPeer(null)
        setSearch({ status: 'loading', q: value, data: null, error: null })
        api('/search', {
          ws: target,
          q: value,
          limit: 12,
          observer: effectivePair.observer || undefined,
          observed: effectivePair.observed || undefined,
        })
          .then((data) => {
            if (workspaceRef.current !== target) return
            setSearch({ status: 'ready', q: value, data, error: null })
            if (data.pair) setPair(data.pair)
          })
          .catch((error) => {
            if (workspaceRef.current !== target) return
            setSearch({ status: 'error', q: value, data: null, error: error.message })
          })
      }, [pair])

      const content = (() => {
        if (peer !== null) {
          return h(PeerDetailView, {
            state: peer,
            onBack: () => setPeer(null),
            onRetry: () => openPeer(peer.id),
            onPeer: openPeer,
            onSession: openSession,
          })
        }
        if (tab === 'overview') {
          if (overview.status === 'loading' || overview.status === 'idle') return h(Spinner)
          if (overview.status === 'error') {
            return h(ErrorState, {
              title: t('unreachable'),
              error: overview.error,
              hint: t('unreachableHint') + (config ? ' (' + config.baseUrl + ')' : ''),
              onRetry: () => (workspaceRef.current ? loadOverview(workspaceRef.current, true) : null),
            })
          }
          return h(OverviewTab, {
            overview,
            workspaces,
            workspace,
            onTab: showTab,
            onPeer: openPeer,
            onSession: openSession,
            onWorkspace: selectWorkspace,
          })
        }
        if (tab === 'conclusions') {
          return h(ConclusionsTab, {
            state: conclusions,
            overview,
            onFilter: (patch) => {
              const nextFilters = Object.assign({}, conclusions.filters, patch)
              loadConclusions(workspaceRef.current, 1, nextFilters)
            },
            onClear: () => loadConclusions(workspaceRef.current, 1, {}),
            onPage: (page) => loadConclusions(workspaceRef.current, page, conclusions.filters),
            onPeer: openPeer,
            onSession: openSession,
          })
        }
        if (tab === 'sessions') {
          return h(SessionsTab, {
            sessions,
            detail,
            onOpen: openSession,
            onPage: (page) => loadSessions(workspaceRef.current, page),
            onDetailPage: (page) => {
              if (detail.sessionId) loadSession(workspaceRef.current, detail.sessionId, page)
            },
            onPeer: openPeer,
          })
        }
        if (tab === 'graph') {
          if (graph.status === 'loading' || graph.status === 'idle') return h(Spinner)
          if (graph.status === 'error') return h(ErrorState, { title: t('requestFailed', { error: '' }), error: graph.error, onRetry: () => loadGraph(workspaceRef.current, true) })
          if (!graph.data || graph.data.window === 0) return h(EmptyState, null, t('graphEmpty'))
          return h('div', null,
            h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' } },
              h('div', { style: { fontSize: 14, fontWeight: 600 } }, t('graphTitle')),
              h('div', { style: { fontSize: 11.5, color: C.muted } }, t('graphHint', { n: num(graph.data.window) })),
            ),
            h(GraphView, {
              data: graph.data,
              onPeer: openPeer,
              onSession: openSession,
            }),
          )
        }
        if (tab === 'search') {
          return h(SearchTab, {
            state: search,
            overview,
            pair,
            onPair: (patch) => {
              const nextPair = Object.assign({}, pair, patch)
              setPair(nextPair)
              if (search.q) runSearch(search.q, nextPair)
            },
            onRerun: () => runSearch(search.q || query, pair),
            onPeer: openPeer,
            onSession: openSession,
          })
        }
        return null
      })()

      const tabs = [
        { id: 'overview', label: t('tabOverview') },
        { id: 'conclusions', label: t('tabConclusions') },
        { id: 'sessions', label: t('tabSessions') },
        { id: 'graph', label: t('tabGraph') },
      ]
      if (search.status !== 'idle') tabs.push({ id: 'search', label: t('tabSearch') })

      return h('div', { style: S.root },
        h('style', null, CSS + '@keyframes hmv-spin{to{transform:rotate(360deg)}}'),
        h('header', { style: S.header },
          h('div', { style: S.brandMark },
            h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
              h('path', { d: 'M12 4.5v15', stroke: '#fff', strokeWidth: 1.4, strokeLinecap: 'round', opacity: 0.55 }),
              h('circle', { cx: 6.5, cy: 8, r: 2.1, fill: '#fff' }),
              h('circle', { cx: 12, cy: 4.5, r: 2.4, fill: '#fff' }),
              h('circle', { cx: 17.5, cy: 9, r: 2, fill: '#fff' }),
              h('circle', { cx: 12, cy: 14.5, r: 2.2, fill: '#fff' }),
              h('circle', { cx: 7, cy: 18, r: 1.8, fill: '#fff', opacity: 0.85 }),
              h('circle', { cx: 17.5, cy: 17.5, r: 1.8, fill: '#fff', opacity: 0.85 }),
            ),
          ),
          h('div', null,
            h('div', { style: S.title }, t('title')),
            h('div', { style: S.subtitle },
              config ? config.baseUrl + ' · ' + t('peer') + ' ' + (config.peerName || '') + ' · ' + t('workspace') + ' ' + workspace : t('loading'),
            ),
          ),
          h('div', { style: S.grow }),
          h('input', {
            className: 'hmv-input',
            style: S.input,
            value: query,
            placeholder: t('searchPlaceholder'),
            onChange: (event) => setQuery(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                runSearch(query, pair)
              }
            },
            'aria-label': t('searchPlaceholder'),
          }),
          h('select', {
            style: S.select,
            value: workspace || '',
            onChange: (event) => selectWorkspace(event.target.value),
            title: t('workspace'),
          },
            workspaces.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.id + ' · ' + t('statConclusions') + ' ' + num(entry.conclusions))),
          ),
          h('button', { type: 'button', className: 'hmv-btn', onClick: refresh, disabled: refreshing || boot.status !== 'ready' || workspace === null },
            refreshing ? t('refreshing') : t('refresh'),
          ),
        ),
        notice ? h('div', { style: { padding: '8px 22px 0' } },
          h('div', { style: Object.assign({}, S.errorBox, { padding: '8px 12px' }) },
            h('div', { style: { fontSize: 12, color: C.muted } }, notice),
            h('button', { type: 'button', className: 'hmv-btn', style: { marginTop: 8 }, onClick: () => setNotice(null) }, '×'),
          ),
        ) : null,
        h('div', { style: S.tabBar },
          tabs.map((entry) => h('button', {
            key: entry.id,
            type: 'button',
            style: Object.assign({}, S.tab, tab === entry.id ? S.tabActive : null),
            onClick: () => showTab(entry.id),
          }, entry.label)),
        ),
        h('div', { style: S.content },
          boot.status === 'loading' ? h(Spinner) : null,
          boot.status === 'error'
            ? h(ErrorState, {
              title: t('unreachable'),
              error: boot.error,
              hint: t('unreachableHint'),
              onRetry: () => {
                setBoot({ status: 'loading', error: null })
                setBootNonce((value) => value + 1)
              },
            })
            : null,
          boot.status === 'ready' && workspace === null ? h(EmptyState, null, t('emptyWorkspace')) : null,
          boot.status === 'ready' && workspace !== null ? content : null,
        ),
      )
    }

    // ------------------------------------------------------------------
    // Sidebar icon
    // ------------------------------------------------------------------
    function PanelIcon(props) {
      const size = props.size || 18
      const color = props.active ? C.brand : 'currentColor'
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { display: 'block' },
      },
        h('path', { d: 'M12 5v13.5M7 8.5l5 3.2 5-3.2M7 8.5v7.8l5 3.2 5-3.2V8.5', style: { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', opacity: 0.75 } }),
        h('circle', { cx: 12, cy: 4.5, r: 2, style: { fill: color } }),
        h('circle', { cx: 7, cy: 8.5, r: 1.8, style: { fill: color, opacity: 0.9 } }),
        h('circle', { cx: 17, cy: 8.5, r: 1.8, style: { fill: color, opacity: 0.9 } }),
        h('circle', { cx: 12, cy: 15.5, r: 1.8, style: { fill: color, opacity: 0.9 } }),
        h('circle', { cx: 7, cy: 17, r: 1.6, style: { fill: color, opacity: 0.6 } }),
        h('circle', { cx: 17, cy: 17, r: 1.6, style: { fill: color, opacity: 0.6 } }),
      )
    }

    // ------------------------------------------------------------------
    // Browser plugin
    // ------------------------------------------------------------------
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'honcho-memory-viz: dictionaries')
      const translate = ctx.locale.bind(NS)
      // Wrap the bound translate so `{name}` placeholders are filled locally:
      // the shipped Translate may or may not interpolate, and this stays correct
      // either way.
      t = (key, vars) => {
        let text = translate(key)
        if (typeof text !== 'string') text = String(key)
        if (!vars) return text
        return text.replace(/\{(\w+)\}/g, (match, name) => (Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match))
      }
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        label: () => t('panel'),
        locale: NS,
      }, PanelIcon))
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        label: () => t('panel'),
        locale: NS,
      }, MemoryPanel))
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
