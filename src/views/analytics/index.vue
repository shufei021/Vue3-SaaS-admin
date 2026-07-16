<template>
  <div class="page-container analytics-page">
    <!-- Row 1: User Growth + API Calls -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :md="12">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">用户增长趋势</span>
            <el-tag size="small" type="info">近12个月</el-tag>
          </div>
          <div class="chart-body">
            <v-chart :option="userGrowthOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">API 调用统计</span>
            <el-tag size="small" type="info">近30天</el-tag>
          </div>
          <div class="chart-body">
            <v-chart :option="apiCallsOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Row 2: Module Usage + Response Time -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :md="12">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">模块使用占比</span>
          </div>
          <div class="chart-body">
            <v-chart :option="moduleUsageOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">接口响应时间</span>
            <el-tag size="small" type="info">近30天</el-tag>
          </div>
          <div class="chart-body">
            <v-chart :option="responseTimeOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Row 3: Error Distribution + Conversion Funnel -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :md="12">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">错误类型分布</span>
          </div>
          <div class="chart-body">
            <v-chart :option="errorDistOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">转化漏斗</span>
          </div>
          <div class="chart-body">
            <v-chart :option="funnelOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart, PieChart, FunnelChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { getAnalyticsData } from "@/api";

use([CanvasRenderer, LineChart, BarChart, PieChart, FunnelChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

const data = ref<any>(null);
const isDark = computed(() => document.documentElement.classList.contains("dark"));
const textColor = computed(() => (isDark.value ? "#a3a6ad" : "#606266"));
const axisLineColor = computed(() => (isDark.value ? "#4c4d4f" : "#dcdfe6"));
const splitLineColor = computed(() => (isDark.value ? "#333" : "#f0f0f0"));

const userGrowthOption = computed(() => {
  if (!data.value) return {};
  const d = data.value.userGrowth;
  return {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["新增用户", "活跃用户"],
      bottom: 0,
      textStyle: { color: textColor.value },
    },
    grid: { top: 10, right: 60, bottom: 40, left: 60 },
    xAxis: {
      type: "category",
      data: d.months,
      axisLabel: { color: textColor.value },
      axisLine: { lineStyle: { color: axisLineColor.value } },
    },
    yAxis: [
      {
        type: "value",
        name: "新增",
        axisLabel: { color: textColor.value },
        splitLine: { lineStyle: { color: splitLineColor.value } },
      },
      {
        type: "value",
        name: "活跃",
        axisLabel: { color: textColor.value },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "新增用户",
        type: "bar",
        data: d.newUsers,
        itemStyle: { color: "#409eff", borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 20,
      },
      {
        name: "活跃用户",
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        data: d.activeUsers,
        itemStyle: { color: "#67c23a" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(103,194,58,0.2)" },
              { offset: 1, color: "rgba(103,194,58,0.01)" },
            ],
          },
        },
      },
    ],
  };
});

const apiCallsOption = computed(() => {
  if (!data.value) return {};
  const d = data.value.apiCalls;
  return {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["成功", "失败"],
      bottom: 0,
      textStyle: { color: textColor.value },
    },
    grid: { top: 10, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: "category",
      data: d.dates,
      axisLabel: { color: textColor.value, interval: 4 },
      axisLine: { lineStyle: { color: axisLineColor.value } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: textColor.value },
      splitLine: { lineStyle: { color: splitLineColor.value } },
    },
    series: [
      {
        name: "成功",
        type: "line",
        smooth: true,
        data: d.success,
        itemStyle: { color: "#409eff" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.2)" },
              { offset: 1, color: "rgba(64,158,255,0.01)" },
            ],
          },
        },
      },
      {
        name: "失败",
        type: "line",
        smooth: true,
        data: d.fail,
        itemStyle: { color: "#f56c6c" },
      },
    ],
  };
});

const moduleUsageOption = computed(() => {
  if (!data.value) return {};
  return {
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: { color: textColor.value },
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "65%"],
        center: ["35%", "50%"],
        roseType: "radius",
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        data: data.value.moduleUsage,
      },
    ],
  };
});

const responseTimeOption = computed(() => {
  if (!data.value) return {};
  const d = data.value.responseTime;
  return {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => params.map((p: any) => `${p.marker} ${p.seriesName}: ${p.value}ms`).join("<br/>"),
    },
    legend: {
      data: ["平均响应", "P99"],
      bottom: 0,
      textStyle: { color: textColor.value },
    },
    grid: { top: 10, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: "category",
      data: d.dates,
      axisLabel: { color: textColor.value, interval: 4 },
      axisLine: { lineStyle: { color: axisLineColor.value } },
    },
    yAxis: {
      type: "value",
      name: "ms",
      axisLabel: { color: textColor.value },
      splitLine: { lineStyle: { color: splitLineColor.value } },
    },
    series: [
      {
        name: "平均响应",
        type: "line",
        smooth: true,
        data: d.avg,
        itemStyle: { color: "#e6a23c" },
      },
      {
        name: "P99",
        type: "line",
        smooth: true,
        data: d.p99,
        itemStyle: { color: "#f56c6c" },
        lineStyle: { type: "dashed" },
      },
    ],
  };
});

const errorDistOption = computed(() => {
  if (!data.value) return {};
  return {
    tooltip: { trigger: "item" },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: { color: textColor.value },
    },
    series: [
      {
        type: "pie",
        radius: "65%",
        center: ["35%", "50%"],
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 13 } },
        data: data.value.errorDistribution,
      },
    ],
  };
});

const funnelOption = computed(() => {
  if (!data.value) return {};
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c}" },
    series: [
      {
        type: "funnel",
        left: "10%",
        right: "10%",
        top: 20,
        bottom: 20,
        width: "80%",
        min: 0,
        max: 10000,
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
          formatter: "{b}\n{c}",
          fontSize: 12,
        },
        itemStyle: {
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 1,
        },
        data: data.value.conversionFunnel,
      },
    ],
  };
});

onMounted(async () => {
  const res = await getAnalyticsData();
  data.value = res.data;
});
</script>

<style lang="scss" scoped>
.analytics-page {
  .chart-row {
    margin-bottom: 16px;
  }
}
</style>
