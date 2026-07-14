<template>
  <div class="sidebar" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <svg viewBox="0 0 32 32" class="logo-icon">
        <rect width="32" height="32" rx="6" fill="#409EFF" />
        <path d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z" fill="#fff" />
      </svg>
      <span v-show="!appStore.sidebarCollapsed" class="logo-text"
        >SaaS Admin</span
      >
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="var(--text-sidebar)"
        active-text-color="var(--text-sidebar-active)"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- Single menu item -->
          <el-menu-item
            v-if="!route.children || route.children.length === 1"
            :index="getMenuIndex(route)"
          >
            <el-icon v-if="getMenuIcon(route)">
              <component :is="getMenuIcon(route)" />
            </el-icon>
            <template #title>{{ getMenuTitle(route) }}</template>
          </el-menu-item>
          <!-- Submenu -->
          <el-sub-menu v-else :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="resolveMenuPath(route.path, child.path)"
            >
              {{ child.meta?.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/store";
import router from "@/router";

const route = useRoute();
const appStore = useAppStore();

const menuRoutes = computed(() => {
  return router.options.routes.find((route) => route.path === "/")?.children || [];
});

const activeMenu = computed(() => {
  return route.path;
});

function getMenuIndex(route: any): string {
  if (route.children && route.children.length === 1) {
    return resolveMenuPath(route.path, route.children[0].path);
  }
  return resolveMenuPath(route.path);
}

function resolveMenuPath(parentPath: string, childPath = ""): string {
  const fullPath = childPath ? `${parentPath}/${childPath}` : parentPath;
  return fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
}

function getMenuIcon(route: any): string {
  if (route.children && route.children.length === 1) {
    return route.meta?.icon || "";
  }
  return route.meta?.icon || "";
}

function getMenuTitle(route: any): string {
  if (route.children && route.children.length === 1) {
    return route.children[0].meta?.title || route.meta?.title || "";
  }
  return route.meta?.title || "";
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: $sidebar-width;
  height: 100vh;
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  transition: width $transition-normal;
  position: fixed;
  left: 0;
  top: 0;
  z-index: $z-sidebar;
  overflow: hidden;

  &.is-collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;

  .logo-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 0.5px;
  }
}

.el-menu {
  border-right: none;
  padding: 8px 0;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 44px;
    line-height: 44px;
    margin: 2px 8px;
    border-radius: 6px;

    &:hover {
      background: var(--bg-sidebar-hover);
    }

    &.is-active {
      background: var(--bg-sidebar-active);
      color: var(--text-sidebar-active) !important;
      font-weight: 600;
    }
  }

  :deep(.el-sub-menu .el-menu-item) {
    margin: 2px 8px 2px 16px;
    min-width: auto;
  }
}
</style>
