import type { Bloco } from './types';

/* ===========================================================
 * HOJE — Arquitetura atual do Genesis (lida da branch accp)
 * =========================================================== */
export const blocosHoje: Bloco[] = [
  {
    id: 'fe-hoje',
    nome: 'Frontend Genesis',
    tag: 'SvelteKit',
    resumo: 'Onde o operador clica "Disparar campanha".',
    variante: 'ok',
    ondeMora: 'Azure App Service · `genesisfrontd`',
    oQueFaz: 'Interface do operador. Cria campanhas, lista conversas, dispara campanhas, mostra status em tempo real via WebSocket.',
    recebeDe: ['Usuário humano (operador, dono da campanha)'],
    entrega: ['HTTP POST /api/campanhas/{id}/disparar', 'Conexão WebSocket /api/ws/conversas'],
  },
  {
    id: 'api-hoje',
    nome: 'Backend FastAPI',
    tag: 'Python · API',
    resumo: 'API HTTP do Genesis. Recebe requests do frontend.',
    variante: 'warn',
    ondeMora: 'Azure App Service · `genesisbackendd`',
    oQueFaz: 'Recebe HTTP do frontend, valida campanha, publica msg no Service Bus, retorna 202. HOJE também roda 2 workers dentro do mesmo processo (concorrendo CPU com requests).',
    recebeDe: ['Frontend (HTTP POST)', 'Webhook Meta (POST /webhooks/whatsapp)'],
    entrega: ['Service Bus fila `genesis-campanhas`', 'Service Bus fila `genesis-webhooks`', 'Resposta 202 pro frontend'],
    payloadEntrada: {
      titulo: 'HTTP do frontend (disparar campanha)',
      tipo: 'http',
      conteudo: `POST /api/campanhas/4f5e-...-c8a1/disparar
Authorization: Bearer eyJhbGc...
Content-Type: application/json

(sem body — id está na URL)`,
    },
    payloadSaida: {
      titulo: 'Resposta + msg enfileirada',
      tipo: 'json',
      conteudo: `// 1. Resposta HTTP imediata pro frontend (202)
{
  "status": "na_fila",
  "campanha_id": "4f5e-...-c8a1"
}

// 2. Em paralelo, publica na fila genesis-campanhas:
{
  "tipo": "campanha_disparo",
  "campanha_id": "4f5e-...-c8a1",
  "tenant_id": "genesis"
}`,
    },
    observacoes: [
      'Problema: o mesmo container responde HTTP e roda workers — competem por CPU.',
      'Pra escalar, vamos isolar: backend só HTTP, workers em App Services separados.',
    ],
  },
  {
    id: 'sb-campanhas-hoje',
    nome: 'Fila `genesis-campanhas`',
    tag: 'Service Bus Queue',
    resumo: 'Fila de disparo de campanha.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus · namespace compartilhado',
    oQueFaz: 'Recebe 1 msg por campanha disparada. Garante 1 msg = 1 consumer. Ack/complete explícito. Tem DLQ nativa (que hoje não usamos).',
    recebeDe: ['Backend FastAPI (enfileira ao receber POST /disparar)'],
    entrega: ['Worker de campanhas (consumer)'],
    payloadEntrada: {
      titulo: 'Mensagem publicada pelo backend',
      tipo: 'json',
      conteudo: `{
  "tipo": "campanha_disparo",
  "campanha_id": "4f5e8a2c-7b91-...-c8a1",
  "tenant_id": "genesis"
}

// Headers do SB
MessageId: <auto-gerado pelo SB>
EnqueuedTimeUtc: 2026-05-21T20:14:32Z
DeliveryCount: 1`,
    },
    payloadSaida: {
      titulo: 'O mesmo payload chega no worker',
      tipo: 'json',
      conteudo: `// Worker faz json.loads(str(msg)) e recebe:
{
  "tipo": "campanha_disparo",
  "campanha_id": "4f5e8a2c-7b91-...-c8a1",
  "tenant_id": "genesis"
}

// Depois worker chama:
// → await receiver.complete_message(msg)  (ack)`,
    },
  },
  {
    id: 'sb-webhooks-hoje',
    nome: 'Fila `genesis-webhooks`',
    tag: 'Service Bus Queue',
    resumo: 'Fila de webhooks WhatsApp inbound.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus',
    oQueFaz: 'Recebe msg quando alguém manda WhatsApp pro número da empresa. Desacopla o webhook Meta do processamento (Meta espera 200 rápido, processamento real fica pro worker).',
    recebeDe: ['Backend FastAPI (router /webhooks/whatsapp enfileira)'],
    entrega: ['Worker de webhooks (consumer)'],
    payloadEntrada: {
      titulo: 'Payload do webhook Meta (vem do backend)',
      tipo: 'json',
      conteudo: `{
  "tipo": "whatsapp_inbound",
  "tenant_id": "genesis",
  "payload": {
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5511999991234",
            "id": "wamid.HBgL...",
            "timestamp": "1747859672",
            "text": { "body": "Quero saber sobre o curso" },
            "type": "text"
          }],
          "contacts": [{
            "profile": { "name": "Maria Silva" },
            "wa_id": "5511999991234"
          }]
        }
      }]
    }]
  }
}`,
    },
    payloadSaida: {
      titulo: 'Mesma msg entregue ao webhook_worker',
      tipo: 'json',
      conteudo: `// Worker recebe o JSON acima inteiro
// e chama:
await service.processar_whatsapp(
  body["payload"],
  tenant_id=body["tenant_id"]
)`,
    },
  },
  {
    id: 'worker-campanha-hoje',
    nome: 'Worker `campanha_worker`',
    tag: 'Python · Worker',
    resumo: 'Consome fila de campanhas, dispara mensagens.',
    variante: 'warn',
    ondeMora: 'Hoje roda DUPLICADO: dentro do `genesisbackendd` E no `worker-genesis-campanhas`',
    oQueFaz: 'Consome msg da fila. Verifica status anti-redelivery. Chama CampanhaService.disparar(): carrega destinatários, resolve variáveis, chama Meta API um a um, atualiza status no banco.',
    recebeDe: ['Service Bus `genesis-campanhas`'],
    entrega: ['HTTP POST direto pra Meta Graph API', 'UPDATE em campanha_destinatarios + campanhas no Azure SQL'],
    payloadEntrada: {
      titulo: 'Msg lida do Service Bus',
      tipo: 'json',
      conteudo: `{
  "tipo": "campanha_disparo",
  "campanha_id": "4f5e-...-c8a1",
  "tenant_id": "genesis"
}`,
    },
    payloadSaida: {
      titulo: 'HTTP POST que o worker faz pra Meta (loop por destinatário)',
      tipo: 'http',
      conteudo: `POST https://graph.facebook.com/v19.0/{phone_id}/messages
Authorization: Bearer EAAxx...

{
  "messaging_product": "whatsapp",
  "to": "5511999991234",
  "type": "template",
  "template": {
    "name": "boas_vindas_compra",
    "language": { "code": "pt_BR" },
    "components": [{
      "type": "body",
      "parameters": [
        { "type": "text", "text": "Maria" }
      ]
    }]
  }
}`,
    },
    observacoes: [
      'Hoje envia 1 destinatário por vez (single-threaded).',
      '`asyncio.sleep(0.5)` hardcoded entre envios — 8 minutos a mais em 1000 contatos.',
      'Idempotência fraca: só checa status no banco, sem idempotency_key.',
      '`complete_message` em erro = não usa DLQ.',
    ],
  },
  {
    id: 'worker-webhook-hoje',
    nome: 'Worker `webhook_worker`',
    tag: 'Python · Worker',
    resumo: 'Consome fila de webhooks, processa inbound.',
    variante: 'warn',
    ondeMora: 'Dentro do `genesisbackendd` (não tem App Service dedicado)',
    oQueFaz: 'Quando cliente responde no WhatsApp, processa o payload Meta: cria/atualiza Contato, abre/atualiza Conversa, insere Mensagem direcao=entrada, marca não-lida, dispara broadcast WebSocket.',
    recebeDe: ['Service Bus `genesis-webhooks`'],
    entrega: ['INSERT/UPDATE em contatos, conversas, mensagens (Azure SQL)', 'Broadcast WebSocket pro frontend'],
    payloadEntrada: {
      titulo: 'Msg lida do SB com payload Meta dentro',
      tipo: 'json',
      conteudo: `{
  "tipo": "whatsapp_inbound",
  "tenant_id": "genesis",
  "payload": {
    "messages": [{
      "from": "5511999991234",
      "id": "wamid.HBgL...",
      "text": { "body": "Quero saber sobre o curso" },
      "type": "text"
    }],
    "contacts": [{
      "profile": { "name": "Maria Silva" },
      "wa_id": "5511999991234"
    }]
  }
}`,
    },
    payloadSaida: {
      titulo: 'Operações no banco + broadcast WS',
      tipo: 'json',
      conteudo: `// 1. UPSERT contato (dedup por telefone E.164)
INSERT INTO contatos (id, tenant_id, nome, telefone, telefone_e164, ...)
VALUES (..., 'Maria Silva', '5511999991234', '+5511999991234', ...)

// 2. UPSERT conversa
INSERT INTO conversas (contato_id, status, ultima_msg_entrada_at)
VALUES (..., 'nao_lida', NOW())

// 3. INSERT mensagem
INSERT INTO mensagens (conversa_id, direcao, conteudo, wamid)
VALUES (..., 'entrada', 'Quero saber sobre o curso', 'wamid.HBgL...')

// 4. Broadcast WebSocket pro tenant
ws.broadcast(tenant_id, {
  "evento": "mensagem_entrada",
  "conversa_id": "...",
  "mensagem": { ... }
})`,
    },
  },
  {
    id: 'meta-hoje',
    nome: 'Meta WhatsApp Cloud API',
    tag: 'API externa',
    resumo: 'API da Meta — provider WhatsApp.',
    variante: 'info',
    ondeMora: 'Externo · graph.facebook.com/v19.0',
    oQueFaz: 'Envia mensagens WhatsApp pelos templates aprovados. Recebe nossos POST, retorna wamid no sucesso. Manda webhook pra gente quando alguém responde.',
    recebeDe: ['Worker de campanhas (envia template)', 'Frontend operador (envia texto livre)'],
    entrega: ['Mensagem entregue ao celular do destinatário', 'Webhook inbound de volta pro backend'],
    payloadEntrada: {
      titulo: 'Request do Genesis (envio template)',
      tipo: 'http',
      conteudo: `POST /v19.0/{phone_id}/messages
Authorization: Bearer EAAxx...

{
  "messaging_product": "whatsapp",
  "to": "5511999991234",
  "type": "template",
  "template": {
    "name": "boas_vindas_compra",
    "language": { "code": "pt_BR" },
    "components": [...]
  }
}`,
    },
    payloadSaida: {
      titulo: 'Resposta Meta + webhook inbound (futuro)',
      tipo: 'json',
      conteudo: `// 1. Resposta HTTP 200 imediata
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "5511999991234", "wa_id": "5511999991234" }],
  "messages": [{ "id": "wamid.HBgL...XXX" }]
}

// 2. Quando cliente responde, Meta nos manda webhook:
POST /webhooks/whatsapp
X-Hub-Signature-256: sha256=...

{
  "entry": [{ "changes": [{ "value": { "messages": [...] } }] }]
}`,
    },
  },
  {
    id: 'db-hoje',
    nome: 'Azure SQL Server',
    tag: 'Banco · schema `genesis`',
    resumo: 'Banco único multi-tenant. Hoje 1 tenant só.',
    variante: 'ok',
    ondeMora: 'Azure SQL Database',
    oQueFaz: 'Armazena tudo: contatos, conversas, mensagens, campanhas, destinatários, automações, templates cacheados. Toda tabela tem tenant_id e deleted_at (soft delete).',
    recebeDe: ['Backend FastAPI', 'Workers', 'Migrations (Alembic + manual)'],
    entrega: ['Dados pro backend e workers'],
  },
];

/* ===========================================================
 * COMO DEVE FICAR — Arquitetura nova
 * =========================================================== */
export const blocosFuturo: Bloco[] = [
  {
    id: 'fe-novo',
    nome: 'Frontend Genesis',
    tag: 'SvelteKit',
    resumo: 'Mesmo de hoje. Não muda nada visível pro operador.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `genesisfrontd`',
    oQueFaz: 'Interface continua igual. A migração arquitetural acontece atrás do backend — o operador não percebe diferença.',
    recebeDe: ['Operador humano'],
    entrega: ['HTTP POST /api/campanhas/{id}/disparar', 'WebSocket /api/ws/conversas'],
  },
  {
    id: 'api-novo',
    nome: 'Backend FastAPI',
    tag: 'Python · API HTTP-only',
    resumo: 'Backend dedicado a HTTP. Sem workers dentro.',
    variante: 'ok',
    ondeMora: 'Azure App Service · `genesisbackendd`',
    oQueFaz: 'Recebe HTTP do frontend, valida, publica msg no Service Bus, retorna 202. ZERO workers — todos isolados em App Services dedicados. CPU/memória só pra responder requests.',
    recebeDe: ['Frontend (HTTP)'],
    entrega: ['Service Bus fila `campaigns.dispatch`'],
    payloadEntrada: {
      titulo: 'HTTP do frontend (igual hoje)',
      tipo: 'http',
      conteudo: `POST /api/campanhas/4f5e-...-c8a1/disparar
Authorization: Bearer eyJhbGc...
Content-Type: application/json`,
    },
    payloadSaida: {
      titulo: 'Publica em campaigns.dispatch + responde 202',
      tipo: 'json',
      conteudo: `// 1. ServiceBusMessage publicada em campaigns.dispatch
{
  "event": "campaign.dispatch_requested",
  "campanha_id": "4f5e-...-c8a1",
  "tenant_id": "cliente-42",
  "agendado_para": null,         // ou ISO se for agendada
  "publicado_em": "2026-05-21T20:14:32Z"
}

// 2. Resposta HTTP 202 imediata pro frontend
{
  "status": "na_fila",
  "campanha_id": "4f5e-...-c8a1"
}`,
    },
    observacoes: ['Webhook Meta sai daqui — agora chega no messaging-service.'],
  },
  {
    id: 'dispatcher',
    nome: 'Worker Dispatcher',
    tag: 'Python · Worker NOVO',
    resumo: 'Transforma "1 campanha" em "N mensagens prontas".',
    variante: 'purple',
    ondeMora: 'Azure App Service · `worker-genesis-dispatcher` (novo)',
    oQueFaz: 'Consome msg "campanha X disparada". Lê destinatários em batches do CRM. Renderiza variáveis (__nome__ → "Maria"). Decide canal por contato (WA/SMS/IG). Decide janela 24h (template ou texto livre). Publica N mensagens em `messaging.send`.',
    recebeDe: ['Service Bus `campaigns.dispatch`'],
    entrega: ['Service Bus `messaging.send` (com idempotency_key por destinatário)'],
    payloadEntrada: {
      titulo: 'Msg lida de campaigns.dispatch',
      tipo: 'json',
      conteudo: `{
  "event": "campaign.dispatch_requested",
  "campanha_id": "4f5e-...-c8a1",
  "tenant_id": "cliente-42",
  "agendado_para": null,
  "publicado_em": "2026-05-21T20:14:32Z"
}`,
    },
    payloadSaida: {
      titulo: 'N mensagens renderizadas publicadas em messaging.send',
      tipo: 'json',
      conteudo: `// Pra CADA destinatário (loop com batches de 500):
{
  "channel": "whatsapp",           // genesis decidiu
  "to": "+5511999991234",          // do CRM
  "from_app": "genesis",
  "tenant_id": "cliente-42",
  "idempotency_key": "camp-4f5e-dest-Y89",

  // genesis ja resolveu vars do template:
  "template_name": "boas_vindas_compra",
  "template_language": "pt_BR",
  "template_components": [{
    "type": "body",
    "parameters": [
      { "type": "text", "text": "Maria" }
    ]
  }]
}

// Header: SessionId = "cliente-42"  (ordem por tenant)`,
    },
    observacoes: ['Substitui o `campanha_worker` atual, mas SEM chamar Meta direto.'],
  },
  {
    id: 'msg-service',
    nome: 'messaging-service (Polly)',
    tag: 'Python · FastAPI',
    resumo: 'Transport layer multi-provider. Único dono dos secrets dos providers.',
    variante: 'purple',
    ondeMora: 'Azure App Service · `messaging-service-noprod/prod` (Polly)',
    oQueFaz: 'Consome `messaging.send`. Decide provider (WA→Meta, SMS→Twilio, IG→IG Graph). Aplica rate limit por tenant+provider. Circuit breaker por provider. Idempotência via UNIQUE(from_app, idempotency_key). Envia. Publica resultado em `messaging.status`.',
    recebeDe: ['Service Bus `messaging.send` (de Genesis, Cobrança, Phoenix, etc.)'],
    entrega: ['Meta / Twilio / Instagram Graph (HTTP)', 'Service Bus topic `messaging.status`'],
    payloadEntrada: {
      titulo: 'Msg lida de messaging.send (renderizada)',
      tipo: 'json',
      conteudo: `{
  "channel": "whatsapp",
  "to": "+5511999991234",
  "from_app": "genesis",
  "tenant_id": "cliente-42",
  "idempotency_key": "camp-4f5e-dest-Y89",
  "template_name": "boas_vindas_compra",
  "template_language": "pt_BR",
  "template_components": [...]
}`,
    },
    payloadSaida: {
      titulo: 'HTTP pro provider + evento de status',
      tipo: 'http',
      conteudo: `// 1. POST pro Meta Graph API
POST https://graph.facebook.com/v19.0/{phone_id}/messages
Authorization: Bearer EAAxx...

{
  "messaging_product": "whatsapp",
  "to": "5511999991234",
  "type": "template",
  "template": {
    "name": "boas_vindas_compra",
    "language": { "code": "pt_BR" },
    "components": [...]
  }
}

// 2. Resposta Meta: { messages: [{ id: "wamid.HBgL..." }] }

// 3. Publica evento em messaging.status:
{
  "event": "message.sent",
  "from_app": "genesis",
  "idempotency_key": "camp-4f5e-dest-Y89",
  "tenant_id": "cliente-42",
  "channel": "whatsapp",
  "provider": "meta",
  "provider_message_id": "wamid.HBgL...",
  "to": "+5511999991234",
  "occurred_at": "2026-05-21T20:14:35Z"
}`,
    },
    observacoes: ['Outros sistemas (Cobrança, Phoenix) usam o mesmo serviço sem implementar provider.'],
  },
  {
    id: 'sb-dispatch',
    nome: 'Fila `campaigns.dispatch`',
    tag: 'Service Bus Queue',
    resumo: 'Fila interna do Genesis. Campanha → Dispatcher.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus Premium',
    oQueFaz: 'Recebe 1 msg quando o operador clica "Disparar". Garante que o Dispatcher pega e processa.',
    recebeDe: ['Backend FastAPI'],
    entrega: ['Dispatcher worker'],
    payloadEntrada: {
      titulo: 'Msg publicada pelo backend',
      tipo: 'json',
      conteudo: `{
  "event": "campaign.dispatch_requested",
  "campanha_id": "4f5e-...-c8a1",
  "tenant_id": "cliente-42",
  "agendado_para": null,
  "publicado_em": "2026-05-21T20:14:32Z"
}

// MessageId: <auto-gerado>
// EnqueuedTimeUtc: 2026-05-21T20:14:32Z
// DeliveryCount: 1`,
    },
    payloadSaida: {
      titulo: 'Mesma msg entregue ao Dispatcher Worker',
      tipo: 'json',
      conteudo: `// Worker pega via async for msg in receiver
// e chama:
await dispatcher.processar(
  campanha_id=body["campanha_id"],
  tenant_id=body["tenant_id"]
)
// Depois: await receiver.complete_message(msg)`,
    },
  },
  {
    id: 'sb-send',
    nome: 'Fila `messaging.send`',
    tag: 'Service Bus Queue · Sessions',
    resumo: 'Fila multi-publisher. Toda saída do ecossistema passa aqui.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus Premium',
    oQueFaz: 'Recebe mensagens RENDERIZADAS (com idempotency_key, channel, to, template+vars). Sessions por tenant pra preservar ordem se necessário. DLQ nativa pra falhas crônicas.',
    recebeDe: ['Dispatcher Genesis', 'Cobrança (futuro)', 'Phoenix (futuro)'],
    entrega: ['messaging-service worker'],
    payloadEntrada: {
      titulo: 'Mensagem renderizada (publicada por Genesis/Cobrança/Phoenix)',
      tipo: 'json',
      conteudo: `{
  "channel": "whatsapp",
  "to": "+5511999991234",
  "from_app": "genesis",
  "tenant_id": "cliente-42",
  "idempotency_key": "camp-4f5e-dest-Y89",

  "template_name": "boas_vindas_compra",
  "template_language": "pt_BR",
  "template_components": [{
    "type": "body",
    "parameters": [{ "type": "text", "text": "Maria" }]
  }]
}

// Session ID = "cliente-42"  (ordem por tenant)`,
    },
    payloadSaida: {
      titulo: 'Mesma msg entregue ao worker da Polly',
      tipo: 'json',
      conteudo: `// messaging-service consome a msg e:
// 1. SELECT messages WHERE from_app='genesis' AND idempotency_key=X
// 2. Se não existir, prossegue. Se existir, retorna idempotent.
// 3. Verifica circuit breaker + rate limit.
// 4. Chama provider (Meta/Twilio/IG).
// 5. complete_message(msg)`,
    },
  },
  {
    id: 'sb-status',
    nome: 'Tópico `messaging.status`',
    tag: 'Service Bus Topic',
    resumo: 'Pub/sub de status. Quem se inscreve, recebe.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus Premium',
    oQueFaz: 'messaging-service publica eventos sent/delivered/read/failed. Genesis Status Worker consome pra atualizar mensagem na conversa. BI futuro pode se inscrever também.',
    recebeDe: ['messaging-service (publica)'],
    entrega: ['Genesis Status Worker (consumer)', 'BI/dashboards (consumer futuro)'],
    payloadEntrada: {
      titulo: 'Evento publicado pelo messaging-service',
      tipo: 'json',
      conteudo: `{
  "event": "message.sent",  // ou "delivered", "read", "failed"
  "from_app": "genesis",
  "idempotency_key": "camp-4f5e-dest-Y89",
  "tenant_id": "cliente-42",
  "channel": "whatsapp",
  "provider": "meta",
  "provider_message_id": "wamid.HBgL...",  // wamid no caso Meta
  "to": "+5511999991234",
  "occurred_at": "2026-05-21T20:14:35.421Z",

  // só em failed:
  "error_code": null,
  "error_message": null
}`,
    },
    payloadSaida: {
      titulo: 'Como Genesis Status Worker consome',
      tipo: 'json',
      conteudo: `// Topic → cada subscriber tem sua subscription
// 1. UPDATE mensagens SET status=?, wamid=? WHERE wamid=?
// 2. UPDATE campanhas SET enviadas=enviadas+1 WHERE id=?
// 3. Broadcast WebSocket pro frontend
ws.broadcast(tenant_id, {
  "evento": "status_atualizado",
  "wamid": "wamid.HBgL...",
  "novo_status": "lida"
})`,
    },
  },
  {
    id: 'sb-inbound',
    nome: 'Tópico `messaging.inbound`',
    tag: 'Service Bus Topic',
    resumo: 'Pub/sub de mensagens recebidas. Multi-canal unificado.',
    variante: 'purple',
    ondeMora: 'Azure Service Bus Premium',
    oQueFaz: 'messaging-service recebe webhook de Meta/Twilio/IG, normaliza pra payload padrão, publica aqui. Genesis consome pra criar Conversa/Mensagem. Adicionar canal novo = só messaging-service muda.',
    recebeDe: ['messaging-service (publica após receber webhook)'],
    entrega: ['Genesis Inbound Worker', 'Polly automações futuras (consumer)'],
    payloadEntrada: {
      titulo: 'Evento NORMALIZADO (mesmo formato pra WA/SMS/IG)',
      tipo: 'json',
      conteudo: `{
  "event": "message.received",
  "tenant_id": "cliente-42",
  "channel": "whatsapp",     // ou "sms", "instagram"
  "provider": "meta",        // ou "twilio", "ig"

  "from": "+5511999991234",
  "from_name": "Maria Silva",
  "to": "+5511555555555",    // numero da empresa

  "message_id": "wamid.HBgL...",
  "occurred_at": "2026-05-21T20:18:02.103Z",

  "content": {
    "type": "text",
    "text": "Quero saber sobre o curso"
  },

  "raw_provider_payload": { ... }  // payload original do provider
}`,
    },
    payloadSaida: {
      titulo: 'Como Genesis Inbound Worker consome',
      tipo: 'json',
      conteudo: `// Cria/atualiza Contato + Conversa + Mensagem
// (igual webhook_worker de hoje, mas com payload normalizado)
//
// Vantagem: tratamento idêntico pra WA, SMS, IG
// Adicionar Telegram = só messaging-service muda, Genesis nem percebe`,
    },
  },
  {
    id: 'worker-status',
    nome: 'Worker Status Updater',
    tag: 'Python · Worker NOVO',
    resumo: 'Atualiza status das mensagens enviadas.',
    variante: 'purple',
    ondeMora: 'Azure App Service · `worker-genesis-status` (novo)',
    oQueFaz: 'Consome `messaging.status`. Para cada evento (sent/delivered/read/failed), atualiza `mensagem.status` e wamid no banco do Genesis, atualiza contadores da campanha, faz broadcast WebSocket pro frontend.',
    recebeDe: ['Tópico `messaging.status`'],
    entrega: ['UPDATE mensagens, campanhas (Azure SQL)', 'Broadcast WebSocket'],
    payloadEntrada: {
      titulo: 'Evento consumido da subscription genesis-status-sub',
      tipo: 'json',
      conteudo: `{
  "event": "message.delivered",  // ou sent/read/failed
  "from_app": "genesis",
  "idempotency_key": "camp-4f5e-dest-Y89",
  "tenant_id": "cliente-42",
  "channel": "whatsapp",
  "provider": "meta",
  "provider_message_id": "wamid.HBgL...",
  "to": "+5511999991234",
  "occurred_at": "2026-05-21T20:18:02Z"
}`,
    },
    payloadSaida: {
      titulo: 'UPDATEs no banco + broadcast WS',
      tipo: 'json',
      conteudo: `// 1. UPDATE mensagem
UPDATE mensagens
   SET status = 'entregue',
       wamid = 'wamid.HBgL...',
       updated_at = NOW()
 WHERE wamid = 'wamid.HBgL...'
   AND tenant_id = 'cliente-42'

// 2. UPDATE contador da campanha (apenas se evento = sent)
UPDATE campanhas
   SET enviadas = enviadas + 1
 WHERE id = '4f5e-...-c8a1'

// 3. Broadcast WebSocket pro frontend
ws.broadcast(tenant_id="cliente-42", {
  "evento": "status_atualizado",
  "wamid": "wamid.HBgL...",
  "novo_status": "entregue"
})`,
    },
  },
  {
    id: 'worker-inbound',
    nome: 'Worker Inbound Processor',
    tag: 'Python · Worker',
    resumo: 'Substitui o webhook_worker atual.',
    variante: 'purple',
    ondeMora: 'Azure App Service · `worker-genesis-inbound`',
    oQueFaz: 'Consome `messaging.inbound`. Cria/atualiza Contato (E.164), abre/atualiza Conversa, insere Mensagem direcao=entrada, marca não-lida, broadcast WebSocket. Igual ao webhook_worker de hoje, mas vem de tópico unificado (WA + SMS + IG).',
    recebeDe: ['Tópico `messaging.inbound`'],
    entrega: ['INSERT em contatos/conversas/mensagens', 'Broadcast WebSocket'],
    payloadEntrada: {
      titulo: 'Evento normalizado (mesmo formato pra WA/SMS/IG)',
      tipo: 'json',
      conteudo: `{
  "event": "message.received",
  "tenant_id": "cliente-42",
  "channel": "whatsapp",        // ou "sms", "instagram"
  "provider": "meta",

  "from": "+5511999991234",
  "from_name": "Maria Silva",
  "to": "+5511555555555",

  "message_id": "wamid.HBgL...",
  "occurred_at": "2026-05-21T20:18:02Z",

  "content": {
    "type": "text",
    "text": "Quero saber sobre o curso"
  }
}`,
    },
    payloadSaida: {
      titulo: 'UPSERTs no banco + broadcast WS',
      tipo: 'json',
      conteudo: `// 1. UPSERT Contato (dedup por E.164)
INSERT INTO contatos (id, tenant_id, nome, telefone, telefone_e164)
VALUES (..., 'Maria Silva', '5511999991234', '+5511999991234')
ON CONFLICT (tenant_id, telefone_e164) DO UPDATE
   SET nome = COALESCE(contatos.nome, EXCLUDED.nome)

// 2. UPSERT Conversa (status = nao_lida)
INSERT INTO conversas (contato_id, tenant_id, status,
                       ultima_msg_entrada_at)
VALUES (..., 'nao_lida', NOW())

// 3. INSERT Mensagem (entrada)
INSERT INTO mensagens (conversa_id, direcao, conteudo,
                       wamid, status, canal)
VALUES (..., 'entrada', 'Quero saber sobre o curso',
        'wamid.HBgL...', 'recebida', 'whatsapp')

// 4. Broadcast WebSocket pro frontend
ws.broadcast(tenant_id="cliente-42", {
  "evento": "mensagem_entrada",
  "conversa_id": "...",
  "mensagem": { ... }
})`,
    },
  },
  {
    id: 'meta-novo',
    nome: 'Meta / Twilio / IG',
    tag: 'APIs externas',
    resumo: 'Vários providers, agora vistos só pelo messaging-service.',
    variante: 'info',
    ondeMora: 'Externo',
    oQueFaz: 'Cada provider fala APENAS com o messaging-service. Genesis nunca chama provider direto. Adicionar Telegram/Push/Email = só messaging-service muda.',
    recebeDe: ['messaging-service'],
    entrega: ['messaging-service (webhook callbacks)'],
  },
  {
    id: 'db-novo',
    nome: 'Azure SQL — 2 bancos',
    tag: 'Banco',
    resumo: 'Genesis tem o seu, messaging-service tem o dele.',
    variante: 'ok',
    ondeMora: 'Azure SQL Database (2 databases distintos)',
    oQueFaz: 'Genesis DB: CRM, conversas, campanhas, templates cacheados pro UI. messaging-service DB: tabela `messages` (auditoria + idempotência + status). Wamid é a chave que cruza os dois.',
    recebeDe: ['Backend Genesis + workers Genesis', 'messaging-service + workers'],
    entrega: ['Dados pros 2 sistemas'],
  },
];

/* ===========================================================
 * PLANO DE AÇÃO — 4 fases
 * =========================================================== */
export const fasesPlano: Bloco[] = [
  {
    id: 'fase0',
    nome: 'Fase 0 — Limpeza imediata',
    tag: 'Risco: zero · ~1 dia',
    resumo: 'Separa workers em App Services dedicados. Não muda arquitetura, só isola.',
    variante: 'ok',
    ondeMora: 'Genesis (sem mexer no messaging-service)',
    oQueFaz: 'Coloca env vars CAMPANHA_WORKER_SEPARADO=true e WEBHOOK_WORKER_SEPARADO=true no `genesisbackendd`. Cria App Service `worker-genesis-webhooks`. Fica: 3 App Services (backend HTTP, worker-campanhas, worker-webhooks).',
    recebeDe: ['Decisão sua (qualquer hora)'],
    entrega: ['Backend liberado pra responder HTTP', 'Workers escaláveis independentes', 'Logs separados por responsabilidade'],
    observacoes: ['Custo: ~$13/mês a mais (1 App Service B1).', 'Reversível: basta tirar a env var.'],
  },
  {
    id: 'fase1',
    nome: 'Fase 1 — Espinha do messaging-service',
    tag: 'Polly · ~2 semanas',
    resumo: 'Polly deploya em prod com multi-tenancy + endpoints inbound.',
    variante: 'warn',
    ondeMora: 'messaging-service (repo da Polly)',
    oQueFaz: 'Deploy do messaging-service em staging+prod. Tabela `tenant_providers` (1 WABA, 1 Twilio, 1 IG por cliente). Endpoints `/webhooks/whatsapp` etc. recebendo da Meta. Cria tópicos `messaging.send/status/inbound` no Service Bus Premium.',
    recebeDe: ['Comprometimento da Polly + alocação de tempo'],
    entrega: ['messaging-service em prod sem usuário', 'Service Bus Premium provisionado', 'Tópicos criados'],
    observacoes: ['Nada do Genesis muda nessa fase. Coisa é da Polly.'],
  },
  {
    id: 'fase2',
    nome: 'Fase 2 — Genesis começa a publicar',
    tag: 'Você · ~1 semana',
    resumo: 'Genesis publica em messaging.send. Feature flag por tenant.',
    variante: 'purple',
    ondeMora: 'Genesis (mexer em backend + worker)',
    oQueFaz: 'Cria worker `status_updater` no Genesis. No `campanha_service.disparar`, em vez de chamar `MetaAPI`, publica em `messaging.send`. Adiciona feature flag por tenant: 1 cliente piloto usa messaging-service, resto continua direto.',
    recebeDe: ['Fase 1 concluída'],
    entrega: ['1 tenant rodando 100% via messaging-service', 'Métricas comparativas (latência, taxa de falha)'],
    observacoes: ['Reversível por feature flag. Se quebrar, desliga a flag e volta pro Meta direto.'],
  },
  {
    id: 'fase3',
    nome: 'Fase 3 — Migração total',
    tag: 'Você · ~2 semanas',
    resumo: 'Todos os tenants no messaging-service. Cordão cortado.',
    variante: 'crit',
    ondeMora: 'Genesis + messaging-service',
    oQueFaz: 'Tira feature flag (todos os tenants usam messaging-service). Webhook inbound passa a vir do tópico `messaging.inbound` (Inbound Worker substitui webhook_worker). Remove `MetaAPI` do Genesis. Remove `/webhooks/whatsapp` do Genesis. Genesis fica sem nenhuma dependência direta de provider.',
    recebeDe: ['Fase 2 estável por ~2 semanas'],
    entrega: ['Genesis 100% desacoplado de providers', 'Pronto pra escalar canal (SMS/IG) sem mexer no Genesis'],
    observacoes: ['Reversível com esforço médio (~2 dias) caso descubra algo crítico.'],
  },
  {
    id: 'fase4',
    nome: 'Fase 4 — Multi-canal',
    tag: 'Você + Polly · variável',
    resumo: 'Adiciona SMS (Twilio) e Instagram Direct.',
    variante: 'info',
    ondeMora: 'messaging-service + UI Genesis',
    oQueFaz: 'Polly implementa Twilio sender (já tem stub) + IG Graph sender. Genesis adiciona seletor de canal por contato/campanha no frontend. Decisão de canal vai no Dispatcher.',
    recebeDe: ['Fase 3 estável'],
    entrega: ['Genesis vira "ManyChat" multi-canal', 'Cobrança e Phoenix podem usar o mesmo messaging-service'],
  },
];

/* ===========================================================
 * FERRAMENTAS
 * =========================================================== */
export const ferramentas: Bloco[] = [
  {
    id: 'svelte',
    nome: 'SvelteKit / Svelte 5',
    tag: 'Frontend',
    resumo: 'Framework do frontend Genesis e deste roadmap.',
    variante: 'purple',
    ondeMora: 'Frontend (Genesis) e este site',
    oQueFaz: 'Framework reativo. Svelte 5 usa runes ($state, $derived, $effect) — sem stores externos. Compilação estática, sem virtual DOM, bundles pequenos.',
    recebeDe: ['Interação do usuário'],
    entrega: ['HTML+CSS+JS estáticos servidos pelo App Service ou Static Web App'],
  },
  {
    id: 'fastapi',
    nome: 'FastAPI',
    tag: 'Backend',
    resumo: 'Framework Python do backend Genesis e do messaging-service.',
    variante: 'purple',
    ondeMora: 'Backend Genesis (`genesisbackendd`) e messaging-service da Polly',
    oQueFaz: 'API HTTP async. Validação via Pydantic. Documentação OpenAPI automática (/docs). Lifespan pra subir workers no startup.',
    recebeDe: ['Frontend (HTTP)', 'Webhooks externos (Meta, etc.)'],
    entrega: ['JSON responses', 'Mensagens pro Service Bus'],
  },
  {
    id: 'sb',
    nome: 'Azure Service Bus Premium',
    tag: 'Mensageria',
    resumo: 'Backbone de filas/topics do ecossistema.',
    variante: 'purple',
    ondeMora: 'Azure · namespace Service Bus dedicado',
    oQueFaz: 'Filas (1 msg = 1 consumer) e Tópicos (pub/sub). Sessions (ordem por chave), DLQ nativa, scheduled messages, idempotency. Premium escala por MU (~$500/mês cada).',
    recebeDe: ['Publishers (backend, workers, messaging-service)'],
    entrega: ['Consumers (workers diversos)'],
    observacoes: ['Premium é caro mas necessário pra 500 clientes × 10k contatos.'],
  },
  {
    id: 'azure-sql',
    nome: 'Azure SQL Database',
    tag: 'Banco',
    resumo: 'Banco relacional gerenciado pela Microsoft.',
    variante: 'ok',
    ondeMora: 'Azure',
    oQueFaz: 'SQL Server PaaS. Backup automático, HA, scale up/down. Genesis usa 1 database (schema `genesis`). messaging-service vai ter o próprio database.',
    recebeDe: ['Conexões via aioodbc (Python async)'],
    entrega: ['Dados persistidos com multi-tenancy via `tenant_id`'],
  },
  {
    id: 'app-service',
    nome: 'Azure App Service',
    tag: 'Hospedagem',
    resumo: 'Onde os containers rodam.',
    variante: 'ok',
    ondeMora: 'Azure · plan `plan-tcc` · resource group `rg-webapp`',
    oQueFaz: 'PaaS pra containers Docker. Auto-scale, deploy slot, logs em Application Insights. Genesis usa pra: backend, frontend, worker-campanhas, e (vai usar pra) worker-webhooks, worker-status, worker-inbound.',
    recebeDe: ['Imagens Docker via GitHub Actions'],
    entrega: ['Endpoints HTTPS públicos e workers always-on'],
  },
  {
    id: 'static-web-apps',
    nome: 'Azure Static Web Apps',
    tag: 'Hospedagem estática',
    resumo: 'Onde este roadmap está rodando.',
    variante: 'info',
    ondeMora: 'Azure',
    oQueFaz: 'PaaS pra sites estáticos. Free tier, CDN global, HTTPS automático, deploy via GitHub Actions. Ideal pra docs/marketing/dashboards estáticos.',
    recebeDe: ['Build do Vite (`dist/`)'],
    entrega: ['Site estático com URL pública'],
  },
  {
    id: 'meta-tool',
    nome: 'Meta WhatsApp Cloud API',
    tag: 'Provider',
    resumo: 'API oficial da Meta pra WhatsApp Business.',
    variante: 'info',
    ondeMora: 'Externo',
    oQueFaz: 'Envia mensagens (template HSM fora da janela 24h, texto livre dentro). Recebe webhooks de inbound + status (sent/delivered/read). Cada cliente tem o próprio phone_number_id.',
    recebeDe: ['messaging-service (futuro)', 'Genesis (hoje, será substituído)'],
    entrega: ['Entrega ao celular + webhook callback'],
  },
  {
    id: 'twilio',
    nome: 'Twilio',
    tag: 'Provider · futuro',
    resumo: 'SMS (e potencialmente WhatsApp/Voice).',
    variante: 'ghost',
    ondeMora: 'Externo',
    oQueFaz: 'Envio de SMS via Messaging Service SID (sticky sender, STOP compliance, fallback). messaging-service da Polly já tem stub.',
    recebeDe: ['messaging-service (a partir da Fase 4)'],
    entrega: ['SMS no celular do destinatário'],
  },
  {
    id: 'ig',
    nome: 'Instagram Graph API',
    tag: 'Provider · futuro',
    resumo: 'Mensagens Direct do Instagram.',
    variante: 'ghost',
    ondeMora: 'Externo',
    oQueFaz: 'Envia/recebe Direct Messages via Graph API. Rate limit mais restritivo que WhatsApp. Conecta ao mesmo modelo de Conversa do Genesis (canal=instagram).',
    recebeDe: ['messaging-service (a partir da Fase 4)'],
    entrega: ['DM no Instagram do destinatário'],
  },
  {
    id: 'gh-actions',
    nome: 'GitHub Actions',
    tag: 'CI/CD',
    resumo: 'Pipeline de deploy. Único caminho permitido pra prod.',
    variante: 'ok',
    ondeMora: 'GitHub',
    oQueFaz: 'Build Docker + push pra Azure Container Registry + deploy via webapp-deploy. Workflows em `.github/workflows/`. Nunca usar zip deploy.',
    recebeDe: ['git push em branches específicos (main, accp)'],
    entrega: ['Imagem nova rodando no App Service'],
  },
];
