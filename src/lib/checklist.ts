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
  // 📢 SEGUNDA-FEIRA — APRESENTAR/PEDIR PRA EQUIPE
  // ============================================================
  {
    area: '📢 Segunda — pra equipe',
    item: 'Apresentar resultado: 83% da arquitetura messaging-service ATIVA em PROD',
    estado: 'falta',
    detalhe: '27 itens matados em uma sessão. Genesis↔Meta cordão cortado. Webhook Meta agora chega no messaging-service. Pipeline E2E validado: template+botão + texto livre. Site roadmap atualizado em https://calm-moss-0e9dd3c0f.7.azurestaticapps.net.',
    bloqueador: 'Reunião com Henrique + Polly',
  },
  {
    area: '📢 Segunda — pra equipe',
    item: 'Mostrar pra Polly: PR cross-fork #1 (sandbox completo)',
    estado: 'falta',
    detalhe: 'github.com/ITValley-School/messaging-service/pull/1 — SB worker + event publisher + Meta webhook receiver + healthcheck validador. Já PROVADO E2E em PROD do Genesis. Pedir review + merge.',
    bloqueador: 'Polly revisar e mergear',
  },
  {
    area: '📢 Segunda — pra equipe',
    item: 'Abrir PR cross-fork #2: canal whatsapp_text',
    estado: 'falta',
    detalhe: '4 alterações aditivas pequenas pra adicionar canal whatsapp_text (texto livre janela 24h). Smoke real validou: mensagem chegou pro Carlos em 22:00 UTC. Padrão IT Valley puro.',
    bloqueador: 'Eu abro PR separado e pequeno antes de segunda',
  },
  {
    area: '📢 Segunda — pra equipe',
    item: 'Pedir Polly: criar messaging-service-prod App Service oficial',
    estado: 'falta',
    detalhe: 'Hoje meu fork (cacaviana/messaging-service-sandbox) está rodando em PROD com tokens reais. Quando ela criar App Service oficial messaging-service-prod, eu migro a config e desligo o sandbox.',
    bloqueador: 'Polly criar + deploy + nova publish profile + trocar webhook Meta URL pra novo endpoint',
  },
  {
    area: '📢 Segunda — pra equipe',
    item: 'Pedir Polly: implementar multi-tenancy de provider',
    estado: 'falta',
    detalhe: 'Tabela tenant_providers (1 WABA + 1 Twilio + 1 IG por cliente). HOJE só tem 1 set de creds globais. SEM ISSO o Genesis não escala pra 100-500 clientes. Trabalho ~2 semanas dela.',
    bloqueador: 'Polly priorizar + estimar',
  },
  {
    area: '📢 Segunda — pra equipe',
    item: 'Alinhar com Henrique: Genesis código novo em PROD',
    estado: 'falta',
    detalhe: '3 workers novos (status_updater, inbound_processor, dispatcher via campanha_worker). MetaAPI deprecated nos envios (só sync_templates ainda usa). Feature flags ativas. CampanhaService.disparar refatorado. Ele precisa saber pra próximas mexidas.',
    bloqueador: 'Conversa pessoal',
  },
  {
    area: '📢 Segunda — pra equipe',
    item: 'Pitch resumo de uma frase',
    estado: 'falta',
    detalhe: '"Eu + Claude desligamos o cordão direto Genesis↔Meta. Webhook Meta agora chega no messaging-service, que processa, publica em tópico, e Genesis consome de lá. Canal whatsapp_text novo desbloqueia tudo. PR cross-fork #1 te espera."',
  },


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
    detalhe: '✅ EM USO E VALIDADO E2E. Webhook→Sandbox→Topic→Genesis worker→INSERT no banco PROD. Smoke V5 (id=22a2eee4-...) confirmou.',
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
    estado: 'parcial',
    detalhe: 'campanha_worker já faz a função de Dispatcher hoje (chama CampanhaService.disparar com flag MESSAGING_SERVICE_ENABLED publicando em messaging.send). Pureza arquitetural: renomear fila pra campaigns.dispatch. Valor real = zero. Decidido SKIP.',
  },
  {
    area: 'Genesis Code',
    item: 'Remover MetaAPI do Genesis (envios)',
    estado: 'feito',
    detalhe: '✅ whatsapp_service.py migrado: enviar_mensagem usa channel=whatsapp_text + enviar_template usa channel=whatsapp. MetaAPI mantida APENAS pra sync_templates (catálogo, não é transport).',
  },
  {
    area: 'Genesis Code',
    item: 'Remover router /webhooks/whatsapp do Genesis',
    estado: 'feito',
    detalhe: '✅ REMOVIDO em 2026-05-23 01:50 UTC. Comentado em backend/routers/webhooks.py. Webhook Meta agora vai 100% pro messaging-service. /webhooks/hotmart, /voomp, /memberkit MANTIDOS.',
  },

  // ============================================================
  // MESSAGING-SERVICE (POLLY)
  // ============================================================
  {
    area: 'messaging-service',
    item: 'Service deployado e rodando em PROD oficial',
    estado: 'feito',
    detalhe: '🎉 PR #1 + PR #2 MERGEADOS no repo ITValley-School/messaging-service main. App oficial messaging-service-itvalley-prod no ar. Smoke real 22:33 UTC: texto livre enviado pelo Carlos. Polly segunda faz git pull + revisa.',
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
    estado: 'feito',
    detalhe: '✅ Logic App smoke-genesis-hourly criada em rg-webapps. Ping /api/health (genesis) + /health/ready (messaging-service) a cada hora. 5xx dispara alert-prod-down + alert-msg-service-down já configurados.',
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
    item: 'App oficial messaging-service em PROD',
    estado: 'feito',
    detalhe: '🎉 messaging-service-itvalley-prod criado em rg-webapps/plan-itvalley-nonprod. Deploy automático do main do ITValley-School/messaging-service. Webhook Meta apontando pra ele. Sandbox stopped (sem uso).',
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
