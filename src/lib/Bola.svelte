<script lang="ts">
  import type { Caso } from './types';

  interface Props {
    caso: Caso;
    onclick: (c: Caso) => void;
  }

  let { caso, onclick }: Props = $props();
</script>

<button class="bola" onclick={() => onclick(caso)}>
  <span class="bola-num">{caso.ordem}</span>
  <span class="bola-nome">{caso.nome}</span>
</button>

<style>
  .bola {
    width: 100%;
    max-width: 240px;
    min-height: 120px;
    border-radius: 999px;
    background: var(--bg-card);
    border: 2px solid var(--border-purple);
    color: var(--text-primary);
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    cursor: pointer;
    transition: all var(--t);
    position: relative;
  }
  .bola:hover {
    background: var(--purple-soft);
    border-color: var(--purple);
    transform: scale(1.04);
    box-shadow: var(--shadow-purple);
  }
  .bola-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--purple);
    color: white;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
  }
  .bola-nome {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.35;
  }
</style>
