<template>
  <div class="page-container">
    <div class="card-base">
      <h2>CustomTable 使用示例</h2>

      <el-tabs v-model="activeTab" style="margin-top: 16px">
        <el-tab-pane label="示例一：基础表格" name="basic">
          <p class="desc">最简单的用法，传 columns 配置即可</p>
          <CustomTable :config="basicConfig" />
        </el-tab-pane>

        <el-tab-pane label="示例二：完整功能" name="full">
          <p class="desc">带 API 请求、多选、排序、操作列、批量操作</p>
          <CustomTable ref="fullTableRef" :config="fullConfig">
            <template #column_avatar="{ row }">
              <el-avatar :size="36" :src="row.avatar || undefined">
                {{ row.username?.charAt(0)?.toUpperCase() || "?" }}
              </el-avatar>
            </template>
            <template #column_status="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </CustomTable>
        </el-tab-pane>

        <el-tab-pane label="示例三：别名映射" name="alias">
          <p class="desc">
            不同接口参数/返回字段不一致时，通过 alias 配置抹平差异
          </p>
          <CustomTable ref="aliasTableRef" :config="aliasConfig" />
        </el-tab-pane>

        <el-tab-pane label="示例四：内置列类型" name="types">
          <p class="desc">tag / status / date / currency / img 等内置列类型</p>
          <CustomTable :config="typesConfig" />
        </el-tab-pane>

        <el-tab-pane label="示例五：多选下拉" name="selection">
          <p class="desc">
            多选列头部下拉菜单：选择当前页、选择全部、清空所有选中（鼠标 hover
            复选框右侧下箭头）
          </p>
          <CustomTable ref="selectionTableRef" :config="selectionConfig">
            <template #column_status="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </CustomTable>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CustomTable from "./components/CustomTable/index.vue";
import type { CustomTableConfig } from "./components/CustomTable/types";
import { getUserList, deleteUser } from "@/api";
import type { UserInfo } from "@/types";

const activeTab = ref("basic");
const fullTableRef = ref();

// ==================== 示例一：基础表格（本地数据）====================
const basicData = [
  { date: "2025-01-01", name: "张三", address: "上海市普陀区金沙江路 1518 弄" },
  { date: "2025-01-02", name: "李四", address: "上海市普陀区金沙江路 1517 弄" },
  { date: "2025-01-03", name: "王五", address: "上海市普陀区金沙江路 1519 弄" },
];

const basicConfig: CustomTableConfig = {
  requestApi: () =>
    Promise.resolve({
      code: 0,
      data: { list: basicData, total: basicData.length },
    }),
  pagination: { show: false },
  columns: [
    { prop: "date", label: "日期", width: 180 },
    { prop: "name", label: "姓名", width: 120 },
    { prop: "address", label: "地址", minWidth: 200 },
  ],
  tableProps: {
    showIndex: true,
  },
};

// ==================== 示例二：完整功能 ====================
const fullConfig: CustomTableConfig = {
  requestApi: getUserList,
  columns: [
    { prop: "id", label: "ID", width: 70, align: "center", sortable: "custom" },
    {
      prop: "avatar",
      label: "头像",
      width: 80,
      align: "center",
      slotName: "avatar",
    },
    { prop: "username", label: "用户名", width: 120, sortable: "custom" },
    { prop: "nickname", label: "昵称", width: 120 },
    { prop: "email", label: "邮箱", minWidth: 180, showOverflowTooltip: true },
    { prop: "roleName", label: "角色", width: 100 },
    {
      prop: "status",
      label: "状态",
      width: 100,
      align: "center",
      slotName: "status",
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 170,
      type: "date",
      format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
  tableProps: {
    showSelection: true,
    selectionMode: "all",
    showIndex: true,
  },
  actions: [
    {
      label: "编辑",
      type: "primary",
      onClick: (row: UserInfo) => handleEdit(row),
    },
    {
      label: "删除",
      type: "danger",
      onClick: (row: UserInfo) => handleDelete(row),
    },
  ],
  batchActions: [
    {
      label: "批量删除",
      type: "danger",
      onClick: () => handleBatchDelete(),
    },
    {
      label: "导出选中",
      type: "primary",
      onClick: () => handleExport(),
    },
  ],
};

function handleEdit(row: UserInfo) {
  ElMessage.success(`编辑用户：${row.username}`);
}

function handleDelete(row: UserInfo) {
  ElMessageBox.confirm(`确定删除「${row.username}」吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      await deleteUser([row.id]);
      ElMessage.success("删除成功");
      fullTableRef.value?.reload();
    })
    .catch(() => {});
}

function handleBatchDelete() {
  const ids = fullTableRef.value?.getSelectionIds() || [];
  if (ids.length === 0) {
    ElMessage.warning("请先选择数据");
    return;
  }
  ElMessageBox.confirm(`确定删除选中的 ${ids.length} 条数据吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      await deleteUser(ids);
      ElMessage.success("批量删除成功");
      fullTableRef.value?.clearSelection();
      fullTableRef.value?.reload();
    })
    .catch(() => {});
}

function handleExport() {
  const ids = fullTableRef.value?.getSelectionIds() || [];
  ElMessage.success(`导出选中的 ${ids.length} 条数据`);
}

// ==================== 示例三：别名映射 ====================
const aliasConfig: CustomTableConfig = {
  requestApi: (params: any) => {
    console.log("请求参数（已映射别名）：", params);
    return getUserList(params);
  },
  alias: {
    request: {
      page: "pageNum",
      pageSize: "pageSize",
      sortField: "sortBy",
      sortOrder: "orderDirection",
    },
    response: {
      list: "list",
      total: "total",
    },
  },
  transformParams: (params) => {
    console.log("transformParams 转换后参数：", params);
    return params;
  },
  columns: [
    { prop: "id", label: "ID", width: 70, align: "center" },
    { prop: "username", label: "用户名", width: 120 },
    { prop: "nickname", label: "昵称", width: 120 },
    { prop: "email", label: "邮箱", minWidth: 180 },
    {
      prop: "createTime",
      label: "创建时间",
      width: 170,
      type: "date",
      format: "YYYY-MM-DD",
    },
  ],
  tableProps: {
    showIndex: true,
  },
};

// ==================== 示例四：内置列类型 ====================
const typesData = [
  {
    id: 1,
    name: "订单",
    status: "success",
    price: 1299.99,
    createTime: "2025-01-15 10:30:00",
  },
  {
    id: 2,
    name: "待处理",
    status: "warning",
    price: 599.5,
    createTime: "2025-01-16 14:20:00",
  },
  {
    id: 3,
    name: "已取消",
    status: "error",
    price: 0,
    createTime: "2025-01-17 09:15:00",
  },
];

const typesConfig: CustomTableConfig = {
  requestApi: () =>
    Promise.resolve({
      code: 0,
      data: { list: typesData, total: typesData.length },
    }),
  pagination: { show: false },
  columns: [
    { prop: "id", label: "ID", width: 60, align: "center" },
    {
      prop: "name",
      label: "标签",
      width: 120,
      type: "tag",
      tagProps: { type: "primary", effect: "light" },
    },
    {
      prop: "status",
      label: "状态",
      width: 100,
      align: "center",
      type: "status",
      colorFormat: (row: any) =>
        row.status === "success"
          ? "#67c23a"
          : row.status === "warning"
            ? "#e6a23c"
            : "#f56c6c",
    },
    {
      prop: "price",
      label: "金额",
      width: 120,
      align: "right",
      type: "currency",
      digit: 2,
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 170,
      type: "date",
      format: "YYYY-MM-DD HH:mm",
    },
  ],
  tableProps: {
    showIndex: true,
  },
};

// ==================== 示例五：多选下拉 ====================
const selectionTableRef = ref();

const selectionConfig: CustomTableConfig = {
  requestApi: getUserList,
  columns: [
    { prop: "id", label: "ID", width: 70, align: "center" },
    { prop: "username", label: "用户名", width: 120 },
    { prop: "nickname", label: "昵称", width: 120 },
    { prop: "email", label: "邮箱", minWidth: 180 },
    {
      prop: "status",
      label: "状态",
      width: 100,
      align: "center",
      slotName: "status",
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 170,
      type: "date",
    },
  ],
  tableProps: {
    showSelection: true,
    selectionMode: "all",
    showIndex: true,
  },
  actions: [
    {
      label: "查看",
      type: "primary",
      onClick: (row: any) => {
        ElMessage.success(
          `查看：${row.username}，当前选中 ${selectionTableRef.value?.getSelectionIds().length} 项`,
        );
      },
    },
  ],
  batchActions: [
    {
      label: "批量删除",
      type: "danger",
      onClick: () => {
        const ids = selectionTableRef.value?.getSelectionIds() || [];
        ElMessage.success(`批量删除：${ids.length} 项，ID: ${ids.join(", ")}`);
      },
    },
  ],
};
</script>

<style lang="scss" scoped>
.desc {
  color: var(--text-secondary);
  margin: 8px 0 16px;
  font-size: 13px;
}
</style>
