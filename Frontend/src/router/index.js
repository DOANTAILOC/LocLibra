import { createRouter, createWebHistory } from 'vue-router'
import HomeView     from '../views/HomeView.vue'
import LoginView    from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import BookListView from '../views/BookListView.vue'
import MyLoansView  from '../views/MyLoansView.vue'

const routes = [
  { path: '/',         component: HomeView },
  { path: '/login',    component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/books',    component: BookListView },
  { path: '/my-loans', component: MyLoansView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router