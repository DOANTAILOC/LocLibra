<template>
  <section
    class="mb-8 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3 shadow-sm"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <div class="relative flex-1">
        <span
          class="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] leading-none text-[var(--outline)]"
        >
          search
        </span>
        <input
          :value="modelValue"
          type="text"
          class="h-12 w-full rounded-xl border border-[var(--outline-variant)] bg-white pl-12 pr-12 text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[rgb(214_232_207/45%)]"
          :placeholder="placeholder"
          @input="onInput"
          @keyup.enter="emit('submit')"
        />

        <button
          v-if="modelValue"
          type="button"
          class="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--outline)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
          @click="clear"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <button
        v-if="showButton"
        type="button"
        class="btn-primary h-12 rounded-xl px-6 text-xs"
        @click="emit('submit')"
      >
        {{ buttonLabel }}
      </button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Tìm kiếm...",
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  buttonLabel: {
    type: String,
    default: "Tìm kiếm",
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

function onInput(event) {
  emit("update:modelValue", event.target.value);
}

function clear() {
  emit("update:modelValue", "");
}
</script>
