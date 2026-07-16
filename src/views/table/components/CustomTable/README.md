# 自定义表格组件 (CustomTable)

> 高度配置化表格组件，封装 `el-table + el-pagination`，支持别名映射抹平接口差异、内置列类型、多选（当前页/跨页）、排序、批量操作等功能。

---

## 设计原则

- **单入口配置**：组件只有一个 `config` 属性，所有配置集中管理
- **高度配置化**：列、分页、请求、别名、操作列全部配置化
- **别名映射**：通过 `alias` 配置抹平接口参数和返回字段差异
- **灵活扩展**：支持插槽 + render 函数 + formatter 三种自定义方式
- **可组合**：只封装表格部分，可自由与筛选栏、工具栏、弹窗等组合

---

## 目录结构

```
CustomTable/
├── index.vue          # 主组件
├── README.md          # 本文档
└── composables/       # 逻辑抽离（后续实现时添加）
    ├── useRequest.ts
    ├── useSelection.ts
    └── usePagination.ts
```

---

## Props

| 属性     | 类型                | 默认值 | 说明               |
| -------- | ------------------- | ------ | ------------------ |
| `config` | `CustomTableConfig` | `{}`   | 表格配置，详见下方 |

组件其余属性自动透传给 `el-table`。

---

## Config 完整结构

```typescript
interface CustomTableConfig {
  // ========== 1. 请求配置 ==========
  requestApi?: (params: Record<string, any>) => Promise<any>;
  requestParams?: Record<string, any>;
  autoLoad?: boolean;
  transformParams?: (params: Record<string, any>) => Record<string, any>;
  preRequest?: () => Promise<void>;

  // ========== 2. 别名配置（抹平接口差异）==========
  alias?: {
    request?: {
      page?: string; // 默认 'page'
      pageSize?: string; // 默认 'pageSize'
      sortField?: string; // 默认 'sortField'
      sortOrder?: string; // 默认 'sortOrder'
    };
    response?: {
      list?: string; // 默认 'list'
      total?: string; // 默认 'total'
    };
  };

  // ========== 3. 分页配置 ==========
  pagination?: {
    page?: number;
    pageSize?: number;
    pageSizes?: number[];
    show?: boolean;
    layout?: string;
  };

  // ========== 4. 列配置 ==========
  columns: CustomTableColumn[];

  // ========== 5. 表格属性 ==========
  tableProps?: {
    stripe?: boolean;
    border?: boolean;
    showSelection?: boolean;
    selectionMode?: "current" | "all";
    showIndex?: boolean;
    indexMethod?: (index: number) => number;
    height?: string | number;
    rowKey?: string;
    [key: string]: any;
  };

  // ========== 6. 操作列 ==========
  actions?: CustomTableAction[];

  // ========== 7. 批量操作 ==========
  batchActions?: CustomTableAction[];
}
```

---

## 列配置 (CustomTableColumn)

```typescript
interface CustomTableColumn {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right" | boolean;
  sortable?: boolean | "custom";
  showOverflowTooltip?: boolean;

  // ===== 内置列类型（优先级最低，会被 slotName/render 覆盖）=====
  type?: "tag" | "status" | "img" | "date" | "currency";

  // 不同类型的专属配置
  format?: string; // date 用，默认 'YYYY-MM-DD HH:mm:ss'
  digit?: number; // currency 数字保留位数
  colorFormat?: (row: any) => string; // status 颜色
  tagProps?: Record<string, any>; // tag 的 el-tag 属性

  // ===== 自定义渲染（三选一，优先级：slotName > render > formatter）=====
  slotName?: string;
  render?: (row: any, index: number) => VNode | string;
  formatter?: (value: any, row: any) => string;

  // el-table-column 其他属性透传
  [key: string]: any;
}
```

---

## 操作列配置 (CustomTableAction)

```typescript
interface CustomTableAction {
  label: string;
  type?: "primary" | "success" | "warning" | "danger" | "info";
  onClick: (row: any, index: number) => void;
  show?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
}
```

---

## 事件

| 事件名             | 说明         | 回调参数                                                        |
| ------------------ | ------------ | --------------------------------------------------------------- |
| `selection-change` | 多选变化     | `rows: any[]`                                                   |
| `sort-change`      | 排序变化     | `{ prop, order }`，order: `'ascending' \| 'descending' \| null` |
| `page-change`      | 页码变化     | `page: number`                                                  |
| `page-size-change` | 每页条数变化 | `pageSize: number`                                              |
| `row-click`        | 行点击       | `row: any`                                                      |
| `load-success`     | 数据加载成功 | `data: { list: any[], total: number }`                          |
| `load-error`       | 数据加载失败 | `error: any`                                                    |

---

## 插槽

| 插槽名           | 说明                         | 作用域           |
| ---------------- | ---------------------------- | ---------------- |
| `#column_{prop}` | 自定义列内容                 | `{ row, index }` |
| `#header_{prop}` | 自定义列表头                 | `{ column }`     |
| `#actions`       | 操作列（覆盖配置生成的按钮） | `{ row, index }` |
| `#toolbar`       | 工具栏预留位置               | -                |
| `#filter`        | 筛选栏预留位置               | -                |
| `#empty`         | 空状态                       | -                |

---

## 暴露的方法

| 方法名                     | 说明                                  |
| -------------------------- | ------------------------------------- |
| `reload()`                 | 重新加载数据                          |
| `getSelection()`           | 获取当前选中行                        |
| `getSelectionIds()`        | 获取所有选中行的 ID（跨页模式下使用） |
| `setSelectionByIds(ids)`   | 通过 ID 数组设置选中项                |
| `clearSelection()`         | 清空选中                              |
| `setRequestParams(params)` | 动态设置请求参数并刷新                |

---

## 使用示例

### 基础使用

```vue
<template>
  <CustomTable ref="tableRef" :config="tableConfig" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import CustomTable from "./components/CustomTable/index.vue";
import { getUserList } from "@/api";

const tableRef = ref();

const tableConfig = {
  requestApi: getUserList,
  alias: {
    request: { page: "pageNum", pageSize: "pageSize" },
    response: { list: "list", total: "total" },
  },
  columns: [
    { prop: "id", label: "ID", width: 60 },
    { prop: "username", label: "用户名", width: 120 },
    { prop: "email", label: "邮箱", minWidth: 180 },
    {
      prop: "createTime",
      label: "创建时间",
      width: 170,
      type: "date",
      format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
  tableProps: { showSelection: true, selectionMode: "current" },
};
</script>
```

### 带操作列和自定义插槽

```vue
<template>
  <CustomTable ref="tableRef" :config="tableConfig">
    <template #column_status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? "启用" : "禁用" }}
      </el-tag>
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CustomTable from "./components/CustomTable/index.vue";
import { getUserList, deleteUser } from "@/api";

const tableRef = ref();

const tableConfig = {
  requestApi: getUserList,
  columns: [
    { prop: "id", label: "ID", width: 60 },
    { prop: "username", label: "用户名", width: 120 },
    {
      prop: "status",
      label: "状态",
      width: 100,
      align: "center",
      slotName: "status",
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
      onClick: (row) => handleEdit(row),
    },
    {
      label: "删除",
      type: "danger",
      onClick: (row) => handleDelete(row),
    },
  ],
  batchActions: [
    {
      label: "批量删除",
      type: "danger",
      onClick: () => handleBatchDelete(),
    },
    {
      label: "导出",
      type: "primary",
      onClick: () => handleExport(),
    },
  ],
};

function handleEdit(row) {
  // 编辑逻辑
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除「${row.username}」吗？`, "提示", {
    type: "warning",
  }).then(async () => {
    await deleteUser([row.id]);
    ElMessage.success("删除成功");
    tableRef.value?.reload();
  });
}

function handleBatchDelete() {
  const ids = tableRef.value?.getSelectionIds();
  // 批量删除逻辑
}

function handleExport() {
  // 导出逻辑
}
</script>
```

### 带后端排序

```vue
<script setup lang="ts">
const tableConfig = {
  requestApi: getUserList,
  columns: [
    { prop: "id", label: "ID", width: 60, sortable: "custom" },
    { prop: "username", label: "用户名", width: 120, sortable: "custom" },
    { prop: "createTime", label: "创建时间", width: 170, sortable: "custom" },
  ],
};
</script>
```

---

## 别名映射说明

当不同接口的分页参数或返回字段不一致时，通过 `alias` 配置抹平差异：

### 场景示例

| 接口   | 分页参数              | 返回字段                    |
| ------ | --------------------- | --------------------------- |
| 接口 A | `page`, `size`        | `{ records: [], count: 0 }` |
| 接口 B | `pageNum`, `pageSize` | `{ list: [], total: 0 }`    |

### 接口 A 的 alias 配置

```typescript
alias: {
  request: { page: "page", pageSize: "size" },
  response: { list: "records", total: "count" },
}
```

### 接口 B 的 alias 配置

```typescript
alias: {
  request: { page: "pageNum", pageSize: "pageSize" },
  response: { list: "list", total: "total" },
}
```

排序参数同理，通过 `alias.request.sortField` 和 `alias.request.sortOrder` 配置。

排序方向值：`'asc'` / `'desc'`。

---

## 多选模式说明

### current（默认）- 选择当前页

- 只选中当前页的数据
- 切换分页后选中状态清空
- 适用于简单场景

### all - 跨页选择

- 选中状态跨页保留
- 通过 `rowKey` 标识唯一行（默认 `'id'`）
- 通过 `getSelectionIds()` 获取所有选中的 ID
- 通过 `setSelectionByIds(ids)` 回显选中项
- 适用于批量操作跨页数据的场景

---

## 内置列类型说明

| 类型       | 说明             | 专属配置                               |
| ---------- | ---------------- | -------------------------------------- |
| `tag`      | 显示为 el-tag    | `tagProps`                             |
| `status`   | 带颜色圆点的状态 | `colorFormat`                          |
| `img`      | 图片预览         | -                                      |
| `date`     | 日期格式化       | `format`，默认 `'YYYY-MM-DD HH:mm:ss'` |
| `currency` | 金额格式化       | `digit`，保留小数位数                  |

如需更复杂的渲染，使用 `slotName` 或 `render` 函数覆盖。
