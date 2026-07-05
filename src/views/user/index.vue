<template>
  <div class="page-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <el-form :inline="true" :model="query" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="用户名/昵称/邮箱"
            clearable
            style="width: 200px"
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
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="query.roleId"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="r in roles"
              :key="r.id"
              :label="r.name"
              :value="r.id"
            />
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

    <!-- Table Toolbar -->
    <div class="card-base">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
          <el-button :disabled="!selectedIds.length" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>导入
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="刷新">
            <el-button circle @click="loadData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- Table -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roleName" label="角色" width="110">
          <template #default="{ row }">
            <el-tag size="small">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tenantName" label="所属租户" width="110" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              size="small"
              @change="handleStatusChange(row as UserInfo)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row as UserInfo)"
              >编辑</el-button
            >
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row as UserInfo)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            :disabled="isEdit"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="form.roleId"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="r in roles"
              :key="r.id"
              :label="r.name"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Download,
  Upload,
} from "@element-plus/icons-vue";
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  getRoleList,
} from "@/api";
import type { UserInfo, UserForm, RoleInfo } from "@/types";

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const tableData = ref<UserInfo[]>([]);
const total = ref(0);
const selectedIds = ref<number[]>([]);
const roles = ref<RoleInfo[]>([]);
const formRef = ref<FormInstance>();

const query = reactive({
  keyword: "",
  status: "" as string | number,
  roleId: "" as string | number,
  page: 1,
  pageSize: 10,
});

const form = reactive<UserForm>({
  username: "",
  nickname: "",
  email: "",
  phone: "",
  status: 1,
  roleId: 0,
  password: "",
});

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

async function loadData() {
  loading.value = true;
  try {
    const res = await getUserList(query);
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
  query.status = "";
  query.roleId = "";
  query.page = 1;
  loadData();
}

function handleSelectionChange(rows: UserInfo[]) {
  selectedIds.value = rows.map((r) => r.id);
}

function handleAdd() {
  isEdit.value = false;
  Object.assign(form, {
    id: undefined,
    username: "",
    nickname: "",
    email: "",
    phone: "",
    status: 1,
    roleId: 0,
    password: "",
  });
  dialogVisible.value = true;
}

function handleEdit(row: UserInfo) {
  isEdit.value = true;
  Object.assign(form, { ...row, password: undefined });
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateUser(form);
      ElMessage.success("更新成功");
    } else {
      await createUser(form);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    loadData();
  } finally {
    submitLoading.value = false;
  }
}

function handleDelete(row: UserInfo) {
  ElMessageBox.confirm(`确定删除用户「${row.nickname}」吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      await deleteUser([row.id]);
      ElMessage.success("删除成功");
      loadData();
    })
    .catch(() => {});
}

function handleBatchDelete() {
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedIds.value.length} 个用户吗？`,
    "提示",
    { type: "warning" },
  )
    .then(async () => {
      await deleteUser(selectedIds.value);
      ElMessage.success("批量删除成功");
      loadData();
    })
    .catch(() => {});
}

function handleStatusChange(row: UserInfo) {
  ElMessage.success(
    `用户「${row.nickname}」已${row.status === 1 ? "启用" : "禁用"}`,
  );
}

function handleExport() {
  ElMessage.info("导出功能（Mock）");
}

function handleImport() {
  ElMessage.info("导入功能（Mock）");
}

onMounted(async () => {
  loadData();
  const roleRes = await getRoleList();
  roles.value = roleRes.data;
});
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
