// ============================================
// Global Type Definitions
// ============================================

// --- API Response ---
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageQuery {
  page: number;
  pageSize: number;
  [key: string]: any;
}

// --- User ---
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  status: 0 | 1;
  roleId: number;
  roleName: string;
  tenantId: number;
  tenantName: string;
  createTime: string;
  lastLoginTime: string;
}

export interface UserForm {
  id?: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: 0 | 1;
  roleId: number;
  password?: string;
}

// --- Role ---
export interface RoleInfo {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 0 | 1;
  menuIds: number[];
  dataScope: "all" | "dept" | "self";
  createTime: string;
  updateTime: string;
}

export interface MenuNode {
  id: number;
  parentId: number;
  name: string;
  path: string;
  icon: string;
  type: "menu" | "button" | "api";
  sort: number;
  children?: MenuNode[];
}

// --- Tenant ---
export interface TenantInfo {
  id: number;
  name: string;
  code: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "suspended" | "expired";
  maxUsers: number;
  currentUsers: number;
  storageUsed: number;
  storageLimit: number;
  expireTime: string;
  createTime: string;
}

// --- Log ---
export interface AuditLog {
  id: number;
  userId: number;
  username: string;
  module: string;
  action: string;
  method: string;
  url: string;
  params: string;
  result: "success" | "fail";
  ip: string;
  duration: number;
  createTime: string;
}

// --- Dashboard ---
export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  footer?: string;
  trend?: "up" | "down" | "flat";
}

export interface MonitorData {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  uptime: string;
  requests: number;
}

// --- Tag ---
export interface TagItem {
  title: string;
  name: string;
  path: string;
  closable: boolean;
  affix?: boolean;
}

// --- Menu / Route ---
export interface MenuItem {
  id: number;
  parentId: number;
  name: string;
  path: string;
  component?: string;
  icon: string;
  title: string;
  hidden: boolean;
  keepAlive: boolean;
  sort: number;
  children?: MenuItem[];
}
