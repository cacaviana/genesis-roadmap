<script lang="ts">
  import type { Bloco } from './types';

  interface Props {
    bloco: Bloco | null;
    aberto: boolean;
    onClose: () => void;
  }

  let { bloco, aberto, onClose }: Props = $props();
</script>

<div
  class="painel-backdrop"
  class:aberto
  onclick={onClose}
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="-1"
  aria-label="Fechar painel"
></div>

<aside class="painel-detalhe" class:aberto aria-hidden={!aberto}>
  <button class="fechar" onclick={onClose} aria-label="Fechar">×</button>

  {#if bloco}
    <span class="chip chip--{bloco.variante === 'ghost' ? 'info' : (bloco.variante ?? 'purple')}">{bloco.tag}</span>
    <h2 style="margin-top: 12px;">{bloco.nome}</h2>
    <p style="margin-top: 8px; color: var(--text-secondary);">{bloco.resumo}</p>

    <div class="secao">
      <h4>Onde mora</h4>
      <p>{bloco.ondeMora}</p>
    </div>

    <div class="secao">
      <h4>O que faz</h4>
      <p>{bloco.oQueFaz}</p>
    </div>

    <div class="secao">
      <h4>Recebe de</h4>
      <ul>
        {#each bloco.recebeDe as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>

    <div class="secao">
      <h4>Entrega para</h4>
      <ul>
        {#each bloco.entrega as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>

    {#if bloco.payloadEntrada}
      <div class="secao">
        <h4>📥 Dado que recebe</h4>
        <p class="payload-titulo">{bloco.payloadEntrada.titulo}</p>
        <pre class="payload-bloco" data-tipo={bloco.payloadEntrada.tipo ?? 'json'}>{bloco.payloadEntrada.conteudo}</pre>
      </div>
    {/if}

    {#if bloco.payloadSaida}
      <div class="secao">
        <h4>📤 Dado que envia</h4>
        <p class="payload-titulo">{bloco.payloadSaida.titulo}</p>
        <pre class="payload-bloco" data-tipo={bloco.payloadSaida.tipo ?? 'json'}>{bloco.payloadSaida.conteudo}</pre>
      </div>
    {/if}

    {#if bloco.observacoes && bloco.observacoes.length > 0}
      <div class="secao">
        <h4>Observações</h4>
        <ul>
          {#each bloco.observacoes as obs}
            <li>{obs}</li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}
</aside>

<style>
  .payload-titulo {
    font-size: 12px;
    color: var(--text-muted);
    margin: 4px 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }
  .payload-bloco {
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 14px 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-primary);
    overflow-x: auto;
    white-space: pre;
    margin: 0;
    position: relative;
  }
  .payload-bloco[data-tipo="http"] {
    border-left: 3px solid var(--info);
  }
  .payload-bloco[data-tipo="json"] {
    border-left: 3px solid var(--purple);
  }
</style>
