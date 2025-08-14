// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import SearchView from '@/views/SearchView.vue';
import PreviewView from '@/views/PreviewView.vue';
import { useLoadingStore } from "@/store/loading";

const routes = [
  // ルートパス（/）にアクセスしたときは skill-framework-builder にリダイレクト
  { 
    path: '/', 
    redirect: '/skill-framework-builder' 
  },
  
  // skill-framework-builder のルート群
  { 
    path: '/skill-framework-builder', 
    component: SearchView 
  },
  { 
    path: '/skill-framework-builder/preview', 
    component: PreviewView 
  },
  
  // 将来的に他のアプリを追加する場合のための構造例
  // { 
  //   path: '/other-app', 
  //   component: OtherAppView 
  // },
  // { 
  //   path: '/another-tool', 
  //   component: AnotherToolView 
  // },
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