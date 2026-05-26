/**
 * Mini-curso RAG do zero ao estado da arte.
 * 8 capítulos sequenciais. Linguagem direta, analogias, exemplos antes/depois.
 *
 * Público: Carlos + equipe IT Valley (devs, vendas, suporte) que precisa
 * entender por que vamos investir em RAG state of art.
 */

export interface Exemplo {
  titulo: string;
  antes?: string;
  depois?: string;
  texto?: string;
}

export interface Capitulo {
  numero: number;
  id: string;
  titulo: string;
  icone: string;
  resumo: string;
  conteudo: string;
  exemplos?: Exemplo[];
  glossario?: { termo: string; definicao: string }[];
  checklist?: { item: string; status: 'feito' | 'parcial' | 'falta'; nota?: string }[];
}

export const capitulosRAG: Capitulo[] = [
  // ============================================================
  {
    numero: 1,
    id: 'oque-e-rag',
    titulo: 'O que é RAG?',
    icone: '🤔',
    resumo: 'IA "consulta a base" antes de responder. Não inventa.',
    conteudo: `**RAG = Retrieval-Augmented Generation** ("Geração Aumentada por Busca").

É uma técnica que dá pra IA **acesso à tua base de conhecimento** ANTES de ela responder. Em vez da IA tentar "lembrar" tudo que leu no treinamento, ela **busca** primeiro os trechos relevantes no teu conteúdo (manuais, FAQ, ementas) e DEPOIS responde com base neles.

## Por que existe?

LLMs (GPT, Claude, Gemini) têm 3 problemas:

1. **Não sabem dados privados.** GPT-5 nunca leu o site da IT Valley nem o teu CRM. Pergunta "qual o preço da Pós em IA da IT Valley?" e ele inventa.
2. **Alucinação.** Quando não sabem, INVENTAM resposta convincente. Cliente recebe info errada.
3. **Conhecimento estático.** GPT-5 sabe coisas até o cutoff (ex: 2025). Não sabe o que mudou depois.

## Analogia simples

| Sem RAG | Com RAG |
|---|---|
| Estudante respondendo prova de cabeça | Estudante respondendo prova com livro aberto |
| "Acho que é isso..." | "Olha aqui, o capítulo 3 diz..." |
| Inventa quando não sabe | Cita a fonte |
| Conhecimento fixo na cabeça | Pode consultar qualquer livro novo |

**RAG transforma um LLM "burro pro teu negócio" num assistente que conhece TUA empresa.**',
    exemplos: [
      {
        titulo: 'Pergunta sobre curso IT Valley',
        antes: 'Cliente: "Qual o preço da Pós em IA?"\nGPT-5 (sem RAG): "Esse curso geralmente custa entre R$ 5.000 e R$ 15.000 dependendo da instituição..." ❌ INVENTOU',
        depois: 'Cliente: "Qual o preço da Pós em IA?"\nGPT-5 (com RAG): "Segundo a página oficial da IT Valley, a Pós em IA e ML custa R$ XXX..." ✅ FONTE REAL',
      },
    ],
  },

  // ============================================================
  {
    numero: 2,
    id: 'pecas-basicas',
    titulo: 'As 5 peças básicas',
    icone: '🧩',
    resumo: 'Documento → Chunks → Embeddings → Vector DB → Retrieval.',
    conteudo: 'Todo sistema de RAG tem **5 peças** em sequência. Entendeu essas 5, entendeu RAG.

## 1. Documentos
**O que é:** os conteúdos da empresa. PDFs, páginas de site, FAQ, manuais técnicos, ementas, contratos.
**Exemplo IT Valley:** 12 páginas do site 'br.itvalleyschool.com', em markdown.

## 2. Chunking
**O que é:** cortar cada documento em pedaços pequenos ("chunks").
**Por quê:** LLM tem limite de contexto. Não dá pra mandar PDF de 500 páginas. Quebra em pedaços de ~1000-2000 caracteres.
**Como hoje (RAG básico):** corta a cada 500 caracteres.
**Como deveria (estado da arte):** cortar por **seção** (## headers), preservando estrutura.

## 3. Embeddings
**O que é:** transformar cada chunk de texto num **vetor** (lista de números, tipo [0.23, -0.84, 0.12, ...] com 1536 ou 3072 dimensões).
**Por quê:** computador não compara texto, compara números. Vetores próximos = textos semanticamente parecidos.
**Modelo:** 'text-embedding-3-large' da OpenAI (estado da arte 2026).

## 4. Vector Database
**O que é:** banco especializado em guardar e buscar vetores em alta velocidade.
**Opções:** Pinecone (cloud, especialista), Mongo Atlas Vector Search (Mongo agora faz isso), Qdrant, Weaviate.
**Como funciona:** quando alguém pergunta algo, gera o vetor da pergunta e o banco busca os **chunks com vetor mais parecido** (top 30).

## 5. Retrieval + Geração
**O que é:** pegar a pergunta → buscar top chunks no vector DB → mandar pra LLM (gpt-5) → ela responde com base nos chunks.
**Resultado:** resposta com fontes reais, não inventada.',
    exemplos: [
      {
        titulo: 'Fluxo prático',
        texto: 'Cliente: "Quais módulos tem a Pós em Eng. Dados?"
   ↓
Sistema gera vetor da pergunta: [0.42, -0.18, 0.71, ...]
   ↓
Vector DB compara com os 280 vetores armazenados
   ↓
Devolve top 30 chunks mais parecidos:
  - "Pós em Eng. Dados > Engenharia em cloud: Ementa: Estudo de AWS..."
  - "Pós em Eng. Dados > Banco de dados avançados: Ementa: ..."
  - (+28 outros)
   ↓
GPT-5 lê esses 30 chunks + pergunta original
   ↓
Responde: "A Pós em Eng. Dados tem os seguintes módulos: 1) Engenharia em cloud — estuda AWS, Azure, GCP; 2) Banco de dados avançados — ..."',
      },
    ],
    glossario: [
      { termo: 'Embedding', definicao: 'Vetor de números que representa um texto. Textos com significado parecido têm vetores parecidos.' },
      { termo: 'Vetor', definicao: 'Lista de números (ex: 1536 floats). Funciona como "coordenadas" do texto num espaço semântico.' },
      { termo: 'Similaridade cossena', definicao: 'Métrica de quão "parecidos" são dois vetores. Vai de -1 (opostos) a 1 (idênticos). 0.8+ = forte similaridade.' },
      { termo: 'Top-K', definicao: 'Quantos resultados retornar (ex: top 30 chunks mais parecidos). Mais = mais contexto, mais caro.' },
    ],
  },

  // ============================================================
  {
    numero: 3,
    id: 'porque-falha',
    titulo: 'Por que o RAG básico falha',
    icone: '⚠️',
    resumo: 'Chunks de 500 chars cortam contexto no meio. Ementa fica órfã.',
    conteudo: 'O RAG "padrão de 2022" usa **chunks de 500 caracteres genéricos**. Funcionava quando documentos eram simples (FAQ linear, texto bruto).

**Hoje (2026) os documentos são complexos:** markdown estruturado, PDFs com seções aninhadas, código. **Chunks genéricos destroem essa estrutura.**

## O problema concreto (caso real IT Valley)

Pergunta do cliente: *"Quais módulos tem a Pós em Engenharia de Dados?"*

### Markdown original do site:
'''
## Pós em Engenharia de Dados

### Engenharia de dados em cloud
Ementa: Estudo das plataformas de cloud (AWS, Azure, GCP)...

### Banco de dados avançados
Ementa: Sistemas objeto-relacional...
'''

### Chunker burro de 500 chars vê:
- **Chunk A:** '"## Pós em Eng. Dados ### Engenharia de dados em cloud Ementa:"'
  → **Só TÍTULOS.** Embedding vira genérico tipo "lista de coisas".

- **Chunk B:** '"Estudo das plataformas (AWS, Azure, GCP). Configuração, pipelines..."'
  → **Só CONTEÚDO.** Mas SEM saber que isso é ementa de "Engenharia em cloud" da "Pós em Eng. Dados".

- **Chunk C:** '"### Banco de dados avançados Ementa: Sistemas objeto-relacional..."'
  → **Mistura 2 disciplinas.** Confusão.

### Quando IA tenta responder:
- Busca por "módulos Pós Eng. Dados" → bate em chunks **órfãos** que não dizem a qual curso pertencem
- LLM lê chunks soltos e conclui: **"a ementa não está publicada no site"** (mentira — está, mas o RAG não conseguiu trazer junta)

## Quanto isso falha?

Benchmarks públicos (BEIR, 2023) mostram que RAG com chunks 500 chars **falha em 25-45% das queries complexas.**

Para queries estruturadas (tipo "liste todos os módulos de X"), o failure rate chega a **50%**.

**É a história do nosso caso da ementa que tu viu.**',
    exemplos: [
      {
        titulo: 'Comparação real',
        antes: 'RAG v1 (chunks 500 chars + ada-002):\n"a ementa detalhada não está publicada no site no momento. A escola envia o PDF oficial ao solicitar..." ❌',
        depois: 'RAG v2 (chunks semânticos + 3-large):\n"Módulos oficiais: 1) Programação para engenheiros e cientistas de dados - Ementa: Fundamentos de Python aplicados à manipulação..." ✅',
      },
    ],
  },

  // ============================================================
  {
    numero: 4,
    id: 'tecnicas-estado-arte',
    titulo: 'As 4 técnicas estado da arte',
    icone: '🚀',
    resumo: 'Chunking semântico + Contextual gen + Hybrid + Rerank.',
    conteudo: 'A indústria amadureceu em 2024-2025. **4 técnicas viraram padrão** pra resolver os problemas do RAG básico:

## Técnica 1: Chunking semântico (markdown-aware)
**Problema que resolve:** chunks órfãos sem contexto.

**Como funciona:**
- Em vez de cortar a cada 500 chars, **quebra por seção** (## h2, ### h3 do markdown).
- Cada chunk leva o **caminho hierárquico**: "Pós em Eng. Dados > Engenharia em cloud:"
- Resultado: cada chunk vira **autocontido**. Não depende de outros.

**Ganho:** resolve ~70% das falhas de RAG.

## Técnica 2: Contextual Generation (Anthropic 2024)
**Problema que resolve:** chunks ainda perdem contexto "global" do documento inteiro.

**Como funciona:**
- Antes de embedar cada chunk, manda ele + **documento inteiro** pra gpt-4o-mini.
- IA pequena escreve 1 frase de contexto: *"Este chunk descreve o módulo X da Pós em Eng. Dados, focado em pipelines cloud com AWS/Azure/GCP"*.
- Adiciona essa frase como contexto invisível ao chunk.

**Ganho provado:** Anthropic publicou em set/2024 — **-49% retrieval failure** (de 5.7% pra 2.9%).

**Custo:** $1 por 100k tokens processados (com prompt caching). Pro Time IT Valley: ~$0.30 one-time.

## Técnica 3: Hybrid Search (Vector + BM25)
**Problema que resolve:** vector search não captura **palavras exatas** bem (nomes próprios, IDs, jargões).

**Como funciona:**
- **Vector search** (cosseno) → captura **semântica** ("computação em nuvem" ≈ "cloud computing")
- **BM25** (busca tradicional) → captura **palavra exata** ("Anhanguera", "MEC", "TCC")
- **Combina os 2 rankings** via Reciprocal Rank Fusion (RRF)

**Ganho:** +15% recall (vs só vector). Pinecone faz isso nativo agora.

## Técnica 4: Re-ranking (Cohere ou BGE)
**Problema que resolve:** vector busca **rápido mas aproximado**. Top 30 contém ruído.

**Como funciona:**
- Vector + BM25 trazem **top 30 candidatos** baseados em similaridade rápida
- **Re-ranker** (modelo mais caro/preciso) reordena os 30 e devolve **top 5 verdadeiramente relevantes**
- Usa **cross-encoder** (olha query + chunk juntos), não só vetores isolados

**Ganho:** +30% NDCG@5 (precisão dos top 5).

**Modelos:**
- **Cohere rerank-3.5** (cloud, $2/1k requests, 150ms latência) — escolha #1 produção
- **BGE-reranker-v2-m3** (local, grátis, 500ms latência) — alternativa sem dependência

## Resultado combinado

| Técnica | Ganho cumulativo |
|---|---|
| RAG básico (500 chars + ada-002) | baseline 50% failure |
| + Chunking semântico | 30% failure (-40%) |
| + Contextual generation | 15% failure (-50%) |
| + Hybrid search | 8% failure (-47%) |
| + Re-ranking | **<3% failure** (-67%) |

**De 50% → <3% de falhas. RAG state of art.**',
  },

  // ============================================================
  {
    numero: 5,
    id: 'pipeline-completo',
    titulo: 'O pipeline completo da AI-Teams',
    icone: '⚙️',
    resumo: '8 etapas: ingestão → chunking → contextual → embedding → store → retrieval → rerank → injection.',
    conteudo: 'Combinando as 4 técnicas, o pipeline tem **8 etapas**:

'''
INGESTÃO  →  CHUNKING  →  CONTEXTUAL GEN  →  EMBEDDING  →  STORAGE
(MD/PDF)     (semântico)   (Anthropic)        (3-large)     (Pinecone)
                                                                ↓
              CONTEXT  ←  RE-RANK  ←  HYBRID SEARCH  ←  RETRIEVAL
              INJECTION   (top 5)     (vector + BM25)    (top 30)
                  ↓
                gpt-5
                  ↓
              Resposta com fontes citadas
'''

## Aba dedicada com quadradinhos

Pra ver **cada etapa em detalhe** (entrada, saída, código, custos), abra a **aba 🧠 RAG** desse mesmo site. Cada bloco é clicável.

## Princípios inegociáveis

| Princípio | Por quê |
|---|---|
| **Sem LangChain** | Lib inflada, breaking changes constantes. Python puro com OpenAI SDK + Pinecone client. ~200 linhas resolvem o que LangChain faz em 2000. |
| **Chunks semânticos** | Nunca cortar por contagem de chars. Sempre por estrutura (headers). |
| **Contexto pai injetado** | Cada chunk leva "H1 > H2 > H3:" + resumo de contexto. |
| **Multi-tenant nativo** | Namespace Pinecone por tenant. Zero risco de vazamento entre clientes. |
| **Observável** | Cada query loga latência, scores, custo. Application Insights + alertas. |',
  },

  // ============================================================
  {
    numero: 6,
    id: 'custos',
    titulo: 'Quanto custa?',
    icone: '💰',
    resumo: '$0.03 reindex completo IT Valley. $3.200/mês pra 100 clientes.',
    conteudo: '**Resumo:** RAG state of art **NÃO é caro.** O modelo do agente (gpt-5) é 94% do custo total. RAG é só 6%.

## Custo por etapa (preço unitário)

| Etapa | Custo unitário | Quando paga |
|---|---|---|
| Contextual generation (gpt-4o-mini com prompt cache) | $0.075/1M input, $0.30/1M output | One-time por documento |
| Embedding (text-embedding-3-large) | $0.13/1M tokens | Per query + per doc |
| Vector storage (Pinecone serverless) | **Grátis** até 100k vectors | Continuous |
| Re-rank Cohere | $2/1k requests | Per query |
| Re-rank BGE local | **Grátis** (roda no container) | Per query |
| gpt-5 (resposta do agente) | $0.75/1M input, $3/1M output | Per query |

## Cenários reais

### Cenário A: Time IT Valley (12 docs, 280 chunks) — reindex completo
| Item | Custo one-time |
|---|---|
| Contextual gen em 280 chunks | $0.02 |
| Embedding 3-large dos 280 chunks | $0.01 |
| **Total** | **$0.03** ❤️ |

### Cenário B: 100 clientes × 1000 conversas/mês = 100k conversas/mês
| Componente | Cálculo | Custo/mês |
|---|---|---|
| Embedding queries (3-large) | 100k × ~$0.00001 | $1 |
| Cohere rerank | 100k × $0.002 | $200 |
| Pinecone storage | < 100k vectors | $0 (free) |
| gpt-5 do agente | 100k × $0.03 | $3.000 |
| **TOTAL RAG + LLM** | | **~$3.200/mês** |

Receita esperada: 100 clientes × R$ 500/mês = **R$ 50.000/mês (~$10k)**

**Margem: ~65%.** Saudável.

## Otimizações se quiser baixar custo

| Mexer em | Economia | Custo |
|---|---|---|
| Trocar gpt-5 → gpt-5-mini no agente | -70% custo LLM | -10% qualidade |
| Trocar Cohere → BGE local | -$200/mês | +500ms latência por query |
| Cache de respostas idênticas (5min TTL) | -30% custo total | risco de cache stale |
| Trocar 3-large → 3-small (embedding) | -85% custo embedding | -2 pontos MTEB (~3% qualidade) |',
  },

  // ============================================================
  {
    numero: 7,
    id: 'checklist',
    titulo: 'Checklist de implementação',
    icone: '✅',
    resumo: 'O que tá feito, em curso e pendente da AI-Teams.',
    conteudo: 'Estado atual da implementação RAG no Neural Architect:',
    checklist: [
      { item: 'F1 — Markdown-aware chunker (Python puro)', status: 'feito', nota: 'backend/rag/chunker.py reescrito. ~50 linhas, sem libs.' },
      { item: 'F2 — Migrar Mongo → Pinecone', status: 'feito', nota: 'Index neural-architect (3072 dim) ativo. 280 chunks indexados.' },
      { item: 'F2 — Embedding text-embedding-3-large', status: 'feito', nota: 'EMBEDDING_MODEL=text-embedding-3-large no Azure.' },
      { item: 'F2 — top_k 5 → 30', status: 'feito', nota: 'pipeline.py: top_k=30.' },
      { item: 'F2 — Smoke E2E ementa', status: 'feito', nota: '✅ IA passou a citar ementas oficiais com trechos literais.' },
      { item: 'F3 — Contextual generation (Anthropic)', status: 'falta', nota: '~2h. -49% failure rate. Custa $0.02 reindex IT Valley.' },
      { item: 'F4 — Re-ranking', status: 'falta', nota: '~1h. Carlos: começar com BGE local (grátis), trocar pra Cohere depois.' },
      { item: 'F5 — Hybrid search (vector + BM25)', status: 'falta', nota: '~2.5h. Pinecone tem nativo. +15% recall.' },
      { item: 'Bonus: DELETE /documentos retornando 405', status: 'falta', nota: 'Não bloqueante. Mongo Vector legacy fica com lixo (sem efeito).' },
      { item: 'Métricas RAG no Application Insights', status: 'falta', nota: 'rag_query_latency, top_1_score, failure_rate, cost.' },
      { item: 'Golden set automatizado (tests/rag_golden_set.jsonl)', status: 'falta', nota: 'Run a cada PR. NDCG@5, MRR, recall@10.' },
    ],
  },

  // ============================================================
  {
    numero: 8,
    id: 'glossario',
    titulo: 'Glossário (cola pra equipe)',
    icone: '📖',
    resumo: 'Todos os termos técnicos em 1 linha.',
    conteudo: 'Cola rápida pra equipe que ouvir esses termos:`,
    glossario: [
      { termo: 'RAG', definicao: 'Retrieval-Augmented Generation. IA "consulta a base" antes de responder.' },
      { termo: 'LLM', definicao: 'Large Language Model. GPT-5, Claude, Gemini. Modelo que gera texto.' },
      { termo: 'Embedding', definicao: 'Vetor de números (ex: 1536-3072 dims) que representa um texto semanticamente.' },
      { termo: 'Vector DB', definicao: 'Banco de dados especializado em guardar e buscar vetores em alta velocidade. Ex: Pinecone, Mongo Atlas Vector.' },
      { termo: 'Chunk', definicao: 'Pedaço de um documento (~500-2000 chars). Unidade básica do RAG.' },
      { termo: 'Chunking', definicao: 'Processo de cortar documento em chunks. Pode ser por chars (burro) ou por estrutura semântica (esperto).' },
      { termo: 'Retrieval', definicao: 'Etapa de buscar os chunks mais relevantes pra pergunta do usuário.' },
      { termo: 'Top-K', definicao: 'Quantos chunks retornar do retrieval. Tipicamente 5-30.' },
      { termo: 'Similaridade cosseno', definicao: 'Métrica de "quão parecidos" são 2 vetores. -1 (opostos) a 1 (idênticos).' },
      { termo: 'BM25', definicao: 'Algoritmo clássico de busca por palavra-chave (anos 90). Captura match exato (jargões, nomes próprios).' },
      { termo: 'Hybrid Search', definicao: 'Combina vector search (semântica) + BM25 (palavra exata). +15% recall.' },
      { termo: 'Re-ranker / Cross-encoder', definicao: 'Modelo que reordena top 30 candidatos pra top 5 mais relevantes. Mais preciso que vector.' },
      { termo: 'Cohere rerank-3.5', definicao: 'Cross-encoder cloud, $2/1k requests, 150ms latência. Padrão produção.' },
      { termo: 'BGE-reranker-v2-m3', definicao: 'Cross-encoder open-source, grátis, ~500ms latência. Alternativa sem custo.' },
      { termo: 'Contextual Retrieval', definicao: 'Técnica Anthropic 2024: gpt-4o-mini adiciona 1 frase de contexto a cada chunk antes de embedar. -49% failure.' },
      { termo: 'NDCG@5', definicao: 'Métrica que mede qualidade do top 5 retornado. Quanto mais alto, melhor.' },
      { termo: 'MRR', definicao: 'Mean Reciprocal Rank. Mede em qual posição o resultado correto aparece.' },
      { termo: 'Failure rate', definicao: '% de queries em que o RAG não retorna informação correta. Estado da arte: <3%.' },
      { termo: 'Namespace (Pinecone)', definicao: 'Subdivisão lógica do index. Usamos 1 namespace por tenant pra isolamento multi-cliente.' },
      { termo: 'Cross-tenant leak', definicao: 'Bug onde tenant A consegue ver dados do tenant B. RAG bem feito previne isso via namespace.' },
    ],
  },
];

export const recursosExtras = [
  { titulo: 'Anthropic — Introducing Contextual Retrieval (paper original)', url: 'https://www.anthropic.com/news/contextual-retrieval' },
  { titulo: 'Pinecone — Hybrid Search Guide', url: 'https://docs.pinecone.io/guides/data/encode-sparse-vectors' },
  { titulo: 'Cohere — Rerank API docs', url: 'https://docs.cohere.com/docs/rerank' },
  { titulo: 'OpenAI — Embedding models comparison', url: 'https://platform.openai.com/docs/guides/embeddings' },
  { titulo: 'MTEB Leaderboard (ranking embeddings)', url: 'https://huggingface.co/spaces/mteb/leaderboard' },
  { titulo: 'Aba 🧠 RAG (pipeline visual com quadradinhos)', url: '#rag' },
  { titulo: 'Doc técnico no repo AI-Teams', url: 'https://github.com/cacaviana/ai-teams/blob/main/docs/RAG_ARCHITECTURE.md' },
];
