<template>
  <div class="door-monitor-container">
    <div class="page-header">
      <h1>门禁监控</h1>
      <div class="page-actions">
        <el-button type="primary" @click="fetchDoorStatus" :loading="loading.doorStatus">
          <i class="el-icon-refresh"></i> 刷新状态
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 门禁状态卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="door-status-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>门禁状态</span>
              <el-tag :type="doorStatus.status === '开启' ? 'success' : 'info'" size="medium" effect="dark">
                {{ doorStatus.status }}
              </el-tag>
            </div>
          </template>
          <div class="door-status-content">
            <p>最后更新: {{ doorStatus.lastUpdated ? formatTime(doorStatus.lastUpdated) : '未知' }}</p>
            
            <div class="door-controls">
              <el-button type="success" @click="controlDoor('open')" :loading="loading.doorStatus" :disabled="doorStatus.status === '开启'">
                开门
              </el-button>
              <el-button type="danger" @click="controlDoor('close')" :loading="loading.doorStatus" :disabled="doorStatus.status === '关闭'">
                关门
              </el-button>
            </div>
            
            <el-alert v-if="error.doorStatus" :title="error.doorStatus" type="error" show-icon />
          </div>
        </el-card>
      </el-col>
      
      <!-- 摄像头预览卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="16">
        <el-card class="camera-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>门禁摄像头</span>
              <div>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="cameraData.isPlaying ? stopCameraStream() : fetchCameraData()" 
                  :loading="loading.camera"
                >
                  {{ cameraData.isPlaying ? '停止' : '启动' }}摄像头
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="takeSnapshot()" 
                  :disabled="!cameraData.isPlaying"
                >
                  拍照记录
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="camera-content">
            <div v-if="cameraData.isPlaying" class="video-container">
              <video ref="cameraVideo" autoplay playsinline></video>
            </div>
            <div v-else-if="cameraData.snapshot" class="snapshot-container">
              <img :src="cameraData.snapshot" alt="门禁监控快照" />
            </div>
            <div v-else class="camera-placeholder">
              <i class="el-icon-video-camera"></i>
              <p>点击启动摄像头查看实时画面</p>
            </div>
            
            <el-alert v-if="error.camera" :title="error.camera" type="error" show-icon />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问记录表格 -->
    <el-card class="access-records-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>门禁访问记录</span>
          <el-button type="primary" size="small" @click="fetchAccessRecords" :loading="loading.records">
            刷新记录
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="accessRecords"
        border
        stripe
        style="width: 100%"
        v-loading="loading.records"
      >
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="personName" label="人员" min-width="100" />
        <el-table-column prop="personType" label="类型" width="100">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.personType === '业主' ? 'success' : 'warning'">
              {{ scope.row.personType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accessTime" label="访问时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.accessTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="accessType" label="访问类型" width="120">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.accessType === '进入' ? 'success' : 'info'">
              {{ scope.row.accessType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accessMethod" label="访问方式" width="120" />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="scope">
            <el-tag 
              size="small" 
              :type="scope.row.result === '成功' ? 'success' : (scope.row.result === '失败' ? 'danger' : 'warning')"
            >
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="viewRecordDetail(scope.row.id)">
              查看详情
            </el-button>
            <el-button v-if="scope.row.hasImage" type="text" size="small" @click="viewRecordImage(scope.row.id)">
              查看照片
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="handlePageChange"
        />
      </div>
      
      <el-alert v-if="error.records" :title="error.records" type="error" show-icon />
    </el-card>
    
    <!-- 记录详情对话框 -->
    <el-dialog
      title="访问记录详情"
      :visible.sync="recordDetailVisible"
      width="40%"
      :before-close="closeRecordDetail"
    >
      <div v-if="currentRecord" class="record-detail">
        <div class="detail-item">
          <span class="label">人员:</span>
          <span class="value">{{ currentRecord.personName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">类型:</span>
          <span class="value">{{ currentRecord.personType }}</span>
        </div>
        <div class="detail-item">
          <span class="label">访问时间:</span>
          <span class="value">{{ formatTime(currentRecord.accessTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">访问类型:</span>
          <span class="value">{{ currentRecord.accessType }}</span>
        </div>
        <div class="detail-item">
          <span class="label">访问方式:</span>
          <span class="value">{{ currentRecord.accessMethod }}</span>
        </div>
        <div class="detail-item">
          <span class="label">结果:</span>
          <span class="value">{{ currentRecord.result }}</span>
        </div>
        <div class="detail-item">
          <span class="label">备注:</span>
          <span class="value">{{ currentRecord.remark || '无' }}</span>
        </div>
        
        <div v-if="currentRecord.hasImage" class="record-image">
          <img :src="currentRecord.imageUrl" alt="访问记录照片" />
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRecordDetail">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./doorMonitor.js"></script>

<style scoped>
.door-monitor-container {
  padding: 20px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.door-status-card,
.camera-card,
.access-records-card {
  margin-bottom: 20px;
}

.door-status-content {
  text-align: center;
}

.door-controls {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.camera-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.video-container,
.snapshot-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #000;
  border-radius: 4px;
}

.video-container video,
.snapshot-container img {
  max-width: 100%;
  max-height: 100%;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.camera-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.record-detail {
  font-size: 14px;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
}

.detail-item .label {
  font-weight: bold;
  width: 100px;
  color: #606266;
}

.record-image {
  margin-top: 20px;
  text-align: center;
}

.record-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}
</style> 