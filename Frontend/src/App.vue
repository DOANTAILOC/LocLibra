<template>
  <NavBar v-if="!hideNavbar" />
  <RouterView />
</template>
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";

const route = useRoute();
const hideNavbar = computed(() => {
  return (
    ["/login", "/register"].includes(route.path) ||
    route.path.startsWith("/admin")
  );
});
</script>
