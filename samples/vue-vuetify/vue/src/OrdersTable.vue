<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

const table = useTemplateRef<TableBroHTMLElement>('table');

// The elements of the skin render by render() of Vue, which patches them at once: the table measures them rendered
onMounted(() => table.value!.configure({cols, rows, conf}));

function onAction(event: CustomEvent<BroActionDetail>) {
  console.log(event.detail.action);
}
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro id="orders" ref="table" theme="auto" @bro-action="onAction"></table-bro>
  </div>
</template>
