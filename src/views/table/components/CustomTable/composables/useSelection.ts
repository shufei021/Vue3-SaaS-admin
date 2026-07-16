import { ref, computed } from "vue";
import type { CustomTableTableProps } from "../types";

export function useSelection(
  tableProps: CustomTableTableProps = {},
  getTableData: () => any[],
  getTotal: () => number,
) {
  const rowKey = tableProps.rowKey ?? "id";
  const selectionMode = tableProps.selectionMode ?? "current";

  const selectedRows = ref<any[]>([]);
  const selectedIdSet = ref<Set<any>>(new Set());
  const isAllDataSelected = ref(false);
  const excludedIds = ref<Set<any>>(new Set());

  const isAllSelected = computed(() => {
    if (isAllDataSelected.value) {
      return excludedIds.value.size === 0;
    }
    const data = getTableData();
    if (!data || data.length === 0) return false;
    return data.every((row) => isSelected(row));
  });

  const isIndeterminate = computed(() => {
    if (isAllDataSelected.value) {
      return (
        excludedIds.value.size > 0 && excludedIds.value.size < (getTotal() || 0)
      );
    }
    return (
      (selectionMode === "all"
        ? selectedIdSet.value.size > 0
        : selectedRows.value.length > 0) && !isAllSelected.value
    );
  });

  const selectCount = computed(() => {
    if (isAllDataSelected.value) {
      return (getTotal() || 0) - excludedIds.value.size;
    }
    return selectionMode === "all"
      ? selectedIdSet.value.size
      : selectedRows.value.length;
  });

  function handleSelectionChange(rows: any[]) {
    selectedRows.value = rows;
    if (selectionMode === "all" && !isAllDataSelected.value) {
      const currentPageIds = new Set(rows.map((r) => r[rowKey]));
      const toRemove = new Set(selectedIdSet.value);
      getTableData().forEach((row) => {
        toRemove.delete(row[rowKey]);
      });
      toRemove.forEach((id) => {
        if (!currentPageIds.has(id)) {
          selectedIdSet.value.delete(id);
        }
      });
      rows.forEach((row) => {
        selectedIdSet.value.add(row[rowKey]);
      });
    }
  }

  function isSelected(row: any): boolean {
    if (isAllDataSelected.value) {
      return !excludedIds.value.has(row[rowKey]);
    }
    if (selectionMode === "all") {
      return selectedIdSet.value.has(row[rowKey]);
    }
    return selectedRows.value.some((r) => r[rowKey] === row[rowKey]);
  }

  function toggleRowSelection(row: any, selected: boolean) {
    if (isAllDataSelected.value) {
      if (selected) {
        excludedIds.value.delete(row[rowKey]);
        if (!selectedRows.value.some((r) => r[rowKey] === row[rowKey])) {
          selectedRows.value.push(row);
        }
      } else {
        excludedIds.value.add(row[rowKey]);
        selectedRows.value = selectedRows.value.filter(
          (r) => r[rowKey] !== row[rowKey],
        );
      }
      return;
    }
    if (selected) {
      if (!selectedRows.value.some((r) => r[rowKey] === row[rowKey])) {
        selectedRows.value.push(row);
      }
      if (selectionMode === "all") {
        selectedIdSet.value.add(row[rowKey]);
      }
    } else {
      selectedRows.value = selectedRows.value.filter(
        (r) => r[rowKey] !== row[rowKey],
      );
      if (selectionMode === "all") {
        selectedIdSet.value.delete(row[rowKey]);
      }
    }
  }

  function selectCurrentPage() {
    const data = getTableData();
    if (isAllDataSelected.value) {
      data.forEach((row) => {
        excludedIds.value.delete(row[rowKey]);
      });
    } else {
      data.forEach((row) => {
        if (!selectedRows.value.some((r) => r[rowKey] === row[rowKey])) {
          selectedRows.value.push(row);
        }
        if (selectionMode === "all") {
          selectedIdSet.value.add(row[rowKey]);
        }
      });
    }
    selectedRows.value = [...selectedRows.value];
  }

  function selectAllData() {
    if (selectionMode === "all") {
      isAllDataSelected.value = true;
      excludedIds.value.clear();
      const data = getTableData();
      data.forEach((row) => {
        if (!selectedRows.value.some((r) => r[rowKey] === row[rowKey])) {
          selectedRows.value.push(row);
        }
      });
    } else {
      const data = getTableData();
      selectedRows.value = [...data];
    }
  }

  function getSelection(): any[] {
    return selectedRows.value;
  }

  function getSelectionIds(): any[] {
    if (isAllDataSelected.value) {
      return Array.from(excludedIds.value);
    }
    return Array.from(selectedIdSet.value);
  }

  function isAllSelectedMode(): boolean {
    return isAllDataSelected.value;
  }

  function getExcludedIds(): any[] {
    return Array.from(excludedIds.value);
  }

  function setSelectionByIds(ids: any[]) {
    selectedIdSet.value = new Set(ids);
    isAllDataSelected.value = false;
    excludedIds.value.clear();
  }

  function clearSelection() {
    selectedRows.value = [];
    selectedIdSet.value.clear();
    excludedIds.value.clear();
    isAllDataSelected.value = false;
  }

  return {
    selectedRows,
    selectedIdSet,
    isAllSelected,
    isIndeterminate,
    selectCount,
    handleSelectionChange,
    isSelected,
    toggleRowSelection,
    selectCurrentPage,
    selectAllData,
    getSelection,
    getSelectionIds,
    isAllSelectedMode,
    getExcludedIds,
    setSelectionByIds,
    clearSelection,
  };
}
