import { createRouter, createWebHistory } from 'vue-router';
import SearchView from '@/views/SearchView.vue';
import PreviewView from '@/views/PreviewView.vue';

const routes = [
  { path: '/', component: SearchView },
  { path: '/preview', component: PreviewView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
