<script lang="ts">
  import {onMount} from 'svelte';

  import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

  import {cols, conf, rows} from './orders';

  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro id="orders" bind:this={table} theme="auto"
             onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
</div>
