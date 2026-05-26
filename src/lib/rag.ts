import type { Bloco } from './types';

/**
 * "RAG" — arquitetura estado da arte do Neural Architect.
 *
 * Pipeline de 8 etapas: ingestão → chunking semântico → contextual generation →
 * embedding 3-large → Pinecone → hybrid retrieval → Cohere rerank → context injection.
 *
 * Princípios: sem LangChain, Python puro, chunks semânticos, multi-tenant nativo.
 * Doc completo: ai-teams/docs/RAG_ARCHITECTURE.md
 */
export const blocosRAG: Bloco[] = [
  // ============================================================
  // INGESTÃO + CHUNKING
  // ============================================================
  {
    id: 'rag-1-ingestao',
    nome: '① Ingestão',
    tag: 'PDF · MD · HTML · DOCX',
    resumo: 'Tudo normalizado pra markdown padronizado.',
    variante: 'info',
    ondeMora: 'backend/rag/ingestion.py',
    oQueFaz: 'Recebe upload (PDF, DOCX, MD, HTML, URL via Firecrawl). Converte tudo pra markdown puro. PDF via marker/pymupdf, DOCX via mammoth, HTML via Firecrawl. Garante que chunker downstream sempre vê estrutura confiável.',
    recebeDe: ['Upload do usuário', 'Crawl web (Firecrawl)'],
    entrega: ['Markdown padronizado pro chunker'],
  },
  {
    id: 'rag-2-chunking',
    nome: '② Chunking semântico',
    tag: 'markdown-aware',
    resumo: 'Corta por estrutura (## headers), não por chars.',
    variante: 'purple',
    ondeMora: 'backend/rag/chunker.py — Python puro, ~50 linhas',
    oQueFaz: 'Quebra texto por ## (h2) → ### (h3) → \\n\\n → sentença (em ordem). Cada chunk leva o CAMINHO HIERÁRQUICO ("H1 > H2 > H3:") + texto completo da seção. Tamanho alvo 800-1500 chars. Chunk órfão = retrieval ruim.',
    recebeDe: ['Markdown padronizado'],
    entrega: ['Chunks autocontidos pro contextual generation'],
    payloadEntrada: {
      titulo: 'Markdown de entrada',
      tipo: 'json',
      conteudo: `## Pós em Engenharia de Dados
### Engenharia de dados em cloud
Ementa: Estudo das plataformas (AWS, Azure, GCP)...

### Banco de dados avançados
Ementa: Sistemas objeto-relacional...`,
    },
    payloadSaida: {
      titulo: 'Chunks autocontidos',
      tipo: 'json',
      conteudo: `[
  "Pós em Engenharia de Dados > Engenharia de dados em cloud:
   Ementa: Estudo das plataformas (AWS, Azure, GCP)...",

  "Pós em Engenharia de Dados > Banco de dados avançados:
   Ementa: Sistemas objeto-relacional..."
]`,
    },
  },
  {
    id: 'rag-3-contextual',
    nome: '③ Contextual generation',
    tag: 'Anthropic 2024',
    resumo: 'gpt-4o-mini gera 1 frase de contexto pra cada chunk.',
    variante: 'purple',
    ondeMora: 'backend/rag/contextual.py',
    oQueFaz: 'Pra cada chunk, manda chunk + documento inteiro pra gpt-4o-mini gerar 1-2 frases situando ele. Adiciona contexto invisível antes do embedding. Resultado provado: -49% retrieval failure (Anthropic paper, set/2024).',
    recebeDe: ['Chunks do § 2'],
    entrega: ['Chunks enriquecidos pro embedder'],
    payloadSaida: {
      titulo: 'Chunk + contexto LLM-gerado',
      tipo: 'json',
      conteudo: `{
  "context": "Este chunk descreve o módulo 'Engenharia de dados em cloud' da Pós em Engenharia de Dados da IT Valley School, focado em pipelines com AWS, Azure e GCP.",
  "chunk_text": "Pós em Engenharia de Dados > Engenharia de dados em cloud:\\nEmenta: Estudo das plataformas (AWS, Azure, GCP)..."
}`,
    },
    observacoes: [
      'Custo: ~$1 por 100k tokens (com prompt caching). Pros 12 docs IT Valley = ~$0.30 one-time.',
      'Reduz failure rate de 5.7% pra 2.9% (Anthropic benchmark).',
      'Combinado com rerank: 5.7% → 1.9% (-67% combined).',
    ],
  },

  // ============================================================
  // EMBEDDING + STORAGE
  // ============================================================
  {
    id: 'rag-4-embedding',
    nome: '④ Embedding',
    tag: 'text-embedding-3-large',
    resumo: '3072 dimensões — estado da arte OpenAI.',
    variante: 'ok',
    ondeMora: 'backend/rag/embedder.py',
    oQueFaz: 'Manda cada chunk enriquecido pra OpenAI text-embedding-3-large. Retorna vetor de 3072 floats. MTEB score 64.59 (vs 60.99 do ada-002 legado, vs 62.26 do 3-small). Custo $0.13/1M tokens.',
    recebeDe: ['Chunks enriquecidos'],
    entrega: ['Vetores 3072-dim pro Pinecone'],
  },
  {
    id: 'rag-5-storage',
    nome: '⑤ Storage',
    tag: 'Pinecone serverless',
    resumo: 'Index neural-architect (3072 dim), namespace por tenant.',
    variante: 'ok',
    ondeMora: 'neural-architect-xb3w3p4.svc.aped-4627-b74a.pinecone.io',
    oQueFaz: 'Upsert dos vetores no Pinecone. Cada vetor tem id=tenant:agent:doc:chunk + metadata (text, context, header_path, source). NAMESPACE = tenant_id pra isolamento total entre clientes.',
    recebeDe: ['Vetores do embedder'],
    entrega: ['Pinecone serverless (us-east-1, AWS)'],
    observacoes: [
      'Index dedicado pro AI-Teams (não compartilhado com itvalleyschool legacy de 1536 dim)',
      'Free tier serverless: até 5 indexes, 100k vetores cada',
      'Multi-tenant via namespace — zero risco de vazamento entre clientes',
    ],
  },

  // ============================================================
  // RETRIEVAL + RE-RANKING + INJECTION
  // ============================================================
  {
    id: 'rag-6-retrieval',
    nome: '⑥ Retrieval híbrido',
    tag: 'vector + BM25',
    resumo: 'Vector busca semântica + BM25 busca palavra exata.',
    variante: 'warn',
    ondeMora: 'backend/rag/retrieval.py',
    oQueFaz: 'Quando agente faz pergunta: gera embedding da query (3-large) → busca top_k=30 no Pinecone (dense) + top_k=30 no BM25 sparse → Reciprocal Rank Fusion (RRF) combina os 2 rankings → retorna top 30 fundidos. Captura semântica (vector) + exatidão (BM25 pra nomes próprios como "Anhanguera", "MEC").',
    recebeDe: ['Pergunta do agente especialista'],
    entrega: ['30 candidatos pro re-ranker'],
  },
  {
    id: 'rag-7-rerank',
    nome: '⑦ Re-ranking',
    tag: 'Cohere rerank-3.5',
    resumo: 'Cross-encoder reordena os 30 candidatos pros 5 melhores.',
    variante: 'warn',
    ondeMora: 'backend/rag/reranker.py',
    oQueFaz: 'Manda (query + 30 chunks) pro Cohere rerank-3.5. Ele usa cross-encoder (modelo que olha query+chunk juntos, mais preciso que embedding similarity) e devolve top 5. Resultado: +30% NDCG@5 (vs só vector). Fallback: BGE-reranker-v2-m3 local (HuggingFace, grátis, mais lento).',
    recebeDe: ['30 candidatos do retrieval híbrido'],
    entrega: ['Top 5 chunks ordenados por relevância'],
    observacoes: [
      'Cohere free tier: 1000 requests/mês.',
      'Acima: $2 / 1k requests.',
      'Fallback local BGE-reranker-v2-m3 grátis se Cohere quota estourar.',
    ],
  },
  {
    id: 'rag-8-injection',
    nome: '⑧ Context injection',
    tag: 'no prompt do agente',
    resumo: 'Top 5 chunks injetados no prompt do gpt-5.',
    variante: 'ok',
    ondeMora: 'backend/rag/pipeline.py',
    oQueFaz: 'Monta prompt final com [FONTE N: arquivo — header] {chunk} pra cada um dos top 5. Agente especialista (gpt-5) lê o contexto + a pergunta + responde citando [FONTE N]. Cliente vê resposta detalhada com referências.',
    recebeDe: ['Top 5 do re-ranker'],
    entrega: ['Prompt final pro LLM do agente'],
    payloadSaida: {
      titulo: 'Prompt final entregue ao gpt-5',
      tipo: 'text',
      conteudo: `Você tem acesso aos seguintes trechos da base de conhecimento.
Use APENAS estas informações para responder. Cite as fontes ao final.

[FONTE 1: pos-eng-dados.md — Pós em Engenharia de Dados > Engenharia de dados em cloud]
Ementa: Estudo das plataformas de cloud (AWS, Azure, GCP)...

[FONTE 2: pos-eng-dados.md — Pós em Engenharia de Dados > Banco de dados avançados]
Ementa: Sistemas objeto-relacional...

[FONTE 3-5: ...]

---
Pergunta: Quais módulos tem a Pós em Engenharia de Dados?
Resposta (com citações [FONTE N]):`,
    },
  },

  // ============================================================
  // OBSERVABILIDADE
  // ============================================================
  {
    id: 'rag-9-metricas',
    nome: 'Métricas & observabilidade',
    tag: 'App Insights',
    resumo: 'Cada query loga latência, scores, custo.',
    variante: 'info',
    ondeMora: 'Application Insights · alertas Azure Monitor',
    oQueFaz: 'Loga rag_query_latency_p95, rag_top_1_score, rag_failure_rate, rag_cost_per_query_usd. Alvo: latência <500ms p95, top1 score >0.7, failure <3%, custo <$0.005/query. Alertas se quebrar threshold.',
    recebeDe: ['Pipeline RAG (cada query)'],
    entrega: ['Azure Monitor dashboards + alertas'],
    observacoes: [
      'Avaliação offline: tests/rag_golden_set.jsonl com pares (pergunta, resposta esperada, fontes esperadas)',
      'Run automatizado a cada PR (NDCG@5, MRR, recall@10)',
      'Failure rate alvo: <3% (vs RAG v1 broken: ~50%)',
    ],
  },
];
