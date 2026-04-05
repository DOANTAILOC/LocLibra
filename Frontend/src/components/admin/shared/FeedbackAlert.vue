<template>
  <div v-if="message" :class="wrapperClass">
    {{ message }}
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "error",
  },
});

const wrapperClass = computed(() => {
  if (props.type === "success") {
    return "mb-4 rounded-lg border border-[rgb(83_99_79/25%)] bg-[rgb(214_232_207/35%)] px-4 py-3 text-sm text-[var(--on-primary-container)]";
  }

  return "mb-4 rounded-lg border border-[rgb(165_71_49/28%)] bg-[rgb(254_139_112/18%)] px-4 py-3 text-sm text-[var(--on-error-container)]";
});
</script>
