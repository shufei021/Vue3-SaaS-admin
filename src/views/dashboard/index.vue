<template>
  <div class="page-container dashboard-page">
    <!-- Stat Cards -->
    <el-row :gutter="16" class="stat-row">
      <el-col
        v-for="(stat, idx) in statCards"
        :key="idx"
        :xs="12"
        :sm="12"
        :md="6"
      >
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="26"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-footer">
              <span :class="`trend-${stat.trend}`">
                {{
                  stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"
                }}
              </span>
              {{ stat.footer }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :md="16">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">营收趋势</span>
            <el-radio-group v-model="revenuePeriod" size="small">
              <el-radio-button value="month">月度</el-radio-button>
              <el-radio-button value="week">周度</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-body">
            <v-chart :option="revenueOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">租户分布</span>
          </div>
          <div class="chart-body">
            <v-chart :option="tenantOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Bottom Row -->
    <el-row :gutter="16" class="bottom-row">
      <!-- Todos -->
      <el-col :xs="24" :md="8">
        <div class="card-base todo-card">
          <div class="card-section-header">
            <span>待办事项</span>
            <el-tag size="small" type="info"
              >{{ todos.filter((t) => !t.done).length }} 待处理</el-tag
            >
          </div>
          <div class="todo-list">
            <div
              v-for="todo in todos"
              :key="todo.id"
              class="todo-item"
              :class="{ done: todo.done }"
            >
              <el-checkbox v-model="todo.done" />
              <span class="todo-title">{{ todo.title }}</span>
              <el-tag
                size="small"
                :type="
                  todo.priority === 'high'
                    ? 'danger'
                    : todo.priority === 'medium'
                      ? 'warning'
                      : 'info'
                "
              >
                {{
                  todo.priority === "high"
                    ? "高"
                    : todo.priority === "medium"
                      ? "中"
                      : "低"
                }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <!-- System Monitor -->
      <el-col :xs="24" :md="16">
        <div class="card-base monitor-card">
          <div class="card-section-header">
            <span>系统监控</span>
            <span class="monitor-uptime"
              >运行时间: {{ monitorData.uptime }}</span
            >
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="monitor-item">
                <div class="monitor-label">CPU 使用率</div>
                <el-progress
                  type="dashboard"
                  :percentage="monitorData.cpu"
                  :color="getProgressColor(monitorData.cpu)"
                  :width="100"
                />
              </div>
            </el-col>
            <el-col :span="8">
              <div class="monitor-item">
                <div class="monitor-label">内存使用率</div>
                <el-progress
                  type="dashboard"
                  :percentage="monitorData.memory"
                  :color="getProgressColor(monitorData.memory)"
                  :width="100"
                />
              </div>
            </el-col>
            <el-col :span="8">
              <div class="monitor-item">
                <div class="monitor-label">磁盘使用率</div>
                <el-progress
                  type="dashboard"
                  :percentage="monitorData.disk"
                  :color="getProgressColor(monitorData.disk)"
                  :width="100"
                />
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="16" class="monitor-stats">
            <el-col :span="8">
              <div class="monitor-stat">
                <span class="stat-label">网络上传</span>
                <span class="stat-val"
                  >{{ monitorData.network.upload }} MB/s</span
                >
              </div>
            </el-col>
            <el-col :span="8">
              <div class="monitor-stat">
                <span class="stat-label">网络下载</span>
                <span class="stat-val"
                  >{{ monitorData.network.download }} MB/s</span
                >
              </div>
            </el-col>
            <el-col :span="8">
              <div class="monitor-stat">
                <span class="stat-label">总请求数</span>
                <span class="stat-val">{{
                  formatNumber(monitorData.requests)
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import {
  getDashboardStats,
  getMonitorData,
  getRevenueTrend,
  getTenantDistribution,
  getTodos,
} from "@/api";
import { formatNumber } from "@/utils";
import type { StatCard, MonitorData } from "@/types";

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const statCards = ref<StatCard[]>([]);
const monitorData = ref<MonitorData>({
  cpu: 0,
  memory: 0,
  disk: 0,
  network: { upload: 0, download: 0 },
  uptime: "",
  requests: 0,
});
const revenuePeriod = ref("month");
const revenueData = ref({
  months: [] as string[],
  revenue: [] as number[],
  orders: [] as number[],
});
const tenantDist = ref<{ name: string; value: number }[]>([]);
const todos = ref<
  {
    id: number;
    title: string;
    done: boolean;
    priority: "high" | "medium" | "low";
  }[]
>([]);

const isDark = computed(() =>
  document.documentElement.classList.contains("dark"),
);
const textColor = computed(() => (isDark.value ? "#a3a6ad" : "#606266"));

const revenueOption = computed(() => ({
  tooltip: { trigger: "axis" },
  legend: {
    data: ["营收", "订单数"],
    bottom: 0,
    textStyle: { color: textColor.value },
  },
  grid: { top: 10, right: 60, bottom: 40, left: 60 },
  xAxis: {
    type: "category",
    data: revenueData.value.months,
    axisLabel: { color: textColor.value },
    axisLine: { lineStyle: { color: isDark.value ? "#4c4d4f" : "#dcdfe6" } },
  },
  yAxis: [
    {
      type: "value",
      name: "营收(¥)",
      axisLabel: { color: textColor.value },
      splitLine: { lineStyle: { color: isDark.value ? "#333" : "#f0f0f0" } },
    },
    {
      type: "value",
      name: "订单",
      axisLabel: { color: textColor.value },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: "营收",
      type: "line",
      smooth: true,
      data: revenueData.value.revenue,
      itemStyle: { color: "#409eff" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(64,158,255,0.25)" },
            { offset: 1, color: "rgba(64,158,255,0.02)" },
          ],
        },
      },
    },
    {
      name: "订单数",
      type: "line",
      smooth: true,
      yAxisIndex: 1,
      data: revenueData.value.orders,
      itemStyle: { color: "#67c23a" },
    },
  ],
}));

const tenantOption = computed(() => ({
  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
  legend: {
    orient: "vertical",
    right: 10,
    top: "center",
    textStyle: { color: textColor.value },
  },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      center: ["35%", "50%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: isDark.value ? "#1d1e1f" : "#fff",
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
      data: tenantDist.value,
    },
  ],
}));

function getProgressColor(val: number) {
  if (val < 50) return "#67c23a";
  if (val < 80) return "#e6a23c";
  return "#f56c6c";
}

onMounted(async () => {
  const [statsRes, monitorRes, revenueRes, tenantRes, todosRes] =
    await Promise.all([
      getDashboardStats(),
      getMonitorData(),
      getRevenueTrend(),
      getTenantDistribution(),
      getTodos(),
    ]);
  statCards.value = statsRes.data;
  monitorData.value = monitorRes.data;
  revenueData.value = revenueRes.data;
  tenantDist.value = tenantRes.data;
  todos.value = todosRes.data;
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  .stat-row {
    margin-bottom: 16px;
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .bottom-row {
    margin-bottom: 16px;
  }
}

.card-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.todo-list {
  .todo-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
    }

    &.done {
      .todo-title {
        text-decoration: line-through;
        color: var(--text-secondary);
      }
    }

    .todo-title {
      flex: 1;
      font-size: 13px;
      color: var(--text-regular);
    }
  }
}

.monitor-card {
  .monitor-uptime {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .monitor-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .monitor-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
  }

  .monitor-stats {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);

    .monitor-stat {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }

      .stat-val {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-flat {
  color: #909399;
}
</style>
