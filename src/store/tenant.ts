import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { mockTenants } from "@/api/mock";
import type { TenantInfo } from "@/types";

export const useTenantStore = defineStore("tenant", () => {
  const tenants = ref<TenantInfo[]>([...mockTenants]);
  const currentTenantId = ref<number>(Number(localStorage.getItem("currentTenantId")) || 1);

  const currentTenant = computed(() => {
    return tenants.value.find((t) => t.id === currentTenantId.value) || tenants.value[0];
  });

  function switchTenant(id: number) {
    currentTenantId.value = id;
    localStorage.setItem("currentTenantId", String(id));
  }

  return {
    tenants,
    currentTenantId,
    currentTenant,
    switchTenant,
  };
});
