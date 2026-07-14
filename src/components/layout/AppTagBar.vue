<template>
  <div class="tag-bar">
    <el-scrollbar class="tag-scroll">
      <div class="tag-list">
        <div
          v-for="tag in tagStore.tags"
          :key="tag.name"
          class="tag-item"
          :class="{ active: tagStore.activeTag === tag.name }"
          @click="handleClickTag(tag)"
          @contextmenu.prevent
        >
          <span class="tag-title">{{ tag.title }}</span>
          <el-icon
            v-if="tag.closable"
            class="tag-close"
            @click.stop="handleCloseTag(tag)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
    <el-dropdown trigger="click" class="tag-actions">
      <el-icon class="actions-btn"><ArrowDown /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleRefresh">
            <el-icon><Refresh /></el-icon>刷新当前
          </el-dropdown-item>
          <el-dropdown-item @click="handleCloseOthers">
            <el-icon><CircleClose /></el-icon>关闭其他
          </el-dropdown-item>
          <el-dropdown-item @click="handleCloseAll">
            <el-icon><CircleCloseFilled /></el-icon>关闭全部
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useTagStore } from "@/store";
import type { TagItem } from "@/types";
import {
  Close,
  ArrowDown,
  Refresh,
  CircleClose,
  CircleCloseFilled,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const tagStore = useTagStore();

function handleClickTag(tag: TagItem) {
  tagStore.activeTag = tag.name;
  router.push(tag.path);
}

function handleCloseTag(tag: TagItem) {
  const next = tagStore.removeTag(tag.name);
  if (next) {
    router.push(next.path);
  }
}

function handleCloseOthers() {
  tagStore.removeOtherTags(tagStore.activeTag);
  const current = tagStore.tags.find((t) => t.name === tagStore.activeTag);
  if (current) router.push(current.path);
}

function handleCloseAll() {
  const last = tagStore.removeAllTags();
  if (last) router.push(last.path);
}

function handleRefresh() {
  router.replace({
    path: `/redirect${route.path}`,
    query: route.query,
    hash: route.hash,
  });
}

// Context menu handler reserved for future use
</script>

<style lang="scss" scoped>
.tag-bar {
  height: $tag-bar-height;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  :deep(.el-scrollbar__wrap) {
    display: flex;
    align-items: center;
  }
}

.tag-scroll {
  flex: 1;
  overflow: hidden;
}

.tag-list {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  background: var(--bg-tag);
  color: var(--text-tag);
  border: 1px solid transparent;
  transition: all $transition-fast;
  user-select: none;

  &:hover {
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--bg-tag-active);
    color: var(--text-tag-active);
    border-color: var(--bg-tag-active);

    .tag-close:hover {
      background: rgba(255, 255, 255, 0.3);
      color: #fff;
    }
  }

  .tag-close {
    font-size: 12px;
    border-radius: 50%;
    transition: all $transition-fast;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
      color: inherit;
    }
  }
}

.tag-actions {
  flex-shrink: 0;

  .actions-btn {
    font-size: 16px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    border-radius: 4px;
    transition: all $transition-fast;

    &:hover {
      color: var(--el-color-primary);
      background: var(--bg-page);
    }
  }
}
</style>
