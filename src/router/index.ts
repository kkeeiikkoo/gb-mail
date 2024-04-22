import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
  },
  // {
  //   path: "/",
  //   name: "home",
  //   component: () => import("../views/mailInQueue.vue"),
  // },
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
