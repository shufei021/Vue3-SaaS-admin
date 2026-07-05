import { defineStore } from "pinia";
import { ref } from "vue";
import type { TagItem } from "@/types";

export const useTagStore = defineStore("tag", () => {
  const tags = ref<TagItem[]>([
    {
      title: "仪表盘",
      name: "Dashboard",
      path: "/dashboard",
      closable: false,
      affix: true,
    },
  ]);
  const activeTag = ref("Dashboard");

  function addTag(tag: TagItem) {
    const exists = tags.value.find((t) => t.name === tag.name);
    if (!exists) {
      tags.value.push({ ...tag, closable: tag.closable !== false });
    }
    activeTag.value = tag.name;
  }

  function removeTag(name: string) {
    const idx = tags.value.findIndex((t) => t.name === name);
    if (idx === -1) return;
    if (!tags.value[idx].closable) return;
    tags.value.splice(idx, 1);
    if (activeTag.value === name) {
      const next = tags.value[Math.min(idx, tags.value.length - 1)];
      activeTag.value = next?.name || "";
      return next;
    }
    return null;
  }

  function removeOtherTags(name: string) {
    tags.value = tags.value.filter((t) => !t.closable || t.name === name);
    activeTag.value = name;
  }

  function removeAllTags() {
    tags.value = tags.value.filter((t) => !t.closable);
    activeTag.value = tags.value[tags.value.length - 1]?.name || "";
    return tags.value[tags.value.length - 1];
  }

  return {
    tags,
    activeTag,
    addTag,
    removeTag,
    removeOtherTags,
    removeAllTags,
  };
});
