<script lang="ts">
  // The skin is registered before the tables
  import '#lib/skin';

  import {onMount} from 'svelte';

  import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

  import {cols, conf, rows} from '#lib/orders';

  import type {PageProps} from './$types';

  // The page of the server has the table prerendered, and configure() renders it with its rows in the browser, in its
  // place
  let {data}: PageProps = $props();
  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro {...data.prerendered.attributes} bind:this={table} theme="auto"
             onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}>{@html data.prerendered.html}</table-bro>
</div>
