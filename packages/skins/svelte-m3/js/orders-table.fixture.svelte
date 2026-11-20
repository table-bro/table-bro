<script lang="ts">
  // A component of Svelte that configures its table in onMount, as the sample and the docs of the skin do: the specs
  // check that the elements of the skin render at once there, and in a filter drawer, whose elements of the skin render
  // inside the mount of the component
  import {onMount} from 'svelte';

  import type {TableBroHTMLElement} from '@table-bro/core';

  let {configure, drawer = false}: {configure: (table: TableBroHTMLElement) => void; drawer?: boolean} = $props();
  let table: TableBroHTMLElement;

  onMount(() => configure(table));
</script>

{#if drawer}
  <table-bro-filter-drawer-container skin="m3-svelte">
    <table-bro bind:this={table}></table-bro>
    <div slot="filters"></div>
  </table-bro-filter-drawer-container>
{:else}
  <table-bro bind:this={table}></table-bro>
{/if}
