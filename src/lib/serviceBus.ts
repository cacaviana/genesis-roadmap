export interface Propriedade {
  id: string;
  nome: string;
  oQueE: string;
  exemplo: string;
  quandoUsa: string;
  tag: 'auto' | 'voce-seta' | 'pode-setar';
}

export const propriedades: Propriedade[] = [
  {
    id: 'message-id',
    nome: 'MessageId',
    oQueE: 'Identificador único da mensagem. UUID gerado automático ou definido por você.',
    exemplo: '"a3f8c2d1-9b4e-4a8c-..."',
    quandoUsa: 'Pra deduplicação: se você ativar duplicate detection, o SB rejeita uma segunda msg com o mesmo ID dentro de uma janela de tempo.',
    tag: 'pode-setar',
  },
  {
    id: 'enqueued-time',
    nome: 'EnqueuedTimeUtc',
    oQueE: 'Timestamp UTC de quando a mensagem entrou na fila.',
    exemplo: '"2026-05-21T20:14:32Z"',
    quandoUsa: 'Saber há quanto tempo uma msg está parada esperando consumer. Útil pra detectar fila travada.',
    tag: 'auto',
  },
  {
    id: 'delivery-count',
    nome: 'DeliveryCount',
    oQueE: 'Quantas vezes a msg foi entregue. Começa em 1. Incrementa a cada redelivery.',
    exemplo: '3',
    quandoUsa: 'Quando bate MaxDeliveryCount (default 10), msg vai pra DLQ automaticamente. Evita loop infinito de mensagem envenenada.',
    tag: 'auto',
  },
  {
    id: 'sequence',
    nome: 'SequenceNumber',
    oQueE: 'Número sequencial único atribuído pelo broker. Nunca repete, sempre cresce.',
    exemplo: '12345678901',
    quandoUsa: 'Operações de "defer" (adiar processamento por X tempo). Também garante ordem dentro da fila.',
    tag: 'auto',
  },
  {
    id: 'ttl',
    nome: 'TimeToLive',
    oQueE: 'Quanto tempo a msg sobrevive na fila antes de expirar. Default: 14 dias.',
    exemplo: 'TimedSpan(hours=24)',
    quandoUsa: 'Mensagens que perdem o sentido depois de X tempo (ex: notificação flash). Expirou → DLQ ou some.',
    tag: 'pode-setar',
  },
  {
    id: 'scheduled',
    nome: 'ScheduledEnqueueTimeUtc',
    oQueE: 'Você manda agora, mas a msg só fica VISÍVEL pros consumers no horário definido.',
    exemplo: '"2026-05-22T08:00:00Z"',
    quandoUsa: 'Agendar campanhas. "Manda essa msg amanhã às 8h." O broker segura, libera no horário.',
    tag: 'voce-seta',
  },
  {
    id: 'session-id',
    nome: 'SessionId',
    oQueE: 'Chave de agrupamento. Garante que msgs com mesmo SessionId vão pro MESMO consumer em ORDEM.',
    exemplo: '"tenant-42"',
    quandoUsa: 'Preservar ordem dentro de um grupo. Ex: todas msgs da campanha X processadas em sequência pelo mesmo worker.',
    tag: 'voce-seta',
  },
  {
    id: 'correlation-id',
    nome: 'CorrelationId',
    oQueE: 'Conecta resposta a uma requisição original. Padrão request-reply.',
    exemplo: '"req-abc123"',
    quandoUsa: 'Quando você manda "faz X" e espera "X feito" de volta. Permite parear a resposta à pergunta correta.',
    tag: 'voce-seta',
  },
  {
    id: 'content-type',
    nome: 'ContentType',
    oQueE: 'Header descritivo do formato do body. SB ignora, consumer usa pra parsear.',
    exemplo: '"application/json"',
    quandoUsa: 'Boa prática sempre setar. Consumer sabe se desserializa como JSON, XML, protobuf, etc.',
    tag: 'voce-seta',
  },
  {
    id: 'subject',
    nome: 'Subject / Label',
    oQueE: 'Assunto curto da mensagem. Visível sem abrir o body.',
    exemplo: '"whatsapp_inbound"',
    quandoUsa: 'Filtros simples em subscriptions (Topic). Ex: "essa subscription só recebe se Subject = whatsapp".',
    tag: 'voce-seta',
  },
];

export interface Naming {
  ruim: string;
  bom: string;
  porQue: string;
}

export const naming: Naming[] = [
  {
    ruim: 'genesis-campanhas',
    bom: 'campanhas.disparo',
    porQue: 'O nome deve descrever o DOMÍNIO + AÇÃO, não o sistema de origem. Se amanhã outro app publicar nessa fila, o nome continua fazendo sentido.',
  },
  {
    ruim: 'genesis-webhooks',
    bom: 'messaging.inbound',
    porQue: 'Webhook é como chegou. O que importa pro consumer é o QUE chegou (mensagem inbound), não o caminho até aqui.',
  },
  {
    ruim: 'whatsapp-messages',
    bom: 'messaging.send',
    porQue: 'Genérico por canal. Se virar multi-canal (SMS, IG), o nome aguenta sem renomear. Aponta pro DOMÍNIO (messaging), não pro provider (whatsapp).',
  },
  {
    ruim: 'fila-1',
    bom: 'orders.created',
    porQue: 'Lê o nome e entende o evento sem abrir doc. Padrão: substantivo (entidade) + verbo no particípio (evento já aconteceu).',
  },
];

export interface EstadoFila {
  nome: string;
  tipo: 'queue' | 'topic';
  ativas: number;
  dlq: number;
  observacao?: string;
}

export const estadoGenesis = {
  namespace: 'genesisitvalley',
  tier: 'Standard',
  region: 'eastus',
  filas: [
    { nome: 'genesis-campanhas', tipo: 'queue' as const, ativas: 0, dlq: 0 },
    { nome: 'genesis-webhooks',  tipo: 'queue' as const, ativas: 0, dlq: 0 },
    { nome: 'whatsapp-messages', tipo: 'queue' as const, ativas: 0, dlq: 1, observacao: 'Legacy/órfã — 1 msg presa na DLQ, investigar.' },
    { nome: 'genesis-events',    tipo: 'topic' as const, ativas: 0, dlq: 0, observacao: 'Topic com 1 subscription. Eventos canônicos pra Polly.' },
  ],
};
