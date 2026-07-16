import { ref, computed } from "vue";
import type { CustomTablePagination, CustomTableAlias } from "../types";

export function usePagination(
  configPagination: CustomTablePagination = {},
  alias: CustomTableAlias = {},
) {
  const currentPage = ref(configPagination.page ?? 1);
  const pageSize = ref(configPagination.pageSize ?? 10);
  const total = ref(0);
  const pageSizes = configPagination.pageSizes ?? [10, 20, 50, 100];
  const show = configPagination.show ?? true;
  const layout =
    configPagination.layout ?? "total, sizes, prev, pager, next, jumper";

  const requestAlias = alias.request ?? {};
  const pageKey = requestAlias.page ?? "page";
  const pageSizeKey = requestAlias.pageSize ?? "pageSize";

  const paginationParams = computed(() => ({
    [pageKey]: currentPage.value,
    [pageSizeKey]: pageSize.value,
  }));

  function handlePageChange(page: number) {
    currentPage.value = page;
  }

  function handleSizeChange(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
  }

  function reset() {
    currentPage.value = 1;
  }

  function setTotal(val: number) {
    total.value = val;
  }

  return {
    currentPage,
    pageSize,
    total,
    pageSizes,
    show,
    layout,
    paginationParams,
    handlePageChange,
    handleSizeChange,
    reset,
    setTotal,
  };
}
