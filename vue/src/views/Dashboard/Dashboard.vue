<template>
  <div class="dashboard-container">
    <h2 class="page-title">首页</h2>
    
    <!-- 业务概览部分 -->
    <div class="dashboard-overview">
      <div class="overview-card">
        <h3>待处理工单</h3>
        <div class="overview-value">{{ dashboardData.pendingOrders }}</div>
      </div>
      <div class="overview-card">
        <h3>业主总数</h3>
        <div class="overview-value">{{ dashboardData.totalOwners }}</div>
      </div>
      <div class="overview-card">
        <h3>访客数量</h3>
        <div class="overview-value">{{ dashboardData.visitorCount }}</div>
      </div>
      <div class="overview-card">
        <h3>剩余车位</h3>
        <div class="overview-value">{{ dashboardData.availableParkingSpots }}</div>
      </div>
    </div>
    
    <!-- 工单统计图表 -->
    <div class="chart-container">
      <div class="chart-card">
        <h3>工单处理情况</h3>
        <div class="chart-area" ref="workOrderChart"></div>
      </div>
      <div class="chart-card">
        <h3>各类工单占比</h3>
        <div class="chart-area" ref="workOrderTypeChart"></div>
      </div>
    </div>
    
    <!-- 访客记录 -->
    <div class="visitor-record">
      <h3>最近访客记录</h3>
      <table class="visitor-table">
        <thead>
          <tr>
            <th>访客姓名</th>
            <th>被访人</th>
            <th>访问原因</th>
            <th>访问时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(visitor, index) in recentVisitors" :key="index">
            <td>{{ visitor.name }}</td>
            <td>{{ visitor.targetPerson }}</td>
            <td>{{ visitor.reason }}</td>
            <td>{{ visitor.visitTime }}</td>
            <td>
              <span :class="'status-badge status-' + visitor.status">
                {{ getStatusText(visitor.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Dashboard from './dashboard.js';
export default Dashboard;
</script>

<style src="./dashboard.css"></style> 