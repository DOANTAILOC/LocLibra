<template>
  <span class="status-chip" :class="resolvedClass">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "---",
  },
  tone: {
    type: String,
    default: "active",
  },
  customClass: {
    type: String,
    default: "",
  },
});

const toneClassMap = {
  active: "status-chip-active",
  overdue: "status-chip-overdue",
  returned: "status-chip-returned",
  draft: "status-chip-draft",
  danger: "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]",
  neutral:
    "bg-[rgb(156_163_175/25%)] text-[rgb(75_85_99)] border border-[rgb(156_163_175/35%)]",
};

const resolvedClass = computed(() => {
  if (props.customClass) return props.customClass;
  return toneClassMap[props.tone] || toneClassMap.active;
});
</script>
