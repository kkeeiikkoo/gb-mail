import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { initializeUnreadCount, changeTitle } from "./service/firebaseInit";

import "./assets/global.css";

import "./service/axios";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import { Store } from "vuex";
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<any>;
  }
}
changeTitle();

initializeUnreadCount().then(() => {
  createApp(App).use(ElementPlus).use(store).use(router).mount("#app");
});
