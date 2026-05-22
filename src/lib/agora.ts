import type { Bloco } from './types';

/**
 * "Como está AGORA" — snapshot após a sessão de migração 2026-05-22.
 *
 * Mistura do "Hoje" (campanha_worker ainda chama Meta direto) com
 * peças da arquitetura nova já montadas (sandbox, filas/tópicos novos,
 * worker-genesis-webhooks isolado). Fase 0 ativada em PROD.
 */
export const blocosAgora: Bloco[] = [
  {
    id: 'fe-agora',
    nome: 'Frontend Genesis',
    tag: 'SvelteKit',
    resumo: 'Sem mudança visível. Mesmo de sempre.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `genesisfrontd`',
    oQueFaz: 'Operador clica disparar; nada visível mudou nesta sessão.',
    recebeDe: ['Usuário'],
    entrega: ['HTTP POST /api/campanhas/{id}/disparar'],
  },
  {
    id: 'api-agora',
    nome: 'Backend FastAPI',
    tag: 'HTTP + campanha_worker',
    resumo: 'Roda HTTP + campanha_worker (webhook_worker SAIU).',
    variante: 'warn',
    ondeMora: 'Azure App Service · `genesisbackendd` (PROD)',
    oQueFaz: 'Continua respondendo HTTP. webhook_worker desligado via WEBHOOK_WORKER_SEPARADO=true. campanha_worker ainda dentro (sai na Fase 2).',
    recebeDe: ['Frontend (HTTP)', 'Webhook Meta (POST /webhooks/whatsapp) — ainda aqui'],
    entrega: ['Service Bus filas `genesis-campanhas` + `genesis-webhooks`'],
    payloadEntrada: {
      titulo: 'HTTP do frontend',
      tipo: 'http',
      conteudo: `POST /api/campanhas/{id}/disparar
Authorization: Bearer ...`,
    },
    payloadSaida: {
      titulo: 'Resposta 202 + msg na fila',
      tipo: 'json',
      conteudo: `{ "status": "na_fila", "campanha_id": "..." }
// + publish em genesis-campanhas`,
    },
    observacoes: [
      '✅ webhook_worker NÃO mais roda aqui (env var ON em PROD)',
      '⏳ campanha_worker ainda roda aqui (sai na Fase 2)',
    ],
  },
  {
    id: 'worker-campanhas-agora',
    nome: 'Worker Campanhas',
    tag: 'App Service dedicado',
    resumo: 'Já tinha, continua igual.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `worker-genesis-campanhas`',
    oQueFaz: 'Consome `genesis-campanhas`, chama MetaAPI direto. Será substituído pelo Dispatcher na Fase 2.',
    recebeDe: ['Service Bus `genesis-campanhas`'],
    entrega: ['Meta WhatsApp Cloud API (direto)'],
  },
  {
    id: 'worker-webhooks-agora',
    nome: 'Worker Webhooks',
    tag: '🆕 App Service dedicado',
    resumo: 'NOVO — criado e ativado nesta sessão.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `worker-genesis-webhooks`',
    oQueFaz: 'Consome `genesis-webhooks` (msgs inbound do WhatsApp). Substitui o webhook_worker que estava dentro do backend. main_worker_webhooks.py.',
    recebeDe: ['Service Bus `genesis-webhooks`'],
    entrega: ['INSERT em contatos/conversas/mensagens', 'Broadcast WebSocket'],
    observacoes: [
      '✅ Logs confirmam: "Worker WEBHOOKS aguardando" no app dedicado',
      'Receita aprendida: SCM_DO_BUILD=true + source-only workflow',
    ],
  },
  {
    id: 'sb-novo-agora',
    nome: 'Service Bus topology completa',
    tag: '🆕 4 recursos novos',
    resumo: 'Filas/tópicos da arquitetura alvo, criados mas NÃO usados em PROD ainda.',
    variante: 'info',
    ondeMora: 'Azure Service Bus · namespace `genesisitvalley`',
    oQueFaz: 'campaigns.dispatch (queue) + messaging.send (queue) + messaging.status (topic + genesis-status-sub) + messaging.inbound (topic + genesis-inbound-sub). Aguardando código da Fase 2 ativar.',
    recebeDe: ['Sandbox messaging-service (usando) · Genesis PROD (quando Fase 2 ATIVAR)'],
    entrega: ['Workers consumidores (alguns ainda em flags OFF)'],
  },
  {
    id: 'msg-sandbox-agora',
    nome: 'messaging-service sandbox',
    tag: '🆕 Sandbox paralelo (provado E2E)',
    resumo: 'Cópia funcional pra testes. Smoke real com botão validou tudo.',
    variante: 'purple',
    ondeMora: 'Azure App Service · `messaging-service-sandbox`',
    oQueFaz: 'Fork cacaviana/messaging-service rodando: send_worker consome messaging.send, publica em messaging.status, webhook receiver em /webhooks/meta/whatsapp. SMOKE REAL: enviou template teste0001 com botão pro Carlos, ele clicou, callback chegou no banco.',
    recebeDe: ['Smoke real: publish em messaging.send → Meta API'],
    entrega: ['Meta WhatsApp Cloud API (live)'],
    payloadEntrada: {
      titulo: 'Msg de smoke test (consumida)',
      tipo: 'json',
      conteudo: `{
  "channel": "sms",
  "to": "+15005550006",
  "from_app": "genesis-smoke",
  "idempotency_key": "smoke-1779485605",
  ...
}`,
    },
    payloadSaida: {
      titulo: 'Persistido no DB do sandbox',
      tipo: 'json',
      conteudo: `{
  "id": "09745648-2cd9-4c2f-8492-f01ed3c1a356",
  "status": "failed",  // Twilio 401 = esperado com magic number
  "provider": "twilio",
  "erro_msg": "twilio_20003: Authentication Error"
}`,
    },
    observacoes: ['Smoke test E2E: queue → worker → Twilio → DB ✓'],
  },
  {
    id: 'code-fase2-agora',
    nome: '🔥 Fase 2 ATIVADA em ACCP',
    tag: 'Staging — provada E2E',
    resumo: 'PR #11 mergeado. Flags ON em app-genesis-backend-accp.',
    variante: 'purple',
    ondeMora: 'Branch CU-fase2-messaging-service MERGEADA em accp',
    oQueFaz: 'CampanhaService.disparar com flag MESSAGING_SERVICE_ENABLED publica em messaging.send. status_updater_worker rodando em ACCP, consumindo messaging.status.',
    recebeDe: ['messaging.status publicações (smoke test passou)'],
    entrega: ['Update mensagens.status + broadcast WS'],
    payloadEntrada: {
      titulo: 'Evento publicado em messaging.status (smoke)',
      tipo: 'json',
      conteudo: `{
  "event": "message.sent",
  "provider_message_id": "wamid.FASE2SMOKE...",
  "to": "+5511999990000",
  ...
}`,
    },
    payloadSaida: {
      titulo: 'Log do worker ACCP (sucesso)',
      tipo: 'json',
      conteudo: `INFO | status_updater_worker |
  status_updater_mensagem_nao_encontrada
  wamid=wamid.FASE2SMOKE1779489439
  event=message.sent

# Comportamento certo: wamid fake = não acha
# Com wamid real: UPDATE mensagens + broadcast WS`,
    },
    observacoes: [
      '✅ PR #11 MERGEADO em accp',
      '✅ MESSAGING_SERVICE_ENABLED=true em ACCP',
      '✅ STATUS_UPDATER_WORKER_ENABLED=true em ACCP',
      '✅ Smoke pub→consume validou pipeline',
      '⏳ Próximo: ativar em PROD (canary)',
    ],
  },
  {
    id: 'meta-agora',
    nome: 'Meta WhatsApp',
    tag: 'API externa',
    resumo: 'Genesis ainda chama direto (Fase 2 muda isso).',
    variante: 'warn',
    ondeMora: 'Externo',
    oQueFaz: 'Recebe POSTs do worker-genesis-campanhas e do operador (via /whatsapp/send-*). Envia webhook inbound pro Genesis (que enfileira em genesis-webhooks).',
    recebeDe: ['Genesis (direto, hoje)'],
    entrega: ['Webhook inbound → genesis-webhooks queue'],
  },
];
