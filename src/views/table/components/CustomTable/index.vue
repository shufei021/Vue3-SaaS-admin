<template>
  <div v-loading="loading" class="custom-table">
    <slot name="filter"></slot>
    <slot name="toolbar"></slot>

    <el-table
      ref="tableRef"
      v-bind="mergedTableProps"
      :data="tableData"
      @sort-change="onSortChange"
      @row-click="onRowClick"
    >
      <el-table-column
        v-if="tableProps?.showSelection"
        width="80"
        align="center"
        fixed="left"
      >
        <template #header>
          <div class="selection-header">
            <el-checkbox
              :model-value="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="(val) => onToggleAllSelection(Boolean(val))"
            />
            <el-dropdown trigger="hover" @command="onSelectionCommand">
              <span class="dropdown-trigger">
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="selectPage"
                    >选择当前页</el-dropdown-item
                  >
                  <el-dropdown-item command="selectAll"
                    >选择全部</el-dropdown-item
                  >
                  <el-dropdown-item command="clearAll" divided
                    >清空所有选中</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
        <template #default="{ row }">
          <el-checkbox
            :model-value="isSelected(row)"
            @change="(val) => onToggleRowSelection(row, Boolean(val))"
          />
        </template>
      </el-table-column>

      <el-table-column
        v-if="tableProps?.showIndex"
        type="index"
        label="序"
        width="60"
        align="center"
        :index="indexMethod"
      />

      <template v-for="column in config.columns" :key="column.prop">
        <el-table-column
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.showOverflowTooltip !== false"
          v-bind="getColumnProps(column)"
        >
          <template #header="{ column: col }">
            <slot
              v-if="hasSlot(`header_${col.property}`)"
              :name="`header_${col.property}`"
              :column="col"
            >
            </slot>
            <span v-else>{{ col.label }}</span>
          </template>

          <template #default="{ row, $index }">
            <slot
              v-if="column.slotName && hasSlot(`column_${column.slotName}`)"
              :name="`column_${column.slotName || column.prop}`"
              :row="row"
              :index="$index"
            ></slot>

            <component
              :is="() => column.render?.(row, $index)"
              v-else-if="column.render"
            ></component>

            <template v-else-if="column.type === 'tag'">
              <el-tag v-bind="column.tagProps || {}">
                {{ formatCell(row, column) }}
              </el-tag>
            </template>

            <template v-else-if="column.type === 'status'">
              <span class="status-cell">
                <span
                  class="status-dot"
                  :style="{
                    backgroundColor: column.colorFormat?.(row) || '#ccc',
                  }"
                ></span>
                {{ formatCell(row, column) }}
              </span>
            </template>

            <template v-else-if="column.type === 'img'">
              <el-image
                :src="row[column.prop]"
                :preview-src-list="[row[column.prop]]"
                fit="cover"
                style="width: 40px; height: 40px"
              />
            </template>

            <template v-else-if="column.type === 'date'">
              {{ formatDate(row[column.prop], column.format) }}
            </template>

            <template v-else-if="column.type === 'currency'">
              {{ formatCurrency(row[column.prop], column.digit) }}
            </template>

            <template v-else>
              <slot
                v-if="hasSlot(`column_${column.prop}`)"
                :name="`column_${column.prop}`"
                :row="row"
                :index="$index"
              >
              </slot>
              <span v-else>{{ formatCell(row, column) }}</span>
            </template>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="config.actions && config.actions.length"
        label="操作"
        :width="Math.max(config.actions.length * 60 + 40, 120)"
        fixed="right"
      >
        <template #default="{ row, $index }">
          <slot
            v-if="hasSlot('actions')"
            name="actions"
            :row="row"
            :index="$index"
          ></slot>
          <template v-else>
            <el-button
              v-for="(action, idx) in visibleActions(row)"
              :key="idx"
              link
              :type="action.type || 'primary'"
              size="small"
              :disabled="action.disabled?.(row)"
              @click="action.onClick(row, $index)"
            >
              {{ action.label }}
            </el-button>
          </template>
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </template>
    </el-table>

    <div
      v-if="(tableProps?.showSelection && selectCount > 0) || pagination.show"
      class="table-footer"
    >
      <div
        v-if="tableProps?.showSelection && selectCount > 0"
        class="batch-bar"
      >
        <el-checkbox
          :model-value="batchSelectAll"
          :indeterminate="batchIndeterminate"
          @change="(val) => onBatchSelectAll(Boolean(val))"
        >
          已选择 <span class="select-count">{{ selectCount }}</span> 项
        </el-checkbox>
        <span v-if="config.batchActions?.length" class="divider"></span>
        <div v-if="config.batchActions?.length" class="batch-btns">
          <el-button
            v-for="(action, idx) in config.batchActions"
            :key="idx"
            link
            :type="action.type || 'primary'"
            size="small"
            @click="action.onClick(null, 0)"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>

      <div v-if="pagination.show" class="pagination-bar">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="pagination.pageSizes"
          :total="pageTotal"
          :layout="pagination.layout"
          background
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import type {
  CustomTableConfig,
  CustomTableColumn,
  SortInfo,
  CustomTableAction,
} from "./types";
import { usePagination } from "./composables/usePagination";
import { useSelection } from "./composables/useSelection";
import { useRequest } from "./composables/useRequest";

const props = defineProps<{
  config: CustomTableConfig;
}>();

const emit = defineEmits<{
  (e: "selection-change", rows: any[]): void;
  (e: "sort-change", info: SortInfo): void;
  (e: "page-change", page: number): void;
  (e: "page-size-change", pageSize: number): void;
  (e: "row-click", row: any): void;
  (e: "load-success", data: { list: any[]; total: number }): void;
  (e: "load-error", error: any): void;
}>();

const slots = useSlots();
const tableRef = ref();

const tableProps = computed(() => props.config.tableProps ?? {});

const mergedTableProps = computed(() => {
  const { height, rowKey, ...rest } = tableProps.value;
  return {
    stripe: true,
    border: true,
    ...rest,
    height,
    rowKey: rowKey || "id",
  };
});

const pagination = usePagination(props.config.pagination, props.config.alias);

const currentPage = computed(() => pagination.currentPage.value);
const pageSize = computed(() => pagination.pageSize.value);
const pageTotal = computed(() => pagination.total.value);

const {
  isAllSelected,
  isIndeterminate,
  selectCount,
  isSelected,
  toggleRowSelection,
  selectAllData,
  getSelection,
  getSelectionIds,
  isAllSelectedMode,
  setSelectionByIds,
  clearSelection,
} = useSelection(
  tableProps.value,
  () => tableData.value,
  () => pageTotal.value,
);

const { loading, tableData, loadData, setSortInfo, setExtraParams } =
  useRequest(
    props.config,
    () => pagination.paginationParams.value,
    pagination.setTotal,
  );

const batchSelectAll = computed(() => isAllSelected.value);
const batchIndeterminate = computed(() => isIndeterminate.value);

function hasSlot(name: string): boolean {
  return !!slots[name];
}

function indexMethod(index: number): number {
  if (tableProps.value?.indexMethod) {
    return tableProps.value.indexMethod(index);
  }
  return (
    index + 1 + (pagination.currentPage.value - 1) * pagination.pageSize.value
  );
}

function getColumnProps(column: CustomTableColumn): Record<string, any> {
  const knownKeys = [
    "prop",
    "label",
    "width",
    "minWidth",
    "align",
    "fixed",
    "sortable",
    "showOverflowTooltip",
    "type",
    "format",
    "digit",
    "colorFormat",
    "tagProps",
    "slotName",
    "render",
    "formatter",
  ];
  const rest: Record<string, any> = {};
  for (const key of Object.keys(column)) {
    if (!knownKeys.includes(key)) {
      rest[key] = column[key];
    }
  }
  return rest;
}

function formatCell(row: any, column: CustomTableColumn): string {
  if (column.formatter) {
    return column.formatter(row[column.prop], row);
  }
  const value = row[column.prop];
  if (value === 0) return "0";
  return value ?? "-";
}

function formatDate(value: any, formatStr = "YYYY-MM-DD HH:mm:ss"): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    HH: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0"),
  };

  return formatStr.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match]);
}

function formatCurrency(value: any, digit = 2): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toFixed(digit);
}

function visibleActions(row: any): CustomTableAction[] {
  return (props.config.actions || []).filter((a) => !a.show || a.show(row));
}

function onSortChange({
  prop,
  order,
}: {
  prop: string | null;
  order: "ascending" | "descending" | null;
}) {
  const info: SortInfo = { prop: prop ?? "", order };
  setSortInfo(info);
  emit("sort-change", info);
  pagination.reset();
  loadData();
}

function onRowClick(row: any) {
  emit("row-click", row);
}

function onPageChange(page: number) {
  pagination.handlePageChange(page);
  emit("page-change", page);
  loadData();
}

function onSizeChange(size: number) {
  pagination.handleSizeChange(size);
  emit("page-size-change", size);
  loadData();
}

function onToggleAllSelection(val: boolean | any[]) {
  const isChecked = typeof val === "boolean" ? val : val.length > 0;
  tableData.value.forEach((row) => {
    toggleRowSelection(row, isChecked);
  });
  nextTick(() => {
    tableData.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, isChecked);
    });
  });
  emit("selection-change", getSelection());
}

function onToggleRowSelection(row: any, val: boolean) {
  toggleRowSelection(row, val);
  emit("selection-change", getSelection());
}

function onSelectionCommand(command: string) {
  if (command === "selectPage") {
    tableData.value.forEach((row) => {
      toggleRowSelection(row, true);
    });
    nextTick(() => {
      tableData.value.forEach((row) => {
        tableRef.value?.toggleRowSelection(row, true);
      });
    });
  } else if (command === "selectAll") {
    selectAllData();
    nextTick(() => {
      tableData.value.forEach((row) => {
        tableRef.value?.toggleRowSelection(row, true);
      });
    });
  } else if (command === "clearAll") {
    clearSelection();
    nextTick(() => {
      tableRef.value?.clearSelection();
    });
  }
  emit("selection-change", getSelection());
}

function onBatchSelectAll(val: boolean) {
  tableData.value.forEach((row) => {
    toggleRowSelection(row, val);
  });
  nextTick(() => {
    tableData.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, val);
    });
  });
  emit("selection-change", getSelection());
}

function reload() {
  loadData();
}

function setRequestParams(params: Record<string, any>) {
  setExtraParams(params);
  pagination.reset();
  loadData();
}

defineExpose({
  tableRef,
  reload,
  getSelection,
  getSelectionIds,
  isAllSelectedMode,
  setSelectionByIds,
  clearSelection,
  setRequestParams,
});

onMounted(() => {
  if (props.config.autoLoad !== false) {
    loadData();
  }
});
</script>

<style lang="scss" scoped>
.custom-table {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
}

.selection-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  .dropdown-trigger {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .dropdown-icon {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
}

.table-footer {
  display: flex;
  flex-direction: column;
  padding-top: 12px;

  .batch-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: var(--el-color-primary-light-9);
    border-radius: 4px;
    margin-bottom: 12px;

    .select-count {
      color: var(--el-color-primary);
      font-weight: 600;
    }

    .divider {
      width: 1px;
      height: 16px;
      background: var(--el-border-color);
    }

    .batch-btns {
      display: flex;
      gap: 4px;
    }
  }

  .pagination-bar {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
