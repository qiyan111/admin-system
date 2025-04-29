<template>
  <div class="work-order-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>工单管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateOrder">创建工单</el-button>
        <el-button @click="refreshOrders" :loading="loading.list">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="工单编号">
          <el-input v-model="filterForm.orderNumber" placeholder="请输入工单编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工单列表 -->
    <div class="order-list-container">
      <el-table
        :data="workOrders"
        border
        stripe
        :height="tableHeight"
        v-loading="loading.list"
        element-loading-text="正在加载工单数据..."
      >
        <el-table-column prop="id" label="工单编号" width="100"></el-table-column>
        <el-table-column prop="title" label="工单标题" min-width="200">
          <template #default="scope">
            <el-link type="primary" @click="viewOrderDetail(scope.row.id)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">{{ formatOrderType(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag 
              :type="getStatusTagType(scope.row.status)"
              class="status-tag clickable"
              @click="showStatusChangeDialog(scope.row)"
            >
              {{ formatOrderStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="ownerName" label="业主信息" width="150"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewOrderDetail(scope.row.id)">查看</el-button>
            <el-button size="small" type="primary" @click="handleUpdateOrder(scope.row)" :disabled="scope.row.status === 'completed' || scope.row.status === 'cancelled'">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteOrder(scope.row)" :disabled="scope.row.status === 'completed'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 工单详情对话框 -->
    <el-dialog
      v-model="dialogs.detail.visible"
      title="工单详情"
      width="70%"
      destroy-on-close
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工单编号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="工单状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">
              {{ formatOrderStatus(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工单标题" :span="2">{{ currentOrder.title }}</el-descriptions-item>
          <el-descriptions-item label="工单类型">
            <el-tag :type="getTypeTagType(currentOrder.type)">
              {{ formatOrderType(currentOrder.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(currentOrder.priority)">
              {{ formatPriority(currentOrder.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="业主姓名">{{ currentOrder.ownerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentOrder.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="工单描述" :span="2">
            <div class="order-description">{{ currentOrder.description }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 工单处理记录 -->
        <div class="order-history">
          <h3>处理记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in currentOrder.activities"
              :key="index"
              :timestamp="formatDate(activity.time)"
              :type="getActivityIconType(activity.type)"
              :color="getActivityColor(activity.type)"
            >
              <div class="activity-content">
                <span class="activity-type">{{ formatActivityType(activity.type) }}</span>
                <span class="activity-operator">{{ activity.operator }}</span>
                <div class="activity-remark">{{ activity.remark }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 添加处理记录 -->
        <div class="add-activity" v-if="currentOrder.status !== 'cancelled' && currentOrder.status !== 'completed'">
          <h3>添加处理记录</h3>
          <el-form :model="activityForm" label-width="100px">
            <el-form-item label="处理类型">
              <el-select v-model="activityForm.type">
                <el-option label="处理中" value="process"></el-option>
                <el-option label="转派" value="transfer"></el-option>
                <el-option label="完成" value="complete"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="处理说明">
              <el-input 
                v-model="activityForm.remark" 
                type="textarea" 
                :rows="3"
                placeholder="请输入处理说明"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitActivity" :loading="loading.activity">
                提交处理记录
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogs.detail.visible = false">关闭</el-button>
          <el-button type="primary" @click="handleUpdateOrder(currentOrder)" v-if="currentOrder && currentOrder.status !== 'completed' && currentOrder.status !== 'cancelled'">
            编辑工单
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 工单表单对话框 (新建/编辑) -->
    <el-dialog
      v-model="dialogs.form.visible"
      :title="dialogs.form.isEdit ? '编辑工单' : '新建工单'"
      width="60%"
      destroy-on-close
    >
      <el-form 
        ref="orderFormRef"
        :model="orderForm"
        :rules="orderFormRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="orderForm.title" placeholder="请输入工单标题"></el-input>
        </el-form-item>
        <el-form-item label="工单类型" prop="type">
          <el-select v-model="orderForm.type" placeholder="请选择工单类型">
            <el-option label="维修" value="repair"></el-option>
            <el-option label="投诉" value="complaint"></el-option>
            <el-option label="建议" value="suggestion"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="orderForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="高" value="high"></el-option>
            <el-option label="紧急" value="urgent"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业主姓名" prop="ownerName">
          <el-input v-model="orderForm.ownerName" placeholder="请输入业主姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="orderForm.contactPhone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="orderForm.address" placeholder="请输入详细地址"></el-input>
        </el-form-item>
        <el-form-item label="工单描述" prop="description">
          <el-input 
            v-model="orderForm.description" 
            type="textarea" 
            :rows="5"
            placeholder="请详细描述工单内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogs.form.visible = false">取消</el-button>
          <el-button type="primary" @click="submitOrderForm" :loading="loading.submit">
            {{ dialogs.form.isEdit ? '保存修改' : '创建工单' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 状态变更对话框 -->
    <el-dialog
      v-model="dialogs.status.visible"
      title="更改工单状态"
      width="30%"
    >
      <div v-if="dialogs.status.order">
        <p>当前工单: {{ dialogs.status.order.title }}</p>
        <p>当前状态: 
          <el-tag :type="getStatusTagType(dialogs.status.order.status)">
            {{ formatOrderStatus(dialogs.status.order.status) }}
          </el-tag>
        </p>
        <el-form :model="statusForm" label-width="100px" class="status-form">
          <el-form-item label="新状态">
            <el-select v-model="statusForm.status">
              <el-option 
                v-for="option in getAvailableStatusOptions(dialogs.status.order.status)"
                :key="option.value" 
                :label="option.label" 
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="变更原因">
            <el-input 
              v-model="statusForm.remark" 
              type="textarea" 
              :rows="3"
              placeholder="请输入状态变更原因"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogs.status.visible = false">取消</el-button>
          <el-button type="primary" @click="submitStatusChange" :loading="loading.status">
            确认变更
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import useWorkOrder from './workOrder.js'
import { Refresh } from '@element-plus/icons-vue'

export default {
  name: 'WorkOrder',
  components: {
    Refresh
  },
  setup() {
    return useWorkOrder()
  }
}
</script>

<style scoped>
.work-order-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.filter-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.order-list-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.status-tag.clickable {
  cursor: pointer;
}

.order-detail {
  padding: 10px;
}

.order-description {
  white-space: pre-line;
  line-height: 1.5;
}

.order-history {
  margin-top: 20px;
}

.activity-content {
  padding: 8px;
}

.activity-type {
  font-weight: bold;
  margin-right: 10px;
}

.activity-operator {
  color: #606266;
  font-size: 14px;
}

.activity-remark {
  margin-top: 10px;
  white-space: pre-line;
  line-height: 1.5;
  color: #606266;
}

.add-activity {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.status-form {
  margin-top: 20px;
}
</style> 