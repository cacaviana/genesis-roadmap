<script lang="ts">
  import type { Caso, Ator } from './types';

  interface Props {
    caso: Caso | null;
    ator: Ator | null;
    aberto: boolean;
    onClose: () => void;
  }

  let { caso, ator, aberto, onClose }: Props = $props();
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

  {#if caso && ator}
    <div class="passo-header">
      <div class="passo-num">{caso.ordem}</div>
      <div>
        <span class="chip chip--info">Ator: {ator.nome}</span>
        <h2 style="margin-top: 10px;">{caso.nome}</h2>
      </div>
    </div>

    <div class="secao">
      <h4>O passo</h4>
      <p>{caso.passo}</p>
    </div>

    <div class="secao">
      <h4>O que acontece tecnicamente</h4>
      <p>{caso.oQueAcontece}</p>
    </div>

    {#if caso.porQueImporta}
      <div class="secao">
        <h4>Por que isso importa</h4>
        <p>{caso.porQueImporta}</p>
      </div>
    {/if}

    <div class="secao">
      <h4>Quem executa</h4>
      <p><strong>{ator.nome}</strong> — {ator.papel}</p>
    </div>
  {/if}
</aside>

<style>
  .passo-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 8px;
  }
  .passo-num {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--purple);
    color: white;
    font-weight: 800;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-purple);
    flex-shrink: 0;
  }
</style>
