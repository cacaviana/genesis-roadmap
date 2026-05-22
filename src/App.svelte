<script lang="ts">
  import Bloco from './lib/Bloco.svelte';
  import PainelDetalhe from './lib/PainelDetalhe.svelte';
  import type { Bloco as BlocoType } from './lib/types';
  import { blocosHoje, blocosFuturo, fasesPlano, ferramentas } from './lib/blocos';

  type Tab = 'hoje' | 'futuro' | 'plano' | 'ferramentas';

  let tab = $state<Tab>('hoje');
  let blocoSelecionado = $state<BlocoType | null>(null);
  let painelAberto = $state(false);

  function abrirPainel(b: BlocoType) {
    blocoSelecionado = b;
    painelAberto = true;
  }
  function fechar() {
    painelAberto = false;
  }

  let scrollY = $state(0);
  $effect(() => {
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
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
</style>
