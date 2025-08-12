import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "./styles/base.scss";

try {
    const raw = sessionStorage.getItem("search-cache");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.keywords)) {
        // 旧形式や破損を修正
        parsed.keywords = [];
        sessionStorage.setItem("search-cache", JSON.stringify(parsed));
      }
    }
  } catch {}
  
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(pinia).use(router).mount("#app");
