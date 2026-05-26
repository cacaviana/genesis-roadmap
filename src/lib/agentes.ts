import type { Bloco } from './types';

/**
 * "Agentes IA" — arquitetura do Neural Architect integrado ao Genesis.
 *
 * Fluxo completo: cliente manda WhatsApp → Genesis decide se IA responde ou humano →
 * se IA, vai pro Neural Architect (orquestrador + agentes especialistas) → resposta
 * volta pro Genesis → cliente recebe via messaging-service.
 *
 * Status: backend + frontend deployados em Azure NoPROD (2026-05-26).
 *   Backend: https://app-ai-teams-backend-accp.azurewebsites.net
 *   Frontend: https://app-ai-teams-frontend-accp.azurewebsites.net
 */
export const blocosAgentes: Bloco[] = [
  // ============================================================
  // INPUT — cliente fala, Genesis decide se IA ou humano responde
  // ============================================================
  {
    id: 'cliente-wpp-ai',
    nome: 'Cliente WhatsApp',
    tag: 'Origem',
    resumo: 'Cliente manda mensagem (texto, áudio, imagem).',
    variante: 'info',
    ondeMora: 'WhatsApp do cliente',
    oQueFaz: 'Cliente envia pergunta/reclamação/dúvida via WhatsApp. Pode mandar texto, áudio (Whisper transcreve) ou imagem (GPT-5 Vision processa).',
    recebeDe: ['—'],
    entrega: ['Meta WhatsApp Cloud API'],
  },
  {
    id: 'genesis-decisao',
    nome: '🎯 Genesis — Decisão IA vs Humano',
    tag: 'Conversa.modo',
    resumo: 'Cada conversa tem um modo: "ia" ou "humano". Botão na UI alterna.',
    variante: 'ok',
    ondeMora: 'genesisbackendd · inbound_processor_worker',
    oQueFaz: 'Quando inbound chega, lê conversa.modo. modo=ia → encaminha pro Neural Architect. modo=humano → só salva na timeline e operador responde. Botão 🤖 "Ativar IA" no chat liga; botão 👤 "Re-pegar" desliga.',
    recebeDe: ['SB topic messaging.inbound (do messaging-service)'],
    entrega: ['Neural Architect API (modo=ia)', 'WebSocket pro frontend (modo=humano)'],
    observacoes: [
      '🔜 A FAZER: campo `modo` em conversas (default "humano") + 2 botões na UI do chat',
      '🔜 Quando IA responde, marca mensagem como `direcao=saida` + `enviado_por=ia`',
      '🔜 Operador pode interromper a qualquer momento clicando em "Re-pegar"',
    ],
  },

  // ============================================================
  // NEURAL ARCHITECT — orquestrador + agentes
  // ============================================================
  {
    id: 'na-api',
    nome: 'Neural Architect API',
    tag: 'POST /api/chat/mensagem',
    resumo: 'Endpoint multipart unificado — texto + arquivos em 1 chamada HTTP.',
    variante: 'purple',
    ondeMora: 'Azure App Service · `app-ai-teams-backend-accp`',
    oQueFaz: 'Recebe POST multipart com texto + arquivos (imagem/áudio/PDF). Auth via JWT ou API Token (na_live_...). Áudio é transcrito por Whisper antes de chegar ao orquestrador. Repassa pra ChatService → executar_com_grafo.',
    recebeDe: ['Genesis (HTTP com tenant_id + contexto cliente)'],
    entrega: ['Orquestrador (Pydantic AI Agent)'],
    payloadEntrada: {
      titulo: 'Request multipart do Genesis',
      tipo: 'http',
      conteudo: `POST /api/chat/mensagem
Authorization: Bearer na_live_<token-genesis>
Content-Type: multipart/form-data

agente_id=1 (orquestrador do time)
conversa_id=42 (se existente)
mensagem="Cliente: não consigo acessar a aula 5"
arquivos=@audio.ogg (opcional)

[CONTEXTO_CLIENTE injetado pelo Genesis]
- Nome: João Silva
- Comprou: Curso Excel em 2026-04-12
- Plano: Premium 1 ano (expira 2027-04-12)
- Conversa anterior: reclamou de login (resolvido)`,
    },
    payloadSaida: {
      titulo: 'Response com caminho de delegação',
      tipo: 'json',
      conteudo: `{
  "resposta": "Olá João! Sobre a aula 5 do seu curso de Excel...",
  "agente_nome": "agente_suporte_tecnico",
  "caminho_execucao": [
    "Orquestrador de Atendimento",
    "Agente Suporte Técnico"
  ],
  "ferramentas_usadas": [...],
  "anexos": []
}`,
    },
  },
  {
    id: 'na-orquestrador',
    nome: '🧠 Orquestrador (root agent)',
    tag: 'gpt-5 · system_prompt: ROUTER',
    resumo: 'NÃO responde direto. Analisa e delega pra UM agente especialista.',
    variante: 'purple',
    ondeMora: 'Pydantic AI Agent · system_prompt = ROUTER_INSTRUCTION + base_prompt',
    oQueFaz: 'Recebe pergunta + contexto. System prompt brutal força ele a ser ROTEADOR (não executor). Olha o grafo de delegação (nodes_json/edges_json do fluxo) e chama UMA tool function → outro Agent é instanciado recursivamente.',
    recebeDe: ['Neural Architect API (mensagem + contexto)'],
    entrega: ['Sub-agente apropriado (via tool call)'],
    observacoes: [
      'System prompt: "Voce e um ROTEADOR. Delegue, nao responda direto. Em follow-ups, delegue ao mesmo sub-agente."',
      'Profundidade máxima de delegação: 10',
      'Cache de tools chamadas por depth (evita loop)',
      '`caminho_execucao` é construído em tempo real ([orquestrador, sub-agente, neto, ...])',
    ],
  },
  {
    id: 'agente-suporte',
    nome: 'Agente Suporte Técnico',
    tag: 'gpt-5 · folha · com RAG',
    resumo: 'Especialista em resolver problemas técnicos. Acessa base de conhecimento.',
    variante: 'ok',
    ondeMora: 'Pydantic AI Agent registrado como tool no orquestrador',
    oQueFaz: 'Recebe pergunta delegada. Consulta RAG (manuais, FAQ, tickets resolvidos). Responde com solução. Se não conseguir, retorna texto pro orquestrador que pode delegar pra outro ou escalar humano.',
    recebeDe: ['Orquestrador (via tool call delegação)'],
    entrega: ['RAG Mongo Vector Search (consulta semântica)', 'Resposta texto pro orquestrador'],
  },
  {
    id: 'agente-vendas',
    nome: 'Agente Vendas',
    tag: 'gpt-5 · folha',
    resumo: 'Especialista em conversão. Sabe sobre os produtos e planos.',
    variante: 'ok',
    ondeMora: 'Pydantic AI Agent',
    oQueFaz: 'Quando cliente pergunta sobre preço, planos, upsell, ele responde. Conhece o catálogo (Hotmart/Voomp via contexto).',
    recebeDe: ['Orquestrador (via tool call)'],
    entrega: ['Resposta texto'],
  },
  {
    id: 'agente-imagem',
    nome: 'Agente Mídia (DALL-E)',
    tag: 'gpt-5 · folha · tool image_gen',
    resumo: 'Gera imagens via DALL-E quando cliente pede.',
    variante: 'warn',
    ondeMora: 'Pydantic AI Agent · tools_habilitadas=[image_gen]',
    oQueFaz: 'Cliente: "Me mostra um exemplo de planilha de orçamento". Orquestrador delega pra ele. Ele chama tool image_gen → DALL-E → salva em /api/anexos/{tenant}/uuid.png → retorna marker [MIDIA_GERADA] pro orquestrador.',
    recebeDe: ['Orquestrador'],
    entrega: ['DALL-E (OpenAI)', 'Filesystem /uploads', 'Marker pro pai'],
  },
  {
    id: 'rag-mongo',
    nome: 'RAG · Mongo Vector Search',
    tag: 'Atlas · embeddings',
    resumo: 'Base de conhecimento que aprende com casos resolvidos.',
    variante: 'info',
    ondeMora: 'Mongo Atlas · cluster1.x6tirkw.mongodb.net/ai_teams',
    oQueFaz: 'Documentos (manuais, FAQ, conversas históricas resolvidas) são chunkados + embeddados com OpenAI ada-002 + indexados. Agente consulta via similaridade semântica. VECTOR_STORE_BACKEND=auto cai pra Mongo quando não tem Pinecone.',
    recebeDe: ['Upload de documentos (Carlos, manualmente, via /api/documentos)', 'Conversas históricas (futuro)'],
    entrega: ['Top-K resultados por similaridade pro agente'],
  },

  // ============================================================
  // OUTPUT — resposta volta pro Genesis, vai pro cliente
  // ============================================================
  {
    id: 'genesis-saida-ia',
    nome: 'Genesis · Recebe resposta IA',
    tag: 'Modo IA → envio',
    resumo: 'Pega resposta do Neural Architect e envia ao cliente.',
    variante: 'ok',
    ondeMora: 'genesisbackendd · ChatService.processar_resposta_ia',
    oQueFaz: 'Recebe `{resposta, agente_nome, caminho_execucao, anexos}`. Cria mensagem `direcao=saida` `enviado_por=ia` `agente=...`. Publica em SB messaging.send → messaging-service envia via Meta. Anexos (imagem gerada) também enviados.',
    recebeDe: ['Neural Architect (HTTP response)'],
    entrega: ['SB queue messaging.send', 'INSERT mensagens (registro)', 'WS broadcast UI'],
    observacoes: [
      '🔜 A FAZER: endpoint genesisbackendd que faz POST pra Neural Architect',
      '🔜 Salvar `caminho_execucao` em metadata pra debug',
      '🔜 Se resposta contém marker [ESCALAR_HUMANO], muda conversa.modo=humano + notifica operador',
    ],
  },
  {
    id: 'msg-service-saida-ai',
    nome: 'messaging-service · envia',
    tag: 'já existe (sessão passada)',
    resumo: 'Pega da fila messaging.send → POST Meta API → cliente recebe.',
    variante: 'ok',
    ondeMora: 'messaging-service-itvalley-prod',
    oQueFaz: 'Worker consome messaging.send (texto ou template). Envia via Graph API. Publica messaging.status (sent/delivered/read) pro Genesis atualizar UI.',
    recebeDe: ['SB queue messaging.send'],
    entrega: ['Meta WhatsApp Cloud API'],
  },
  {
    id: 'cliente-resposta',
    nome: 'Cliente recebe',
    tag: 'WhatsApp',
    resumo: 'Cliente vê a resposta no WhatsApp dele — sem saber se foi IA ou humano.',
    variante: 'info',
    ondeMora: 'WhatsApp do cliente',
    oQueFaz: 'Resposta chega normalmente. Cliente pode responder, e ciclo recomeça. Se IA escalou, próxima msg cai no operador humano.',
    recebeDe: ['Meta WhatsApp Cloud API'],
    entrega: ['Cliente lê + responde (próximo ciclo)'],
  },
];
