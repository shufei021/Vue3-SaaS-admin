import axios from "axios";
import type { ApiResponse } from "@/types";
import { ElMessage } from "element-plus";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantId = localStorage.getItem("currentTenantId");
    if (tenantId) {
      config.headers["X-Tenant-Id"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    if (res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message || "请求失败"));
    }
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "网络错误";
    ElMessage.error(message);
    return Promise.reject(error);
  },
);

export default request;
