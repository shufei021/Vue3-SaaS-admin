<template>
  <div class="page-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="租户名称/编码/联系人"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="query.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="正常" value="active" />
            <el-option label="停用" value="suspended" />
            <el-option label="过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Tenant Cards -->
    <el-row :gutter="16">
      <el-col
        :xs="24"
        :sm="12"
        :lg="8"
        v-for="tenant in tenants"
        :key="tenant.id"
      >
        <div class="card-base tenant-card">
          <div class="tenant-header">
            <div class="tenant-name-row">
              <span class="tenant-name">{{ tenant.name }}</span>
              <el-tag :type="statusType(tenant.status)" size="small">{{
                statusLabel(tenant.status)
              }}</el-tag>
            </div>
            <el-tag
              :color="planColor(tenant.plan)"
              size="small"
              effect="dark"
              style="border: none; color: #fff"
            >
              {{ planLabel(tenant.plan) }}
            </el-tag>
          </div>

          <div class="tenant-info">
            <div class="info-row">
              <span class="info-label">编码</span>
              <span class="info-value">{{ tenant.code }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">联系人</span>
              <span class="info-value">{{ tenant.contactName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">联系电话</span>
              <span class="info-value">{{ tenant.contactPhone }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">到期时间</span>
              <span class="info-value">{{
                tenant.expireTime.slice(0, 10)
              }}</span>
            </div>
          </div>

          <!-- Usage Progress -->
          <div class="tenant-usage">
            <div class="usage-item">
              <div class="usage-label">
                <span>用户数</span>
                <span class="usage-text"
                  >{{ tenant.currentUsers }} / {{ tenant.maxUsers }}</span
                >
              </div>
              <el-progress
                :percentage="
                  Math.round((tenant.currentUsers / tenant.maxUsers) * 100)
                "
                :stroke-width="8"
              />
            </div>
            <div class="usage-item">
              <div class="usage-label">
                <span>存储用量</span>
                <span class="usage-text"
                  >{{ tenant.storageUsed }} / {{ tenant.storageLimit }} GB</span
                >
              </div>
              <el-progress
                :percentage="
                  Math.round((tenant.storageUsed / tenant.storageLimit) * 100)
                "
                :stroke-width="8"
                :color="storageColor(tenant)"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="tenant-actions">
            <el-button size="small" @click="handleDetail(tenant)"
              >详情</el-button
            >
            <el-button
              size="small"
              :type="tenant.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(tenant)"
            >
              {{ tenant.status === "active" ? "停用" : "启用" }}
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Pagination -->
    <div class="pagination-wrapper" v-if="total > query.pageSize">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
      />
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="租户详情" width="560px">
      <el-descriptions v-if="currentTenant" :column="2" border>
        <el-descriptions-item label="租户名称">{{
          currentTenant.name
        }}</el-descriptions-item>
        <el-descriptions-item label="租户编码">{{
          currentTenant.code
        }}</el-descriptions-item>
        <el-descriptions-item label="套餐">{{
          planLabel(currentTenant.plan)
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentTenant.status)" size="small">{{
            statusLabel(currentTenant.status)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">{{
          currentTenant.contactName
        }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{
          currentTenant.contactPhone
        }}</el-descriptions-item>
        <el-descriptions-item label="联系邮箱">{{
          currentTenant.contactEmail
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          currentTenant.createTime
        }}</el-descriptions-item>
        <el-descriptions-item label="用户数"
          >{{ currentTenant.currentUsers }} /
          {{ currentTenant.maxUsers }}</el-descriptions-item
        >
        <el-descriptions-item label="存储用量"
          >{{ currentTenant.storageUsed }} /
          {{ currentTenant.storageLimit }} GB</el-descriptions-item
        >
        <el-descriptions-item label="到期时间" :span="2">{{
          currentTenant.expireTime
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import { getTenantList, updateTenantStatus } from "@/api";
import { getStatusLabel, getPlanLabel, getPlanColor } from "@/utils";
import type { TenantInfo } from "@/types";

const tenants = ref<TenantInfo[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const currentTenant = ref<TenantInfo | null>(null);

const query = reactive({
  keyword: "",
  status: "",
  page: 1,
  pageSize: 12,
});

function statusType(status: string) {
  return status === "active"
    ? "success"
    : status === "suspended"
      ? "danger"
      : "warning";
}

function statusLabel(status: string) {
  return getStatusLabel(status);
}

function planLabel(plan: string) {
  return getPlanLabel(plan);
}

function planColor(plan: string) {
  return getPlanColor(plan);
}

function storageColor(tenant: TenantInfo) {
  const ratio = tenant.storageUsed / tenant.storageLimit;
  if (ratio < 0.6) return "#67c23a";
  if (ratio < 0.85) return "#e6a23c";
  return "#f56c6c";
}

async function loadData() {
  const res = await getTenantList(query);
  tenants.value = res.data.list;
  total.value = res.data.total;
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function handleReset() {
  query.keyword = "";
  query.status = "";
  query.page = 1;
  loadData();
}

function handleDetail(tenant: TenantInfo) {
  currentTenant.value = tenant;
  detailVisible.value = true;
}

function handleToggleStatus(tenant: TenantInfo) {
  const action = tenant.status === "active" ? "停用" : "启用";
  ElMessageBox.confirm(`确定${action}租户「${tenant.name}」吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      const newStatus = tenant.status === "active" ? "suspended" : "active";
      await updateTenantStatus(tenant.id, newStatus);
      tenant.status = newStatus as any;
      ElMessage.success(`${action}成功`);
    })
    .catch(() => {});
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.tenant-card {
  margin-bottom: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
}

.tenant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .tenant-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tenant-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.tenant-info {
  margin-bottom: 16px;

  .info-row {
    display: flex;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;

    .info-label {
      width: 80px;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .info-value {
      color: var(--text-regular);
    }
  }
}

.tenant-usage {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-page);
  border-radius: 8px;

  .usage-item {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .usage-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;

      .usage-text {
        font-weight: 500;
      }
    }
  }
}

.tenant-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
