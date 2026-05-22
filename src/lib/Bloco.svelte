<script lang="ts">
  import type { Bloco } from './types';

  interface Props {
    bloco: Bloco;
    onclick: (b: Bloco) => void;
  }

  let { bloco, onclick }: Props = $props();
</script>

<button
  class="bloco bloco--{bloco.variante ?? 'purple'}"
  onclick={() => onclick(bloco)}
>
  <span class="tag">{bloco.tag}</span>
  <h3>{bloco.nome}</h3>
  <p class="desc">{bloco.resumo}</p>
</button>
