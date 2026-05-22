<script lang="ts">
  interface Props {
    nome: string;
    papel: string;
    destaque?: boolean;
  }

  let { nome, papel, destaque = false }: Props = $props();
</script>

<div class="boneco" class:destaque>
  <svg viewBox="0 0 64 96" width="56" height="84" aria-hidden="true">
    <!-- Cabeça -->
    <circle cx="32" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.5" />
    <!-- Pescoço/tronco -->
    <line x1="32" y1="26" x2="32" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    <!-- Braços -->
    <line x1="12" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    <!-- Pernas -->
    <line x1="32" y1="56" x2="16" y2="84" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    <line x1="32" y1="56" x2="48" y2="84" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
  </svg>
  <div class="boneco-info">
    <h3>{nome}</h3>
    <p>{papel}</p>
  </div>
</div>

<style>
  .boneco {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 18px 12px;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--r);
    background: var(--bg-card);
    transition: all var(--t);
  }
  .boneco.destaque {
    color: var(--purple);
    border-color: var(--border-purple);
    box-shadow: var(--shadow-purple);
    background: var(--purple-soft);
  }
  .boneco-info { text-align: center; }
  .boneco-info h3 {
    font-size: 14px;
    margin: 0 0 2px;
    color: var(--text-primary);
  }
  .boneco-info p {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin: 0;
  }
</style>
