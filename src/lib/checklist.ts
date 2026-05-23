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
    estado: 'parcial',
    detalhe: 'Criado mas VAZIO. Inbound worker rodando mas sem mensagens.',
    bloqueador: 'Webhook Meta ainda aponta pro Genesis. Trocar URL no Meta Business Manager.',
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
    detalhe: 'Fork meu (cacaviana/messaging-service) ativo. Polly precisa mergear no repo dela.',
    bloqueador: 'Conversa com Polly + merge no repo ITValley-School/messaging-service',
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
    estado: 'parcial',
    detalhe: 'Endpoint pronto. Mas Meta ainda não aponta pra ele.',
    bloqueador: 'Trocar webhook URL no Meta Business Manager (precisa App Secret).',
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
    estado: 'falta',
    detalhe: 'Hoje só checa se var tem valor (caso KeyVault literal nos pegou). Deveria fazer ping na Graph API.',
    bloqueador: 'Adicionar `meta.is_token_alive()` no /health endpoint do messaging-service.',
  },
  {
    area: 'Observabilidade',
    item: 'Alerta DLQ em Application Insights',
    estado: 'falta',
    detalhe: 'Quando uma msg vai pra DLQ, deveria alertar. Hoje passa despercebido.',
    bloqueador: 'Configurar alert rule no Application Insights.',
  },
  {
    area: 'Observabilidade',
    item: 'Alerta failed rate > X% por provider',
    estado: 'falta',
    detalhe: 'Se 50% das msgs falham por code=190 (auth), tem que disparar alerta.',
    bloqueador: 'Métrica custom + alert rule.',
  },
  {
    area: 'Observabilidade',
    item: 'Smoke E2E periódico em PROD',
    estado: 'falta',
    detalhe: 'Cron que dispara msg de teste a cada hora pra detectar regressão silenciosa antes do cliente.',
    bloqueador: 'Azure Function ou Logic App.',
  },

  // ============================================================
  // META / EXTERNO
  // ============================================================
  {
    area: 'Meta / Externo',
    item: 'Webhook Meta apontando pro messaging-service',
    estado: 'falta',
    detalhe: 'Hoje aponta pro Genesis (/webhooks/whatsapp do genesisbackendd).',
    bloqueador: 'Mudar URL no Meta Business Manager. Carlos precisa fazer (precisa App Secret).',
  },
  {
    area: 'Meta / Externo',
    item: 'Verify Token Meta consistente',
    estado: 'parcial',
    detalhe: 'WHATSAPP_VERIFY_TOKEN configurado no sandbox. Mas Meta App precisa apontar pra URL nova.',
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
