// Testes de arquitetura (npm run test:architecture): os limites entre apps, pacotes e fatias.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'apps-are-independent',
      comment: 'Um app nunca importa código de outro: o Shell só conhece os remotes pelo Module Federation (mfe_payments/..., mfe_account/...).',
      severity: 'error',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^apps/([^/]+)/', pathNot: '^apps/$1/' },
    },
    {
      name: 'packages-do-not-import-apps',
      comment: 'Os pacotes compartilhados não dependem de nenhum app.',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'ui-does-not-call-the-bff',
      comment: '@payflow/ui é só visual: quem fala com o BFF são as telas, via @payflow/api-client.',
      severity: 'error',
      from: { path: '^packages/ui/' },
      to: { path: '^packages/api-client/' },
    },
    {
      name: 'api-client-has-no-react',
      comment: 'O cliente HTTP não depende de React nem de componentes.',
      severity: 'error',
      from: { path: '^packages/api-client/' },
      to: { path: '(^packages/ui/|node_modules/react)' },
    },
    {
      name: 'feature-slices-are-independent',
      comment: 'Vertical slice: uma funcionalidade não importa outra; o que é comum fica em shared/ (remotes) ou layout/ e session/ (Shell).',
      severity: 'error',
      from: { path: '^apps/[^/]+/src/features/([^/]+)/' },
      to: { path: '^apps/[^/]+/src/features/([^/]+)/', pathNot: '^apps/[^/]+/src/features/$1/' },
    },
    {
      name: 'shared-does-not-know-features',
      comment: 'shared/, layout/ e session/ servem às fatias e não dependem delas.',
      severity: 'error',
      from: { path: '^apps/[^/]+/src/(shared|layout|session)/' },
      to: { path: '^apps/[^/]+/src/features/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      comment: 'Todo import resolve, menos os módulos remotos, que só existem em tempo de execução.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true, pathNot: '^mfe_(payments|account)/' },
    },
    {
      name: 'src-does-not-import-tests',
      severity: 'error',
      from: { path: '/src/' },
      to: { path: '/test/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|coverage)/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'],
      mainFields: ['module', 'main', 'types'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
