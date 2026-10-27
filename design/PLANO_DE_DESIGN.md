# PayFlow — Plano de design do portal do lojista

Referência visual: **portal da Stone** (layout com barra lateral, fundo cinza claro,
cartões brancos arredondados, verde como cor de marca, atalhos em círculo).
Regras de produto: skill **ui-ux-pro-max** para fintech (estilo _data-dense dashboard_,
confiança, contraste AA, números tabulares, ícones SVG).

Prévia navegável: [`design/preview/index.html`](preview/index.html) (abre direto no navegador).

## 1. Direção

| Decisão | Escolha | Por quê |
|---|---|---|
| Estilo | Painel claro e limpo, cartões brancos sobre fundo cinza, pouca sombra | Igual à Stone: leitura rápida de valores, sensação de banco confiável |
| Cor de marca | Verde (`#0B8457` em botões, `#12A26A` em destaques) | Verde = dinheiro entrando; o verde da Stone (`#00A868`) com texto branco dá 3,09:1 e não passa no AA, então botões usam um tom mais escuro |
| Tipografia | **Plus Jakarta Sans** (Google Fonts) | Indicada pela skill para fintech/SaaS amigável; arredondada como a fonte da Stone; tem algarismos tabulares |
| Ícones | **Lucide**, contorno 1,75 px, 20 px | Mesmo estilo de linha dos ícones da Stone; nunca emoji |
| Densidade | Média: valores grandes nos destaques, tabelas compactas | O lojista confere números; o painel cabe numa tela de notebook |
| Tom de texto | Português simples, segunda pessoa ("seus pagamentos") | Mesmo tom da Stone ("Novidades pra você") |

## 2. Tokens

### Cores

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--brand-500` | `#12A26A` | Marca, ícones ativos, gráficos | — |
| `--brand-600` | `#0B8457` | Botão primário, banner com texto | branco 4,72:1 |
| `--brand-700` | `#08744C` | Hover do botão primário | branco 5,81:1 |
| `--brand-text` | `#0B7A50` | Texto verde (nav ativo, links) | sobre `--brand-50` 4,81:1 |
| `--brand-50` | `#E7F6EF` | Fundo do item ativo, chips de sucesso | — |
| `--bg` | `#F4F5F7` | Fundo da área de conteúdo | — |
| `--surface` | `#FFFFFF` | Cartões, barra lateral, topo | — |
| `--border` | `#E4E7EB` | Bordas e divisórias | — |
| `--text` | `#1D2329` | Texto principal | 15,85:1 |
| `--text-muted` | `#5B6470` | Texto secundário | 6,00:1 |
| `--warning` / `--warning-bg` | `#9A5B00` / `#FFF4E0` | Avisos, PENDING | 4,98:1 |
| `--danger` / `--danger-bg` | `#B42318` / `#FDECEA` | Recusado, ações irreversíveis | 5,75:1 |
| `--info` / `--info-bg` | `#1F5BC6` / `#EAF1FD` | Estorno parcial, selo "Novo" | 5,49:1 |
| `--neutral` / `--neutral-bg` | `#4B5563` / `#EEF0F3` | Cancelado, estornado | 6,62:1 |

### Tipografia (Plus Jakarta Sans)

| Papel | Tamanho / peso | Uso |
|---|---|---|
| Display | 32 / 700 | Valor principal (saldo, valor do pagamento) |
| Título da página | 22 / 700 | "Pagamentos", "Conta" |
| Título de seção | 17 / 600 | "Últimos pagamentos" |
| Corpo | 15 / 400, altura 1,5 | Textos e tabelas |
| Rótulo | 13 / 500 | Rótulos de campo, cabeçalho de tabela |
| Legenda | 12 / 500 | Selos, datas secundárias (nunca texto essencial abaixo de 12) |

Valores em reais sempre com `font-variant-numeric: tabular-nums`, formato
`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` e alinhados à direita nas tabelas.

### Espaço, raio, sombra, movimento

- Espaçamento em múltiplos de 4: 4, 8, 12, 16, 24, 32, 48.
- Raio: 8 (campos, botões), 12 (cartões pequenos), 16 (cartões e banners), 999 (selos e atalhos).
- Sombra: só `0 1px 2px rgb(16 24 40 / 6%)` nos cartões; modais com `0 12px 32px rgb(16 24 40 / 18%)`.
- Movimento: 150–200 ms, `ease-out`; respeitar `prefers-reduced-motion`.

## 3. Estrutura de tela (Shell)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ payflow   [Ambiente de testes]                     Loja Exemplo  (LE)    │ topo 56 px
├───────────────┬──────────────────────────────────────────────────────────┤
│ Loja Exemplo ▾│  ← Título da página                          [Ação]       │
│ 11.222.333/…  │                                                          │
│ Volume do mês │  cartões brancos, largura máx. 1040 px, centralizados     │
│ R$ 1.250,00 👁│                                                          │
│ (Cartão)(PIX) │                                                          │
│ (Webhook)     │                                                          │
│ ⌂ Início      │                                                          │
│ ▤ Pagamentos  │                                                          │
│ ⊕ Nova cobrança                                                          │
│ ☺ Conta       │                                                          │
│ ⚙ Integração  │                                                          │
│ ⇥ Sair        │                                                          │
└───────────────┴──────────────────────────────────────────────────────────┘
```

- Barra lateral de 256 px com o lojista e o documento, o **volume aprovado do mês com botão de
  ocultar valores** e três atalhos em círculo (como Transferir/Pagar/Pix na Stone).
- Item ativo: fundo `--brand-50`, texto `--brand-text` e barra lateral verde de 3 px.
- Abaixo de 1024 px a barra lateral vira gaveta aberta por um botão de menu no topo.
- O selo **Ambiente de testes** fica sempre visível: nenhum valor real é cobrado.

## 4. Telas por microfrontend

| App | Tela | Dados (BFF) | Destaques |
|---|---|---|---|
| Shell | Entrar | `GET /merchants/me` | Campo da chave com mostrar/ocultar; erro "Chave inválida" junto do campo |
| Shell | Criar conta | `POST /merchants` | Máscara de CPF/CNPJ; a chave aparece **uma vez**, com botão copiar e aviso |
| mfe-payments | Início (painel) | `GET /aggregated-data` | 4 indicadores, volume por método com taxa e prazo, status, últimos 5, atalhos, avisos |
| mfe-payments | Pagamentos | `GET /payments` | Filtros de status, método e período; tabela com selo de status; paginação |
| mfe-payments | Detalhe | `GET /payments/{id}` | Valor grande, linha do tempo, estornos, ações conforme o status |
| mfe-payments | Nova cobrança | `POST /payments` | Valor com máscara, Cartão ou PIX, cartões de teste explicados, resumo com taxa |
| mfe-payments | PIX gerado | resposta do `POST` | QR Code, "copia e cola" com copiar, "Simular pagamento" (`/pix-confirmation`) |
| mfe-account | Conta | `GET/PUT /merchants/me` | Nome e e-mail editáveis; documento só leitura |
| mfe-account | Integração | `PUT /merchants/me/webhook`, `POST /merchants/me/api-key` | URL, eventos, segredo com copiar; troca de chave com confirmação |

### Painel (`/aggregated-data`)

1. Saudação + horário de `generatedAt` + botão **Atualizar**.
2. Aviso âmbar quando `warnings` não está vazio, dizendo o que faltou (ex.: taxas) e que o resto está certo.
3. Banner verde "Configure seu webhook" enquanto `merchant.webhookConfigured` for falso.
4. Indicadores: **Volume aprovado**, **Taxas estimadas**, **Você recebe** e **Pagamentos**.
5. **Volume por método**: barras horizontais com rótulo direto (valor, % do total, taxa e prazo
   D+30/D+0). A skill desaconselha pizza; com 2 categorias, barras são mais precisas.
6. **Pagamentos por status**: lista com bolinha, nome e quantidade.
7. **Últimos pagamentos** (5) com link "Ver todos".
8. **Acesso rápido** em círculos, como na Stone: Cobrar no cartão, Cobrar com PIX, Webhook,
   Trocar chave, Documentação da API.

### Status do pagamento

Sempre cor + texto + ícone (nunca só cor):

| Status | Selo | Ícone |
|---|---|---|
| `AUTHORIZED` | Aprovado (verde) | check |
| `CONFIRMED` | PIX confirmado (verde) | check-check |
| `PENDING` | Aguardando PIX (âmbar) | clock |
| `DECLINED` | Recusado (vermelho) | x |
| `CANCELED` | Cancelado (cinza) | ban |
| `PARTIALLY_REFUNDED` | Estorno parcial (azul) | undo-2 |
| `REFUNDED` | Estornado (cinza) | undo-2 |

## 5. Componentes (`packages/ui`)

`AppShell`, `Sidebar`, `NavItem`, `QuickAction` (círculo com ícone e rótulo), `Topbar`,
`Card`, `KpiCard`, `Banner` (verde, âmbar), `Button` (primário, secundário, fantasma, perigo;
estado carregando), `IconButton` (com `aria-label`), `Field` (rótulo visível, ajuda e erro abaixo),
`MoneyInput`, `DocumentInput`, `SegmentedControl`, `Select`, `Checkbox`, `StatusBadge`,
`NewBadge`, `CopyField` (copiar com aviso "Copiado"), `SecretField` (mostrar/ocultar),
`DataTable` (linha clicável, valores à direita), `Pagination`, `Timeline`, `EmptyState`,
`Skeleton`, `Toast` (`aria-live="polite"`, some em 4 s), `ConfirmDialog`, `MethodBars`.

## 6. Estados de cada tela

- **Carregando**: esqueletos no formato do conteúdo (nada de tela branca).
- **Vazio**: frase do que fazer + ação ("Você ainda não recebeu pagamentos. Criar cobrança").
- **Erro do BFF**: mensagem com o motivo e **Tentar de novo**; 401 volta para "Entrar".
- **Sucesso**: toast curto ("Estorno de R$ 25,00 registrado").
- **Ações irreversíveis** (estorno, trocar chave, cancelar): confirmação com o efeito escrito.

## 7. Acessibilidade (mínimo)

Contraste AA em todos os pares acima · foco visível de 2 px verde · navegação completa
por teclado · rótulos visíveis em todos os campos · `aria-label` em botões só com ícone ·
selos de status com texto · alvos de 40 px ou mais · `prefers-reduced-motion` ·
tabelas com cabeçalho `<th scope>` · mudanças de rota levam o foco ao título.

## 8. Em aberto para ajustar na prévia

- Tom de verde (mais próximo da Stone ou mais escuro).
- Barra lateral fixa ou recolhível no desktop.
- Itens da barra lateral (hoje: Início, Pagamentos, Nova cobrança, Conta, Integração).
- Modo escuro (os tokens já permitem; fica para depois da versão clara).
