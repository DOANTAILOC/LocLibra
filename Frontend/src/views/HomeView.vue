<template>
  <div style="padding: 2rem">
    <h1>Thư viện sách</h1>

    <!-- ref: đếm click -->
    <p>Bạn đã click {{ count }} lần</p>
    <button @click="count++">Click</button>

    <!-- computed: hiển thị trạng thái -->
    <p>Trạng thái: {{ status }}</p>

    <!-- v-model: input 2 chiều -->
    <input v-model="name" placeholder="Nhập tên..." />
    <p v-if="name">Xin chào, {{ name }}!</p>

    <!-- v-for: render danh sách -->
    <ul>
      <li v-for="book in books" :key="book.id">
        {{ book.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const count = ref(0);
const name = ref("");

const books = ref([
  { id: 1, title: "Clean Code" },
  { id: 2, title: "Đắc Nhân Tâm" },
  { id: 3, title: "Sapiens" },
]);

const status = computed(() => {
  if (count.value === 0) return "Chưa click lần nào";
  if (count.value < 5) return "Mới bắt đầu";
  return "Click nhiều quá rồi!";
});

onMounted(() => {
  console.log("Component đã mount — đây là nơi gọi API sau này");
});
</script>
