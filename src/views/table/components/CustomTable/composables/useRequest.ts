import { ref } from "vue";
import type { CustomTableConfig, SortInfo } from "../types";

export function useRequest(
  config: CustomTableConfig,
  getPaginationParams: () => Record<string, any>,
  setTotal: (total: number) => void,
) {
  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const sortInfo = ref<SortInfo | null>(null);
  const extraParams = ref<Record<string, any>>({
    ...(config.requestParams ?? {}),
  });

  const requestAlias = {
    page: "page",
    pageSize: "pageSize",
    sortField: "sortField",
    sortOrder: "sortOrder",
    ...(config.alias?.request ?? {}),
  };

  const responseAlias = {
    list: "list",
    total: "total",
    ...(config.alias?.response ?? {}),
  };

  function buildSortParams(): Record<string, any> {
    if (!sortInfo.value || !sortInfo.value.order) return {};
    const orderMap: Record<string, string> = {
      ascending: "asc",
      descending: "desc",
    };
    return {
      [requestAlias.sortField]: sortInfo.value.prop,
      [requestAlias.sortOrder]:
        orderMap[sortInfo.value.order] ?? sortInfo.value.order,
    };
  }

  async function loadData() {
    if (!config.requestApi) return;

    if (config.preRequest) {
      await config.preRequest();
    }

    loading.value = true;
    try {
      let params: Record<string, any> = {
        ...getPaginationParams(),
        ...extraParams.value,
        ...buildSortParams(),
      };

      if (config.transformParams) {
        params = config.transformParams(params);
      }

      const res = await config.requestApi(params);

      const list =
        res?.data?.[responseAlias.list] ?? res?.[responseAlias.list] ?? [];
      const total =
        res?.data?.[responseAlias.total] ?? res?.[responseAlias.total] ?? 0;

      tableData.value = list;
      setTotal(total);
    } finally {
      loading.value = false;
    }
  }

  function setSortInfo(info: SortInfo | null) {
    sortInfo.value = info;
  }

  function setExtraParams(params: Record<string, any>) {
    extraParams.value = { ...params };
  }

  return {
    loading,
    tableData,
    sortInfo,
    loadData,
    setSortInfo,
    setExtraParams,
  };
}
