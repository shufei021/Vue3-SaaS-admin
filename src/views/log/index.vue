<template>
  <div class="page-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="用户名/操作/模块"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="模块">
          <el-select
            v-model="query.module"
            placeholder="全部"
            clearable
            style="width: 130px"
          >
            <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="结果">
          <el-select
            v-model="query.result"
            placeholder="全部"
            clearable
            style="width: 100px"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <div class="card-base">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="80" />
        <el-table-column prop="method" label="请求方式" width="90">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="methodType(row.method)"
              effect="plain"
              >{{ row.method }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.result === 'success' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.result === "success" ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column prop="duration" label="耗时" width="80" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.duration > 300 ? '#f56c6c' : 'inherit' }"
              >{{ row.duration }}ms</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="170" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleDetail(row as AuditLog)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="日志详情" width="560px">
      <el-descriptions v-if="currentLog" :column="2" border>
        <el-descriptions-item label="操作人">{{
          currentLog.username
        }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{
          currentLog.module
        }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{
          currentLog.action
        }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{
          currentLog.method
        }}</el-descriptions-item>
        <el-descriptions-item label="请求 URL" :span="2">{{
          currentLog.url
        }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <code style="word-break: break-all">{{ currentLog.params }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag
            :type="currentLog.result === 'success' ? 'success' : 'danger'"
            size="small"
          >
            {{ currentLog.result === "success" ? "成功" : "失败" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时"
          >{{ currentLog.duration }}ms</el-descriptions-item
        >
        <el-descriptions-item label="IP 地址">{{
          currentLog.ip
        }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{
          currentLog.createTime
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh, Download } from "@element-plus/icons-vue";
import { getAuditLogs } from "@/api";
import type { AuditLog } from "@/types";

const loading = ref(false);
const tableData = ref<AuditLog[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const currentLog = ref<AuditLog | null>(null);

const modules = [
  "用户管理",
  "角色管理",
  "租户管理",
  "系统设置",
  "数据看板",
  "仪表盘",
];

const query = reactive({
  keyword: "",
  module: "",
  result: "",
  dateRange: null as string[] | null,
  page: 1,
  pageSize: 10,
});

function methodType(method: string) {
  const map: Record<string, string> = {
    GET: "info",
    POST: "success",
    PUT: "warning",
    DELETE: "danger",
  };
  return (map[method] || "info") as any;
}

async function loadData() {
  loading.value = true;
  try {
    const res = await getAuditLogs(query);
    tableData.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function handleReset() {
  query.keyword = "";
  query.module = "";
  query.result = "";
  query.dateRange = null;
  query.page = 1;
  loadData();
}

function handleDetail(row: AuditLog) {
  currentLog.value = row;
  detailVisible.value = true;
}

function handleExport() {
  ElMessage.info("日志导出功能（Mock）");
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
