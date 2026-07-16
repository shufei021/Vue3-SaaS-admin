<template>
  <div class="pagination">
    <el-pagination v-model:page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const total = ref(0);
const pageSize = ref(10);

const handleCurrentChange = (val: number) => {
  console.log(`当前页: ${val}`);
};

const handleSizeChange = (val: number) => {
  console.log(`每页 ${val} 条`);
};
</script>

<style lang="scss" scoped>
.pagination {
  margin-top: 16px;
}
</style>
