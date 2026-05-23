import type { Bloco } from './types';

/**
 * "Como está AGORA" — snapshot FINAL após sessão 2026-05-23 02:35 UTC.
 *
 * Estado: Fase 3 completa em PROD oficial. messaging-service da Polly
 * com nosso código merged. Webhook Meta apontando pro app oficial.
 * Sandbox descontinuado.
 */
export const blocosAgora: Bloco[] = [
  {
    id: 'fe-agora',
    nome: 'Frontend Genesis',
    tag: 'SvelteKit',
    resumo: 'Sem mudança visível. Operador clica disparar igual antes.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `genesisfrontd`',
    oQueFaz: 'Interface do operador. Disparo de campanha, gestão de conversas, dashboard. Real-time via WebSocket.',
    recebeDe: ['Usuário (operador)'],
    entrega: ['HTTP POST /api/campanhas/{id}/disparar pro backend'],
  },
  {
    id: 'api-agora',
    nome: '✅ Backend FastAPI HTTP-only',
    tag: 'Fase 2 ATIVA',
    resumo: 'HTTP + status_updater + inbound_processor (Fase 2 ativa). Campanha e webhook isolados.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `genesisbackendd` (PROD real, 190 req/7d) · plan-genesis-backend',
    oQueFaz: 'Recebe HTTP do frontend, valida, publica no Service Bus. Roda status_updater_worker (consome messaging.status) + inbound_processor_worker (consome messaging.inbound). webhook_worker e campanha_worker em App Services dedicados. MetaAPI removida dos envios.',
    recebeDe: ['Frontend (HTTP)', 'Tópicos messaging.status + messaging.inbound'],
    entrega: ['SB queue genesis-campanhas', 'UPDATE mensagens.status + broadcast WS'],
    observacoes: [
      '✅ MetaAPI removida dos envios (mantida só pra sync_templates)',
      '✅ /webhooks/whatsapp REMOVIDO (Meta aponta pro messaging-service oficial agora)',
      '✅ Flag MESSAGING_SERVICE_ENABLED=true (CampanhaService.disparar publica em messaging.send)',
      '⚠️ Existe app PARALELO app-genesis-backend-accp (STAGING, 17 req/7d) — não confundir',
      '🎓 23/05 madrugada: NUNCA usar "az webapp restart" sozinho — pode quebrar antenv. Sempre disparar redeploy via GH Actions.',
    ],
  },
  {
    id: 'worker-campanhas-agora',
    nome: 'Worker Campanhas (Dispatcher)',
    tag: 'App Service dedicado',
    resumo: 'Lê destinatários e publica em messaging.send (não chama Meta mais).',
    variante: 'ok',
    ondeMora: 'Azure App Service · `worker-genesis-campanhas`',
    oQueFaz: 'Consome `genesis-campanhas`. Para cada destinatário: renderiza variáveis + decide canal/janela + publica msg em messaging.send (via messaging_client). Polly consome no app oficial.',
    recebeDe: ['Service Bus `genesis-campanhas`'],
    entrega: ['Service Bus `messaging.send`'],
  },
  {
    id: 'worker-webhooks-agora',
    nome: 'Worker Webhooks (legacy, sem tráfego)',
    tag: 'App Service dedicado',
    resumo: 'Existe mas sem trabalho (webhook Meta vai direto pro messaging-service agora).',
    variante: 'ghost',
    ondeMora: 'Azure App Service · `worker-genesis-webhooks`',
    oQueFaz: 'Existia pra consumir genesis-webhooks que era populada pelo /webhooks/whatsapp do Genesis. Esse endpoint foi REMOVIDO. Fila silenciosa. Pode desligar quando quiser (R$13/mês economia).',
    recebeDe: ['(nada — fila vazia)'],
    entrega: ['—'],
    observacoes: ['Manter por enquanto pra rollback rápido se algo quebrar.'],
  },
  {
    id: 'sb-novo-agora',
    nome: 'Service Bus topology completa',
    tag: 'Genesis + ecossistema',
    resumo: 'Toda arquitetura alvo provisionada e EM USO.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus · namespace `genesisitvalley`',
    oQueFaz: 'queue messaging.send (Genesis → messaging-service ATIVA). topic messaging.status + sub genesis-status-sub (status_updater ATIVO). topic messaging.inbound + sub genesis-inbound-sub (inbound_processor ATIVO). campaigns.dispatch (criada, opcional). genesis-campanhas (legacy, em uso pelo dispatcher).',
    recebeDe: ['Genesis backend + workers', 'messaging-service-itvalley-prod'],
    entrega: ['Workers consumidores (de Genesis e messaging-service)'],
  },
  {
    id: 'msg-prod-agora',
    nome: '🎉 messaging-service PROD OFICIAL',
    tag: 'Polly · App oficial',
    resumo: 'App PROD oficial rodando código nosso evoluído. Sandbox descontinuado.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `messaging-service-itvalley-prod`',
    oQueFaz: 'Deploy automático do main do ITValley-School/messaging-service. send_worker consome messaging.send. Publishers pra messaging.status + messaging.inbound. Webhook receiver /webhooks/meta/whatsapp ATIVO. Healthcheck valida creds Meta REAL (ping Graph API).',
    recebeDe: ['SB queue messaging.send', 'Webhook Meta inbound (POST direto)'],
    entrega: ['Meta WhatsApp Cloud API (envio)', 'SB topic messaging.status (sent/delivered/read/failed)', 'SB topic messaging.inbound (msg recebida normalizada)'],
    payloadEntrada: {
      titulo: 'Smoke real (22:33 UTC) que ChegoU pro Carlos',
      tipo: 'json',
      conteudo: `{
  "channel": "whatsapp_text",
  "to": "+15815780564",
  "body": "Carlos, mensagem do APP OFICIAL messaging-service-itvalley-prod (repo ITValley-School direto). Sandbox stopped. Estamos em 100% prod.",
  "from_app": "claude-app-oficial",
  "idempotency_key": "prod-app-oficial-..."
}`,
    },
    payloadSaida: {
      titulo: 'POST type=text na Meta API',
      tipo: 'http',
      conteudo: `POST https://graph.facebook.com/v19.0/{phone_id}/messages
Authorization: Bearer ...
{
  "messaging_product": "whatsapp",
  "to": "+15815780564",
  "type": "text",
  "text": {"body": "Carlos, mensagem do APP OFICIAL..."}
}

// retorno: wamid.HBgL... + Carlos recebeu no celular ✅`,
    },
    observacoes: [
      '✅ Provado E2E com Carlos confirmando "recebi"',
      '✅ Webhook Meta apontando pra ele (Graph API troca feita)',
      '✅ MetaAPI removida no Genesis (sem cordão direto)',
    ],
  },
  {
    id: 'meta-agora',
    nome: 'Meta WhatsApp Cloud API',
    tag: 'Provider externo',
    resumo: 'Apenas messaging-service fala com ela. Genesis desacoplado.',
    variante: 'info',
    ondeMora: 'Externo · graph.facebook.com',
    oQueFaz: 'Recebe POSTs do messaging-service (texto + template). Manda webhooks de inbound + status callbacks pro messaging-service-itvalley-prod (URL configurada via Graph API hoje).',
    recebeDe: ['messaging-service (envios)'],
    entrega: ['Cliente WhatsApp', 'Webhook → messaging-service'],
  },
];
