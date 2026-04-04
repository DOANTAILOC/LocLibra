<template>
  <article class="panel-surface p-5">
    <h2
      class="mb-3 text-sm font-bold tracking-[0.08em] text-[var(--on-surface)] uppercase"
    >
      {{ title }}
    </h2>

    <div class="max-h-56 space-y-2 overflow-y-auto pr-1">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
      >
        <input
          :checked="modelValue.includes(option.value)"
          type="checkbox"
          :value="option.value"
          class="h-4 w-4 rounded border-[var(--outline-variant)] text-[var(--primary)] focus:ring-[var(--primary-container)]"
          @change="toggleOption(option.value, $event.target.checked)"
        />
        <span>{{ option.label }}</span>
      </label>

      <p v-if="!options.length" class="text-sm text-[var(--outline)]">
        {{ emptyText }}
      </p>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: "Chưa có dữ liệu.",
  },
});

const emit = defineEmits(["update:modelValue"]);

function toggleOption(value, checked) {
  const next = [...props.modelValue];

  if (checked && !next.includes(value)) {
    next.push(value);
  }

  if (!checked) {
    const index = next.indexOf(value);
    if (index >= 0) {
      next.splice(index, 1);
    }
  }

  emit("update:modelValue", next);
}
</script>
