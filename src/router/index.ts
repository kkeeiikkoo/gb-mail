import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/mailInQueue",
    name: "mailInQueue",
    component: () => import("../views/mailInQueue.vue"),
  },
  {
    path: "/testView",
    name: "testView",
    component: () => import("../views/testView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
