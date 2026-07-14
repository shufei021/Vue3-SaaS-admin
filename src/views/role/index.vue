<template>
  <div class="page-container">
    <el-row :gutter="16">
      <!-- Role List -->
      <el-col :xs="24" :md="10">
        <div class="card-base">
          <div class="table-toolbar">
            <span class="section-title">角色列表</span>
            <el-button type="primary" size="small" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增角色
            </el-button>
          </div>
          <el-table
            v-loading="loading"
            :data="roles"
            highlight-current-row
            stripe
            border
            @current-change="handleSelectRole"
          >
            <el-table-column prop="name" label="角色名称" width="120" />
            <el-table-column prop="code" label="角色编码" width="130" />
            <el-table-column prop="description" label="描述" min-width="120" />
            <el-table-column
              prop="status"
              label="状态"
              width="70"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 1 ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.status === 1 ? "启用" : "禁用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleEdit(row as RoleInfo)"
                  >编辑</el-button
                >
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleDelete(row as RoleInfo)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- Permission Config -->
      <el-col :xs="24" :md="14">
        <div v-if="selectedRole" class="card-base">
          <div class="table-toolbar">
            <span class="section-title"
              >权限配置 - {{ selectedRole.name }}</span
            >
            <el-button type="primary" size="small" @click="handleSavePermission"
              >保存权限</el-button
            >
          </div>

          <el-tabs v-model="permTab">
            <el-tab-pane label="菜单权限" name="menu">
              <el-tree
                ref="treeRef"
                :data="menuTree"
                show-checkbox
                node-key="id"
                :default-checked-keys="selectedRole.menuIds"
                :props="{ label: 'name', children: 'children' }"
                default-expand-all
              />
            </el-tab-pane>
            <el-tab-pane label="数据权限" name="data">
              <el-form label-width="100px" style="margin-top: 16px">
                <el-form-item label="数据范围">
                  <el-select
                    v-model="selectedRole.dataScope"
                    style="width: 240px"
                  >
                    <el-option label="全部数据" value="all" />
                    <el-option label="本部门数据" value="dept" />
                    <el-option label="仅本人数据" value="self" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-alert
                    :title="dataScopeDesc"
                    type="info"
                    :closable="false"
                    show-icon
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else class="card-base empty-placeholder">
          <el-empty description="请选择左侧角色查看权限配置" />
        </div>
      </el-col>
    </el-row>

    <!-- Role Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="480px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入角色编码"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getMenuTree,
} from "@/api";
import type { RoleInfo, MenuNode } from "@/types";

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const roles = ref<RoleInfo[]>([]);
const menuTree = ref<MenuNode[]>([]);
const selectedRole = ref<RoleInfo | null>(null);
const permTab = ref("menu");
const treeRef = ref();
const formRef = ref<FormInstance>();

const form = reactive<{
  id: number;
  name: string;
  code: string;
  description: string;
  status: 0 | 1;
}>({
  id: 0,
  name: "",
  code: "",
  description: "",
  status: 1,
});

const formRules: FormRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
};

const dataScopeDesc = computed(() => {
  const map: Record<string, string> = {
    all: "可查看所有租户和部门的全部数据",
    dept: "仅可查看本部门及下级部门的数据",
    self: "仅可查看自己创建或负责的数据",
  };
  return selectedRole.value ? map[selectedRole.value.dataScope] || "" : "";
});

async function loadRoles() {
  loading.value = true;
  try {
    const res = await getRoleList();
    roles.value = res.data;
  } finally {
    loading.value = false;
  }
}

async function loadMenuTree() {
  const res = await getMenuTree();
  menuTree.value = res.data;
}

function handleSelectRole(row: RoleInfo | null) {
  if (row) {
    selectedRole.value = { ...row };
  }
}

function handleAdd() {
  isEdit.value = false;
  Object.assign(form, {
    id: 0,
    name: "",
    code: "",
    description: "",
    status: 1,
  });
  dialogVisible.value = true;
}

function handleEdit(row: RoleInfo) {
  isEdit.value = true;
  Object.assign(form, { ...row });
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateRole(form);
      ElMessage.success("更新成功");
    } else {
      await createRole(form);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    loadRoles();
  } finally {
    submitLoading.value = false;
  }
}

function handleDelete(row: RoleInfo) {
  ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      await deleteRole(row.id);
      ElMessage.success("删除成功");
      loadRoles();
    })
    .catch(() => {});
}

function handleSavePermission() {
  if (!selectedRole.value) return;
  const checkedKeys = treeRef.value?.getCheckedKeys() || [];
  selectedRole.value.menuIds = checkedKeys;
  ElMessage.success("权限保存成功（Mock）");
}

onMounted(() => {
  loadRoles();
  loadMenuTree();
});
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-placeholder {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
