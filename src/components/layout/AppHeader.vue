<template>
  <div class="app-header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- Tenant Switcher -->
      <el-dropdown trigger="click" @command="handleTenantSwitch">
        <div class="header-action tenant-switch">
          <el-icon><OfficeBuilding /></el-icon>
          <span class="tenant-name">{{ tenantStore.currentTenant?.name }}</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="t in tenantStore.tenants"
              :key="t.id"
              :command="t.id"
              :class="{
                'is-active-tenant': t.id === tenantStore.currentTenantId,
              }"
            >
              <div class="tenant-dropdown-item">
                <span>{{ t.name }}</span>
                <el-tag size="small" :type="t.status === 'active' ? 'success' : 'danger'">
                  {{ t.status === "active" ? "正常" : t.status === "suspended" ? "停用" : "过期" }}
                </el-tag>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- Theme Toggle -->
      <div class="header-action" @click="appStore.toggleTheme">
        <el-icon>
          <Moon v-if="!appStore.isDark" />
          <Sunny v-else />
        </el-icon>
      </div>

      <!-- Fullscreen -->
      <div class="header-action" @click="toggleFullscreen">
        <el-icon><FullScreen /></el-icon>
      </div>

      <!-- User Dropdown -->
      <el-dropdown trigger="click">
        <div class="header-action user-info">
          <el-avatar :size="30" style="background: #409eff">A</el-avatar>
          <span class="user-name">Admin</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore, useTenantStore } from "@/store";
import { Fold, Expand, OfficeBuilding, ArrowDown, Moon, Sunny, FullScreen, User, SwitchButton } from "@element-plus/icons-vue";

const route = useRoute();
const appStore = useAppStore();
const tenantStore = useTenantStore();

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title);
  return matched.map((item) => ({
    title: item.meta.title as string,
    path: item.path,
  }));
});

function handleTenantSwitch(id: number) {
  tenantStore.switchTenant(id);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  height: $header-height;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .collapse-btn {
    font-size: 20px;
    cursor: pointer;
    color: var(--text-regular);
    transition: color $transition-fast;
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all $transition-fast;
  font-size: 14px;

  &:hover {
    background: var(--bg-page);
    color: var(--el-color-primary);
  }
}

.tenant-switch {
  .tenant-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tenant-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 160px;
}

.user-info {
  .user-name {
    font-size: 14px;
  }
}
</style>
