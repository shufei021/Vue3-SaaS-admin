<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-area" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
      <AppHeader />
      <AppTagBar />
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import AppTagBar from "./AppTagBar.vue";

const appStore = useAppStore();
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.main-area {
  flex: 1;
  margin-left: $sidebar-width;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left $transition-normal;
  overflow: hidden;

  &.sidebar-collapsed {
    margin-left: $sidebar-collapsed-width;
  }
}

.main-content {
  flex: 1;
  overflow: auto;
  background: var(--bg-page);
  padding: 0;
}
</style>
