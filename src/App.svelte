<script lang="ts">
  import Bloco from './lib/Bloco.svelte';
  import PainelDetalhe from './lib/PainelDetalhe.svelte';
  import Boneco from './lib/Boneco.svelte';
  import Bola from './lib/Bola.svelte';
  import PainelCaso from './lib/PainelCaso.svelte';
  import type { Bloco as BlocoType, Caso, Ator } from './lib/types';
  import { blocosHoje, blocosFuturo, fasesPlano, ferramentas } from './lib/blocos';
  import { atores, casos } from './lib/fluxo';

  type Tab = 'hoje' | 'futuro' | 'acao' | 'plano' | 'ferramentas';

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
      <button class:ativo={tab === 'hoje'} onclick={() => tab = 'hoje'}>Como é hoje</button>
      <button class:ativo={tab === 'futuro'} onclick={() => tab = 'futuro'}>Como deve ficar</button>
      <button class:ativo={tab === 'acao'} onclick={() => tab = 'acao'}>Ação: enviar mensagem</button>
      <button class:ativo={tab === 'plano'} onclick={() => tab = 'plano'}>Plano de ação</button>
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
</style>
