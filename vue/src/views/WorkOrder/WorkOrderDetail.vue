<template>
  <div class="work-order-detail-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="el-icon-arrow-left">返回</el-button>
        <h1>工单详情</h1>
      </div>
      <div class="header-actions" v-if="workOrder">
        <el-button 
          type="primary" 
          @click="handleUpdateOrder" 
          :disabled="workOrder.status === 'completed' || workOrder.status === 'cancelled'"
        >
          编辑工单
        </el-button>
        <el-button 
          @click="handlePrintOrder"
        >
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" animated>
        <template #template>
          <el-skeleton-item variant="text" style="width: 50%" />
          <el-skeleton-item variant="text" style="width: 100%; margin-top: 10px;" />
          <el-skeleton-item variant="text" style="width: 100%; margin-top: 10px;" />
          <el-skeleton-item variant="text" style="width: 60%; margin-top: 10px;" />
        </template>
      </el-skeleton>
    </div>

    <!-- 工单内容 -->
    <template v-else-if="workOrder">
      <div class="main-content">
        <!-- 工单基本信息 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <h2>基本信息</h2>
              <el-tag :type="getStatusTagType(workOrder.status)" size="large">
                {{ formatOrderStatus(workOrder.status) }}
              </el-tag>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="工单编号">{{ workOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="工单标题">{{ workOrder.title }}</el-descriptions-item>
            <el-descriptions-item label="工单类型">
              <el-tag :type="getTypeTagType(workOrder.type)">
                {{ formatOrderType(workOrder.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityTagType(workOrder.priority)">
                {{ formatPriority(workOrder.priority) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(workOrder.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(workOrder.updateTime) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 业主信息 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <h2>业主信息</h2>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="业主姓名">{{ workOrder.ownerName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ workOrder.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ workOrder.address }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 工单详情 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <h2>工单详情</h2>
            </div>
          </template>
          
          <div class="order-description">{{ workOrder.description }}</div>
        </el-card>

        <!-- 工单处理记录 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <h2>处理记录</h2>
              <el-button 
                v-if="workOrder.status !== 'completed' && workOrder.status !== 'cancelled'"
                type="primary" 
                size="small" 
                @click="showAddActivityDialog"
              >
                添加处理记录
              </el-button>
            </div>
          </template>
          
          <div v-if="workOrder.activities && workOrder.activities.length > 0" class="activity-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in workOrder.activities"
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
          <div v-else class="no-activity">
            暂无处理记录
          </div>
        </el-card>

        <!-- 相关资料 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <h2>相关资料</h2>
              <el-button 
                v-if="workOrder.status !== 'completed' && workOrder.status !== 'cancelled'"
                type="primary" 
                size="small" 
                @click="uploadAttachment"
              >
                上传附件
              </el-button>
            </div>
          </template>
          
          <div v-if="workOrder.attachments && workOrder.attachments.length > 0" class="attachments">
            <el-table :data="workOrder.attachments" style="width: 100%">
              <el-table-column prop="name" label="文件名" min-width="180" />
              <el-table-column prop="size" label="大小" width="100">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.uploadTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="uploader" label="上传人" width="120" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button type="text" size="small" @click="downloadAttachment(scope.row)">
                    下载
                  </el-button>
                  <el-button 
                    v-if="workOrder.status !== 'completed' && workOrder.status !== 'cancelled'"
                    type="text" 
                    size="small" 
                    @click="deleteAttachment(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-else class="no-attachments">
            暂无附件
          </div>
        </el-card>
      </div>

      <!-- 底部固定按钮 -->
      <div class="fixed-bottom">
        <el-button @click="goBack">返回</el-button>
        <el-button 
          type="primary" 
          @click="showStatusChangeDialog" 
          :disabled="workOrder.status === 'completed' || workOrder.status === 'cancelled'"
        >
          变更状态
        </el-button>
      </div>
    </template>

    <!-- 无数据状态 -->
    <div v-else class="no-data">
      <el-empty description="未找到工单数据" />
      <el-button type="primary" @click="goBack">返回工单列表</el-button>
    </div>

    <!-- 添加处理记录对话框 -->
    <el-dialog
      v-model="dialogs.activity.visible"
      title="添加处理记录"
      width="40%"
    >
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
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogs.activity.visible = false">取消</el-button>
          <el-button type="primary" @click="submitActivity" :loading="submitting.activity">
            提交处理记录
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
      <div v-if="workOrder">
        <p>当前状态: 
          <el-tag :type="getStatusTagType(workOrder.status)">
            {{ formatOrderStatus(workOrder.status) }}
          </el-tag>
        </p>
        <el-form :model="statusForm" label-width="100px" class="status-form">
          <el-form-item label="新状态">
            <el-select v-model="statusForm.status">
              <el-option 
                v-for="option in getAvailableStatusOptions(workOrder.status)"
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
          <el-button type="primary" @click="submitStatusChange" :loading="submitting.status">
            确认变更
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传附件对话框 -->
    <el-dialog
      v-model="dialogs.upload.visible"
      title="上传附件"
      width="40%"
    >
      <el-upload
        v-model:file-list="uploadFileList"
        :http-request="customUploadRequest"
        multiple
        :limit="5"
        :on-exceed="handleExceed"
        action="#"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件至此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            文件大小不超过10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogs.upload.visible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="submitting.upload">
            开始上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Printer, UploadFilled } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/formatter'
import { formatFileSize } from '@/utils/formatter'

export default {
  name: 'WorkOrderDetail',
  components: {
    Printer,
    UploadFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 工单数据
    const workOrder = ref(null)
    const loading = ref(true)
    
    // 表单提交状态
    const submitting = reactive({
      activity: false,
      status: false,
      upload: false
    })
    
    // 对话框状态
    const dialogs = reactive({
      activity: {
        visible: false
      },
      status: {
        visible: false
      },
      upload: {
        visible: false
      }
    })
    
    // 活动记录表单
    const activityForm = reactive({
      type: 'process',
      remark: ''
    })
    
    // 状态变更表单
    const statusForm = reactive({
      status: '',
      remark: ''
    })
    
    // 上传文件列表
    const uploadFileList = ref([])
    
    // 获取工单状态对应的类型
    const getStatusTagType = (status) => {
      const statusMap = {
        'pending': 'info',
        'processing': 'warning',
        'completed': 'success',
        'cancelled': 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取工单类型对应的类型
    const getTypeTagType = (type) => {
      const typeMap = {
        'repair': 'danger',
        'complaint': 'warning',
        'suggestion': 'info',
        'other': ''
      }
      return typeMap[type] || ''
    }
    
    // 获取优先级对应的类型
    const getPriorityTagType = (priority) => {
      const priorityMap = {
        'low': 'info',
        'medium': '',
        'high': 'warning',
        'urgent': 'danger'
      }
      return priorityMap[priority] || ''
    }
    
    // 格式化工单状态
    const formatOrderStatus = (status) => {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    }
    
    // 格式化工单类型
    const formatOrderType = (type) => {
      const typeMap = {
        'repair': '维修',
        'complaint': '投诉',
        'suggestion': '建议',
        'other': '其他'
      }
      return typeMap[type] || type
    }
    
    // 格式化优先级
    const formatPriority = (priority) => {
      const priorityMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'urgent': '紧急'
      }
      return priorityMap[priority] || priority
    }
    
    // 格式化活动类型
    const formatActivityType = (type) => {
      const typeMap = {
        'create': '创建工单',
        'process': '处理工单',
        'transfer': '转派工单',
        'complete': '完成工单',
        'cancel': '取消工单',
        'update': '更新工单'
      }
      return typeMap[type] || type
    }
    
    // 获取活动图标类型
    const getActivityIconType = (type) => {
      const typeMap = {
        'create': 'primary',
        'process': 'warning',
        'transfer': 'info',
        'complete': 'success',
        'cancel': 'danger',
        'update': 'info'
      }
      return typeMap[type] || 'info'
    }
    
    // 获取活动颜色
    const getActivityColor = (type) => {
      const colorMap = {
        'create': '#409EFF',
        'process': '#E6A23C',
        'transfer': '#909399',
        'complete': '#67C23A',
        'cancel': '#F56C6C',
        'update': '#909399'
      }
      return colorMap[type] || '#909399'
    }
    
    // 获取可用的状态选项
    const getAvailableStatusOptions = (currentStatus) => {
      const allOptions = [
        { label: '待处理', value: 'pending' },
        { label: '处理中', value: 'processing' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' }
      ]
      
      // 根据当前状态过滤可用选项
      return allOptions.filter(option => {
        // 已完成和已取消状态不能再变更
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
          return false
        }
        
        // 过滤掉当前状态
        if (option.value === currentStatus) {
          return false
        }
        
        return true
      })
    }
    
    // 获取工单详情
    const fetchWorkOrderDetail = async () => {
      loading.value = true
      try {
        const orderId = route.params.id
        
        // 调用API获取工单详情
        const response = await fetch(`/api/work-orders/${orderId}`)
        
        if (!response.ok) {
          throw new Error('获取工单详情失败')
        }
        
        const data = await response.json()
        workOrder.value = data
      } catch (error) {
        ElMessage.error(error.message || '获取工单详情失败')
        console.error('获取工单详情错误:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 返回工单列表
    const goBack = () => {
      router.push('/work-orders')
    }
    
    // 编辑工单
    const handleUpdateOrder = () => {
      router.push(`/work-orders/edit/${workOrder.value.id}`)
    }
    
    // 打印工单
    const handlePrintOrder = () => {
      window.print()
    }
    
    // 显示添加处理记录对话框
    const showAddActivityDialog = () => {
      activityForm.type = 'process'
      activityForm.remark = ''
      dialogs.activity.visible = true
    }
    
    // 提交处理记录
    const submitActivity = async () => {
      // 表单验证
      if (!activityForm.type) {
        ElMessage.warning('请选择处理类型')
        return
      }
      
      if (!activityForm.remark) {
        ElMessage.warning('请填写处理说明')
        return
      }
      
      submitting.activity = true
      try {
        const orderId = workOrder.value.id
        
        // 调用API添加处理记录
        const response = await fetch(`/api/work-orders/${orderId}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityForm)
        })
        
        if (!response.ok) {
          throw new Error('添加处理记录失败')
        }
        
        ElMessage.success('处理记录添加成功')
        
        // 关闭对话框并刷新数据
        dialogs.activity.visible = false
        fetchWorkOrderDetail()
      } catch (error) {
        ElMessage.error(error.message || '添加处理记录失败')
        console.error('添加处理记录错误:', error)
      } finally {
        submitting.activity = false
      }
    }
    
    // 显示状态变更对话框
    const showStatusChangeDialog = () => {
      statusForm.status = ''
      statusForm.remark = ''
      dialogs.status.visible = true
    }
    
    // 提交状态变更
    const submitStatusChange = async () => {
      // 表单验证
      if (!statusForm.status) {
        ElMessage.warning('请选择新状态')
        return
      }
      
      if (!statusForm.remark) {
        ElMessage.warning('请填写变更原因')
        return
      }
      
      submitting.status = true
      try {
        const orderId = workOrder.value.id
        
        // 调用API更新工单状态
        const response = await fetch(`/api/work-orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statusForm)
        })
        
        if (!response.ok) {
          throw new Error('更新工单状态失败')
        }
        
        ElMessage.success('工单状态更新成功')
        
        // 关闭对话框并刷新数据
        dialogs.status.visible = false
        fetchWorkOrderDetail()
      } catch (error) {
        ElMessage.error(error.message || '更新工单状态失败')
        console.error('更新工单状态错误:', error)
      } finally {
        submitting.status = false
      }
    }
    
    // 上传附件
    const uploadAttachment = () => {
      uploadFileList.value = []
      dialogs.upload.visible = true
    }
    
    // 处理超出上传限制
    const handleExceed = () => {
      ElMessage.warning('最多只能上传5个文件')
    }
    
    // 自定义上传请求
    const customUploadRequest = (options) => {
      console.log('准备上传文件:', options.file)
      // 在实际提交时处理
    }
    
    // 提交上传
    const submitUpload = async () => {
      if (uploadFileList.value.length === 0) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      
      submitting.upload = true
      try {
        const orderId = workOrder.value.id
        const formData = new FormData()
        
        // 添加所有文件到表单
        uploadFileList.value.forEach(file => {
          formData.append('files', file.raw)
        })
        
        // 调用API上传附件
        const response = await fetch(`/api/work-orders/${orderId}/attachments`, {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('上传附件失败')
        }
        
        ElMessage.success('附件上传成功')
        
        // 关闭对话框并刷新数据
        dialogs.upload.visible = false
        fetchWorkOrderDetail()
      } catch (error) {
        ElMessage.error(error.message || '上传附件失败')
        console.error('上传附件错误:', error)
      } finally {
        submitting.upload = false
      }
    }
    
    // 下载附件
    const downloadAttachment = (attachment) => {
      window.open(`/api/work-orders/attachments/${attachment.id}`, '_blank')
    }
    
    // 删除附件
    const deleteAttachment = (attachment) => {
      ElMessageBox.confirm(
        `确定要删除附件 "${attachment.name}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          // 调用API删除附件
          const response = await fetch(`/api/work-orders/attachments/${attachment.id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            throw new Error('删除附件失败')
          }
          
          ElMessage.success('附件删除成功')
          
          // 刷新数据
          fetchWorkOrderDetail()
        } catch (error) {
          ElMessage.error(error.message || '删除附件失败')
          console.error('删除附件错误:', error)
        }
      }).catch(() => {
        // 用户取消操作
      })
    }
    
    // 生命周期钩子
    onMounted(() => {
      fetchWorkOrderDetail()
    })
    
    return {
      workOrder,
      loading,
      submitting,
      dialogs,
      activityForm,
      statusForm,
      uploadFileList,
      getStatusTagType,
      getTypeTagType,
      getPriorityTagType,
      formatOrderStatus,
      formatOrderType,
      formatPriority,
      formatActivityType,
      getActivityIconType,
      getActivityColor,
      getAvailableStatusOptions,
      formatDate,
      formatFileSize,
      goBack,
      handleUpdateOrder,
      handlePrintOrder,
      showAddActivityDialog,
      submitActivity,
      showStatusChangeDialog,
      submitStatusChange,
      uploadAttachment,
      handleExceed,
      customUploadRequest,
      submitUpload,
      downloadAttachment,
      deleteAttachment
    }
  }
}
</script>

<style scoped>
.work-order-detail-container {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.main-content {
  margin-bottom: 70px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.order-description {
  white-space: pre-line;
  line-height: 1.6;
  color: #606266;
  padding: 10px;
}

.activity-timeline {
  padding: 10px;
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

.no-activity,
.no-attachments {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}

.attachments {
  padding: 10px;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  z-index: 100;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 20px;
}

/* 打印样式 */
@media print {
  .page-header,
  .fixed-bottom,
  .activity-timeline .el-button,
  .attachments .el-button {
    display: none !important;
  }
  
  .main-content {
    margin-bottom: 0;
  }
  
  .work-order-detail-container {
    padding: 0;
    background-color: #fff;
  }
  
  .info-card {
    box-shadow: none !important;
    border: 1px solid #ebeef5;
  }
}
</style> 