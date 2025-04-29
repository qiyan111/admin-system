<template>
  <div class="parking container">
    <h1>停车管理</h1>
    <div class="card">
      <div class="card-header">停车位列表</div>
      <div class="card-body">
        <p>停车管理功能正在开发中...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Parking',
  data() {
    return {
      parkingSpots: []
    }
  },
  mounted() {
    // 这里可以添加获取停车位数据的逻辑
  },
  methods: {
    // 停车管理相关方法
  }
}
</script>

<style scoped>
.parking {
  padding: 20px;
}
</style> 