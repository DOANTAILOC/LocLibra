import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import BookListView from "../views/BookListView.vue";
import BookDetailView from "../views/BookDetailView.vue";
import MyLoansView from "../views/MyLoansView.vue";
import MyProfileView from "../views/MyProfileView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/login", component: LoginView },
  { path: "/register", component: RegisterView },
  { path: "/books", component: BookListView },
  { path: "/books/:id", component: BookDetailView },
  { path: "/my-loans", component: MyLoansView, meta: { requiresAuth: true } },
  {
    path: "/my-profile",
    component: MyProfileView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem("token");

  if (to.meta.requiresAuth && !isLoggedIn) {
    window.alert("Vui lòng đăng nhập để tiếp tục.");
    return "/login";
  }

  return true;
});

export default router;
