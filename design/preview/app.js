// PayFlow — prévia navegável do design. Dados fictícios no formato das respostas do BFF.
'use strict';

// ---------------------------------------------------------------- dados de exemplo
const merchant = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Loja Exemplo',
  email: 'contato@lojaexemplo.com.br',
  document: '11222333000181',
  status: 'ACTIVE',
};

const dashboard = {
  summary: {
    currency: 'BRL', totalAmount: 125000, count: 42,
    byStatus: { AUTHORIZED: 26, CONFIRMED: 6, PENDING: 4, DECLINED: 3, CANCELED: 1, PARTIALLY_REFUNDED: 1, REFUNDED: 1 },
    byMethod: { CARD: 90000, PIX: 35000 },
  },
  fees: {
    totalFees: 3488, netAmount: 121512,
    byMethod: [
      { method: 'CARD', gross: 90000, rate: 0.0349, fee: 3141, settlement: 'D+30' },
      { method: 'PIX', gross: 35000, rate: 0.0099, fee: 347, settlement: 'D+0' },
    ],
  },
  generatedAt: '2026-10-26T14:00:00Z',
};

const payments = [
  { id: '9f8e7d6c-5b4a-4321-8765-0fedcba98765', amount: 10000, method: 'CARD', status: 'PARTIALLY_REFUNDED', last4: '4242', description: 'Pedido #1042 — Camiseta básica', createdAt: '2026-10-26T13:41:00Z', refunded: 2500, metadata: { order_id: '1042', canal: 'site' } },
  { id: '5a1c2b3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d', amount: 3000, method: 'PIX', status: 'PENDING', description: 'Pedido #1043 — Caneca', createdAt: '2026-10-26T13:20:00Z', refunded: 0, metadata: {} },
  { id: '1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e', amount: 1990, method: 'PIX', status: 'CONFIRMED', description: 'Pedido #1041 — Chaveiro', createdAt: '2026-10-26T11:05:00Z', refunded: 0, metadata: {} },
  { id: '2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f', amount: 25990, method: 'CARD', status: 'AUTHORIZED', last4: '1234', description: 'Pedido #1040 — Tênis corrida', createdAt: '2026-10-26T09:47:00Z', refunded: 0, metadata: { order_id: '1040' } },
  { id: '3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a', amount: 8900, method: 'CARD', status: 'DECLINED', last4: '4242', description: 'Pedido #1039 — Mochila', createdAt: '2026-10-25T19:12:00Z', refunded: 0, metadata: {} },
  { id: '4e5f6a7b-8c9d-4e0f-1a2b-3c4d5e6f7a8b', amount: 4500, method: 'CARD', status: 'AUTHORIZED', last4: '4242', description: 'Pedido #1038 — Boné', createdAt: '2026-10-25T16:30:00Z', refunded: 0, metadata: {} },
  { id: '5f6a7b8c-9d0e-4f1a-2b3c-4d5e6f7a8b9c', amount: 12000, method: 'CARD', status: 'REFUNDED', last4: '9876', description: 'Pedido #1037 — Jaqueta', createdAt: '2026-10-25T10:02:00Z', refunded: 12000, metadata: {} },
  { id: '6a7b8c9d-0e1f-4a2b-3c4d-5e6f7a8b9c0d', amount: 2500, method: 'PIX', status: 'CANCELED', description: 'Pedido #1036 — Adesivos', createdAt: '2026-10-24T18:44:00Z', refunded: 0, metadata: {} },
  { id: '7b8c9d0e-1f2a-4b3c-4d5e-6f7a8b9c0d1e', amount: 15900, method: 'PIX', status: 'CONFIRMED', description: 'Pedido #1035 — Fone de ouvido', createdAt: '2026-10-24T15:15:00Z', refunded: 0, metadata: {} },
  { id: '8c9d0e1f-2a3b-4c4d-5e6f-7a8b9c0d1e2f', amount: 6700, method: 'CARD', status: 'AUTHORIZED', last4: '4242', description: 'Pedido #1034 — Garrafa térmica', createdAt: '2026-10-24T09:30:00Z', refunded: 0, metadata: {} },
];

const STATUS = {
  AUTHORIZED: { label: 'Aprovado', tone: 'success', icon: 'check' },
  CONFIRMED: { label: 'PIX confirmado', tone: 'success', icon: 'check-check' },
  PENDING: { label: 'Aguardando PIX', tone: 'warning', icon: 'clock' },
  DECLINED: { label: 'Recusado', tone: 'danger', icon: 'x' },
  CANCELED: { label: 'Cancelado', tone: 'neutral', icon: 'ban' },
  PARTIALLY_REFUNDED: { label: 'Estorno parcial', tone: 'info', icon: 'undo-2' },
  REFUNDED: { label: 'Estornado', tone: 'neutral', icon: 'undo-2' },
};

const EVENTS = [
  ['payment.authorized', 'Cartão aprovado'],
  ['payment.declined', 'Cartão recusado'],
  ['payment.pending', 'PIX criado'],
  ['payment.confirmed', 'PIX confirmado'],
  ['payment.refunded', 'Estorno registrado'],
  ['payment.canceled', 'Pagamento cancelado'],
];

// Estados que o painel "Prévia" alterna para avaliar cada situação.
const preview = {
  hideValues: false,
  webhookConfigured: false,
  warnings: false,
  emptyList: false,
  loading: false,
  method: 'CARD',
  menuOpen: false,
};

// ---------------------------------------------------------------- formatação
const brlFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brl = (cents) => (preview.hideValues ? 'R$ ••••' : brlFormat.format(cents / 100));
const brlAlways = (cents) => brlFormat.format(cents / 100);
const pct = (value) => `${(value * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const dateTime = (iso) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const time = (iso) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const cnpj = (digits) => digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
const shortId = (id) => id.slice(0, 8);
const icon = (name, cls = '') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;

function statusBadge(status) {
  const s = STATUS[status];
  return `<span class="badge badge-${s.tone}">${icon(s.icon)}${s.label}</span>`;
}

function methodLabel(payment) {
  return payment.method === 'CARD' ? `Cartão •••• ${payment.last4}` : 'PIX';
}

// ---------------------------------------------------------------- shell (topo + barra lateral)
const NAV = [
  ['inicio', 'Início', 'house'],
  ['pagamentos', 'Pagamentos', 'receipt-text'],
  ['nova-cobranca', 'Nova cobrança', 'circle-plus'],
  ['conta', 'Conta', 'store'],
  ['integracao', 'Integração', 'webhook', true],
];

function shell(active, body) {
  const nav = NAV.map(([route, label, ic, isNew]) => `
    <a class="nav-item" href="#/${route}" ${active === route ? 'aria-current="page"' : ''}>
      ${icon(ic)}<span>${label}</span>${isNew ? '<span class="new-badge">Novo</span>' : ''}
    </a>`).join('');
  return `
  <a class="sr-only" href="#main">Pular para o conteúdo</a>
  <header class="topbar">
    <button class="icon-btn menu-button" data-action="toggle-nav" aria-label="Abrir menu">${icon('menu')}</button>
    <a class="logo" href="#/inicio" aria-label="PayFlow, início"><span class="logo-mark">${icon('arrow-right-left')}</span>payflow</a>
    <span class="env-badge">Ambiente de testes</span>
    <span class="topbar-spacer"></span>
    <div class="user">
      <div class="user-text"><div class="user-name">${merchant.name}</div><div class="user-mail">${merchant.email}</div></div>
      <span class="avatar" aria-hidden="true">LE</span>
    </div>
  </header>
  <div class="layout">
    <aside class="sidebar" aria-label="Menu principal">
      <button class="merchant-switch" aria-label="Lojista ${merchant.name}">
        <span><span class="merchant-name">${merchant.name}</span><br><span class="merchant-doc">${cnpj(merchant.document)}</span></span>
        ${icon('chevron-down', 'icon-sm')}
      </button>
      <div class="balance">
        <div class="balance-label">Volume aprovado em outubro
          <button class="icon-btn" data-action="toggle-values" aria-label="${preview.hideValues ? 'Mostrar valores' : 'Ocultar valores'}" aria-pressed="${preview.hideValues}">${icon(preview.hideValues ? 'eye-off' : 'eye')}</button>
        </div>
        <div class="balance-value num ${preview.hideValues ? 'hidden-value' : ''}">${brl(dashboard.summary.totalAmount)}</div>
      </div>
      <div class="quick-actions">
        <a class="quick-action" href="#/nova-cobranca" data-method="CARD"><span class="circle">${icon('credit-card')}</span>Cartão</a>
        <a class="quick-action" href="#/nova-cobranca" data-method="PIX"><span class="circle">${icon('qr-code')}</span>PIX</a>
        <a class="quick-action" href="#/integracao"><span class="circle">${icon('webhook')}</span>Webhook</a>
      </div>
      <nav class="nav">${nav}</nav>
      <div class="sidebar-footer">
        <div class="nav-separator"></div>
        <a class="nav-item" href="#/entrar">${icon('log-out')}<span>Sair</span></a>
      </div>
    </aside>
    <main class="content" id="main" tabindex="-1">${body}</main>
  </div>`;
}

// ---------------------------------------------------------------- telas
function loginView() {
  return `
  <div class="auth">
    ${authAside()}
    <main class="auth-main" id="main">
      <form class="auth-card" data-action="login" novalidate>
        <div>
          <h2>Entrar no portal</h2>
          <p class="muted" style="margin-top:6px">Use a chave de acesso que você recebeu ao criar a conta.</p>
        </div>
        <div class="field">
          <label for="key">Chave de acesso</label>
          <div class="input-group">
            <input class="input" id="key" type="password" autocomplete="current-password" placeholder="pf_…" value="pf_905061db8206fe5d2a60a32a5400b55b">
            <button type="button" class="icon-btn" data-action="toggle-secret" data-target="key" aria-label="Mostrar chave">${icon('eye')}</button>
          </div>
          <span class="help">Começa com <strong>pf_</strong>. Nunca compartilhe sua chave.</span>
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Entrar</button>
        <p class="muted" style="text-align:center;font-size:14px">Ainda não tem conta? <a href="#/criar-conta">Criar conta</a></p>
      </form>
    </main>
  </div>`;
}

function signupView() {
  return `
  <div class="auth">
    ${authAside()}
    <main class="auth-main" id="main">
      <form class="auth-card" data-action="signup" novalidate>
        <div>
          <a class="muted" href="#/entrar" style="display:inline-flex;align-items:center;gap:6px;font-size:14px">${icon('arrow-left', 'icon-sm')}Voltar</a>
          <h2 style="margin-top:12px">Criar conta de lojista</h2>
          <p class="muted" style="margin-top:6px">Leva um minuto. Você recebe a chave de acesso na hora.</p>
        </div>
        <div class="field"><label for="name">Nome da loja</label><input class="input" id="name" autocomplete="organization" value="Loja Exemplo"></div>
        <div class="field"><label for="email">E-mail</label><input class="input" id="email" type="email" autocomplete="email" value="contato@lojaexemplo.com.br"></div>
        <div class="field">
          <label for="doc">CPF ou CNPJ</label>
          <input class="input invalid" id="doc" inputmode="numeric" value="11.222.333/0001-8" aria-invalid="true" aria-describedby="doc-error">
          <span class="error" id="doc-error">${icon('circle-alert', 'icon-sm')}O CNPJ tem 14 dígitos. Confira o número.</span>
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Criar conta</button>
      </form>
    </main>
  </div>`;
}

function signupDoneView() {
  return `
  <div class="auth">
    ${authAside()}
    <main class="auth-main" id="main">
      <div class="auth-card">
        <span class="success-icon">${icon('badge-check')}</span>
        <div>
          <h2>Conta criada!</h2>
          <p class="muted" style="margin-top:6px">Esta é a sua chave de acesso. Use para entrar no portal e para integrar a sua loja.</p>
        </div>
        <div class="copy-field">
          <code>pf_905061db8206fe5d2a60a32a5400b55b2b7ff36185cb172b90254427c27d4c25</code>
          <button class="btn btn-soft" data-action="copy" data-copy="Chave copiada">${icon('copy')}Copiar</button>
        </div>
        <div class="callout">${icon('triangle-alert')}<span><strong>Guarde agora.</strong> Por segurança, a chave não aparece de novo. Se perder, gere outra em Integração.</span></div>
        <a class="btn btn-primary btn-lg btn-block" href="#/inicio">Ir para o painel</a>
      </div>
    </main>
  </div>`;
}

function authAside() {
  return `
  <aside class="auth-aside">
    <span class="logo"><span class="logo-mark">${icon('arrow-right-left')}</span>payflow</span>
    <div>
      <h1>Seus pagamentos em um painel só.</h1>
      <ul>
        <li>${icon('credit-card')}Cartão e PIX na mesma conta</li>
        <li>${icon('bell-ring')}Avisos na sua loja a cada pagamento</li>
        <li>${icon('shield-check')}Nenhum dado de cartão passa pela sua loja</li>
      </ul>
    </div>
    <span class="muted" style="color:rgb(255 255 255 / 75%);font-size:13px">Ambiente de testes — nenhum valor real é cobrado.</span>
    <span class="ring" aria-hidden="true"></span>
  </aside>`;
}

function dashboardView() {
  const { summary, fees } = dashboard;
  const total = summary.byMethod.CARD + summary.byMethod.PIX;
  if (preview.loading) return shell('inicio', dashboardSkeleton());
  const methodBars = fees.byMethod.map((line) => {
    const share = line.gross / total;
    return `
      <div>
        <div class="method-bar-head">
          <span class="method-bar-name">${icon(line.method === 'CARD' ? 'credit-card' : 'qr-code')}${line.method === 'CARD' ? 'Cartão' : 'PIX'}</span>
          <span class="num"><strong>${brl(line.gross)}</strong> <span class="muted">· ${Math.round(share * 100)}%</span></span>
        </div>
        <div class="method-bar-track" role="img" aria-label="${Math.round(share * 100)}% do volume"><div class="method-bar-fill ${line.method === 'PIX' ? 'pix' : ''}" style="width:${share * 100}%"></div></div>
        <div class="method-bar-foot"><span>Taxa ${pct(line.rate)} · ${brl(line.fee)}</span><span>Recebe em ${line.settlement}</span></div>
      </div>`;
  }).join('');
  const statusLines = Object.entries(summary.byStatus).map(([status, count]) =>
    `<div class="status-line">${statusBadge(status)}<span class="num"><strong>${count}</strong></span></div>`).join('');
  return shell('inicio', `
  <div class="page">
    <div class="page-header">
      <div class="grow">
        <h1>Olá, ${merchant.name}</h1>
        <p class="page-subtitle">Resumo de todos os pagamentos · atualizado às ${time(dashboard.generatedAt)}</p>
      </div>
      <button class="btn btn-secondary" data-action="refresh">${icon('refresh-cw')}Atualizar</button>
      <a class="btn btn-primary" href="#/nova-cobranca">${icon('plus')}Nova cobrança</a>
    </div>

    ${preview.warnings ? `
    <div class="notice" role="status">${icon('triangle-alert')}
      <div class="grow"><strong>Não foi possível calcular as taxas agora.</strong> O serviço de taxas não respondeu em 2 s. O resto do painel está atualizado.</div>
      <button class="btn btn-soft" data-action="refresh">Tentar de novo</button>
    </div>` : ''}

    ${preview.webhookConfigured ? '' : `
    <section class="banner" aria-labelledby="banner-title">
      <div class="grow">
        <h2 id="banner-title">Receba avisos de pagamento na sua loja</h2>
        <p>Configure um webhook e saiba na hora quando um pagamento for aprovado, confirmado ou estornado.</p>
        <a href="#/integracao">Configurar agora ${icon('chevron-right', 'icon-sm')}</a>
      </div>
      ${bannerArt()}
    </section>`}

    <section class="grid grid-4" aria-label="Indicadores">
      ${kpi('trending-up', 'Volume aprovado', brl(summary.totalAmount), 'Líquido de estornos')}
      ${kpi('percent', 'Taxas estimadas', preview.warnings ? '—' : brl(fees.totalFees), preview.warnings ? 'Indisponível agora' : 'Cartão 3,49% · PIX 0,99%')}
      ${kpi('wallet', 'Você recebe', preview.warnings ? '—' : brl(fees.netAmount), 'Depois das taxas')}
      ${kpi('receipt-text', 'Pagamentos', String(summary.count), `${summary.byStatus.PENDING} aguardando PIX`)}
    </section>

    <div class="grid grid-main">
      <section class="card">
        <div class="card-header"><h2 class="section-title">Volume por método</h2><span class="muted" style="font-size:13px">Prazo de recebimento</span></div>
        <div class="card-body method-bars">${methodBars}</div>
      </section>
      <section class="card">
        <div class="card-header"><h2 class="section-title">Pagamentos por status</h2></div>
        <div class="card-body status-list">${statusLines}</div>
      </section>
    </div>

    <section class="card">
      <div class="card-header"><h2 class="section-title">Acesso rápido</h2></div>
      <div class="card-body shortcuts">
        ${shortcut('#/nova-cobranca', 'credit-card', 'Cobrar no cartão', false, 'CARD')}
        ${shortcut('#/nova-cobranca', 'qr-code', 'Cobrar com PIX', false, 'PIX')}
        ${shortcut('#/integracao', 'webhook', 'Configurar webhook', true)}
        ${shortcut('#/integracao', 'key-round', 'Trocar chave')}
        ${shortcut('#/pagamentos', 'undo-2', 'Fazer estorno')}
        ${shortcut('#/integracao', 'file-code-2', 'Documentação da API')}
      </div>
    </section>

    <section class="card">
      <div class="card-header"><h2 class="section-title">Últimos pagamentos</h2><a href="#/pagamentos">Ver todos</a></div>
      <ul class="row-list" style="margin-top:8px">${payments.slice(0, 5).map(paymentRow).join('')}</ul>
    </section>
  </div>`);
}

function kpi(ic, label, value, hint) {
  return `<div class="card kpi"><span class="kpi-label"><span class="kpi-icon">${icon(ic)}</span>${label}</span><span class="kpi-value num">${value}</span><span class="kpi-hint">${hint}</span></div>`;
}

function shortcut(href, ic, label, isNew = false, method = '') {
  return `<a class="shortcut" href="${href}" ${method ? `data-method="${method}"` : ''}>${isNew ? '<span class="new-badge">Novo</span>' : ''}<span class="circle">${icon(ic)}</span>${label}</a>`;
}

function paymentRow(payment) {
  return `<li><a class="pay-row" href="#/pagamentos/${payment.id}">
    <span class="method-icon">${icon(payment.method === 'CARD' ? 'credit-card' : 'qr-code')}</span>
    <span style="min-width:0"><span class="pay-title" style="display:block">${payment.description}</span><span class="pay-meta">${methodLabel(payment)} · ${dateTime(payment.createdAt)}</span></span>
    ${statusBadge(payment.status)}
    <span class="pay-amount num">${brl(payment.amount)}</span>
  </a></li>`;
}

function dashboardSkeleton() {
  const block = (h, w = '100%') => `<div class="skeleton" style="height:${h}px;width:${w}"></div>`;
  return `<div class="page" aria-busy="true" aria-label="Carregando painel">
    <div>${block(28, '260px')}<div style="height:8px"></div>${block(16, '340px')}</div>
    ${block(108)}
    <div class="grid grid-4">${[1, 2, 3, 4].map(() => `<div class="card kpi">${block(14, '60%')}${block(26, '80%')}${block(12, '50%')}</div>`).join('')}</div>
    <div class="grid grid-main"><div class="card card-pad">${block(160)}</div><div class="card card-pad">${block(160)}</div></div>
  </div>`;
}

function paymentsView() {
  const rows = preview.emptyList ? [] : payments;
  const table = rows.length === 0 ? `
    <div class="empty">
      <span class="circle">${icon('receipt-text')}</span>
      <h3>Nenhum pagamento por aqui</h3>
      <p class="muted">Você ainda não recebeu pagamentos com esses filtros.</p>
      <a class="btn btn-primary" href="#/nova-cobranca" style="margin-top:8px">${icon('plus')}Criar cobrança</a>
    </div>` : `
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Data</th><th scope="col">Descrição</th><th scope="col">Método</th><th scope="col">Status</th><th scope="col" class="right">Valor</th></tr></thead>
      <tbody>${rows.map((p) => `
        <tr data-href="#/pagamentos/${p.id}" tabindex="0">
          <td class="muted num" style="white-space:nowrap">${dateTime(p.createdAt)}</td>
          <td><strong style="font-weight:600">${p.description}</strong><div class="pay-meta">ID ${shortId(p.id)}</div></td>
          <td><span class="cell-method">${icon(p.method === 'CARD' ? 'credit-card' : 'qr-code', 'icon-sm')}${methodLabel(p)}</span></td>
          <td>${statusBadge(p.status)}</td>
          <td class="right num"><strong>${brl(p.amount)}</strong>${p.refunded ? `<div class="pay-meta">−${brl(p.refunded)} estornado</div>` : ''}</td>
        </tr>`).join('')}</tbody>
    </table></div>
    <div class="pagination"><span class="num">1–10 de 42 pagamentos</span>
      <span class="pages"><button class="btn btn-secondary" disabled>${icon('chevron-left', 'icon-sm')}Anterior</button><button class="btn btn-secondary">Próxima${icon('chevron-right', 'icon-sm')}</button></span>
    </div>`;
  return shell('pagamentos', `
  <div class="page">
    <div class="page-header">
      <div class="grow"><h1>Pagamentos</h1><p class="page-subtitle">Todos os pagamentos da sua loja, mais recentes primeiro</p></div>
      <a class="btn btn-primary" href="#/nova-cobranca">${icon('plus')}Nova cobrança</a>
    </div>
    <section class="card" style="overflow:hidden">
      <div class="filters">
        <label class="sr-only" for="f-status">Status</label>
        <select class="select" id="f-status"><option>Todos os status</option>${Object.values(STATUS).map((s) => `<option>${s.label}</option>`).join('')}</select>
        <div class="segmented" role="group" aria-label="Método">
          <button aria-pressed="true">Todos</button><button aria-pressed="false">${icon('credit-card', 'icon-sm')}Cartão</button><button aria-pressed="false">${icon('qr-code', 'icon-sm')}PIX</button>
        </div>
        <label class="sr-only" for="f-period">Período</label>
        <select class="select" id="f-period"><option>Últimos 30 dias</option><option>Hoje</option><option>Últimos 7 dias</option><option>Este mês</option></select>
        <span class="topbar-spacer"></span>
        <button class="btn btn-ghost">${icon('x', 'icon-sm')}Limpar filtros</button>
      </div>
      ${table}
    </section>
  </div>`);
}

function paymentDetailView(id) {
  const p = payments.find((payment) => payment.id === id) ?? payments[0];
  const refundable = p.amount - p.refunded;
  const canRefund = ['AUTHORIZED', 'CONFIRMED', 'PARTIALLY_REFUNDED'].includes(p.status);
  const timeline = [
    [p.method === 'PIX' ? 'qr-code' : 'credit-card', p.method === 'PIX' ? 'Cobrança PIX criada' : 'Pagamento criado', p.createdAt, ''],
  ];
  if (p.status !== 'PENDING' && p.status !== 'CANCELED') {
    timeline.push([p.status === 'DECLINED' ? 'x' : 'check', p.status === 'DECLINED' ? 'Recusado pelo gateway' : p.method === 'PIX' ? 'PIX confirmado' : 'Aprovado pelo gateway', p.createdAt, p.status === 'DECLINED' ? 'muted' : '']);
  }
  if (p.status === 'CANCELED') timeline.push(['ban', 'Cancelado', p.createdAt, 'muted']);
  if (p.refunded) timeline.push(['undo-2', `Estorno de ${brl(p.refunded)} — avaria no produto`, '2026-10-26T15:02:00Z', 'info']);
  const metadata = Object.entries(p.metadata);
  return shell('pagamentos', `
  <div class="page">
    <div class="page-header">
      <a class="back" href="#/pagamentos" aria-label="Voltar para pagamentos">${icon('arrow-left')}</a>
      <h1 class="grow">Pagamento</h1>
    </div>
    <section class="card card-pad">
      <div class="detail-hero">
        <div>
          <div class="muted" style="font-size:14px">${p.description}</div>
          <div class="detail-amount num">${brlAlways(p.amount)}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px">${statusBadge(p.status)}<span class="muted" style="font-size:14px">${methodLabel(p)} · ${dateTime(p.createdAt)}</span></div>
          ${p.refunded ? `<div class="muted num" style="font-size:14px;margin-top:8px">Estornado ${brlAlways(p.refunded)} · pode estornar mais ${brlAlways(refundable)}</div>` : ''}
        </div>
        <div class="detail-actions">
          ${p.status === 'PENDING' ? `<button class="btn btn-primary" data-action="toast" data-message="PIX confirmado (simulação)">${icon('check-check')}Simular confirmação do PIX</button><button class="btn btn-danger" data-action="toast" data-message="Pagamento cancelado">${icon('ban')}Cancelar</button>` : ''}
          ${canRefund ? `<button class="btn btn-secondary" data-action="refund" data-max="${refundable}">${icon('undo-2')}Estornar</button>` : ''}
          <button class="btn btn-soft" data-action="copy" data-copy="ID copiado">${icon('copy')}Copiar ID</button>
        </div>
      </div>
    </section>
    <div class="grid grid-main">
      <section class="card">
        <div class="card-header"><h2 class="section-title">Detalhes</h2></div>
        <div class="card-body"><dl class="dl">
          <dt>ID do pagamento</dt><dd><code class="num" style="font-size:13px">${p.id}</code></dd>
          <dt>Método</dt><dd>${icon(p.method === 'CARD' ? 'credit-card' : 'qr-code', 'icon-sm')}${methodLabel(p)}</dd>
          <dt>Referência do gateway</dt><dd><code style="font-size:13px">gw_ch_7f3a91c2e4b5d6a8</code></dd>
          <dt>Descrição</dt><dd>${p.description}</dd>
          <dt>Metadados</dt><dd>${metadata.length ? metadata.map(([k, v]) => `<span class="badge badge-neutral">${k}: ${v}</span>`).join(' ') : '<span class="muted">Nenhum</span>'}</dd>
          <dt>Atualizado em</dt><dd>${dateTime('2026-10-26T15:02:00Z')}</dd>
        </dl></div>
      </section>
      <section class="card">
        <div class="card-header"><h2 class="section-title">Linha do tempo</h2></div>
        <div class="card-body"><ol class="timeline">${timeline.map(([ic, title, at, tone]) => `
          <li><span class="dot ${tone}">${icon(ic)}</span><div><div class="timeline-title">${title}</div><div class="timeline-time">${dateTime(at)}</div></div></li>`).join('')}
        </ol></div>
      </section>
    </div>
  </div>`);
}

function newPaymentView() {
  const card = preview.method === 'CARD';
  const amount = 15990;
  const rate = card ? 0.0349 : 0.0099;
  return shell('nova-cobranca', `
  <div class="page">
    <div class="page-header"><div class="grow"><h1>Nova cobrança</h1><p class="page-subtitle">Crie um pagamento de teste no cartão ou com PIX</p></div></div>
    <div class="grid grid-main" style="align-items:start">
      <form class="card card-pad form" data-action="create">
        <div class="field">
          <label for="amount">Valor</label>
          <input class="input input-money num" id="amount" inputmode="numeric" value="${brlAlways(amount)}">
        </div>
        <div class="field">
          <span class="label" id="method-label">Forma de pagamento</span>
          <div class="segmented" role="group" aria-labelledby="method-label">
            <button type="button" data-action="method" data-method="CARD" aria-pressed="${card}">${icon('credit-card', 'icon-sm')}Cartão</button>
            <button type="button" data-action="method" data-method="PIX" aria-pressed="${!card}">${icon('qr-code', 'icon-sm')}PIX</button>
          </div>
        </div>
        ${card ? `
        <fieldset class="field" style="border:0;padding:0;margin:0">
          <legend class="label" style="margin-bottom:6px">Cartão de teste</legend>
          <div class="option-cards">
            <label class="option-card"><input type="radio" name="token" checked><span class="option-title">${icon('circle-check', 'icon-sm')}Aprovado</span><span class="option-desc">O gateway aprova na hora.</span><span class="option-code">tok_approved</span></label>
            <label class="option-card"><input type="radio" name="token"><span class="option-title">${icon('circle-x', 'icon-sm')}Recusado</span><span class="option-desc">O banco recusa a compra.</span><span class="option-code">tok_declined</span></label>
            <label class="option-card"><input type="radio" name="token"><span class="option-title">${icon('timer-off', 'icon-sm')}Sem resposta</span><span class="option-desc">O gateway não responde; nada é cobrado.</span><span class="option-code">tok_timeout</span></label>
          </div>
          <span class="help" style="margin-top:6px">Os dados do cartão nunca passam pelo PayFlow: a loja envia só o token.</span>
        </fieldset>` : `
        <div class="callout" style="background:var(--info-bg);color:var(--info)">${icon('info')}<span>Vamos gerar um QR Code e um código <strong>copia e cola</strong>. O pagamento fica <strong>Aguardando PIX</strong> até o cliente pagar.</span></div>`}
        <div class="field">
          <label for="desc">Descrição <span class="muted" style="font-weight:400">(opcional)</span></label>
          <input class="input" id="desc" value="Pedido #1044 — Moletom">
          <span class="help">Aparece na lista de pagamentos e no webhook.</span>
        </div>
        <div class="field">
          <label for="order">Número do pedido na sua loja <span class="muted" style="font-weight:400">(opcional)</span></label>
          <input class="input" id="order" value="1044">
        </div>
        <button class="btn btn-primary btn-lg" type="submit">${card ? `${icon('credit-card')}Cobrar ${brlAlways(amount)}` : `${icon('qr-code')}Gerar PIX de ${brlAlways(amount)}`}</button>
      </form>
      <aside class="card card-pad" aria-label="Resumo">
        <h2 class="section-title">Resumo</h2>
        <dl class="dl" style="margin-top:8px;grid-template-columns:1fr auto">
          <dt>Valor</dt><dd class="num" style="justify-content:flex-end">${brlAlways(amount)}</dd>
          <dt>Taxa ${card ? 'do cartão' : 'do PIX'} (${pct(rate)})</dt><dd class="num" style="justify-content:flex-end">− ${brlAlways(Math.round(amount * rate))}</dd>
          <dt><strong style="color:var(--text)">Você recebe</strong></dt><dd class="num" style="justify-content:flex-end"><strong>${brlAlways(amount - Math.round(amount * rate))}</strong></dd>
          <dt>Quando</dt><dd style="justify-content:flex-end">${card ? 'Em 30 dias (D+30)' : 'Na hora (D+0)'}</dd>
        </dl>
        <div class="callout" style="margin-top:16px">${icon('flask-conical')}<span>Ambiente de testes: nenhum valor real é cobrado.</span></div>
      </aside>
    </div>
  </div>`);
}

function pixCreatedView() {
  return shell('nova-cobranca', `
  <div class="page">
    <div class="page-header">
      <a class="back" href="#/nova-cobranca" aria-label="Voltar">${icon('arrow-left')}</a>
      <div class="grow"><h1>PIX gerado</h1><p class="page-subtitle">Mostre o QR Code ou envie o código para o seu cliente</p></div>
      ${statusBadge('PENDING')}
    </div>
    <section class="card card-pad">
      <div class="pix-box">
        <div style="text-align:center">${qrSvg()}<div class="subtle" style="font-size:12px;margin-top:6px">QR ilustrativo na prévia</div></div>
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div><div class="muted" style="font-size:14px">Pedido #1044 — Moletom</div><div class="detail-amount num">${brlAlways(15990)}</div></div>
          <div class="field"><span class="label">PIX copia e cola</span>
            <div class="copy-field"><code>00020126580014br.gov.bcb.pix01365333ef72-2380-4a2d-9a3d-a12b9f0c6e215204000053039865406159.905802BR5912PAYFLOW DEMO6008CURITIBA62070503***6304A1F3</code>
            <button class="btn btn-soft" data-action="copy" data-copy="Código PIX copiado">${icon('copy')}Copiar</button></div>
          </div>
          <ol class="steps"><li>O cliente abre o app do banco e escolhe pagar com PIX.</li><li>Escaneia o QR Code ou cola o código.</li><li>O status muda para <strong>PIX confirmado</strong> e sua loja recebe o webhook.</li></ol>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary" data-action="toast" data-message="PIX confirmado (simulação)">${icon('check-check')}Simular pagamento</button>
            <a class="btn btn-secondary" href="#/pagamentos/5a1c2b3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d">Ver pagamento</a>
          </div>
        </div>
      </div>
    </section>
  </div>`);
}

function accountView() {
  return shell('conta', `
  <div class="page">
    <div class="page-header"><div class="grow"><h1>Conta</h1><p class="page-subtitle">Dados da sua loja</p></div></div>
    <section class="card card-pad">
      <form class="form" data-action="save-profile" style="max-width:560px">
        <div class="field"><label for="acc-name">Nome da loja</label><input class="input" id="acc-name" value="${merchant.name}"></div>
        <div class="field"><label for="acc-email">E-mail</label><input class="input" id="acc-email" type="email" value="${merchant.email}"></div>
        <div class="field">
          <label for="acc-doc">CNPJ</label>
          <div class="input-group"><input class="input" id="acc-doc" readonly value="${cnpj(merchant.document)}" aria-describedby="acc-doc-help"><span class="icon-btn" aria-hidden="true">${icon('lock', 'icon-sm')}</span></div>
          <span class="help" id="acc-doc-help">O documento não pode ser alterado. Fale com o suporte se precisar.</span>
        </div>
        <div class="field"><span class="label">Situação</span><span>${statusBadge('AUTHORIZED').replace('Aprovado', 'Ativa')}</span></div>
        <div><button class="btn btn-primary" type="submit">Salvar alterações</button></div>
      </form>
    </section>
  </div>`);
}

function integrationView() {
  const configured = preview.webhookConfigured;
  return shell('integracao', `
  <div class="page">
    <div class="page-header"><div class="grow"><h1>Integração</h1><p class="page-subtitle">Webhook e chave de acesso da sua loja</p></div>
      <a class="btn btn-secondary" href="#/integracao">${icon('file-code-2')}Documentação da API</a></div>

    <section class="card card-pad" aria-labelledby="webhook-title">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div><h2 class="section-title" id="webhook-title">Webhook</h2><p class="muted" style="font-size:14px">Enviamos um POST assinado (HMAC-SHA256) para esta URL a cada evento escolhido.</p></div>
        ${configured ? '<span class="badge badge-success"><i data-lucide="check"></i>Ativo</span>' : '<span class="badge badge-neutral"><i data-lucide="circle-dashed"></i>Não configurado</span>'}
      </div>
      <form class="form" data-action="save-webhook" style="margin-top:18px">
        <div class="field"><label for="wh-url">URL que recebe os avisos</label><input class="input" id="wh-url" type="url" placeholder="https://sua-loja.com.br/webhooks/payflow" value="${configured ? 'https://lojaexemplo.com.br/webhooks/payflow' : ''}"><span class="help">Use HTTPS. Sua loja deve responder 2xx; se falhar, tentamos de novo até 5 vezes.</span></div>
        <fieldset class="field" style="border:0;padding:0;margin:0">
          <legend class="label" style="margin-bottom:8px">Eventos</legend>
          <div class="check-grid">${EVENTS.map(([event, label], index) => `<label class="check"><input type="checkbox" ${index !== 1 ? 'checked' : ''}><span>${label} <span class="option-code">${event}</span></span></label>`).join('')}</div>
        </fieldset>
        <div class="field"><span class="label">Segredo da assinatura</span>
          ${configured ? `<div class="copy-field"><code>whsec_••••••••••••••••••••••••c9a1</code><button type="button" class="btn btn-soft" data-action="copy" data-copy="Segredo copiado">${icon('copy')}Copiar</button></div>` : '<span class="help">Geramos um segredo ao salvar. Use para conferir o cabeçalho X-PayFlow-Signature.</span>'}
        </div>
        <div style="display:flex;gap:8px"><button class="btn btn-primary" type="submit">Salvar webhook</button>${configured ? `<button type="button" class="btn btn-secondary" data-action="toast" data-message="Evento de teste enviado">${icon('send')}Enviar evento de teste</button>` : ''}</div>
      </form>
    </section>

    <section class="card card-pad" aria-labelledby="key-title">
      <h2 class="section-title" id="key-title">Chave de acesso</h2>
      <p class="muted" style="font-size:14px">Usada para entrar no portal e pela sua loja para criar cobranças. Guardamos só uma versão protegida dela.</p>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:16px">
        <div class="copy-field" style="flex:1;min-width:240px"><code>pf_••••••••••••••••••••••••••••4c25</code></div>
        <button class="btn btn-danger" data-action="rotate">${icon('refresh-ccw')}Gerar nova chave</button>
      </div>
    </section>
  </div>`);
}

function bannerArt() {
  return `<svg class="banner-art" viewBox="0 0 140 96" aria-hidden="true">
    <circle cx="112" cy="20" r="56" fill="rgb(255 255 255 / 10%)"/>
    <rect x="44" y="18" width="70" height="60" rx="10" fill="#fff"/>
    <rect x="54" y="30" width="34" height="6" rx="3" fill="#cdeedf"/>
    <rect x="54" y="42" width="50" height="6" rx="3" fill="#e7f6ef"/>
    <circle cx="98" cy="64" r="12" fill="#12a26a"/>
    <path d="M92 64l4 4 8-8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// QR "de mentira", determinístico, só para a prévia (o app real usa uma biblioteca de QR Code).
function qrSvg() {
  const size = 29;
  let seed = 7;
  const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#1d2329"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#1d2329"/>`;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
  let cells = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inFinder(x, y) && random() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  return `<svg class="qr" viewBox="-1 -1 ${size + 2} ${size + 2}" role="img" aria-label="QR Code do PIX" shape-rendering="crispEdges"><g fill="#1d2329">${cells}</g>${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}</svg>`;
}

// ---------------------------------------------------------------- modais e toasts
function toast(message) {
  const region = document.querySelector('.toast-region');
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `${icon('circle-check')}${message}`;
  region.append(node);
  lucide.createIcons();
  setTimeout(() => node.remove(), 4000);
}

function modal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">${html}</div></div>`;
  lucide.createIcons();
  root.querySelector('.modal input, .modal button')?.focus();
}

function refundModal(max) {
  modal(`
    <h2 id="modal-title">Estornar pagamento</h2>
    <p class="muted" style="font-size:14px">O valor volta para o cliente. O estorno não pode ser desfeito.</p>
    <div class="field"><label for="refund-amount">Valor do estorno</label><input class="input input-money num" id="refund-amount" value="${brlAlways(max)}"><span class="help">Pode estornar até ${brlAlways(max)}.</span></div>
    <div class="field"><label for="refund-reason">Motivo <span class="muted" style="font-weight:400">(opcional)</span></label><input class="input" id="refund-reason" placeholder="Ex.: produto com avaria"></div>
    <div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Voltar</button><button class="btn btn-primary" data-action="confirm-refund">Estornar ${brlAlways(max)}</button></div>`);
}

function rotateModal() {
  modal(`
    <h2 id="modal-title">Gerar nova chave?</h2>
    <p class="muted" style="font-size:14px">A chave atual <strong>para de funcionar na hora</strong>: o portal e a integração da sua loja vão precisar da nova chave.</p>
    <div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Cancelar</button><button class="btn btn-danger-solid" data-action="confirm-rotate">Gerar nova chave</button></div>`);
}

function newKeyModal() {
  modal(`
    <span class="success-icon">${icon('key-round')}</span>
    <h2 id="modal-title">Sua nova chave</h2>
    <div class="copy-field"><code>pf_3c81d0a95b7e4f26a1d8c0e9b7f5a3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6</code><button class="btn btn-soft" data-action="copy" data-copy="Chave copiada">${icon('copy')}Copiar</button></div>
    <div class="callout">${icon('triangle-alert')}<span><strong>Guarde agora.</strong> Ela não aparece de novo.</span></div>
    <div class="modal-actions"><button class="btn btn-primary" data-action="close-modal">Já guardei</button></div>`);
}

// ---------------------------------------------------------------- painel da prévia
function previewPanel() {
  const toggle = (key, label) => `<label class="check"><input type="checkbox" data-preview="${key}" ${preview[key] ? 'checked' : ''}>${label}</label>`;
  return `<div class="preview-panel">
    ${preview.menuOpen ? `<div class="preview-menu">
      <span class="label">Telas</span>
      <a href="#/entrar">Entrar</a><a href="#/criar-conta">Criar conta (com erro)</a><a href="#/conta-criada">Conta criada</a>
      <a href="#/inicio">Início (painel)</a><a href="#/pagamentos">Pagamentos</a><a href="#/pagamentos/${payments[0].id}">Detalhe com estorno</a>
      <a href="#/nova-cobranca">Nova cobrança</a><a href="#/pix-gerado">PIX gerado</a><a href="#/conta">Conta</a><a href="#/integracao">Integração</a>
      <span class="label">Estados</span>
      ${toggle('warnings', 'Painel com aviso (taxas)')}${toggle('webhookConfigured', 'Webhook configurado')}${toggle('emptyList', 'Lista vazia')}${toggle('loading', 'Painel carregando')}${toggle('hideValues', 'Valores ocultos')}
    </div>` : ''}
    <button class="preview-toggle" data-action="toggle-preview" aria-expanded="${preview.menuOpen}">${icon('layout-template', 'icon-sm')}Prévia: telas e estados</button>
  </div>`;
}

// ---------------------------------------------------------------- roteamento
const routes = {
  entrar: loginView,
  'criar-conta': signupView,
  'conta-criada': signupDoneView,
  inicio: dashboardView,
  pagamentos: paymentsView,
  'nova-cobranca': newPaymentView,
  'pix-gerado': pixCreatedView,
  conta: accountView,
  integracao: integrationView,
};

function render() {
  const [, route = 'inicio', param] = location.hash.split('/');
  const view = route === 'pagamentos' && param ? () => paymentDetailView(param) : routes[route] ?? dashboardView;
  document.getElementById('app').innerHTML = view() + previewPanel();
  document.body.classList.remove('nav-open');
  lucide.createIcons();
}

function rerenderKeepingScroll() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
  document.getElementById('main')?.focus({ preventScroll: true });
});

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action], [data-method], tr[data-href]');
  if (!target) return;
  if (target.matches('tr[data-href]')) {
    location.hash = target.dataset.href;
    return;
  }
  if (target.dataset.method && !target.dataset.action) {
    preview.method = target.dataset.method;
    return;
  }
  const action = target.dataset.action;
  if (action === 'close-modal' && event.target !== target && target.classList.contains('modal-backdrop')) return;
  switch (action) {
    case 'toggle-nav': document.body.classList.toggle('nav-open'); break;
    case 'toggle-values': preview.hideValues = !preview.hideValues; rerenderKeepingScroll(); break;
    case 'toggle-preview': preview.menuOpen = !preview.menuOpen; rerenderKeepingScroll(); break;
    case 'method': preview.method = target.dataset.method; rerenderKeepingScroll(); break;
    case 'toggle-secret': {
      const input = document.getElementById(target.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      target.setAttribute('aria-label', input.type === 'password' ? 'Mostrar chave' : 'Ocultar chave');
      break;
    }
    case 'copy': toast(target.dataset.copy); break;
    case 'toast': toast(target.dataset.message); break;
    case 'refresh': toast('Painel atualizado'); break;
    case 'refund': refundModal(Number(target.dataset.max)); break;
    case 'confirm-refund': document.getElementById('modal-root').innerHTML = ''; toast('Estorno registrado'); break;
    case 'rotate': rotateModal(); break;
    case 'confirm-rotate': newKeyModal(); break;
    case 'close-modal': document.getElementById('modal-root').innerHTML = ''; break;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.getElementById('modal-root').innerHTML = '';
  if (event.key === 'Enter' && event.target.matches('tr[data-href]')) location.hash = event.target.dataset.href;
});

document.addEventListener('change', (event) => {
  const key = event.target.dataset.preview;
  if (key) {
    preview[key] = event.target.checked;
    rerenderKeepingScroll();
  }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const action = event.target.dataset.action;
  if (action === 'login') location.hash = '#/inicio';
  if (action === 'signup') location.hash = '#/conta-criada';
  if (action === 'create') location.hash = preview.method === 'PIX' ? '#/pix-gerado' : `#/pagamentos/${payments[3].id}`;
  if (action === 'save-profile') toast('Dados salvos');
  if (action === 'save-webhook') { preview.webhookConfigured = true; rerenderKeepingScroll(); toast('Webhook salvo'); }
});

render();
