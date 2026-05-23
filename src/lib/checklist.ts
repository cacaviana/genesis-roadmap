export type EstadoItem = 'feito' | 'parcial' | 'falta';

export interface ItemChecklist {
  area: string;
  item: string;
  estado: EstadoItem;
  detalhe: string;
  bloqueador?: string;
}

export const checklist: ItemChecklist[] = [
  // ============================================================
  // INFRA AZURE
  // ============================================================
  {
    area: 'Infra Azure',
    item: 'App Service worker-genesis-webhooks',
    estado: 'feito',
    detalhe: 'Criado e rodando. Consome genesis-webhooks.',
  },
  {
    area: 'Infra Azure',
    item: 'App Service messaging-service-sandbox',
    estado: 'feito',
    detalhe: 'Rodando em mode production com tokens reais do WABA Itvalley School.',
  },
  {
    area: 'Infra Azure',
    item: 'Azure SQL messaging-sandbox',
    estado: 'feito',
    detalhe: 'DB reservado (sandbox usa SQLite por ora).',
  },
  {
    area: 'Infra Azure',
    item: 'CAMPANHA_WORKER_SEPARADO=true em PROD',
    estado: 'feito',
    detalhe: 'Backend não roda campanha_worker mais (delegado pro App Service dedicado).',
  },
  {
    area: 'Infra Azure',
    item: 'WEBHOOK_WORKER_SEPARADO=true em PROD',
    estado: 'feito',
    detalhe: 'Backend não roda webhook_worker mais.',
  },

  // ============================================================
  // SERVICE BUS
  // ============================================================
  {
    area: 'Service Bus',
    item: 'Queue campaigns.dispatch',
    estado: 'parcial',
    detalhe: 'Criada mas VAZIA. Campanha vai via genesis-campanhas legacy.',
    bloqueador: 'Refactor pendente — campanha_worker pode publicar em campaigns.dispatch (interno) e o dispatcher publicar em messaging.send',
  },
  {
    area: 'Service Bus',
    item: 'Queue messaging.send',
    estado: 'feito',
    detalhe: 'EM USO PROD. Smoke validou.',
  },
  {
    area: 'Service Bus',
    item: 'Topic messaging.status + subscription genesis-status-sub',
    estado: 'feito',
    detalhe: 'EM USO PROD. Smoke "delivered" validou em 00:50 UTC.',
  },
  {
    area: 'Service Bus',
    item: 'Topic messaging.inbound + subscription genesis-inbound-sub',
    estado: 'feito',
    detalhe: '✅ EM USO. Webhook Meta apontado pro messaging-service. Smoke validou POST → SB topic → Genesis worker consumindo.',
  },

  // ============================================================
  // GENESIS CÓDIGO (PROD)
  // ============================================================
  {
    area: 'Genesis Code',
    item: 'Workers Fase 2 em PROD (status + inbound)',
    estado: 'feito',
    detalhe: 'genesisbackendd com 2 workers rodando.',
  },
  {
    area: 'Genesis Code',
    item: 'CampanhaService.disparar com feature flag',
    estado: 'feito',
    detalhe: 'MESSAGING_SERVICE_ENABLED=true em PROD: publica em messaging.send.',
  },
  {
    area: 'Genesis Code',
    item: 'messaging_client.py (publisher)',
    estado: 'feito',
    detalhe: 'integrations/messaging_client.py.',
  },
  {
    area: 'Genesis Code',
    item: 'Worker Dispatcher dedicado (substituir campanha_worker)',
    estado: 'falta',
    detalhe: 'Hoje campanha_worker chama disparar com if/else (flag). Padrão IT Valley quer um Dispatcher separado consumindo campaigns.dispatch.',
    bloqueador: 'Refactor médio. Pode ficar pra depois.',
  },
  {
    area: 'Genesis Code',
    item: 'Remover MetaAPI do Genesis',
    estado: 'falta',
    detalhe: 'integrations/meta_api.py ainda usado quando flag OFF.',
    bloqueador: 'Esperar Fase 2 estável 1-2 semanas em PROD.',
  },
  {
    area: 'Genesis Code',
    item: 'Remover router /webhooks/whatsapp do Genesis',
    estado: 'falta',
    detalhe: 'Webhook Meta ainda chega aqui.',
    bloqueador: 'Trocar URL no Meta Business Manager primeiro.',
  },

  // ============================================================
  // MESSAGING-SERVICE (POLLY)
  // ============================================================
  {
    area: 'messaging-service',
    item: 'Service deployado e rodando',
    estado: 'parcial',
    detalhe: '✅ PR cross-fork aberto: ITValley-School/messaging-service#1. Polly precisa revisar e mergear.',
    bloqueador: 'Aguardando review da Polly.',
  },
  {
    area: 'messaging-service',
    item: 'send_worker consumindo messaging.send',
    estado: 'feito',
    detalhe: 'Conectado e processando.',
  },
  {
    area: 'messaging-service',
    item: 'Publisher de status (messaging.status)',
    estado: 'feito',
    detalhe: 'Eventos sent/delivered/read/failed publicados.',
  },
  {
    area: 'messaging-service',
    item: 'Webhook receiver /webhooks/meta/whatsapp',
    estado: 'feito',
    detalhe: '✅ ATIVO. Meta App "wflow" agora aponta callback_url pra ele. Verify_token + PlainTextResponse fix aplicados.',
  },
  {
    area: 'messaging-service',
    item: 'Circuit breaker por provider',
    estado: 'feito',
    detalhe: '5 falhas → fail-fast 60s → half-open.',
  },
  {
    area: 'messaging-service',
    item: 'Idempotência (UNIQUE no banco)',
    estado: 'feito',
    detalhe: 'UNIQUE(from_app, idempotency_key) na tabela messages.',
  },
  {
    area: 'messaging-service',
    item: 'Multi-tenancy de provider (tabela tenant_providers)',
    estado: 'falta',
    detalhe: 'Hoje só 1 set de creds Meta. Pra 100-500 clientes, precisa multi-tenancy.',
    bloqueador: 'Polly precisa implementar. Trabalho médio (~2 semanas).',
  },

  // ============================================================
  // OBSERVABILIDADE
  // ============================================================
  {
    area: 'Observabilidade',
    item: 'Healthcheck que valida creds Meta de verdade',
    estado: 'feito',
    detalhe: '✅ /health + /health/ready com check_meta_token_alive (ping Graph API). Detecta KeyVault literal + token expirado. Cache 60s.',
  },
  {
    area: 'Observabilidade',
    item: 'Alerta DLQ em Azure Monitor (3 filas)',
    estado: 'feito',
    detalhe: '✅ alert-dlq-messaging-send + alert-dlq-genesis-campanhas + alert-dlq-genesis-webhooks. Email pra carlosvianacomp@gmail.com via Action Group ag-genesis-ops.',
  },
  {
    area: 'Observabilidade',
    item: 'Alerta 5xx (PROD + sandbox)',
    estado: 'feito',
    detalhe: '✅ alert-prod-down (genesisbackendd) + alert-msg-service-down (messaging-service-sandbox). >5 erros 5xx em 5min.',
  },
  {
    area: 'Observabilidade',
    item: 'Alerta backlog messaging.send (worker travado)',
    estado: 'feito',
    detalhe: '✅ alert-messaging-send-backlog. >50 msgs ativas em 5min = worker travado ou provider down.',
  },
  {
    area: 'Observabilidade',
    item: 'Alerta failed rate > X% por provider (custom metric)',
    estado: 'parcial',
    detalhe: 'Tem alertas de 5xx (PROD+sandbox) + backlog. Mas custom metric "% failed por provider Meta/Twilio/IG" ainda não.',
    bloqueador: 'Emitir custom metric via Application Insights SDK no messaging-service.',
  },
  {
    area: 'Observabilidade',
    item: 'Smoke E2E periódico em PROD',
    estado: 'falta',
    detalhe: 'Cron Azure Function que publica msg de teste a cada hora.',
    bloqueador: 'Criar Azure Function ou Logic App.',
  },

  // ============================================================
  // META / EXTERNO
  // ============================================================
  {
    area: 'Meta / Externo',
    item: 'Webhook Meta apontando pro messaging-service',
    estado: 'feito',
    detalhe: '🎉 TROCADO HOJE via Graph API. App "wflow" (508223132333066) → messaging-service-sandbox/webhooks/meta/whatsapp. App Secret no Key Vault (wflow-fb-app-secret).',
  },
  {
    area: 'Meta / Externo',
    item: 'Verify Token Meta consistente',
    estado: 'feito',
    detalhe: '✅ Validado. PlainTextResponse fix aplicado pra Meta aceitar challenge sem aspas.',
  },
  {
    area: 'Meta / Externo',
    item: 'Renomear messaging-service-sandbox pra prod oficial',
    estado: 'falta',
    detalhe: 'Nome "sandbox" não combina com PROD. Quando Polly merge o fork, criar messaging-service-prod no repo dela.',
  },

  // ============================================================
  // ROADMAP / DOCS
  // ============================================================
  {
    area: 'Docs',
    item: 'Site roadmap atualizado com PROD',
    estado: 'feito',
    detalhe: 'Aba "Como está agora" + "Execução" + esta "Checklist".',
  },
  {
    area: 'Docs',
    item: 'Handoff doc commitado em main',
    estado: 'feito',
    detalhe: 'docs/handoff-execucao-2026-05-22.md.',
  },
  {
    area: 'Docs',
    item: 'Plano de migração',
    estado: 'feito',
    detalhe: 'docs/plano-migracao-messaging.md.',
  },
  {
    area: 'Docs',
    item: 'Smoke test roteiro',
    estado: 'feito',
    detalhe: 'docs/smoke-test-messaging.md.',
  },
];

export function contarPorEstado(): { feito: number; parcial: number; falta: number; total: number; pctFeito: number } {
  const feito = checklist.filter(i => i.estado === 'feito').length;
  const parcial = checklist.filter(i => i.estado === 'parcial').length;
  const falta = checklist.filter(i => i.estado === 'falta').length;
  const total = checklist.length;
  const pctFeito = Math.round((feito / total) * 100);
  return { feito, parcial, falta, total, pctFeito };
}
