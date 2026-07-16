// ============================================
// Utility Functions
// ============================================

/**
 * Format date string
 */
export function formatDate(date: string | Date, fmt = "YYYY-MM-DD HH:mm:ss"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const map: Record<string, number> = {
    YYYY: d.getFullYear(),
    MM: d.getMonth() + 1,
    DD: d.getDate(),
    HH: d.getHours(),
    mm: d.getMinutes(),
    ss: d.getSeconds(),
  };
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => {
    return String(map[match]).padStart(2, "0");
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + units[i];
}

/**
 * Format number with comma separator
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Generate random ID
 */
export function generateId(): number {
  return Math.floor(Math.random() * 100000);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 300): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Deep clone
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get status type for Element Plus tag
 */
export function getStatusType(status: string | number): "" | "success" | "warning" | "danger" | "info" {
  const map: Record<string, "" | "success" | "warning" | "danger" | "info"> = {
    active: "success",
    suspended: "danger",
    expired: "warning",
    success: "success",
    fail: "danger",
    1: "success",
    0: "danger",
  };
  return map[String(status)] || "info";
}

/**
 * Get status label
 */
export function getStatusLabel(status: string | number): string {
  const map: Record<string, string> = {
    active: "正常",
    suspended: "已停用",
    expired: "已过期",
    success: "成功",
    fail: "失败",
    1: "启用",
    0: "禁用",
  };
  return map[String(status)] || String(status);
}

/**
 * Get plan label
 */
export function getPlanLabel(plan: string): string {
  const map: Record<string, string> = {
    free: "免费版",
    basic: "基础版",
    pro: "专业版",
    enterprise: "企业版",
  };
  return map[plan] || plan;
}

/**
 * Get plan color
 */
export function getPlanColor(plan: string): string {
  const map: Record<string, string> = {
    free: "#909399",
    basic: "#409eff",
    pro: "#e6a23c",
    enterprise: "#67c23a",
  };
  return map[plan] || "#909399";
}
