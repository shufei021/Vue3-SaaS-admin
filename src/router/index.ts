import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { h } from "vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useTagStore } from "@/store";

NProgress.configure({ showSpinner: false });

const Layout = () => import("@/components/layout/AppLayout.vue");

const Redirect = {
  beforeRouteEnter(to: any, _from: any, next: any) {
    next((vm: any) => {
      const pathMatch = to.params.pathMatch;
      const target = `/${Array.isArray(pathMatch) ? pathMatch.join("/") : pathMatch || ""}`;
      vm.$router.replace({
        path: target,
        query: to.query,
        hash: to.hash,
      });
    });
  },
  render: () => h("div"),
};

const routes: RouteRecordRaw[] = [
  {
    path: "/redirect/:pathMatch(.*)*",
    name: "Redirect",
    component: Redirect,
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "仪表盘", icon: "Odometer", keepAlive: true },
      },
      {
        path: "user",
        name: "User",
        redirect: "/user/list",
        meta: { title: "用户管理", icon: "User" },
        children: [
          {
            path: "list",
            name: "UserList",
            component: () => import("@/views/user/index.vue"),
            meta: { title: "用户列表", keepAlive: true },
          },
        ],
      },
      {
        path: "role",
        name: "Role",
        redirect: "/role/list",
        meta: { title: "角色权限", icon: "UserFilled" },
        children: [
          {
            path: "list",
            name: "RoleList",
            component: () => import("@/views/role/index.vue"),
            meta: { title: "角色管理", keepAlive: true },
          },
        ],
      },
      {
        path: "tenant",
        name: "Tenant",
        redirect: "/tenant/list",
        meta: { title: "租户管理", icon: "OfficeBuilding" },
        children: [
          {
            path: "list",
            name: "TenantList",
            component: () => import("@/views/tenant/index.vue"),
            meta: { title: "租户列表", keepAlive: true },
          },
        ],
      },
      {
        path: "system",
        name: "System",
        component: () => import("@/views/system/index.vue"),
        meta: { title: "系统设置", icon: "Setting", keepAlive: true },
      },
      {
        path: "log",
        name: "Log",
        component: () => import("@/views/log/index.vue"),
        meta: { title: "操作日志", icon: "Document", keepAlive: true },
      },
      {
        path: "analytics",
        name: "Analytics",
        component: () => import("@/views/analytics/index.vue"),
        meta: { title: "数据看板", icon: "DataAnalysis", keepAlive: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  NProgress.start();
  const tagStore = useTagStore();
  if (to.meta.title) {
    tagStore.addTag({
      title: to.meta.title as string,
      name: to.name as string,
      path: to.path,
      closable: true,
    });
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
