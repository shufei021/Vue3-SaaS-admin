// ============================================
// API Modules - Mock implementations
// ============================================
import type { ApiResponse, PageResult, PageQuery, UserInfo, UserForm, RoleInfo, MenuNode, TenantInfo, AuditLog, StatCard, MonitorData } from "@/types";
import { mockUsers, mockRoles, mockMenuTree, mockTenants, mockAuditLogs, mockStatCards, mockMonitorData, mockRevenueTrend, mockTenantDistribution, mockTodos, mockAnalyticsData } from "./mock";

// Simulate async delay
function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function success<T>(data: T): ApiResponse<T> {
  return { code: 0, message: "ok", data };
}

// --- Dashboard ---
export async function getDashboardStats(): Promise<ApiResponse<StatCard[]>> {
  await delay();
  return success(mockStatCards);
}

export async function getMonitorData(): Promise<ApiResponse<MonitorData>> {
  await delay();
  return success(mockMonitorData);
}

export async function getRevenueTrend(): Promise<ApiResponse<typeof mockRevenueTrend>> {
  await delay();
  return success(mockRevenueTrend);
}

export async function getTenantDistribution(): Promise<ApiResponse<typeof mockTenantDistribution>> {
  await delay();
  return success(mockTenantDistribution);
}

export async function getTodos(): Promise<ApiResponse<typeof mockTodos>> {
  await delay();
  return success([...mockTodos]);
}

// --- Users ---
export async function getUserList(query: PageQuery): Promise<ApiResponse<PageResult<UserInfo>>> {
  await delay();
  let list = [...mockUsers];
  if (query.keyword) {
    const kw = String(query.keyword).toLowerCase();
    list = list.filter((u) => u.username.toLowerCase().includes(kw) || u.nickname.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw));
  }
  if (query.status !== undefined && query.status !== "") {
    list = list.filter((u) => u.status === Number(query.status));
  }
  if (query.roleId) {
    list = list.filter((u) => u.roleId === Number(query.roleId));
  }
  const total = list.length;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const start = (page - 1) * pageSize;
  list = list.slice(start, start + pageSize);
  return success({ list, total, page, pageSize });
}

export async function createUser(data: UserForm): Promise<ApiResponse<null>> {
  await delay();
  console.log("Create user:", data);
  return success(null);
}

export async function updateUser(data: UserForm): Promise<ApiResponse<null>> {
  await delay();
  console.log("Update user:", data);
  return success(null);
}

export async function deleteUser(ids: number[]): Promise<ApiResponse<null>> {
  await delay();
  console.log("Delete users:", ids);
  return success(null);
}

// --- Roles ---
export async function getRoleList(): Promise<ApiResponse<RoleInfo[]>> {
  await delay();
  return success([...mockRoles]);
}

export async function createRole(data: Partial<RoleInfo>): Promise<ApiResponse<null>> {
  await delay();
  console.log("Create role:", data);
  return success(null);
}

export async function updateRole(data: Partial<RoleInfo>): Promise<ApiResponse<null>> {
  await delay();
  console.log("Update role:", data);
  return success(null);
}

export async function deleteRole(id: number): Promise<ApiResponse<null>> {
  await delay();
  console.log("Delete role:", id);
  return success(null);
}

export async function getMenuTree(): Promise<ApiResponse<MenuNode[]>> {
  await delay();
  return success(JSON.parse(JSON.stringify(mockMenuTree)));
}

// --- Tenants ---
export async function getTenantList(query?: PageQuery): Promise<ApiResponse<PageResult<TenantInfo>>> {
  await delay();
  let list = [...mockTenants];
  if (query?.keyword) {
    const kw = String(query.keyword).toLowerCase();
    list = list.filter((t) => t.name.toLowerCase().includes(kw) || t.code.toLowerCase().includes(kw) || t.contactName.toLowerCase().includes(kw));
  }
  if (query?.status) {
    list = list.filter((t) => t.status === query.status);
  }
  const total = list.length;
  const page = Number(query?.page) || 1;
  const pageSize = Number(query?.pageSize) || 10;
  const start = (page - 1) * pageSize;
  list = list.slice(start, start + pageSize);
  return success({ list, total, page, pageSize });
}

export async function updateTenantStatus(id: number, status: string): Promise<ApiResponse<null>> {
  await delay();
  console.log("Update tenant status:", id, status);
  return success(null);
}

// --- Audit Logs ---
export async function getAuditLogs(query: PageQuery): Promise<ApiResponse<PageResult<AuditLog>>> {
  await delay();
  let list = [...mockAuditLogs];
  if (query.module) {
    list = list.filter((l) => l.module === query.module);
  }
  if (query.result) {
    list = list.filter((l) => l.result === query.result);
  }
  if (query.keyword) {
    const kw = String(query.keyword).toLowerCase();
    list = list.filter((l) => l.username.toLowerCase().includes(kw) || l.action.toLowerCase().includes(kw) || l.module.toLowerCase().includes(kw));
  }
  if (query.dateRange && Array.isArray(query.dateRange) && query.dateRange.length === 2) {
    const start = new Date(query.dateRange[0]).getTime();
    const end = new Date(query.dateRange[1]).getTime();
    list = list.filter((l) => {
      const t = new Date(l.createTime).getTime();
      return t >= start && t <= end;
    });
  }
  const total = list.length;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const startIdx = (page - 1) * pageSize;
  list = list.slice(startIdx, startIdx + pageSize);
  return success({ list, total, page, pageSize });
}

// --- Analytics ---
export async function getAnalyticsData(): Promise<ApiResponse<typeof mockAnalyticsData>> {
  await delay();
  return success(JSON.parse(JSON.stringify(mockAnalyticsData)));
}
