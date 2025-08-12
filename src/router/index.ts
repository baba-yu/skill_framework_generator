import { createRouter, createWebHistory } from 'vue-router';
import SearchView from '@/views/SearchView.vue';
import PreviewView from '@/views/PreviewView.vue';
import { useLoadingStore } from "@/store/loading";

const routes = [
  { path: '/', component: SearchView },
  { path: '/preview', component: PreviewView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach(() => {
  const loading = useLoadingStore();
  loading.stopLoading("nav");
});

export default router;
