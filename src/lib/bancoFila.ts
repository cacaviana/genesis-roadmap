export interface QuemFazOQue {
  pergunta: string;
  resposta: 'banco' | 'fila' | 'ambos';
  porQue: string;
}

export const quemFazOQue: QuemFazOQue[] = [
  { pergunta: 'Qual o status atual da campanha X?',                    resposta: 'banco', porQue: 'Estado consultável a qualquer momento. Operador olha na UI.' },
  { pergunta: 'Quantas campanhas foram disparadas semana passada?',     resposta: 'banco', porQue: 'Relatório histórico. Só banco lembra.' },
  { pergunta: 'Mostre minha conversa com Maria (todas as msgs)',        resposta: 'banco', porQue: 'Histórico permanente. Fila já apagou.' },
  { pergunta: 'Disparar campanha agora',                                resposta: 'fila',  porQue: 'É TRABALHO a fazer. Worker vai consumir.' },
  { pergunta: 'Processar webhook que acabou de chegar',                 resposta: 'fila',  porQue: 'Trabalho transitório, 1 consumer faz e acabou.' },
  { pergunta: 'Avisar que a msg foi entregue (delivered)',              resposta: 'ambos', porQue: 'Fila (tópico) pra notificar interessados + Banco pra UI mostrar ✓✓.' },
  { pergunta: 'Quantos contatos tenho cadastrados?',                    resposta: 'banco', porQue: 'Estado. Pura consulta.' },
  { pergunta: 'Agendar campanha pra amanhã 9h',                         resposta: 'ambos', porQue: 'Banco guarda a config + Fila com ScheduledEnqueueTime executa no horário.' },
];

export interface Antipadrao {
  nome: string;
  oQueE: string;
  porQueRuim: string;
  ondeFazerCerto: string;
}

export const antipadroes: Antipadrao[] = [
  {
    nome: 'Salvar tudo em ambos os lugares',
    oQueE: 'Dev nervoso replica status em N lugares: banco + fila + cache. Cada transição faz UPDATE em 3 lugares.',
    porQueRuim: 'Sincronização vira pesadelo. Se 1 falha, fica inconsistente. Bug "olha no banco diz X, fila diz Y, cache diz Z".',
    ondeFazerCerto: '1 fonte de verdade por dado. Banco para estado, fila só carrega "ordem de trabalho" mínima (id + tipo).',
  },
  {
    nome: 'Tratar fila como banco temporário',
    oQueE: 'Querer "ler" mensagens da fila pra mostrar progresso. Tentar "voltar" mensagens já consumidas.',
    porQueRuim: 'Fila não é queryable. Não tem SELECT. Não tem rewind. Quando msg sai, sai. Você vai sofrer.',
    ondeFazerCerto: 'Quer ver "o que tá rolando agora"? Salva no banco enquanto processa. Use a fila só pra coordenar trabalho.',
  },
  {
    nome: 'complete_message em qualquer erro',
    oQueE: 'Worker captura exception genérica, loga, e chama complete_message no finally.',
    porQueRuim: 'Msg some da fila pra sempre. DLQ nunca recebe nada. Bug "envenenado" perde a evidência.',
    ondeFazerCerto: 'Diferencia erro esperado (complete) de inesperado (abandon → broker retenta → após 10 tentativas, DLQ automático).',
  },
  {
    nome: 'Segurar transação enquanto chama API externa',
    oQueE: 'BEGIN TRANSACTION → SELECT FOR UPDATE destinatário → chama Meta API → UPDATE → COMMIT.',
    porQueRuim: 'Lock no banco fica aberto enquanto espera HTTP da Meta. Outros workers travam. Deadlock fácil em N consumers.',
    ondeFazerCerto: 'Transações curtas. Chama Meta SEM lock. Depois abre transação só pra UPDATE final.',
  },
];

export interface Estado {
  nome: string;
  cor: 'ok' | 'warn' | 'crit' | 'info';
  oQueAcontece: string;
}

export const estadosMsg: Estado[] = [
  { nome: 'Active',  cor: 'info',  oQueAcontece: 'Msg gravada, esperando consumer pedir.' },
  { nome: 'Locked',  cor: 'warn',  oQueAcontece: 'Consumer pegou. Lock por 60s (default). Outros consumers NÃO veem.' },
  { nome: 'complete()', cor: 'ok',  oQueAcontece: '✅ Worker processou OK. Broker DELETA do storage.' },
  { nome: 'abandon()',  cor: 'info', oQueAcontece: '↩️ Worker falhou. Lock libera, msg volta pra Active. delivery_count++' },
  { nome: 'lock expira',cor: 'warn', oQueAcontece: '⏰ Worker travou e nem completou nem abandonou. Após 60s lock cai sozinho. Mesmo efeito de abandon.' },
  { nome: 'DLQ',     cor: 'crit',  oQueAcontece: '💀 delivery_count > 10. Broker move pra DLQ AUTOMATICAMENTE. Você investiga lá.' },
];

export interface RegistroBanco {
  tabela: string;
  oQue: string;
  exemploLinhas: string;
  quandoEscreve: string;
}

export const oQueGenesisGuarda: RegistroBanco[] = [
  {
    tabela: 'campanhas',
    oQue: 'Estado de cada campanha (1 linha = 1 campanha)',
    exemploLinhas: '~10 a 1.000 linhas por tenant',
    quandoEscreve: 'INSERT no criar. UPDATEs: na_fila → enviando → concluida (+ contadores enviadas/falhas)',
  },
  {
    tabela: 'campanha_destinatarios',
    oQue: 'Status individual por contato (1 linha = 1 contato numa campanha)',
    exemploLinhas: '1000+ por campanha',
    quandoEscreve: 'INSERT em batch ao montar destinatários. UPDATE status="enviado"/"falha" + wamid no envio',
  },
  {
    tabela: 'mensagens',
    oQue: 'Histórico permanente da conversa (in + out)',
    exemploLinhas: 'Cresce sem parar (todas msgs de todos contatos)',
    quandoEscreve: 'INSERT por msg saída (outbound) E por msg entrada (inbound webhook)',
  },
  {
    tabela: 'conversas',
    oQue: 'Resumo da conversa de cada contato (status, última msg, janela 24h)',
    exemploLinhas: '1 por contato com histórico',
    quandoEscreve: 'INSERT na 1ª msg. UPDATEs em status (aberta/nao_lida/fechada) e ultima_msg_entrada_at',
  },
];
