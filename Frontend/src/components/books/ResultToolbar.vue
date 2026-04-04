<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <p class="text-sm text-[var(--on-surface-variant)]">
      Hiển thị
      <span class="font-semibold text-[var(--on-surface)]">{{ total }}</span>
      sách
    </p>

    <select
      :value="sortBy"
      class="form-select w-auto min-w-[180px]"
      @change="emit('update:sortBy', $event.target.value)"
    >
      <option
        v-for="option in sortOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  total: {
    type: Number,
    default: 0,
  },
  sortBy: {
    type: String,
    default: "newest",
  },
  sortOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:sortBy"]);
</script>
