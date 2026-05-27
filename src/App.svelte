<script lang="ts">
  import Bloco from './lib/Bloco.svelte';
  import PainelDetalhe from './lib/PainelDetalhe.svelte';
  import Boneco from './lib/Boneco.svelte';
  import Bola from './lib/Bola.svelte';
  import PainelCaso from './lib/PainelCaso.svelte';
  import type { Bloco as BlocoType, Caso, Ator } from './lib/types';
  import { blocosHoje, blocosFuturo, fasesPlano, ferramentas } from './lib/blocos';
  import { atores, casos } from './lib/fluxo';
  import { propriedades, naming, estadoGenesis } from './lib/serviceBus';
  import { quemFazOQue, antipadroes, estadosMsg, oQueGenesisGuarda } from './lib/bancoFila';
  import { execucao, recursosProvisionados, prs, pendencias } from './lib/execucao';
  import { blocosAgora } from './lib/agora';
  import { blocosAgentes } from './lib/agentes';
  import { blocosRAG } from './lib/rag';
  import { capitulosRAG, recursosExtras } from './lib/rag101';
  import { checklist, contarPorEstado } from './lib/checklist';

  type Tab = 'hoje' | 'agora' | 'futuro' | 'acao' | 'sb' | 'banco' | 'plano' | 'ferramentas' | 'execucao' | 'checklist' | 'agentes' | 'rag' | 'rag101';

  let capituloAberto = $state<number | null>(1);

  const stats = contarPorEstado();
  const areas = [...new Set(checklist.map(i => i.area))];

  let tab = $state<Tab>('hoje');
  let blocoSelecionado = $state<BlocoType | null>(null);
  let painelAberto = $state(false);

  let casoSelecionado = $state<Caso | null>(null);
  let atorSelecionado = $state<Ator | null>(null);
  let painelCasoAberto = $state(false);

  function abrirPainel(b: BlocoType) {
    blocoSelecionado = b;
    painelAberto = true;
  }
  function fechar() { painelAberto = false; }

  function abrirCaso(c: Caso) {
    casoSelecionado = c;
    atorSelecionado = atores.find(a => a.id === c.atorId) ?? null;
    painelCasoAberto = true;
  }
  function fecharCaso() { painelCasoAberto = false; }

  function atorAtivo(atorId: string): boolean {
    if (!casoSelecionado) return false;
    return casoSelecionado.atorId === atorId;
  }

  let scrollY = $state(0);
  $effect(() => {
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  // pra cada caso, descobrir o índice da sua coluna (1..4)
  function colunaDoCaso(c: Caso): number {
    return atores.findIndex(a => a.id === c.atorId) + 1;
  }
</script>

<div class="parallax-bg" style="transform: translateY({scrollY * 0.3}px);"></div>

<header class="topo">
  <div class="container">
    <div class="brand">
      <div class="brand-dot"></div>
      <div>
        <h1>Genesis Roadmap</h1>
        <p class="subtitulo">Da arquitetura atual até o ecossistema multi-canal IT Valley</p>
      </div>
    </div>

    <nav class="tabs">
      <button class:ativo={tab === 'hoje'} onclick={() => tab = 'hoje'}>Como era hoje</button>
      <button class:ativo={tab === 'agora'} onclick={() => tab = 'agora'}>🆕 Como está agora</button>
      <button class:ativo={tab === 'pilares'} onclick={() => tab = 'pilares'}>🛡️ Pilares</button>
      <button class:ativo={tab === 'futuro'} onclick={() => tab = 'futuro'}>Como deve ficar</button>
      <button class:ativo={tab === 'acao'} onclick={() => tab = 'acao'}>Ação: enviar mensagem</button>
      <button class:ativo={tab === 'sb'} onclick={() => tab = 'sb'}>Service Bus 101</button>
      <button class:ativo={tab === 'banco'} onclick={() => tab = 'banco'}>Banco × Fila × DLQ</button>
      <button class:ativo={tab === 'plano'} onclick={() => tab = 'plano'}>Plano de ação</button>
      <button class:ativo={tab === 'execucao'} onclick={() => tab = 'execucao'}>✅ Execução</button>
      <button class:ativo={tab === 'checklist'} onclick={() => tab = 'checklist'}>📋 Checklist</button>
      <button class:ativo={tab === 'agentes'} onclick={() => tab = 'agentes'}>🤖 Agentes IA</button>
      <button class:ativo={tab === 'rag'} onclick={() => tab = 'rag'}>🧠 RAG</button>
      <button class:ativo={tab === 'rag101'} onclick={() => tab = 'rag101'}>📚 RAG 101 (curso)</button>
      <button class:ativo={tab === 'ferramentas'} onclick={() => tab = 'ferramentas'}>Ferramentas</button>
    </nav>
  </div>
</header>

<main class="container conteudo">
  {#if tab === 'hoje'}
    <section>
      <h2>Como é hoje</h2>
      <p class="bloco-intro">
        O Genesis funciona, mas tem fragilidades. Clique em cada bloco pra entender o que ele é, onde mora e o que faz.
      </p>

      <div class="grupo">
        <h4>Caminho de saída (disparo de campanha)</h4>
        <div class="fluxo">
          <Bloco bloco={blocosHoje[0]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[1]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[2]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[4]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[6]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>Caminho de entrada (cliente respondendo)</h4>
        <div class="fluxo">
          <Bloco bloco={blocosHoje[6]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[1]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[3]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[5]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosHoje[7]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>Resumo: 4 problemas principais</h4>
        <div class="grid-2">
          <div class="bloco bloco--crit" style="cursor: default;">
            <span class="tag">Problema 1</span>
            <h3>Workers competem com HTTP</h3>
            <p class="desc">Backend FastAPI roda HTTP + 2 workers no mesmo container. Em pico de tráfego, requests ficam lentos porque CPU tá disputada com worker.</p>
          </div>
          <div class="bloco bloco--crit" style="cursor: default;">
            <span class="tag">Problema 2</span>
            <h3>Envio sequencial + sleep hardcoded</h3>
            <p class="desc">Worker dispara 1 destinatário por vez com sleep 0.5s entre eles. Em 1000 contatos, 8 minutos a mais de sleep gratuito.</p>
          </div>
          <div class="bloco bloco--crit" style="cursor: default;">
            <span class="tag">Problema 3</span>
            <h3>Idempotência fraca</h3>
            <p class="desc">Só checa status no banco. Se Service Bus reentrega no meio de uma campanha, pode disparar duplicado pro mesmo número.</p>
          </div>
          <div class="bloco bloco--crit" style="cursor: default;">
            <span class="tag">Problema 4</span>
            <h3>Acoplamento direto com Meta</h3>
            <p class="desc">Genesis chama Meta API direto. Não dá pra trocar provider, não tem circuit breaker, não tem rate limit por tenant.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'agora'}
    <section>
      <h2>🆕 Como está AGORA — Fase 3 ATIVA em PROD oficial</h2>
      <p class="bloco-intro">
        Estado FINAL de <strong>2026-05-23 02:35 UTC</strong>. Genesis ↔ Meta DESACOPLADO. App oficial <code>messaging-service-itvalley-prod</code> rodando código da Polly evoluído por Carlos + Claude. Webhook Meta apontando direto pro app oficial. Sandbox deletado. <strong>Clique em qualquer bloco pra detalhes.</strong>
      </p>

      <div class="grupo">
        <h4>Caminho de saída (campanha → messaging-service → Meta) — ATIVO</h4>
        <div class="fluxo">
          <Bloco bloco={blocosAgora[0]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[1]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[4]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[2]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[4]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[5]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[6]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>Caminho de status (sent/delivered/read) — ATIVO</h4>
        <div class="fluxo">
          <Bloco bloco={blocosAgora[6]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[5]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[4]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[1]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>Caminho de entrada (cliente respondendo) — ATIVO (Fase 3 nova)</h4>
        <div class="fluxo">
          <Bloco bloco={blocosAgora[6]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[5]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[4]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosAgora[1]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>O que mudou nessa sessão (resumo executivo)</h4>
        <div class="grid-2">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🎯 messaging-service oficial</span>
            <h3>App PROD no repo da Polly</h3>
            <p class="desc">PR #1 + PR #2 mergeados em main de ITValley-School/messaging-service. App messaging-service-itvalley-prod deployado direto. Sandbox deletado.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🎯 Webhook Meta</span>
            <h3>Aponta pro app oficial</h3>
            <p class="desc">Graph API trocou callback_url pra messaging-service-itvalley-prod/webhooks/meta/whatsapp. /webhooks/whatsapp do Genesis foi REMOVIDO.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🎯 MetaAPI cortada</span>
            <h3>Genesis desacoplado dos envios</h3>
            <p class="desc">whatsapp_service.py migrado pra messaging_client. Envios via messaging.send queue. MetaAPI mantida só pra sync_templates (catálogo).</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🎯 Smoke real</span>
            <h3>3 mensagens reais pro Carlos</h3>
            <p class="desc">Template com botão (Carlos apertou) + texto livre via canal whatsapp_text + texto via app oficial. Persistido no banco PROD, wamid em todos.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🎯 Observabilidade</span>
            <h3>6 alertas Azure + Logic App</h3>
            <p class="desc">DLQ × 3, 5xx × 2, backlog. Logic App smoke-genesis-hourly. Healthcheck valida creds Meta de verdade.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🎯 Canal whatsapp_text</span>
            <h3>Texto livre janela 24h</h3>
            <p class="desc">Novo canal no factory da Polly (4 alterações aditivas). Operador responde dentro da janela sem template HSM.</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>O que falta — só depende da Polly / equipe</h4>
        <div class="grid-2">
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">Polly · ~2 semanas</span>
            <h3>Multi-tenancy de provider</h3>
            <p class="desc">Tabela tenant_providers (1 WABA/Twilio/IG por cliente). Hoje creds globais. Sem isso não escala 100-500 clientes.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Fase 4 (futuro)</span>
            <h3>Multi-canal SMS + IG</h3>
            <p class="desc">Polly implementa Twilio + IG Graph senders. Genesis ganha seletor de canal por contato.</p>
          </div>
          <div class="bloco bloco--ghost" style="cursor: default;">
            <span class="tag">Limpeza · 1-2 semanas</span>
            <h3>Remover MetaAPI inteira do Genesis</h3>
            <p class="desc">Quando Fase 3 estável, mover sync_templates pro messaging-service e deletar integrations/meta_api.py.</p>
          </div>
          <div class="bloco bloco--ghost" style="cursor: default;">
            <span class="tag">Cosmético</span>
            <h3>Failed rate custom metric</h3>
            <p class="desc">Emit Application Insights metric por provider. Hoje só tem 5xx generic.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'futuro'}
    <section>
      <h2>Como deve ficar</h2>
      <p class="bloco-intro">
        Genesis vira "cérebro de mensageria" (CRM, conversa, janela 24h, campanhas). messaging-service vira "transporte multi-provider". Clique nos blocos pra detalhes.
      </p>

      <div class="grupo">
        <h4>Caminho de saída (Genesis → messaging-service → provider)</h4>
        <div class="fluxo">
          <Bloco bloco={blocosFuturo[0]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[1]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[4]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[2]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[5]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[3]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[10]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>Caminho de volta (status sent/delivered/read)</h4>
        <div class="fluxo">
          <Bloco bloco={blocosFuturo[3]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[6]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[8]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[0]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>Caminho de entrada (cliente respondeu — multi-canal)</h4>
        <div class="fluxo">
          <Bloco bloco={blocosFuturo[10]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[3]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[7]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[9]} onclick={abrirPainel} />
          <div class="seta">→</div>
          <Bloco bloco={blocosFuturo[0]} onclick={abrirPainel} />
        </div>
      </div>

      <div class="grupo">
        <h4>O que o Genesis prepara antes de mandar pra Polly</h4>
        <p class="bloco-intro" style="margin-bottom: 20px;">
          Genesis não joga "contato bruto" na fila. O Dispatcher do Genesis <strong>renderiza variáveis</strong> (lê o CRM), <strong>escolhe o canal</strong> (preferência por contato),
          <strong>decide janela 24h</strong> (template HSM ou texto livre) e só então publica a mensagem PRONTA em <code>messaging.send</code>.
          O messaging-service da Polly só executa o transporte.
        </p>

        <div class="grid-2" style="margin-top: 16px;">
          <div>
            <h4 style="margin-bottom: 8px;">Payload exemplo (Genesis → fila)</h4>
            <div class="payload"><span class="comment">// 1 destinatario = 1 msg em messaging.send</span>
{`
  `}<span class="key">"channel"</span>: <span class="str">"whatsapp"</span>,
  <span class="key">"to"</span>: <span class="str">"+5511999991234"</span>,
  <span class="key">"from_app"</span>: <span class="str">"genesis"</span>,
  <span class="key">"tenant_id"</span>: <span class="str">"cliente-42"</span>,

  <span class="comment">// idempotency_key UNICO por destinatario</span>
  <span class="key">"idempotency_key"</span>: <span class="str">"camp-X-dest-Y"</span>,

  <span class="comment">// genesis ja resolveu __nome__ -&gt; "Maria"</span>
  <span class="key">"template_name"</span>: <span class="str">"boas_vindas_compra"</span>,
  <span class="key">"template_language"</span>: <span class="str">"pt_BR"</span>,
  <span class="key">"template_components"</span>: [
    {`{`}
      <span class="key">"type"</span>: <span class="str">"body"</span>,
      <span class="key">"parameters"</span>: [
        {`{`}<span class="key">"type"</span>: <span class="str">"text"</span>, <span class="key">"text"</span>: <span class="str">"Maria"</span>{`}`}
      ]
    {`}`}
  ]
{`}`}</div>
          </div>

          <div>
            <h4 style="margin-bottom: 8px;">Decisões que Genesis toma antes</h4>
            <div class="bloco" style="cursor: default; margin-bottom: 12px;">
              <span class="tag">1 · Resolução de variáveis</span>
              <h3>Lê o CRM e substitui</h3>
              <p class="desc"><code>__nome__</code> vira <code>"Maria"</code>. Polly não conhece o CRM, então quem resolve é o Genesis.</p>
            </div>
            <div class="bloco" style="cursor: default; margin-bottom: 12px;">
              <span class="tag">2 · Escolha de canal</span>
              <h3>WA, SMS ou IG?</h3>
              <p class="desc">Olha preferência do contato (ou da campanha). Pode ter fallback: tenta WA, se falhar manda SMS.</p>
            </div>
            <div class="bloco" style="cursor: default; margin-bottom: 12px;">
              <span class="tag">3 · Janela 24h Meta</span>
              <h3>Template ou texto livre?</h3>
              <p class="desc">Conversa aberta há &lt;24h: pode mandar texto livre (<code>channel: "whatsapp_text"</code>). Fora da janela: <strong>obrigatório template HSM</strong>.</p>
            </div>
            <div class="bloco" style="cursor: default;">
              <span class="tag">4 · Idempotency key</span>
              <h3>Chave única por destinatário</h3>
              <p class="desc">Garante que se a msg cair na fila 2× (redelivery), Polly NÃO dispara WhatsApp duplicado pro Maria.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>Quem é dono do que</h4>
        <p class="bloco-intro" style="margin-bottom: 20px;">
          Linha clara: Genesis = <strong>cérebro de mensageria</strong> (CRM + conversa + lógica). messaging-service da Polly = <strong>transporte multi-provider</strong>.
          Quando você adicionar Cobrança e Phoenix ao ecossistema, eles vão publicar direto no <code>messaging.send</code> sem precisar do Genesis.
        </p>

        <table class="tabela-donos">
          <thead>
            <tr>
              <th>Responsabilidade</th>
              <th class="centro">Genesis</th>
              <th class="centro">messaging-service</th>
            </tr>
          </thead>
          <tbody>
            <tr class="grupo-titulo"><td colspan="3">Inteligência de mensageria</td></tr>
            <tr><td>CRM (Contato, segmentação)</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>
            <tr><td>Campanhas (criação, agendamento)</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>
            <tr><td>Conversa + janela 24h</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>
            <tr><td>Renderização de variáveis (__nome__ → "Maria")</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>
            <tr><td>Escolha de canal (WA/SMS/IG) por contato</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>
            <tr><td>Templates Meta (cache + sync pra UI)</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>
            <tr><td>Automações (Hotmart, Voomp, MemberKit)</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-nao">—</span></td></tr>

            <tr class="grupo-titulo"><td colspan="3">Transporte multi-provider</td></tr>
            <tr><td>Falar com Meta Cloud API</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Falar com Twilio (SMS)</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Falar com Instagram Graph API</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Circuit breaker por provider</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Rate limit por (tenant + provider)</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Idempotência de envio (UNIQUE no banco)</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Auditoria de envio (tabela <code>messages</code>)</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Receber webhook Meta / Twilio / IG</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Republicar inbound/status em tópico</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Gerenciar secrets dos providers</td><td class="centro"><span class="dono-nao">—</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>

            <tr class="grupo-titulo"><td colspan="3">Compartilhado</td></tr>
            <tr><td>Multi-tenancy (tenant_id em todo lugar)</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
            <tr><td>Observabilidade (logs + métricas por tenant)</td><td class="centro"><span class="dono-sim">✓</span></td><td class="centro"><span class="dono-sim">✓</span></td></tr>
          </tbody>
        </table>
      </div>

      <div class="grupo">
        <h4>O que muda em uma frase</h4>
        <div class="grid-2">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Ganho 1</span>
            <h3>Genesis ↔ Providers desacoplados</h3>
            <p class="desc">Trocar provider WhatsApp ou adicionar Telegram = só mexe no messaging-service. Genesis nunca sabe.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Ganho 2</span>
            <h3>Outros sistemas reutilizam</h3>
            <p class="desc">Cobrança e Phoenix mandam SMS/Email/WhatsApp publicando no `messaging.send`. Sem reimplementar nada.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Ganho 3</span>
            <h3>Status callbacks de verdade</h3>
            <p class="desc">Operador vê `delivered` e `read` aparecerem na conversa. Hoje só vê `sent`.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Ganho 4</span>
            <h3>Escala horizontal independente</h3>
            <p class="desc">Pico de inbound? Escala worker-inbound. Black Friday de disparo? Escala dispatcher + messaging-service.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'acao'}
    <section>
      <h2>Ação: enviar uma mensagem de campanha</h2>
      <p class="bloco-intro">
        Caso de uso completo, do clique do operador até o ✓✓ azul aparecer. <strong>4 atores</strong> nas colunas, <strong>14 passos</strong> em bolas numeradas — cada bola na coluna do ator que executa. Clique em qualquer bola pra entender o que acontece, tecnicamente, e por que importa.
      </p>

      <div class="diagrama">
        <!-- Cabeçalho com bonequinhos -->
        <div class="atores-linha">
          {#each atores as ator}
            <div class="ator-coluna-cabecalho">
              <Boneco nome={ator.nome} papel={ator.papel} destaque={atorAtivo(ator.id)} />
            </div>
          {/each}
        </div>

        <!-- Grid de bolas: 1 linha por caso, coluna = ator -->
        <div class="bolas-grid">
          {#each casos as caso, i}
            <div class="linha-caso" style="grid-column: {colunaDoCaso(caso)};">
              <Bola {caso} onclick={abrirCaso} />
            </div>
            {#if i < casos.length - 1}
              <div class="seta-vertical" style="grid-column: {colunaDoCaso(casos[i + 1])};">↓</div>
            {/if}
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>Legenda do fluxo</h4>
        <div class="grid-2">
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Passos 1-6 · Operador + Genesis</span>
            <h3>Preparação no Genesis</h3>
            <p class="desc">Clique → validação → leitura do CRM → renderização de variáveis → decisão de canal e janela 24h → publicação na fila do messaging-service.</p>
          </div>
          <div class="bloco bloco--purple" style="cursor: default;">
            <span class="tag">Passos 7-10 · messaging-service</span>
            <h3>Transporte na Polly</h3>
            <p class="desc">Idempotência → rate limit + circuit breaker → POST Meta → persiste + publica status no tópico.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Passos 11, 14 · Genesis</span>
            <h3>Reflexo na UI</h3>
            <p class="desc">Status worker atualiza mensagem na conversa e contadores da campanha. Operador vê em tempo real via WebSocket.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Passos 12-13 · Meta + Polly</span>
            <h3>Callbacks de entrega</h3>
            <p class="desc">Meta avisa quando msg foi entregue/lida. Polly republica no mesmo tópico, Genesis atualiza os ✓✓ azuis na conversa.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'sb'}
    <section>
      <h2>Service Bus 101</h2>
      <p class="bloco-intro">
        Referência rápida pra quem precisa entender o Azure Service Bus sem ler 300 páginas de docs. Tudo em uma página: o que é, como é organizado, como funciona uma mensagem, queue vs topic, ciclo de vida e nomenclatura. <strong>Compartilhe com os devs.</strong>
      </p>

      <!-- 1. O que é -->
      <div class="grupo">
        <h4>1 · O que é, em uma frase</h4>
        <div class="bloco bloco--purple" style="cursor: default; max-width: 800px;">
          <span class="tag">Definição</span>
          <h3 style="font-size: 18px;">Carteiro gerenciado pela Microsoft.</h3>
          <p class="desc" style="font-size: 14px; margin-top: 8px;">
            Pega mensagens de um app e entrega em outro, com <strong>garantia de não perder</strong> mesmo se servidor cair.
            Você nunca vê o servidor — é PaaS. Só usa o endpoint que a Microsoft te dá.
          </p>
        </div>
      </div>

      <!-- 2. Cluster -->
      <div class="grupo">
        <h4>2 · O que tem por trás (o cluster)</h4>
        <div class="grid-2">
          <div class="bloco" style="cursor: default;">
            <span class="tag">Cluster</span>
            <h3>Vários servidores como se fossem um</h3>
            <p class="desc">Em vez de 1 máquina (que pode morrer), são N servidores físicos num datacenter Microsoft. Se um cai, outro assume. Você não controla nem vê — Microsoft cuida.</p>
          </div>
          <div class="bloco" style="cursor: default;">
            <span class="tag">Replicação 3×</span>
            <h3>Mensagem gravada em 3 lugares antes de OK</h3>
            <p class="desc">Toda msg que você manda é gravada em 3 réplicas (3 servidores do cluster) ANTES do broker te confirmar. Se 1 disco queima, 2 cópias ainda existem.</p>
          </div>
          <div class="bloco" style="cursor: default;">
            <span class="tag">Analogia</span>
            <h3>🍽️ Restaurante com 4 garçons</h3>
            <p class="desc">1 garçom sozinho atende 5 mesas, se passa mal todos ficam sem atendimento. 4 garçons (cluster): se 1 sai, outros cobrem. Em pico, dividem carga.</p>
          </div>
          <div class="bloco" style="cursor: default;">
            <span class="tag">Você nunca vê</span>
            <h3>É PaaS, abstração total</h3>
            <p class="desc">Você não loga em servidor nenhum. Só interage com o endpoint <code>genesisitvalley.servicebus.windows.net</code> via SDK ou REST.</p>
          </div>
        </div>
      </div>

      <!-- 3. Hierarquia -->
      <div class="grupo">
        <h4>3 · Hierarquia (de fora pra dentro)</h4>
        <p style="margin-bottom: 16px;">São 5 camadas de containers aninhados. Você cria namespace no Azure Portal, depois cria queues/topics dentro dele.</p>

        <div class="hierarquia">
          <div class="camada camada-1">
            <div class="camada-label">🏢 NAMESPACE</div>
            <p class="camada-desc"><code>genesisitvalley.servicebus.windows.net</code> — sua "instância" do SB. O endpoint público. Tem auth, config de tier e quotas.</p>

            <div class="camada camada-2">
              <div class="camada-label">📦 QUEUE</div>
              <p class="camada-desc"><strong>Ponto-a-ponto.</strong> Ex: <code>campanhas.disparo</code>. 1 msg = 1 consumer. Quando consome, msg some.</p>
              <div class="camada camada-3">
                <div class="camada-label">✉️ MESSAGE</div>
                <p class="camada-desc">Body (até 256KB) + propriedades do sistema + properties customizadas. Detalhado na seção 4 abaixo.</p>
              </div>
              <div class="camada camada-3-dlq">
                <div class="camada-label">💀 DEAD-LETTER QUEUE (DLQ)</div>
                <p class="camada-desc">Sub-fila automática. Msgs que falharam N vezes vão pra cá, esperando investigação manual.</p>
              </div>
            </div>

            <div class="camada camada-2">
              <div class="camada-label">📢 TOPIC</div>
              <p class="camada-desc"><strong>Pub/sub.</strong> Ex: <code>messaging.status</code>. Msg vai pra TODAS as subscriptions filhas. N consumers, cada um sua cópia.</p>
              <div class="camada camada-3">
                <div class="camada-label">🔔 SUBSCRIPTION (genesis-sub)</div>
                <p class="camada-desc">"Fila virtual" com filtro opcional. Genesis consome daqui pra atualizar mensagem na conversa.</p>
              </div>
              <div class="camada camada-3">
                <div class="camada-label">🔔 SUBSCRIPTION (bi-sub)</div>
                <p class="camada-desc">Outra subscription do mesmo topic. BI lê daqui pra alimentar dashboard. Recebe a MESMA msg que genesis-sub recebeu.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Anatomia da mensagem -->
      <div class="grupo">
        <h4>4 · Anatomia de uma mensagem</h4>
        <p style="margin-bottom: 16px;">Cada msg tem 3 partes. O Service Bus <strong>não olha dentro do body</strong> — pra ele, é blob de bytes. Body livre, contrato é entre você e o consumer.</p>

        <div class="anatomia">
          <div class="anatomia-parte">
            <span class="tag">Parte 1 · Body</span>
            <h3>📝 O conteúdo</h3>
            <p class="desc">Livre — JSON, XML, texto, protobuf, base64. Você decide o formato. Limite 256KB no Standard, 100MB no Premium.</p>
            <pre class="payload-mini" data-tipo="json">{`{
  "tipo": "campanha_disparo",
  "campanha_id": "4f5e-...",
  "tenant_id": "cliente-42"
}`}</pre>
          </div>

          <div class="anatomia-parte">
            <span class="tag">Parte 2 · Propriedades do sistema</span>
            <h3>📋 Headers que o broker gerencia</h3>
            <p class="desc">10 propriedades padronizadas. Algumas o broker preenche sozinho, outras você pode setar.</p>
            <p class="desc" style="margin-top: 8px; font-size: 13px;">Veja todas listadas abaixo, com exemplo de uso.</p>
          </div>

          <div class="anatomia-parte">
            <span class="tag">Parte 3 · Custom Properties</span>
            <h3>🏷️ Headers extras seus</h3>
            <p class="desc">Você define. Útil pra filtrar em subscriptions (topic) sem abrir o body.</p>
            <pre class="payload-mini" data-tipo="json">{`{
  "regiao": "br-sul",
  "prioridade": "alta",
  "canal": "whatsapp"
}`}</pre>
          </div>
        </div>
      </div>

      <!-- 5. Propriedades do sistema (10 cards) -->
      <div class="grupo">
        <h4>5 · As 10 propriedades do sistema</h4>
        <p style="margin-bottom: 16px;">
          <span class="chip-mini chip-mini--auto">AUTO</span> = broker preenche sozinho. ·
          <span class="chip-mini chip-mini--seta">VOCÊ SETA</span> = define no envio. ·
          <span class="chip-mini chip-mini--opcional">OPCIONAL</span> = pode setar ou deixar auto.
        </p>

        <div class="grid-2">
          {#each propriedades as prop}
            <div class="bloco" style="cursor: default;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <h3 style="font-family: var(--font-mono); font-size: 14px;">{prop.nome}</h3>
                <span class="chip-mini chip-mini--{prop.tag === 'auto' ? 'auto' : prop.tag === 'voce-seta' ? 'seta' : 'opcional'}">
                  {prop.tag === 'auto' ? 'AUTO' : prop.tag === 'voce-seta' ? 'VOCÊ SETA' : 'OPCIONAL'}
                </span>
              </div>
              <p class="desc" style="margin-top: 8px;">{prop.oQueE}</p>
              <p class="desc" style="margin-top: 8px;">
                <strong style="color: var(--text-primary);">Exemplo:</strong> <code>{prop.exemplo}</code>
              </p>
              <p class="desc" style="margin-top: 8px;">
                <strong style="color: var(--text-primary);">Quando usa:</strong> {prop.quandoUsa}
              </p>
            </div>
          {/each}
        </div>
      </div>

      <!-- 6. Queue vs Topic -->
      <div class="grupo">
        <h4>6 · Queue vs Topic (a diferença essencial)</h4>

        <div class="vs-grid">
          <div class="vs-coluna vs-queue">
            <div class="vs-icone">🪣</div>
            <h3>QUEUE</h3>
            <p class="vs-tagline">Ponto-a-ponto. 1 msg = 1 consumer.</p>

            <div class="vs-fluxo">
              <div class="vs-box">Producer</div>
              <div class="vs-seta">→</div>
              <div class="vs-box vs-box--purple">Queue</div>
              <div class="vs-seta">→</div>
              <div class="vs-box">Consumer</div>
            </div>

            <ul class="vs-lista">
              <li>Quando consumer dá <code>complete</code>, a msg <strong>SOME</strong></li>
              <li>Vários consumers competindo? SB entrega pra UM só (competing consumers)</li>
              <li>Caso de uso: trabalho a ser feito ("disparar campanha")</li>
            </ul>
          </div>

          <div class="vs-divisor">
            <div class="vs-vs">VS</div>
          </div>

          <div class="vs-coluna vs-topic">
            <div class="vs-icone">📢</div>
            <h3>TOPIC</h3>
            <p class="vs-tagline">Pub/Sub. 1 msg = N consumers.</p>

            <div class="vs-fluxo vs-fluxo-topic">
              <div class="vs-box">Producer</div>
              <div class="vs-seta">→</div>
              <div class="vs-box vs-box--purple">Topic</div>
              <div class="vs-seta-multi">
                <div>→</div>
                <div>→</div>
                <div>→</div>
              </div>
              <div class="vs-subs">
                <div class="vs-box vs-box--small">Sub A → Consumer 1</div>
                <div class="vs-box vs-box--small">Sub B → Consumer 2</div>
                <div class="vs-box vs-box--small">Sub C → Consumer 3</div>
              </div>
            </div>

            <ul class="vs-lista">
              <li>Cada subscription recebe sua PRÓPRIA cópia da msg</li>
              <li>Subscriptions podem ter FILTROS (só recebem se condição bate)</li>
              <li>Caso de uso: eventos ("mensagem enviada" — Genesis + BI + alertas)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 7. Ciclo de vida -->
      <div class="grupo">
        <h4>7 · Ciclo de vida de uma mensagem (peek-lock)</h4>
        <p style="margin-bottom: 20px;">É o padrão que garante "msg não some se consumer morrer". O consumer "trava" a msg, processa, depois confirma.</p>

        <div class="estados">
          <div class="estado estado-active">
            <div class="estado-icone">🟣</div>
            <h3>Active</h3>
            <p>Msg gravada e pronta. Esperando consumer pedir.</p>
          </div>
          <div class="estado-seta">→</div>
          <div class="estado estado-locked">
            <div class="estado-icone">🔒</div>
            <h3>Locked</h3>
            <p>Consumer pegou. Broker faz "lock" por 60s (default). Outros consumers NÃO veem.</p>
          </div>
          <div class="estado-seta">→</div>
          <div class="estado-decisao">
            <div class="estado estado-ok">
              <div class="estado-icone">✅</div>
              <h3>Complete</h3>
              <p>Worker terminou OK. Broker DELETA do storage.</p>
            </div>
            <div class="estado estado-abandon">
              <div class="estado-icone">↩️</div>
              <h3>Abandon</h3>
              <p>Worker falhou. Lock libera, msg volta pra Active. <code>delivery_count++</code></p>
            </div>
            <div class="estado estado-dlq">
              <div class="estado-icone">💀</div>
              <h3>DLQ</h3>
              <p>delivery_count &gt; 10 → broker move pra Dead-Letter Queue automático.</p>
            </div>
          </div>
        </div>

        <div class="bloco bloco--warn" style="cursor: default; margin-top: 24px;">
          <span class="tag">Atenção · Genesis</span>
          <h3>Hoje seus workers fazem <code>complete</code> SEMPRE — até em erro</h3>
          <p class="desc">Isso desliga a DLQ na prática. Quando algo falha grave, msg some pra sempre sem investigação. <strong>Solução:</strong> em exceção, fazer <code>abandon_message()</code> — após 10 falhas vai pra DLQ pra você olhar.</p>
        </div>
      </div>

      <!-- 8. Naming -->
      <div class="grupo">
        <h4>8 · Como nomear queues e topics</h4>
        <p style="margin-bottom: 16px;">Regra: <strong>domínio.ação</strong> (ou <strong>entidade.evento</strong>). NÃO bota nome de sistema (Genesis, Phoenix). Pensa em "qualquer dev novo lê o nome e entende o que trafega".</p>

        <table class="tabela-donos" style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 30%;">❌ Ruim</th>
              <th style="width: 30%;">✅ Bom</th>
              <th>Por quê</th>
            </tr>
          </thead>
          <tbody>
            {#each naming as n}
              <tr>
                <td><code style="color: var(--crit);">{n.ruim}</code></td>
                <td><code style="color: var(--ok);">{n.bom}</code></td>
                <td>{n.porQue}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- 9. Estado real -->
      <div class="grupo">
        <h4>9 · Estado real do Service Bus do Genesis HOJE</h4>
        <p style="margin-bottom: 16px;">
          Dados puxados via <code>az servicebus</code> CLI. Namespace: <code>{estadoGenesis.namespace}</code> ·
          Tier: <strong>{estadoGenesis.tier}</strong> · Region: {estadoGenesis.region}
        </p>

        <div class="grid-2">
          {#each estadoGenesis.filas as fila}
            <div class="bloco bloco--{fila.dlq > 0 ? 'warn' : 'ok'}" style="cursor: default;">
              <span class="tag">{fila.tipo === 'queue' ? '🪣 QUEUE' : '📢 TOPIC'}</span>
              <h3 style="font-family: var(--font-mono); font-size: 15px;">{fila.nome}</h3>
              <div style="display: flex; gap: 16px; margin-top: 10px; font-size: 13px;">
                <div><strong style="color: var(--text-primary);">Ativas:</strong> <span style="color: var(--text-secondary);">{fila.ativas}</span></div>
                <div><strong style="color: var(--text-primary);">DLQ:</strong> <span style="color: {fila.dlq > 0 ? 'var(--warn)' : 'var(--text-secondary)'}; font-weight: {fila.dlq > 0 ? '700' : 'normal'};">{fila.dlq}</span></div>
              </div>
              {#if fila.observacao}
                <p class="desc" style="margin-top: 10px; font-size: 12px; font-style: italic;">{fila.observacao}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- 10. TLDR -->
      <div class="grupo">
        <h4>10 · TL;DR pros devs (5 frases)</h4>
        <ol class="tldr">
          <li><strong>Service Bus é PaaS.</strong> Você não vê servidor. Microsoft gerencia cluster + replicação 3×.</li>
          <li><strong>Hierarquia:</strong> namespace contém queues e topics. Topics contêm subscriptions. Tudo contém mensagens.</li>
          <li><strong>Body é livre</strong> (geralmente JSON, mas SB não liga). Propriedades do sistema são o envelope: MessageId, DeliveryCount, TTL etc.</li>
          <li><strong>Queue = ponto-a-ponto</strong> (1:1). <strong>Topic = pub/sub</strong> (1:N). Pra eventos, sempre topic.</li>
          <li><strong>Peek-lock</strong>: consumer pega, processa, dá complete (msg some) OU abandon (volta pra fila, incrementa delivery_count). 10 falhas → DLQ automático.</li>
        </ol>
      </div>
    </section>
  {/if}

  {#if tab === 'banco'}
    <section>
      <h2>Banco × Fila × DLQ</h2>
      <p class="bloco-intro">
        Três conceitos que os devs misturam. Banco guarda <strong>estado</strong>, fila guarda <strong>trabalho a fazer</strong>, e DLQ é <strong>lugar onde mensagens falhadas vão parar</strong>. Bonus: deadlock SQL é coisa completamente diferente de DLQ — só o nome parece. Tudo explicado abaixo.
      </p>

      <!-- 1. Banco vs Fila -->
      <div class="grupo">
        <h4>1 · Banco vs Fila — papéis diferentes</h4>
        <div class="vs-grid">
          <div class="vs-coluna vs-queue">
            <div class="vs-icone">🗄️</div>
            <h3>BANCO</h3>
            <p class="vs-tagline">"Qual o ESTADO atual de tudo?"</p>
            <ul class="vs-lista">
              <li>Persistente — sobrevive a deploy, reboot, ano</li>
              <li>Queryable: <code>SELECT WHERE...</code></li>
              <li>UI lê pra mostrar status, contadores, listas</li>
              <li>Auditoria, relatório, BI</li>
              <li>Latência maior (mas mais flexível)</li>
            </ul>
            <p style="margin-top: 12px; font-size: 13px; color: var(--text-muted);">Ex: tabelas <code>campanhas</code>, <code>mensagens</code>, <code>contatos</code></p>
          </div>

          <div class="vs-divisor"><div class="vs-vs">≠</div></div>

          <div class="vs-coluna vs-topic">
            <div class="vs-icone">📬</div>
            <h3>FILA / TÓPICO</h3>
            <p class="vs-tagline">"Qual o próximo TRABALHO a fazer?"</p>
            <ul class="vs-lista">
              <li>Transitório — msg some quando consumida</li>
              <li>NÃO é queryable — só publish/consume</li>
              <li>Coordena trabalho entre componentes</li>
              <li>Worker pega 1 msg = 1 unidade de trabalho</li>
              <li>Latência baixa, throughput alto</li>
            </ul>
            <p style="margin-top: 12px; font-size: 13px; color: var(--text-muted);">Ex: <code>genesis-campanhas</code>, <code>messaging.send</code></p>
          </div>
        </div>
      </div>

      <!-- 2. Quem responde o quê -->
      <div class="grupo">
        <h4>2 · Quem responde o quê (regra de ouro)</h4>
        <table class="tabela-donos">
          <thead>
            <tr>
              <th>Pergunta</th>
              <th class="centro">Onde</th>
              <th>Por quê</th>
            </tr>
          </thead>
          <tbody>
            {#each quemFazOQue as q}
              <tr>
                <td>{q.pergunta}</td>
                <td class="centro">
                  {#if q.resposta === 'banco'}
                    <span class="chip chip--ok">🗄️ BANCO</span>
                  {:else if q.resposta === 'fila'}
                    <span class="chip">📬 FILA</span>
                  {:else}
                    <span class="chip chip--warn">⚖️ AMBOS</span>
                  {/if}
                </td>
                <td style="font-size: 13px; color: var(--text-secondary);">{q.porQue}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- 3. O que o Genesis guarda hoje -->
      <div class="grupo">
        <h4>3 · O que o Genesis guarda no banco hoje</h4>
        <p style="margin-bottom: 16px;">4 tabelas-chave do schema <code>genesis</code>. Cada UPDATE/INSERT abaixo é o Henrique escrevendo estado conforme o fluxo de campanha rola.</p>

        <div class="grid-2">
          {#each oQueGenesisGuarda as r}
            <div class="bloco bloco--info" style="cursor: default;">
              <span class="tag">Tabela</span>
              <h3 style="font-family: var(--font-mono); font-size: 15px;">{r.tabela}</h3>
              <p class="desc" style="margin-top: 6px;">{r.oQue}</p>
              <div class="secao-mini">
                <strong style="color: var(--text-primary); font-size: 12px;">VOLUME</strong>
                <p class="desc" style="font-size: 12px; margin-top: 2px;">{r.exemploLinhas}</p>
              </div>
              <div class="secao-mini">
                <strong style="color: var(--text-primary); font-size: 12px;">QUANDO ESCREVE</strong>
                <p class="desc" style="font-size: 12px; margin-top: 2px;">{r.quandoEscreve}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 4. Coreografia em um disparo -->
      <div class="grupo">
        <h4>4 · A coreografia em um disparo (banco + fila andando juntos)</h4>
        <p style="margin-bottom: 16px;">Sequência real do que acontece quando operador clica "Disparar". Note: <strong>cada passo escreve no LUGAR CERTO</strong> — fila pra trabalho, banco pra estado.</p>

        <div class="coreografia">
          <div class="coreo-passo">
            <div class="coreo-num">1</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-banco">🗄️ BANCO</div>
              <p><code>UPDATE campanhas SET status='na_fila' WHERE id=X</code></p>
              <small>Porque a UI precisa mostrar "esperando worker pegar"</small>
            </div>
          </div>
          <div class="coreo-passo">
            <div class="coreo-num">2</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-fila">📬 FILA</div>
              <p><code>publish &#123; campanha_id, tenant_id &#125; → genesis-campanhas</code></p>
              <small>Porque é TRABALHO a fazer. Worker vai consumir.</small>
            </div>
          </div>
          <div class="coreo-passo">
            <div class="coreo-num">3</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-banco">🗄️ BANCO</div>
              <p><code>UPDATE campanhas SET status='enviando', iniciado_em=NOW()</code></p>
              <small>Worker pegou e tá processando. UI mostra "0/1000 disparadas"</small>
            </div>
          </div>
          <div class="coreo-passo">
            <div class="coreo-num">4</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-banco">🗄️ BANCO</div>
              <p><code>UPDATE destinatarios SET status='enviado', wamid=...</code> (por destinatário)</p>
              <small>Estado por contato. UI mostra "487/1000"</small>
            </div>
          </div>
          <div class="coreo-passo">
            <div class="coreo-num">5</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-banco">🗄️ BANCO</div>
              <p><code>INSERT INTO mensagens (direcao='saida', wamid, conteudo, ...)</code></p>
              <small>Histórico permanente. Aparece na conversa do contato.</small>
            </div>
          </div>
          <div class="coreo-passo">
            <div class="coreo-num">6</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-fila">📬 FILA</div>
              <p><code>complete_message(msg)</code></p>
              <small>"Trabalho terminado, broker pode deletar."</small>
            </div>
          </div>
          <div class="coreo-passo">
            <div class="coreo-num">7</div>
            <div class="coreo-corpo">
              <div class="coreo-onde coreo-banco">🗄️ BANCO</div>
              <p><code>UPDATE campanhas SET status='concluida', concluido_em=NOW()</code></p>
              <small>Estado final pra UI mostrar "✅ Concluída".</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Antipadroes -->
      <div class="grupo">
        <h4>5 · Antipadrões — não faça isso</h4>
        <div class="grid-2">
          {#each antipadroes as ap}
            <div class="bloco bloco--crit" style="cursor: default;">
              <span class="tag">❌ Antipadrão</span>
              <h3>{ap.nome}</h3>
              <p class="desc" style="margin-top: 8px;">{ap.oQueE}</p>
              <div class="secao-mini">
                <strong style="color: var(--crit); font-size: 12px;">POR QUE RUIM</strong>
                <p class="desc" style="font-size: 12px; margin-top: 2px;">{ap.porQueRuim}</p>
              </div>
              <div class="secao-mini">
                <strong style="color: var(--ok); font-size: 12px;">FORMA CORRETA</strong>
                <p class="desc" style="font-size: 12px; margin-top: 2px;">{ap.ondeFazerCerto}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 6. DLQ — o conceito que falta -->
      <div class="grupo">
        <h4>6 · DLQ — Dead-Letter Queue (o conceito que falta)</h4>
        <p style="margin-bottom: 16px;">
          DLQ é uma <strong>sub-fila automática</strong> do Service Bus. Quando uma mensagem "envenenada" (que sempre falha) é tentada N vezes, o broker move ela pra DLQ <strong>sozinho</strong>. Você vai lá investigar depois — não no banco, na própria DLQ.
        </p>

        <div class="grid-2">
          <div>
            <h4 style="margin-bottom: 12px;">Ciclo de vida de uma msg</h4>
            <div class="estados-vert">
              {#each estadosMsg as estado}
                <div class="estado-vert estado-vert--{estado.cor}">
                  <div class="estado-vert-nome">{estado.nome}</div>
                  <div class="estado-vert-desc">{estado.oQueAcontece}</div>
                </div>
              {/each}
            </div>
          </div>

          <div>
            <h4 style="margin-bottom: 12px;">O que o Henrique faz hoje</h4>
            <div class="bloco bloco--crit" style="cursor: default; margin-bottom: 16px;">
              <span class="tag">❌ Errado</span>
              <h3>complete_message sempre, até em erro</h3>
              <pre class="payload-mini" data-tipo="json">{`try:
  ...processa...
  await receiver.complete_message(msg)
except Exception as e:
  logger.error(e)
  await receiver.complete_message(msg)  # BUG!`}</pre>
              <p class="desc" style="margin-top: 10px;">
                Msg some pra sempre. Após 1 falha, DLQ nunca recebe. Bug "envenenado" não deixa rastro. <strong>DLQ está vazia o tempo todo no Genesis.</strong>
              </p>
            </div>

            <div class="bloco bloco--ok" style="cursor: default;">
              <span class="tag">✅ Certo</span>
              <h3>Diferenciar erro esperado vs inesperado</h3>
              <pre class="payload-mini" data-tipo="json">{`try:
  ...processa...
  await receiver.complete_message(msg)
except ErroDeNegocio as e:
  # template invalido, contato sem fone, etc
  salvar_falha_no_banco(e)
  await receiver.complete_message(msg)
except Exception as e:
  # banco offline, exception inesperada
  await receiver.abandon_message(msg)
  # → broker retenta. Após 10x, DLQ automatico.`}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. Deadlock != DLQ -->
      <div class="grupo">
        <h4>7 · Deadlock ≠ DLQ (não confundir!)</h4>
        <div class="grid-2">
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">📬 Service Bus</span>
            <h3>DLQ (Dead-Letter Queue)</h3>
            <p class="desc" style="margin-top: 8px;">Sub-fila pra mensagens que falharam N vezes. O broker move automaticamente. Você investiga depois.</p>
            <p class="desc" style="margin-top: 8px;"><strong style="color: var(--text-primary);">Quando:</strong> mensagem "envenenada" que sempre dá pau.</p>
            <p class="desc" style="margin-top: 8px;"><strong style="color: var(--text-primary);">Conserto:</strong> usar abandon_message no erro inesperado.</p>
          </div>

          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">🗄️ SQL</span>
            <h3>Deadlock (banco)</h3>
            <p class="desc" style="margin-top: 8px;">2 transações esperam uma à outra pra liberar lock. Ninguém anda. SQL Server detecta e mata uma com erro 1205.</p>
            <p class="desc" style="margin-top: 8px;"><strong style="color: var(--text-primary);">Quando:</strong> 2 workers fazendo UPDATE em ordem diferente nas mesmas linhas.</p>
            <p class="desc" style="margin-top: 8px;"><strong style="color: var(--text-primary);">Conserto:</strong> sempre lockar recursos NA MESMA ORDEM, transações curtas, NUNCA chamar API externa segurando lock.</p>
          </div>
        </div>

        <div class="bloco" style="cursor: default; margin-top: 16px;">
          <span class="tag">Diferença em uma frase</span>
          <h3>DLQ é sobre MENSAGEM falhada. Deadlock é sobre TRANSAÇÃO presa.</h3>
          <p class="desc" style="margin-top: 8px;">O nome parecido confunde. Mas DLQ vive no Service Bus, deadlock vive no SQL. Causas, sintomas e soluções totalmente diferentes.</p>
        </div>
      </div>

      <!-- 8. Padrões de transação -->
      <div class="grupo">
        <h4>8 · Regras de ouro de transação SQL</h4>
        <div class="grid-2">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Faça</span>
            <h3>Transações curtas</h3>
            <p class="desc">BEGIN → UPDATE → COMMIT em milissegundos. Quanto menos tempo o lock fica aberto, menor a chance de deadlock.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Faça</span>
            <h3>Commit em batches grandes</h3>
            <p class="desc">Loop de 1000 UPDATEs? Commita a cada 50-100. Genesis faz a cada 10 hoje — pode subir pra 50.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Faça</span>
            <h3>Lockar SEMPRE na mesma ordem</h3>
            <p class="desc">Sempre UPDATE destinatario ANTES de UPDATE campanha (ou vice-versa, escolha 1). Workers paralelos não criam deadlock.</p>
          </div>
          <div class="bloco bloco--crit" style="cursor: default;">
            <span class="tag">❌ NÃO faça</span>
            <h3>Chamar API externa dentro de transação</h3>
            <p class="desc">BEGIN → SELECT FOR UPDATE → <strong>await meta.send()</strong> → UPDATE → COMMIT.
              <br><br>Esse <code>await</code> segura lock por segundos enquanto espera HTTP. Outros workers travam. Deadlock garantido em escala.</p>
          </div>
        </div>
      </div>

      <!-- 9. TL;DR -->
      <div class="grupo">
        <h4>9 · TL;DR pros devs (6 frases)</h4>
        <ol class="tldr">
          <li><strong>Banco = ESTADO</strong> (queryable, persistente, mostra na UI). <strong>Fila = TRABALHO</strong> (transitório, coordena workers).</li>
          <li><strong>1 fonte de verdade por dado.</strong> Se um número é importante, ele mora num lugar só — geralmente o banco.</li>
          <li><strong>Coreografia certa:</strong> fila carrega ID e tipo, worker faz UPDATE no banco em cada transição importante pra UI.</li>
          <li><strong>DLQ é sub-fila automática</strong> do Service Bus. Msg que falha N vezes vai pra lá sozinha. Hoje no Genesis nunca chega porque o worker sempre dá complete.</li>
          <li><strong>Conserto da DLQ:</strong> <code>complete</code> só em sucesso ou erro de negócio esperado. <code>abandon</code> em exception inesperada.</li>
          <li><strong>Deadlock ≠ DLQ.</strong> Deadlock é transações SQL presas (erro 1205). DLQ é mensagem falhada no broker. Nomes parecem, problemas e soluções totalmente diferentes.</li>
        </ol>
      </div>
    </section>
  {/if}

  {#if tab === 'plano'}
    <section>
      <h2>Plano de ação</h2>
      <p class="bloco-intro">
        4 fases reversíveis. Sem big bang. Cada fase entrega valor sozinha e a anterior continua funcionando se você travar.
      </p>

      <div class="grupo">
        <div class="fases">
          {#each fasesPlano as fase, i}
            <div class="fase-wrapper">
              <div class="fase-numero">{i}</div>
              <Bloco bloco={fase} onclick={abrirPainel} />
            </div>
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>Sequência sugerida</h4>
        <div class="grid-2">
          <div class="bloco" style="cursor: default;">
            <span class="tag">Próximo passo</span>
            <h3>1. Fazer Fase 0 essa semana</h3>
            <p class="desc">Sem mexer em arquitetura. Só separa workers em App Services. Ganho: backend liberado. Risco: zero.</p>
          </div>
          <div class="bloco" style="cursor: default;">
            <span class="tag">Em paralelo</span>
            <h3>2. Alinhar com Polly sobre Fase 1</h3>
            <p class="desc">Deploy do messaging-service em staging + multi-tenancy + webhook inbound + tópicos. ~2 semanas dela.</p>
          </div>
          <div class="bloco" style="cursor: default;">
            <span class="tag">Você</span>
            <h3>3. Fase 2 com 1 tenant piloto</h3>
            <p class="desc">Feature flag por tenant. Compara métricas antes/depois. Se quebrar, desliga a flag.</p>
          </div>
          <div class="bloco" style="cursor: default;">
            <span class="tag">Depois</span>
            <h3>4. Fase 3 só quando estável</h3>
            <p class="desc">Migra todos os tenants. Remove MetaAPI do Genesis. Cordão cortado.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'execucao'}
    <section>
      <h2>✅ Execução — o que foi feito</h2>
      <p class="bloco-intro">
        Status da migração em <strong>2026-05-22</strong>. Tudo abaixo foi executado nesta sessão. Recursos Azure provisionados, branches criadas, PRs abertos, código em sandbox.
      </p>

      <div class="grupo">
        <h4>1 · Status por bloco</h4>
        <div class="grid-2">
          {#each execucao as item}
            <div class="bloco bloco--{item.estado === 'feito' ? 'ok' : item.estado === 'em-andamento' ? 'warn' : item.estado === 'bloqueado' ? 'crit' : 'info'}" style="cursor: default;">
              <span class="tag">{item.bloco}</span>
              <h3>{item.titulo}</h3>
              <p class="desc" style="margin-top: 6px;">
                {#if item.estado === 'feito'}<span class="chip chip--ok">✅ feito</span>
                {:else if item.estado === 'em-andamento'}<span class="chip chip--warn">⏳ em andamento</span>
                {:else if item.estado === 'bloqueado'}<span class="chip chip--crit">🚫 bloqueado</span>
                {:else}<span class="chip">📋 pendente</span>
                {/if}
              </p>
              <ul style="margin-top: 10px; padding-left: 18px; font-size: 12px; color: var(--text-secondary);">
                {#each item.detalhes as d}
                  <li style="margin-bottom: 4px;">{d}</li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>2 · Recursos Azure provisionados</h4>
        <table class="tabela-donos">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Resource Group / Plan</th>
              <th class="centro">$ /mês</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {#each recursosProvisionados as r}
              <tr>
                <td><code style="font-size: 12px;">{r.nome}</code></td>
                <td style="font-size: 13px;">{r.tipo}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">{r.rg}</td>
                <td class="centro" style="font-size: 12px;">{r.custoMes ?? '—'}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">{r.notas}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="grupo">
        <h4>3 · Pull Requests abertos / mergeados</h4>
        <div class="grid-2">
          {#each prs as pr}
            <div class="bloco" style="cursor: default;">
              <span class="tag">PR #{pr.num} — {pr.repo}</span>
              <h3>{pr.titulo}</h3>
              <p class="desc" style="margin-top: 8px;">
                <strong style="color: var(--text-primary);">Estado:</strong> {pr.estado}<br>
                <code style="font-size: 11px;">{pr.head}</code> → <code style="font-size: 11px;">{pr.base}</code>
              </p>
            </div>
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>4 · Pendências pra próxima sessão</h4>
        <div class="grid-2">
          {#each pendencias as p}
            <div class="bloco bloco--{p.prioridade === 'alta' ? 'crit' : p.prioridade === 'media' ? 'warn' : 'info'}" style="cursor: default;">
              <span class="tag">Prioridade {p.prioridade}</span>
              <h3>{p.acao}</h3>
              <p class="desc" style="margin-top: 6px;">{p.contexto}</p>
            </div>
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>5 · Resumo numérico</h4>
        <div class="grid-3">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Infra Azure</span>
            <h3 style="font-size: 28px; color: var(--purple);">7</h3>
            <p class="desc">novos recursos provisionados (App Services + DB + filas/tópicos)</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Código</span>
            <h3 style="font-size: 28px; color: var(--purple);">~1000</h3>
            <p class="desc">linhas de Python em 9 arquivos novos (Genesis + messaging-service fork)</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">PRs</span>
            <h3 style="font-size: 28px; color: var(--purple);">2</h3>
            <p class="desc">PR #10 mergeado · PR #11 aberto</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Branches</span>
            <h3 style="font-size: 28px; color: var(--purple);">3</h3>
            <p class="desc">Genesis (Fase 0 + Fase 2 + plano) · messaging-service fork</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Risco em PROD</span>
            <h3 style="font-size: 28px; color: var(--ok);">Baixo</h3>
            <p class="desc">Tudo reversível. Flags Fase 2 OFF. Workers separados mas com env var pendente.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Custo /mês</span>
            <h3 style="font-size: 28px; color: var(--purple);">~$31</h3>
            <p class="desc">Sandbox extra (App Services + DB). Pode pausar quando validar.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'checklist'}
    <section>
      <h2>📋 Checklist da Arquitetura — Feito vs Falta</h2>
      <p class="bloco-intro">
        Estado em <strong>2026-05-23 00:50 UTC</strong>. Comparação item a item entre o que o site descreve como alvo (arquitetura "Como deve ficar") e o que está rodando agora em PROD.
      </p>

      <div class="grupo">
        <div class="grid-3">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Concluídos</span>
            <h3 style="font-size: 36px; color: var(--ok);">{stats.feito}<span style="font-size: 16px; color: var(--text-muted);"> / {stats.total}</span></h3>
            <p class="desc">Itens 100% ativos em PROD</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">Parciais</span>
            <h3 style="font-size: 36px; color: var(--warn);">{stats.parcial}<span style="font-size: 16px; color: var(--text-muted);"> / {stats.total}</span></h3>
            <p class="desc">Estrutura pronta mas faltando ativação/integração</p>
          </div>
          <div class="bloco bloco--crit" style="cursor: default;">
            <span class="tag">Faltam</span>
            <h3 style="font-size: 36px; color: var(--crit);">{stats.falta}<span style="font-size: 16px; color: var(--text-muted);"> / {stats.total}</span></h3>
            <p class="desc">Ainda não iniciado</p>
          </div>
        </div>
        <div style="margin-top: 16px; text-align: center;">
          <span style="font-size: 14px; color: var(--text-secondary);">Progresso geral:</span>
          <span style="font-size: 28px; font-weight: 800; color: var(--purple); margin-left: 8px;">{stats.pctFeito}%</span>
        </div>
      </div>

      {#each areas as area}
        <div class="grupo">
          <h4>{area}</h4>
          <table class="tabela-donos">
            <thead>
              <tr>
                <th>Item</th>
                <th class="centro" style="width: 90px;">Estado</th>
                <th>Detalhe</th>
                <th>Bloqueador / Próximo</th>
              </tr>
            </thead>
            <tbody>
              {#each checklist.filter(i => i.area === area) as item}
                <tr>
                  <td><strong>{item.item}</strong></td>
                  <td class="centro">
                    {#if item.estado === 'feito'}
                      <span class="chip chip--ok">✅ feito</span>
                    {:else if item.estado === 'parcial'}
                      <span class="chip chip--warn">⏳ parcial</span>
                    {:else}
                      <span class="chip chip--crit">❌ falta</span>
                    {/if}
                  </td>
                  <td style="font-size: 13px; color: var(--text-secondary);">{item.detalhe}</td>
                  <td style="font-size: 12px; color: var(--text-muted); font-style: italic;">{item.bloqueador ?? '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
    </section>
  {/if}

  {#if tab === 'agentes'}
    <section>
      <h2>🤖 Agentes IA — Neural Architect integrado ao Genesis</h2>
      <p class="bloco-intro">
        Cliente conversa no WhatsApp. Genesis decide se IA responde ou humano. Se IA, uma <strong>equipe de agentes hierárquica</strong> processa: orquestrador delega pra especialistas (suporte, vendas, mídia). Meta: 80% resolvido por IA, 20% escalado pro humano.
      </p>

      <div class="grupo">
        <h4>📍 Status atual</h4>
        <div class="grid-3">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Deployado</span>
            <h3>Neural Architect rodando</h3>
            <p class="desc">Backend + frontend em Azure NoPROD. Mongo Atlas, OpenAI gpt-5, JWT auth. <a href="https://app-ai-teams-frontend-accp.azurewebsites.net" target="_blank" rel="noopener">Abrir UI</a></p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">🔜 Faltando</span>
            <h3>Integração com Genesis</h3>
            <p class="desc">Botões 🤖 Ativar IA / 👤 Re-pegar no chat. Endpoint que chama Neural Architect. Conversa.modo. Smoke E2E com número do Carlos.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Futuro</span>
            <h3>RAG aprendendo</h3>
            <p class="desc">Cada caso resolvido vira documento no RAG. IA fica mais inteligente em produção. Operador re-pega → resposta dele alimenta RAG.</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>🔄 Fluxo end-to-end (clique pra detalhes)</h4>
        <p class="bloco-intro" style="font-size: 0.9em;">
          INPUT → DECISÃO IA/HUMANO → NEURAL ARCHITECT → OUTPUT
        </p>
        <div class="grid-3">
          {#each blocosAgentes as b}
            <Bloco bloco={b} onclick={abrirPainel} />
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>🎯 Os 2 botões no chat do Genesis (a fazer)</h4>
        <div class="grid-2">
          <div class="bloco bloco--purple" style="cursor: default;">
            <span class="tag">Botão 1</span>
            <h3>🤖 Ativar IA</h3>
            <p class="desc">Operador clica → <code>conversa.modo = 'ia'</code>. Próximas mensagens do cliente vão pro Neural Architect e voltam SOZINHAS. Operador pode acompanhar mas não precisa responder.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Botão 2</span>
            <h3>👤 Re-pegar mensagem</h3>
            <p class="desc">Operador clica → <code>conversa.modo = 'humano'</code>. IA para imediatamente. Operador responde manual. Histórico fica salvo — IA pode ser reativada depois.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'rag'}
    <section>
      <h2>🧠 RAG — Pipeline estado da arte (8 etapas)</h2>
      <p class="bloco-intro">
        Como os agentes da IA <strong>realmente lembram</strong> dos cursos da IT Valley.
        Sem LangChain. Python puro. Chunks semânticos. Pinecone. Contextual retrieval da Anthropic. Cohere rerank.
        <br><br>
        <strong>Doc técnico:</strong> <code>cacaviana/ai-teams/docs/RAG_ARCHITECTURE.md</code>
      </p>

      <div class="grupo">
        <h4>📍 Estado ATUAL (o que está rodando HOJE em PROD)</h4>
        <div class="grid-3">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Técnica 1 (F1)</span>
            <h3>Chunking semântico</h3>
            <p class="desc">Markdown-aware em Python puro. Quebra por ## ### \n\n sentença. Cada chunk leva "H1 &gt; H2 &gt; H3:" + conteúdo. backend/rag/chunker.py</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Infra (F2)</span>
            <h3>Pinecone + 3-large</h3>
            <p class="desc">Index <code>neural-architect</code> (3072 dim, AWS us-east-1). Embedding text-embedding-3-large. Namespace por tenant. top_k=30.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Técnica 2 (F3)</span>
            <h3>Contextual Generation</h3>
            <p class="desc">Anthropic 2024. gpt-4o-mini gera 1 frase de contexto pra cada chunk antes do embedding. -49% retrieval failure. Custo: ~$0.02 one-time IT Valley.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">🔜 Técnica 4 (F4)</span>
            <h3>Re-ranking</h3>
            <p class="desc">BGE-reranker-v2-m3 local (grátis) ou Cohere rerank-3.5 (pago). Reordena top 30 → top 5 com cross-encoder. +30% NDCG@5.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">🔜 Técnica 3 (F5)</span>
            <h3>Hybrid Search</h3>
            <p class="desc">Vector + BM25 com Reciprocal Rank Fusion. Captura match exato (MEC, Anhanguera). +15% recall. Custo $0.</p>
          </div>
          <div class="bloco bloco--purple" style="cursor: default;">
            <span class="tag">🎯 Recomendação</span>
            <h3>O que falta atacar</h3>
            <p class="desc">F4 (rerank BGE local) + F5 (hybrid BM25). Total ~3h. Chega no <strong>&lt;3% failure rate</strong> (estado da arte).</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>🆚 Antes vs Depois (smoke real Time IT Valley)</h4>
        <p class="bloco-intro" style="font-size: 0.9em;">3 perguntas reais, mesma base de dados, resposta da IA em cada estado:</p>
        <div class="grid-2">
          <div class="bloco" style="cursor: default; border-left: 4px solid #f87171;">
            <span class="tag">❌ RAG v1 (chunks 500 + ada-002)</span>
            <h3>"Quais módulos tem a Pós em Eng. Dados?"</h3>
            <p class="desc">"a ementa detalhada não está publicada no site no momento. A escola envia o PDF oficial ao solicitar via 'Receber informações'..." <strong>~600 chars genéricos</strong>. Failure: deu desculpa em vez de citar ementa.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ RAG v2 (F1+F2+F3 atual)</span>
            <h3>Mesma pergunta — RAG v2</h3>
            <p class="desc">"Módulo 1 — Programação para Engenheiros e Cientistas de Dados [CONFIRMADO NA BASE]. Ementa oficial: 'Fundamentos de Python aplicados à manipulação...' [Fonte 1/2]" <strong>7.503 chars estruturados com citações</strong>.</p>
          </div>
          <div class="bloco" style="cursor: default; border-left: 4px solid #f87171;">
            <span class="tag">❌ RAG v1</span>
            <h3>"A Pós em IA é certificada pelo MEC?"</h3>
            <p class="desc">Antes não tinha resposta certeira — palavras "MEC" e "Anhanguera" ficavam em chunks órfãos. Falava genericamente sobre certificações.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ RAG v2</span>
            <h3>Mesma pergunta — RAG v2</h3>
            <p class="desc"><strong>326 chars certeiros:</strong> "Sim, a Pós em IA tem diploma MEC. Chancelada via parceria com a Anhanguera. Trecho oficial: 'O diploma é reconhecido pelo MEC, em função da parceria da IT Valley School com a Anhanguera...'"</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>🏛️ Arquitetura do banco RAG (Pinecone)</h4>
        <div class="grid-2">
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Index</span>
            <h3>neural-architect</h3>
            <p class="desc">
              • Cloud: AWS us-east-1 (serverless free)<br>
              • Dimensão: 3072 (text-embedding-3-large)<br>
              • Metric: cosine<br>
              • Host: neural-architect-xb3w3p4.svc.aped-4627-b74a.pinecone.io
            </p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Isolamento</span>
            <h3>Namespace por tenant</h3>
            <p class="desc">
              • tenant-it-valley → 280 chunks atuais<br>
              • tenant-cliente-X → futuro (zero risco vazamento)<br>
              • Filter metadata: agent_id (cada agente tem seu RAG)<br>
              • Auth: API key no Key Vault (kv-api-key-itvalley/pinecone-api-key)
            </p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Metadata por chunk</span>
            <h3>O que guardamos</h3>
            <p class="desc">
              • tenant_id, agent_id, doc_id, chunk_index<br>
              • text (chunk original, full — sem truncar)<br>
              • header_path (caminho "H1 &gt; H2 &gt; H3")<br>
              • (futuro) sparse_vector pra hybrid search
            </p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Pipeline ingestão</span>
            <h3>Quando cliente sobe doc</h3>
            <p class="desc">
              1. extract_text (PDF/MD/HTML → markdown)<br>
              2. chunk_markdown (semântico)<br>
              3. generate_contexts (gpt-4o-mini)<br>
              4. enrich_chunks (contexto + chunk)<br>
              5. get_embeddings (3-large 3072 dim)<br>
              6. store.upsert → Pinecone namespace=tenant
            </p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>🏗️ Arquitetura IT Valley aplicada (Clean Architecture)</h4>
        <div class="grid-2">
          <div class="bloco bloco--purple" style="cursor: default;">
            <span class="tag">Princípios</span>
            <h3>Como organizamos o RAG no backend</h3>
            <p class="desc">
              • routers/ → camada opaca HTTP<br>
              • services/ → orquestração<br>
              • factories/ → regras de negócio<br>
              • data/repositories/ → Mongo (operacional)<br>
              • <strong>rag/</strong> → módulo técnico isolado<br>
              • <strong>Sem LangChain</strong> — Python puro, funções simples
            </p>
          </div>
          <div class="bloco bloco--purple" style="cursor: default;">
            <span class="tag">backend/rag/</span>
            <h3>Estrutura técnica</h3>
            <p class="desc">
              • chunker.py — Técnica 1 (semântico)<br>
              • contextual.py — Técnica 2 (Anthropic)<br>
              • embedder.py — OpenAI 3-large<br>
              • vector_store.py — Pinecone backend<br>
              • reranker.py — Técnica 4 (BGE/Cohere) 🔜<br>
              • pipeline.py — orquestra tudo<br>
              • text_extractor.py — PDF/DOCX/MD
            </p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>📐 Pipeline (clique pra detalhes técnicos)</h4>
        <p class="bloco-intro" style="font-size: 0.9em;">
          INGESTÃO → CHUNKING → CONTEXTUAL GEN → EMBEDDING → STORAGE → RETRIEVAL → RE-RANK → INJECTION
        </p>
        <div class="grid-3">
          {#each blocosRAG as b}
            <Bloco bloco={b} onclick={abrirPainel} />
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>🎯 5 princípios inegociáveis</h4>
        <div class="grid-3">
          <div class="bloco bloco--purple" style="cursor: default;">
            <span class="tag">Princípio 1</span>
            <h3>Sem LangChain</h3>
            <p class="desc">Lib inflada, breaking changes, abstrações demais. Python puro com OpenAI SDK + Pinecone client direto. ~200 linhas resolvem o que LangChain faz em 2000.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Princípio 2</span>
            <h3>Chunks semânticos</h3>
            <p class="desc">Quebra por estrutura (## headers) — nunca por contagem de chars. Cada chunk é uma unidade auto-contida de significado.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">Princípio 3</span>
            <h3>Contexto pai injetado</h3>
            <p class="desc">Cada chunk leva o caminho hierárquico ("H1 &gt; H2 &gt; H3:") + resumo de contexto. Chunk órfão = retrieval ruim.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">Princípio 4</span>
            <h3>Multi-tenant nativo</h3>
            <p class="desc">Namespace por tenant_id no Pinecone. Filtro por agent_id em metadata. Zero risco de vazamento entre clientes.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Princípio 5</span>
            <h3>Observável</h3>
            <p class="desc">Cada query loga: latência por etapa, scores dos top 5, custo. Métricas em Application Insights + alertas.</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>📊 Comparação: RAG v1 (broken) vs RAG v2 (state of art)</h4>
        <div class="grid-2">
          <div class="bloco" style="cursor: default; border-left: 4px solid #f87171;">
            <span class="tag">❌ RAG v1 — atual</span>
            <h3>O que estava errado</h3>
            <p class="desc">
              • Chunks de 500 chars genéricos (corta no meio de seção)<br>
              • Embedding ada-002 (legado, MTEB 60.99)<br>
              • Mongo Atlas Vector (sem hybrid)<br>
              • top_k=5 sem rerank<br>
              • Failure rate ~50% pra perguntas estruturadas
            </p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ RAG v2 — alvo</span>
            <h3>Estado da arte</h3>
            <p class="desc">
              • Markdown-aware chunking (semântico)<br>
              • Contextual generation (Anthropic 2024)<br>
              • text-embedding-3-large (MTEB 64.59)<br>
              • Pinecone hybrid (vector + BM25)<br>
              • Cohere rerank-3 (top 5 final)<br>
              • Failure rate &lt;3% (provado em paper)
            </p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>💰 Custo (pro Time IT Valley — 12 docs)</h4>
        <div class="grid-3">
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">One-time</span>
            <h3>Ingestão completa</h3>
            <p class="desc">~$0.50 (contextual gen com gpt-4o-mini + embedding 3-large). Roda 1x por documento.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Por query</span>
            <h3>Custo de cada resposta</h3>
            <p class="desc">~$0.001 (embedding da query + Cohere rerank). gpt-5 do agente é custo separado.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">Free tier</span>
            <h3>Pinecone + Cohere</h3>
            <p class="desc">Pinecone serverless free: 100k vectors, 5 indexes. Cohere rerank free: 1k req/mês. Vai bater quando escalar.</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'rag101'}
    <section>
      <h2>📚 RAG 101 — Mini-curso do zero ao estado da arte</h2>
      <p class="bloco-intro">
        Pra ti + tua equipe entender <strong>por que estamos investindo em RAG estado da arte</strong> no AI-Teams.
        Linguagem direta, analogias, exemplos antes/depois. 8 capítulos.
        <br><br>
        <strong>Tempo de leitura:</strong> ~20min. <strong>Pré-requisito:</strong> zero.
      </p>

      <div class="curso-toc">
        <h4>📑 Sumário</h4>
        <div class="grid-2">
          {#each capitulosRAG as cap}
            <button
              class="curso-toc-item"
              class:ativo={capituloAberto === cap.numero}
              onclick={() => capituloAberto = capituloAberto === cap.numero ? null : cap.numero}
            >
              <span class="curso-toc-num">{cap.numero}</span>
              <span class="curso-toc-icone">{cap.icone}</span>
              <div class="curso-toc-texto">
                <strong>{cap.titulo}</strong>
                <small>{cap.resumo}</small>
              </div>
            </button>
          {/each}
        </div>
      </div>

      {#each capitulosRAG as cap}
        {#if capituloAberto === cap.numero}
          <div class="curso-capitulo">
            <div class="curso-cap-header">
              <span class="curso-cap-num">Capítulo {cap.numero}</span>
              <h3>{cap.icone} {cap.titulo}</h3>
            </div>

            <div class="curso-cap-conteudo">
              {#each cap.conteudo.split('\n\n') as paragrafo}
                {#if paragrafo.startsWith('## ')}
                  <h4>{paragrafo.replace(/^## /, '')}</h4>
                {:else if paragrafo.startsWith('### ')}
                  <h5>{paragrafo.replace(/^### /, '')}</h5>
                {:else if paragrafo.startsWith('```')}
                  <pre class="curso-code">{paragrafo.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')}</pre>
                {:else if paragrafo.startsWith('|')}
                  <div class="curso-tabela-wrapper">
                    <table class="curso-tabela">
                      {#each paragrafo.split('\n') as linha, i}
                        {#if i === 0}
                          <thead>
                            <tr>
                              {#each linha.split('|').slice(1, -1) as col}
                                <th>{col.trim()}</th>
                              {/each}
                            </tr>
                          </thead>
                        {:else if i === 1}
                          <!-- separador, ignora -->
                        {:else}
                          <tr>
                            {#each linha.split('|').slice(1, -1) as col}
                              <td>{@html col.trim().replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</td>
                            {/each}
                          </tr>
                        {/if}
                      {/each}
                    </table>
                  </div>
                {:else}
                  <p>{@html paragrafo.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>
                {/if}
              {/each}
            </div>

            {#if cap.exemplos}
              <div class="curso-exemplos">
                <h4>📝 Exemplos</h4>
                {#each cap.exemplos as ex}
                  <div class="curso-exemplo">
                    <strong>{ex.titulo}</strong>
                    {#if ex.antes}
                      <pre class="exemplo-antes">{ex.antes}</pre>
                    {/if}
                    {#if ex.depois}
                      <pre class="exemplo-depois">{ex.depois}</pre>
                    {/if}
                    {#if ex.texto}
                      <pre class="curso-code">{ex.texto}</pre>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}

            {#if cap.glossario}
              <div class="curso-glossario">
                <h4>📖 Glossário deste capítulo</h4>
                <dl>
                  {#each cap.glossario as g}
                    <dt>{g.termo}</dt>
                    <dd>{g.definicao}</dd>
                  {/each}
                </dl>
              </div>
            {/if}

            {#if cap.checklist}
              <div class="curso-checklist">
                {#each cap.checklist as it}
                  <div class="curso-check-item curso-check-{it.status}">
                    <span class="check-icon">
                      {#if it.status === 'feito'}✅
                      {:else if it.status === 'parcial'}🟡
                      {:else}⏳{/if}
                    </span>
                    <div>
                      <strong>{it.item}</strong>
                      {#if it.nota}<small>{it.nota}</small>{/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            <div class="curso-nav">
              {#if cap.numero > 1}
                <button class="curso-nav-btn" onclick={() => capituloAberto = cap.numero - 1}>
                  ← Capítulo {cap.numero - 1}
                </button>
              {/if}
              {#if cap.numero < capitulosRAG.length}
                <button class="curso-nav-btn curso-nav-next" onclick={() => capituloAberto = cap.numero + 1}>
                  Capítulo {cap.numero + 1} →
                </button>
              {/if}
            </div>
          </div>
        {/if}
      {/each}

      <div class="curso-recursos">
        <h4>🔗 Recursos extras (pra aprofundar)</h4>
        <ul>
          {#each recursosExtras as r}
            <li><a href={r.url} target="_blank" rel="noopener">{r.titulo}</a></li>
          {/each}
        </ul>
      </div>
    </section>
  {/if}

  {#if tab === 'ferramentas'}
    <section>
      <h2>Ferramentas</h2>
      <p class="bloco-intro">
        O que cada peça é, onde mora, e quando entra em cena. Clique pra detalhes técnicos.
      </p>

      <div class="grupo">
        <h4>Aplicação</h4>
        <div class="grid-3">
          {#each ferramentas.filter(f => ['svelte','fastapi'].includes(f.id)) as f}
            <Bloco bloco={f} onclick={abrirPainel} />
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>Infra & Mensageria</h4>
        <div class="grid-3">
          {#each ferramentas.filter(f => ['sb','azure-sql','app-service','static-web-apps','gh-actions'].includes(f.id)) as f}
            <Bloco bloco={f} onclick={abrirPainel} />
          {/each}
        </div>
      </div>

      <div class="grupo">
        <h4>Providers externos</h4>
        <div class="grid-3">
          {#each ferramentas.filter(f => ['meta-tool','twilio','ig'].includes(f.id)) as f}
            <Bloco bloco={f} onclick={abrirPainel} />
          {/each}
        </div>
      </div>
    </section>
  {/if}

  {#if tab === 'pilares'}
    <section>
      <h2>🛡️ Pilares Arquiteturais — 2026-05-26</h2>
      <p class="bloco-intro">
        Depois de um incidente PROD onde a UI dizia <strong>"Enviado"</strong> mas o cliente <strong>não recebia</strong>, mudamos a postura: arquiteto vê o sistema inteiro, não só o sintoma. Esses são os 6 pilares que separam "sistema que funciona com sorte" de "sistema confiável".
      </p>

      <div class="grupo">
        <h4>Os 6 Pilares</h4>
        <div class="grid-2">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Pilar 1 · DONE</span>
            <h3>Observabilidade</h3>
            <p class="desc">Application Insights <code>appi-genesis</code> + OpenTelemetry SDK em todos os entry points (backend, workers). Auto-instrumentação: requests, dependencies, SB, SQL, exceptions. Spans manuais pra publish/consume. <strong>Sem isso, não teríamos descoberto o "body Field required" da Polly.</strong></p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Pilar 2 · DONE</span>
            <h3>Contract Tests Genesis↔Polly</h3>
            <p class="desc">15 testes em <code>tests/contract/</code> copiam o <code>SendMessageRequest</code> da Polly. Bloqueia drift de DTO. GitHub Actions <code>contract-drift-check.yml</code> roda em PR + diário. Se a Polly mudar contrato, o build quebra antes do deploy.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">✅ Pilar 3 · DONE backend</span>
            <h3>Verdade nos Status</h3>
            <p class="desc">Status flow: <code>enviando → enviada → entregue → lida</code> ou <code>falha</code>. Coluna <code>erro_motivo</code> (500 chars) + <code>idempotency_key</code> (correlação dupla com Polly: por wamid OU idempotency_key). UI ainda mostra só "Enviado/Falha" — frontend pra mostrar <code>erro_motivo</code> é Pilar 3 parte 2.</p>
          </div>
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">⏳ Pilar 4 · PARCIAL</span>
            <h3>Deploy Resiliência</h3>
            <p class="desc">Parte 1 DONE: <code>concurrency.group</code> por app-name em 3 workflows PROD (protege 409 Conflict). Falta: workflows accp, custom Docker image (escapar do antenv quebrando com base image Azure), deployment slots zero-downtime.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">⏳ Pilar 5 · PENDING</span>
            <h3>Smoke E2E Automatizado</h3>
            <p class="desc">Logic App hourly que dispara template real pro Carlos+Laura, valida wamid retornado, alerta se quebrar. Hoje só tem smoke manual. ~2h pra implementar.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">⏳ Pilar 6 · PENDING (depende Polly)</span>
            <h3>PR no repo messaging-service</h3>
            <p class="desc">Worker da Polly publicar <code>message.failed</code> em <code>messaging.status</code> quando ValidationError. Hoje em validation error: <code>complete_message</code> silencioso = mensagem perde, status_updater do Genesis nunca atualiza, UI fica "enviando" eterno. Precisa abrir PR em ITValley-School/messaging-service.</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>Bugs arquitetônicos descobertos hoje (e como resolvemos)</h4>
        <div class="grid-2">
          <div class="bloco bloco--ok" style="cursor: default;">
            <span class="tag">🐛 → ✅ RESOLVIDO</span>
            <h3>Service Bus compartilhado PROD↔ACCP</h3>
            <p class="desc">Namespace <code>genesisitvalley</code> era usado pelos apps PROD <strong>e</strong> ACCP. <code>app-genesis-backend-accp</code> (código velho) consumia fila <code>genesis-campanhas</code> de PROD e publicava em <code>messaging.send</code> SEM o campo <code>body</code>. Polly rejeitava. Carlos batia: "não recebi". Fix: criado namespace <code>genesisitvalley-accp</code> (Standard, eastus) + replicadas 5 queues + 3 topics + 4 subscriptions + apontados apps ACCP pro novo. Sangria estancada.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">🐛 WORKAROUND ATIVO</span>
            <h3>Worker standalone morre por warmup probe</h3>
            <p class="desc">Apps <code>worker-genesis-campanhas</code> e <code>worker-genesis-webhooks</code> rodam <code>python main_worker_X.py</code> (loop puro, sem FastAPI). Azure App Service espera resposta HTTP em :8000 — warmup probe falha após 600s → container terminated. Workaround: <code>CAMPANHA_WORKER_SEPARADO=false</code> no backend principal pra rodar todos os loops via lifespan (backend é FastAPI nativo, probe passa). Fix correto: cada worker expor <code>/health</code> HTTP simples paralelo ao loop.</p>
          </div>
          <div class="bloco bloco--warn" style="cursor: default;">
            <span class="tag">🐛 EM ABERTO</span>
            <h3>Polly faz drop silencioso em ValidationError</h3>
            <p class="desc"><code>send_worker._handle_message()</code> chama <code>receiver.complete_message(msg)</code> mesmo quando o DTO falha. Sem publicar <code>message.failed</code>, o Genesis não tem como saber. Pilar 3 (verdade) fica mancando porque a Polly some com a mensagem. <strong>Sintoma:</strong> UI mostra "Enviado" e celular não toca, porque <code>messaging-service</code> "comeu" a msg. Fix em <code>workers/send_worker.py</code>: emit <code>self._publicar_evento</code> com event=message.failed antes do complete.</p>
          </div>
          <div class="bloco bloco--info" style="cursor: default;">
            <span class="tag">🐛 KNOWN · BR-only</span>
            <h3>normalizar_telefone rejeita internacionais</h3>
            <p class="desc"><code>normalizar_telefone("15815780564")</code> sem <code>+</code> retornava <code>""</code> pra Carlos (Canadá +1). Fix em <code>campanha_service.disparar</code>: usar <code>ContatoModel.telefone_e164</code> direto do banco, fallback pra <code>normalizar_telefone</code> só se vazio. UI precisa exigir E.164 com <code>+</code> obrigatório no input.</p>
          </div>
          <div class="bloco bloco--ghost" style="cursor: default;">
            <span class="tag">💡 GAP ARQUITETURAL</span>
            <h3>Sem watchdog pra "enviando" eterno</h3>
            <p class="desc">Mensagem com <code>status="enviando"</code> há mais de N min sem evento <code>message.sent</code> da Polly deveria virar <code>falha</code> com <code>erro_motivo="timeout_polly"</code> automaticamente + alerta. Hoje fica eternamente. Job periódico (a cada 5min): UPDATE mensagens SET status='falha', erro_motivo='timeout_polly' WHERE status='enviando' AND created_at &lt; NOW() - INTERVAL '10 min'.</p>
          </div>
          <div class="bloco bloco--ghost" style="cursor: default;">
            <span class="tag">💡 GAP ARQUITETURAL</span>
            <h3>UI não exibe erro_motivo</h3>
            <p class="desc"><code>MensagemDTO</code> do frontend tem <code>erroMotivo</code> e <code>statusLabel</code> com tooltip ("Falha: número inválido"), mas as views de campanha mostram só "Enviado"/"Falha" sem motivo. Operador vê falha mas não sabe POR QUÊ. Falta: render do <code>statusLabel</code> + ícone diferenciado em <code>campaigns/[id]/+page.svelte</code>.</p>
          </div>
        </div>
      </div>

      <div class="grupo">
        <h4>Smoke E2E real — 26/05 19:31 UTC</h4>
        <div class="bloco bloco--ok" style="cursor: default;">
          <span class="tag">✅ FUNCIONOU PONTA A PONTA</span>
          <h3>Campanha <code>d658b833</code> · 2 destinatários · 2 entregues</h3>
          <p class="desc">
            <strong>19:18:32</strong> Carlos clica "Disparar" no frontend (genesisbackendd recebe 202).<br>
            <strong>19:18:33</strong> Backend enfileira em <code>genesis-campanhas</code>.<br>
            <strong>~19:31</strong> Backend (lifespan worker, pós-fix <code>CAMPANHA_WORKER_SEPARADO=false</code>) consome, chama <code>publicar_mensagem_outbound</code> com <code>body=[template:teste1001]</code>.<br>
            <strong>19:31:56</strong> Polly <code>send_worker_done id=7f052d2b status=sent wamid=...393</code> → <strong>Laura</strong> recebeu (<code>+5517992379339</code>).<br>
            <strong>19:32:00</strong> Polly <code>send_worker_done id=7d69be68 status=sent wamid=HBgLMTU4MTU3ODA1NjQ...</code> → <strong>Carlos</strong> recebeu (<code>+15815780564</code>).<br>
            <strong>19:32:01-03</strong> Eventos <code>message.delivered</code> publicados em <code>messaging.status</code>.<br>
            Carlos confirmou no celular: "chegou no meu celular". <strong>Pilar 3 verde end-to-end pelo caminho feliz.</strong>
          </p>
        </div>
      </div>

      <div class="grupo">
        <h4>Postura: arquiteto, não dev tático</h4>
        <div class="bloco bloco--info" style="cursor: default;">
          <span class="tag">📜 Princípio</span>
          <h3>Antes de mexer em código, expor riscos sistêmicos</h3>
          <p class="desc">
            Frases-gatilho da sessão de hoje:<br>
            • <em>"tu ta agindo como arquiteto?"</em> → reavaliar postura, expor riscos.<br>
            • <em>"100% correto"</em> → não cantar vitória sem evidência REAL (msg chegou no celular, não "Genesis diz que enviou").<br>
            • <em>"observabilidade"</em> → o sintoma de estar debugando no escuro.<br>
            • <em>"minha equipe vai usar"</em> → solução tem que ser robusta, não MVP.<br>
            • <em>"deveria ter prefixo prod, ne?"</em> → Carlos chegou na causa raiz antes do Claude.
          </p>
        </div>
      </div>
    </section>
  {/if}
</main>

<footer class="rodape container">
  <p>Genesis Roadmap · NoPROD · construído com Svelte 5 + Vite · clique nos blocos pra entender cada peça</p>
</footer>

<PainelDetalhe bloco={blocoSelecionado} aberto={painelAberto} onClose={fechar} />
<PainelCaso caso={casoSelecionado} ator={atorSelecionado} aberto={painelCasoAberto} onClose={fecharCaso} />

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }

  .topo {
    padding: 48px 0 16px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-overlay);
    backdrop-filter: blur(8px);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }
  .brand-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--purple);
    box-shadow: 0 0 24px var(--purple);
  }
  .subtitulo {
    color: var(--text-secondary);
    font-size: 14px;
    margin-top: 4px;
  }

  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
  }
  .tabs button {
    padding: 14px 22px;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    transition: all var(--t);
    white-space: nowrap;
  }
  .tabs button:hover { color: var(--text-primary); }
  .tabs button.ativo {
    color: var(--purple);
    border-bottom-color: var(--purple);
  }

  .conteudo {
    padding: 48px 24px 80px;
  }

  .bloco-intro {
    max-width: 760px;
    color: var(--text-secondary);
    margin: 12px 0 32px;
    font-size: 16px;
  }

  .grupo {
    margin-top: 48px;
  }
  .grupo h4 {
    margin-bottom: 18px;
  }

  .fluxo {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 12px;
  }
  .fluxo :global(.bloco) {
    min-width: 220px;
    max-width: 240px;
    flex-shrink: 0;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) {
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
  }

  .fases {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .fase-wrapper {
    position: relative;
  }
  .fase-numero {
    position: absolute;
    top: -12px;
    left: -12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--purple);
    color: white;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: var(--shadow-purple);
  }

  .rodape {
    padding: 32px 24px;
    border-top: 1px solid var(--border);
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
  }

  /* ===== Diagrama de atores e casos ===== */
  .diagrama {
    margin-top: 24px;
    background: linear-gradient(180deg, var(--bg-card) 0%, transparent 100%);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 32px;
    overflow-x: auto;
  }

  .atores-linha {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px dashed var(--border);
    position: sticky;
    top: 100px;
    background: var(--bg-primary);
    z-index: 10;
    padding-top: 4px;
  }
  .ator-coluna-cabecalho {
    display: flex;
    justify-content: center;
  }
  .ator-coluna-cabecalho :global(.boneco) {
    min-width: 180px;
  }

  .bolas-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px 24px;
    align-items: center;
    justify-items: center;
  }

  .linha-caso {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .seta-vertical {
    grid-row: span 1;
    color: var(--purple);
    font-size: 22px;
    opacity: 0.6;
    text-align: center;
    line-height: 1;
    padding: 4px 0;
  }

  @media (max-width: 900px) {
    .atores-linha, .bolas-grid {
      grid-template-columns: repeat(4, minmax(180px, 1fr));
      min-width: 800px;
    }
    .diagrama { padding: 20px; }
  }

  /* ===== Service Bus 101 ===== */
  .hierarquia { margin-top: 8px; }
  .camada {
    border-radius: var(--r);
    padding: 18px 20px;
    margin-top: 14px;
    position: relative;
  }
  .camada-label {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }
  .camada-desc { font-size: 13px; margin: 0; color: var(--text-secondary); }
  .camada-1 {
    background: rgba(168, 85, 247, 0.06);
    border: 1px solid var(--border-purple);
  }
  .camada-2 {
    background: var(--bg-card);
    border: 1px solid var(--border);
    margin-left: 24px;
  }
  .camada-3 {
    background: var(--bg-input);
    border: 1px solid var(--border);
    margin-left: 24px;
  }
  .camada-3-dlq {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.30);
    margin-left: 24px;
    border-radius: var(--r);
    padding: 18px 20px;
    margin-top: 14px;
  }

  .anatomia {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  .anatomia-parte {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 18px;
  }
  .anatomia-parte h3 { font-size: 16px; margin: 6px 0; }
  .payload-mini {
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 10px 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.5;
    margin: 10px 0 0;
    overflow-x: auto;
    color: var(--text-primary);
  }
  .payload-mini[data-tipo="json"] { border-left: 3px solid var(--purple); }

  .chip-mini {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--r-pill);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid;
  }
  .chip-mini--auto    { color: var(--info); background: rgba(96,165,250,0.10); border-color: rgba(96,165,250,0.30); }
  .chip-mini--seta    { color: var(--purple); background: var(--purple-soft); border-color: var(--border-purple); }
  .chip-mini--opcional{ color: var(--warn); background: rgba(245,158,11,0.10); border-color: rgba(245,158,11,0.30); }

  /* Queue vs Topic */
  .vs-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 24px;
    align-items: stretch;
  }
  .vs-coluna {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 24px;
    text-align: center;
  }
  .vs-queue { border-color: var(--info); }
  .vs-topic { border-color: var(--purple); }
  .vs-icone { font-size: 42px; margin-bottom: 8px; }
  .vs-tagline {
    color: var(--text-secondary);
    margin: 6px 0 18px;
    font-size: 14px;
  }
  .vs-fluxo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 16px 0;
    flex-wrap: wrap;
  }
  .vs-fluxo-topic {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 6px;
  }
  .vs-box {
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .vs-box--purple { background: var(--purple-soft); border-color: var(--border-purple); color: var(--purple); }
  .vs-box--small { font-size: 11px; padding: 6px 10px; }
  .vs-seta { color: var(--purple); font-size: 16px; }
  .vs-seta-multi { display: flex; flex-direction: column; gap: 4px; color: var(--purple); }
  .vs-subs { display: flex; flex-direction: column; gap: 4px; }
  .vs-lista {
    text-align: left;
    padding-left: 18px;
    margin: 14px 0 0;
    font-size: 13px;
    color: var(--text-secondary);
  }
  .vs-lista li { margin-bottom: 6px; }
  .vs-divisor {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vs-vs {
    background: var(--purple);
    color: white;
    font-weight: 800;
    font-size: 14px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-purple);
  }

  /* Estados */
  .estados {
    display: flex;
    align-items: stretch;
    gap: 12px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .estado {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 18px 16px;
    text-align: center;
    min-width: 180px;
    flex: 1;
  }
  .estado h3 { font-size: 15px; margin: 8px 0; }
  .estado p { font-size: 12px; color: var(--text-secondary); margin: 0; }
  .estado-icone { font-size: 28px; }
  .estado-active  { border-color: var(--border-purple); }
  .estado-locked  { border-color: var(--warn); }
  .estado-ok      { border-color: var(--ok); }
  .estado-abandon { border-color: var(--info); }
  .estado-dlq     { border-color: var(--crit); }
  .estado-seta {
    align-self: center;
    color: var(--purple);
    font-size: 20px;
    padding: 0 4px;
  }
  .estado-decisao {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    flex: 2;
    min-width: 540px;
  }

  /* TL;DR */
  .tldr {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 4px solid var(--purple);
    border-radius: var(--r);
    padding: 20px 28px 20px 44px;
    margin: 0;
  }
  .tldr li {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 10px;
  }
  .tldr li:last-child { margin-bottom: 0; }
  .tldr li strong { color: var(--text-primary); }

  @media (max-width: 900px) {
    .anatomia { grid-template-columns: 1fr; }
    .vs-grid { grid-template-columns: 1fr; }
    .vs-divisor { padding: 12px 0; }
  }

  /* ===== Coreografia ===== */
  .coreografia {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .coreo-passo {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 14px 18px;
  }
  .coreo-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--purple);
    color: white;
    font-weight: 800;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: var(--shadow-purple);
  }
  .coreo-corpo { flex: 1; }
  .coreo-onde {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: var(--r-pill);
    margin-bottom: 6px;
  }
  .coreo-banco {
    background: rgba(96, 165, 250, 0.10);
    color: var(--info);
    border: 1px solid rgba(96, 165, 250, 0.30);
  }
  .coreo-fila {
    background: var(--purple-soft);
    color: var(--purple);
    border: 1px solid var(--border-purple);
  }
  .coreo-corpo p { color: var(--text-primary); font-size: 13px; margin: 0; }
  .coreo-corpo code { font-size: 12px; }
  .coreo-corpo small {
    display: block;
    margin-top: 6px;
    color: var(--text-muted);
    font-size: 12px;
    font-style: italic;
  }

  /* ===== Estados vertical ===== */
  .estados-vert {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .estado-vert {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 3px solid var(--border);
    border-radius: var(--r);
    padding: 12px 16px;
  }
  .estado-vert--ok   { border-left-color: var(--ok); }
  .estado-vert--info { border-left-color: var(--info); }
  .estado-vert--warn { border-left-color: var(--warn); }
  .estado-vert--crit { border-left-color: var(--crit); }
  .estado-vert-nome {
    font-weight: 700;
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .estado-vert-desc {
    color: var(--text-secondary);
    font-size: 12px;
  }

  /* ===== Seções mini dentro de bloco ===== */
  .secao-mini {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  /* ===== Mini-curso RAG 101 ===== */
  .curso-toc {
    margin-bottom: 32px;
  }
  .curso-toc h4 {
    margin-bottom: 12px;
  }
  .curso-toc-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
    color: var(--text);
  }
  .curso-toc-item:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }
  .curso-toc-item.ativo {
    border-color: var(--accent);
    background: rgba(96, 165, 250, 0.08);
  }
  .curso-toc-num {
    font-size: 22px;
    font-weight: 700;
    color: var(--accent);
    width: 32px;
    text-align: center;
    flex-shrink: 0;
  }
  .curso-toc-icone {
    font-size: 24px;
    flex-shrink: 0;
  }
  .curso-toc-texto {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .curso-toc-texto strong {
    font-size: 14px;
  }
  .curso-toc-texto small {
    font-size: 12px;
    color: var(--text-muted);
  }
  .curso-capitulo {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
  }
  .curso-cap-header {
    border-bottom: 2px solid var(--accent);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .curso-cap-num {
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .curso-cap-header h3 {
    margin: 4px 0 0 0;
    font-size: 28px;
  }
  .curso-cap-conteudo {
    line-height: 1.7;
    font-size: 15px;
  }
  .curso-cap-conteudo h4 {
    margin-top: 28px;
    margin-bottom: 12px;
    font-size: 18px;
    color: var(--accent-light, #93c5fd);
  }
  .curso-cap-conteudo h5 {
    margin-top: 20px;
    margin-bottom: 8px;
    font-size: 16px;
  }
  .curso-cap-conteudo p {
    margin: 12px 0;
  }
  .curso-cap-conteudo code {
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .curso-code {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 12px 0;
    white-space: pre-wrap;
  }
  .curso-tabela-wrapper {
    overflow-x: auto;
    margin: 16px 0;
  }
  .curso-tabela {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .curso-tabela th {
    background: rgba(96, 165, 250, 0.15);
    padding: 10px 14px;
    text-align: left;
    border-bottom: 2px solid var(--accent);
    font-weight: 600;
  }
  .curso-tabela td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
  }
  .curso-exemplos {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .curso-exemplo {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 16px;
    margin: 12px 0;
  }
  .curso-exemplo strong {
    display: block;
    margin-bottom: 8px;
    color: var(--accent-light, #93c5fd);
  }
  .exemplo-antes {
    background: rgba(248, 113, 113, 0.1);
    border-left: 3px solid #f87171;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 8px 0;
    white-space: pre-wrap;
    font-size: 13px;
  }
  .exemplo-depois {
    background: rgba(74, 222, 128, 0.1);
    border-left: 3px solid #4ade80;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 8px 0;
    white-space: pre-wrap;
    font-size: 13px;
  }
  .curso-glossario {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .curso-glossario dl {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 12px 24px;
    margin: 12px 0;
  }
  .curso-glossario dt {
    font-weight: 600;
    color: var(--accent-light, #93c5fd);
  }
  .curso-glossario dd {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .curso-checklist {
    margin-top: 16px;
  }
  .curso-check-item {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin: 8px 0;
    border-left: 3px solid var(--border);
  }
  .curso-check-item.curso-check-feito {
    border-left-color: #4ade80;
  }
  .curso-check-item.curso-check-parcial {
    border-left-color: #fbbf24;
  }
  .curso-check-item.curso-check-falta {
    border-left-color: #94a3b8;
  }
  .check-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  .curso-check-item strong {
    display: block;
    font-size: 14px;
  }
  .curso-check-item small {
    display: block;
    color: var(--text-muted);
    font-size: 12px;
    margin-top: 4px;
  }
  .curso-nav {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .curso-nav-btn {
    background: rgba(96, 165, 250, 0.1);
    border: 1px solid var(--accent);
    color: var(--accent-light, #93c5fd);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .curso-nav-btn:hover {
    background: rgba(96, 165, 250, 0.2);
  }
  .curso-nav-next {
    margin-left: auto;
  }
  .curso-recursos {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
  }
  .curso-recursos ul {
    padding-left: 20px;
    margin: 12px 0;
  }
  .curso-recursos li {
    margin: 8px 0;
  }
  .curso-recursos a {
    color: var(--accent-light, #93c5fd);
    text-decoration: none;
  }
  .curso-recursos a:hover {
    text-decoration: underline;
  }
</style>
