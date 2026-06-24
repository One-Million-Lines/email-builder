<!--
  Vue 3 wrapper for @one-million-lines/email-builder.
  The editor is React-based; we mount it through the framework-neutral
  createEmailBuilder() factory inside a Vue component.
-->
<template>
  <div ref="host" style="height: 100vh" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { createEmailBuilder } from "@one-million-lines/email-builder";
import "@one-million-lines/email-builder/styles.css";

const props = defineProps({
  initialDocument: { type: Object, default: undefined },
});
const emit = defineEmits(["change", "exportHtml"]);

const host = ref(null);
let instance = null;

onMounted(() => {
  instance = createEmailBuilder({
    container: host.value,
    initialDocument: props.initialDocument,
    onChange: (doc) => emit("change", doc),
    onExportHtml: (html) => emit("exportHtml", html),
  });
});

onBeforeUnmount(() => instance?.destroy());

defineExpose({
  getDocument: () => instance?.getDocument(),
  exportHtml: () => instance?.exportHtml(),
  exportJson: () => instance?.exportJson(),
});
</script>

<!--
  NOTE: react and react-dom are peer dependencies. In a Vue app you must still
  install them:  npm install react react-dom @one-million-lines/email-builder
-->
