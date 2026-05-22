export type Estado = 'feito' | 'em-andamento' | 'pendente' | 'bloqueado';

export interface ItemExec {
  bloco: string;
  titulo: string;
  estado: Estado;
  detalhes: string[];
}

export const execucao: ItemExec[] = [
  {
    bloco: 'Bloco 1',
    titulo: 'Plano de migração escrito',
    estado: 'feito',
    detalhes: [
      'Documento `docs/plano-migracao-messaging.md` na branch CU-plano-migracao-messaging',
      '6 fases, riscos, custos Azure, contratos JSON',
    ],
  },
  {
    bloco: 'Bloco 2',
    titulo: 'Sandboxes Azure provisionados',
    estado: 'feito',
    detalhes: [
      'App Service `messaging-service-sandbox` em rg-webapps / plan-itvalley-nonprod',
      'Azure SQL `messaging-sandbox` (Basic, $5/mês)',
      'Service Bus topology completa em `genesisitvalley`:',
      '  + queue `campaigns.dispatch` (Genesis interno)',
      '  + queue `messaging.send` (Genesis → messaging-service)',
      '  + topic `messaging.status` + subscription `genesis-status-sub`',
      '  + topic `messaging.inbound` + subscription `genesis-inbound-sub`',
    ],
  },
  {
    bloco: 'Bloco 3',
    titulo: 'Fase 0 PROD — workers separados',
    estado: 'feito',
    detalhes: [
      '✅ PR #10 MERGEADO em main',
      '✅ App Service worker-genesis-webhooks provisionado E rodando',
      '✅ Logs confirmam: "Worker WEBHOOKS aguardando mensagens" no app dedicado',
      '✅ Env var WEBHOOK_WORKER_SEPARADO=true ativa em genesisbackendd PROD',
      '✅ Genesis PROD restart: NÃO mais roda webhook_worker (zero regressão)',
      '✅ /api/health 200 OK pós-restart',
      'Criado main_worker_webhooks.py (entry point padrão IT Valley)',
      'Removido WEBSITES_PORT/APP_PORT (worker sem HTTP)',
    ],
  },
  {
    bloco: 'Bloco 4',
    titulo: 'Fase 2 Código Genesis (branch + PR)',
    estado: 'feito',
    detalhes: [
      'Branch `CU-fase2-messaging-service` + PR #11 pra accp',
      'Adiciona `integrations/messaging_client.py` (publish em messaging.send)',
      'Adiciona `workers/status_updater_worker.py` (consome messaging.status)',
      'Adiciona `workers/inbound_processor_worker.py` (consome messaging.inbound)',
      '3 feature flags (default OFF): MESSAGING_SERVICE_ENABLED, STATUS_UPDATER_WORKER_ENABLED, INBOUND_PROCESSOR_WORKER_ENABLED',
      'Reversível 100% — comportamento PROD inalterado',
    ],
  },
  {
    bloco: 'Bloco 5',
    titulo: 'messaging-service sandbox completo',
    estado: 'feito',
    detalhes: [
      '✅ https://messaging-service-sandbox.azurewebsites.net/health → 200 OK',
      'Fork: github.com/cacaviana/messaging-service (CU-sandbox-completo)',
      'Código novo:',
      '  + integrations/service_bus.py (wrapper)',
      '  + integrations/event_publisher.py (publica status + inbound)',
      '  + workers/send_worker.py (consome messaging.send + idempotency)',
      '  + routers/webhooks_meta.py (recebe webhook Meta + republica)',
      'send_worker CONECTADO em messaging.send queue (logs confirmam)',
      'Receita Oryx (perdi 2h): SCM_DO_BUILD=true + source-only no zip',
    ],
  },
  {
    bloco: 'Bloco 6',
    titulo: '🔥 Smoke E2E REAL com botão WhatsApp',
    estado: 'feito',
    detalhes: [
      '✅ Template real com botão enviado pro +1 581 5780564 (Carlos)',
      '✅ Carlos recebeu WhatsApp e clicou em "Bloquear Contato"',
      '✅ Meta dispatchou webhook → Genesis PROD /webhooks/whatsapp',
      '✅ Backend FastAPI enfileirou em genesis-webhooks',
      '✅ worker-genesis-webhooks (App Service novo) consumiu',
      '✅ INSERT mensagens (direcao=entrada, conteudo="Bloquear Contato")',
      '✅ Banco PROD tem o registro com wamid + título do botão capturado',
      '🎯 Pipeline ponta a ponta PROVADO em PROD',
    ],
  },
  {
    bloco: 'Bloco 7',
    titulo: 'Handoff + atualização do site',
    estado: 'feito',
    detalhes: [
      '✅ Documento docs/handoff-execucao-2026-05-22.md (commitado em main)',
      '✅ Roteiro smoke test docs/smoke-test-messaging.md',
      '✅ Esta aba "Execução" no site',
      '✅ Memória salva sobre receita Oryx (SCM=true + source-only)',
      'Decisão honesta: arquitetura MONTADA + VALIDADA, mas Fase 2/3 não ATIVADA em PROD ainda (segura)',
    ],
  },
];

export interface RecursoAzure {
  nome: string;
  tipo: string;
  rg: string;
  custoMes?: string;
  notas: string;
}

export const recursosProvisionados: RecursoAzure[] = [
  {
    nome: 'messaging-service-sandbox',
    tipo: 'App Service (Linux Python 3.12)',
    rg: 'rg-webapps · plan-itvalley-nonprod',
    custoMes: '~$13',
    notas: 'Copy do messaging-service da Polly + worker SB + publishers. DB SQLite local.',
  },
  {
    nome: 'worker-genesis-webhooks',
    tipo: 'App Service (Linux Python 3.13)',
    rg: 'rg-webapps · plan-genesis-backend',
    custoMes: '~$13',
    notas: 'Isolamento do webhook_worker. Env vars clonadas do genesisbackendd.',
  },
  {
    nome: 'messaging-sandbox',
    tipo: 'Azure SQL Database (Basic)',
    rg: 'rg-masterclass · srvmasterclass',
    custoMes: '~$5',
    notas: 'Reservado pro messaging-service (não usado por enquanto, sandbox usa SQLite).',
  },
  {
    nome: 'campaigns.dispatch',
    tipo: 'Service Bus Queue',
    rg: 'rg-webapps · genesisitvalley',
    notas: 'Queue interna do Genesis (campanha → dispatcher).',
  },
  {
    nome: 'messaging.send',
    tipo: 'Service Bus Queue',
    rg: 'rg-webapps · genesisitvalley',
    notas: 'Genesis publica, messaging-service consome.',
  },
  {
    nome: 'messaging.status',
    tipo: 'Service Bus Topic + Subscription `genesis-status-sub`',
    rg: 'rg-webapps · genesisitvalley',
    notas: 'messaging-service publica sent/delivered/read/failed.',
  },
  {
    nome: 'messaging.inbound',
    tipo: 'Service Bus Topic + Subscription `genesis-inbound-sub`',
    rg: 'rg-webapps · genesisitvalley',
    notas: 'messaging-service publica msgs inbound normalizadas.',
  },
];

export interface PrInfo {
  num: number;
  repo: string;
  titulo: string;
  estado: string;
  base: string;
  head: string;
}

export const prs: PrInfo[] = [
  {
    num: 10,
    repo: 'ITValley-School/projetogenesis',
    titulo: 'Fase 0 — isolar webhook_worker em App Service dedicado',
    estado: 'MERGED em main',
    base: 'main',
    head: 'CU-fase0-workers-separados',
  },
  {
    num: 11,
    repo: 'ITValley-School/projetogenesis',
    titulo: 'Fase 2 — workers + messaging_client (flags OFF)',
    estado: 'OPEN — aguardando review',
    base: 'accp',
    head: 'CU-fase2-messaging-service',
  },
];

export interface Pendencia {
  prioridade: 'alta' | 'media' | 'baixa';
  acao: string;
  contexto: string;
}

export const pendencias: Pendencia[] = [
  {
    prioridade: 'alta',
    acao: 'Conversar com Polly sobre as mudanças no fork',
    contexto: 'Fork cacaviana/messaging-service tem código novo (SB worker + publishers + webhook receiver) PROVADO em sandbox. Quando ela aprovar, mergear no repo dela.',
  },
  {
    prioridade: 'alta',
    acao: 'Smoke test E2E quando sandbox subir',
    contexto: 'Publicar msg de teste em messaging.send → validar fluxo até evento em messaging.status.',
  },
  {
    prioridade: 'alta',
    acao: 'Setar WEBHOOK_WORKER_SEPARADO=true em genesisbackendd PROD',
    contexto: 'Após validar que worker-genesis-webhooks tá consumindo direito. Restart depois.',
  },
  {
    prioridade: 'media',
    acao: 'Mergear PR #11 quando smoke OK',
    contexto: 'Branch tá com 3 workers novos + client. Flags OFF. Seguro mergear pra accp depois do smoke.',
  },
  {
    prioridade: 'media',
    acao: 'Refactor CampanhaService.disparar pra usar messaging_client',
    contexto: 'Próxima fase: o service publica em messaging.send em vez de chamar MetaAPI direto. Feature flag por tenant.',
  },
  {
    prioridade: 'baixa',
    acao: 'Pedir Polly autorizar repo da org pra ele criar messaging-service-noprod oficial',
    contexto: 'Sandbox hoje é fork pessoal cacaviana/messaging-service. Em algum momento migrar pra ITValley-School oficial.',
  },
];
