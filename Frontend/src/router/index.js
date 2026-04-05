import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import BookListView from "../views/BookListView.vue";
import BookDetailView from "../views/BookDetailView.vue";
import MyLoansView from "../views/MyLoansView.vue";
import MyProfileView from "../views/MyProfileView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import AdminBorrowView from "../views/AdminBorrowView.vue";
import AdminMembersView from "../views/AdminMembersView.vue";
import AdminBooksView from "../views/AdminBooksView.vue";
import AdminAuthorsView from "../views/AdminAuthorsView.vue";
import AdminGenresView from "../views/AdminGenresView.vue";
import AdminStaffsView from "../views/AdminStaffsView.vue";
import AdminPublishersView from "../views/AdminPublishersView.vue";

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
  {
    path: "/admin",
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/borrows",
    component: AdminBorrowView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/members",
    component: AdminMembersView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/books",
    component: AdminBooksView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/authors",
    component: AdminAuthorsView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/genres",
    component: AdminGenresView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/staffs",
    component: AdminStaffsView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/publishers",
    component: AdminPublishersView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = ["staff", "admin"].includes(storedUser?.role);

  if (to.meta.requiresAuth && !isLoggedIn) {
    window.alert("Vui lòng đăng nhập để tiếp tục.");
    return "/login";
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    window.alert("Bạn không có quyền truy cập khu vực quản trị.");
    return "/";
  }

  return true;
});

export default router;
