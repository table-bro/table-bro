<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from '../orders';

const {$vuetify} = useNuxtApp();
const table = useTemplateRef<TableBroHTMLElement>('table');

// The server prerenders the table in its loading state, and the page carries its markup to the browser
const {data: prerendered} = await useAsyncData('orders', async () => import.meta.server
  ? (await import('../prerender-table')).prerenderOrders($vuetify)
  : null);

// configure() renders the table with its rows in the place of the prerender
onMounted(() => table.value!.configure({cols, rows, conf}));

function onAction(event: CustomEvent<BroActionDetail>) {
  console.log(event.detail.action);
}
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro v-bind="prerendered?.attributes" id="orders" ref="table" theme="auto" @bro-action="onAction" v-html="prerendered?.html"></table-bro>
  </div>
</template>
