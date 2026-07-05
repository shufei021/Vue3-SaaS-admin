import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const sidebarCollapsed = ref(false);
  const isDark = ref(false);
  const loading = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle("dark", isDark.value);
    document.documentElement.classList.toggle("light", !isDark.value);
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
  }

  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      isDark.value = true;
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      isDark.value = false;
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }

  function setLoading(val: boolean) {
    loading.value = val;
  }

  return {
    sidebarCollapsed,
    isDark,
    loading,
    toggleSidebar,
    toggleTheme,
    initTheme,
    setLoading,
  };
});
