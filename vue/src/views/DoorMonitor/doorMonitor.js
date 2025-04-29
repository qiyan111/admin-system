import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'DoorMonitor',
  
  data() {
    return {
      // 门禁状态相关
      doorStatus: {
        status: '未知',
        lastUpdated: null
      },
      
      // 摄像头相关
      cameraData: {
        isPlaying: false,
        stream: null,
        snapshot: null
      },
      
      // 访问记录相关
      accessRecords: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 控制加载状态
      loading: {
        doorStatus: false,
        camera: false,
        records: false
      },
      
      // 错误信息
      error: {
        doorStatus: null,
        camera: null,
        records: null
      },
      
      // 当前记录详情
      currentRecord: null,
      recordDetailVisible: false,
      
      // 轮询定时器
      pollingTimers: {
        doorStatus: null
      }
    };
  },
  
  computed: {
    totalPages() {
      return Math.ceil(this.pagination.total / this.pagination.pageSize);
    }
  },
  
  mounted() {
    // 初始化获取数据
    this.fetchDoorStatus();
    this.fetchAccessRecords();
    
    // 设置门禁状态轮询 (每30秒更新一次)
    this.pollingTimers.doorStatus = setInterval(() => {
      this.fetchDoorStatus();
    }, 30000);
  },
  
  beforeUnmount() {
    // 清除轮询定时器
    if (this.pollingTimers.doorStatus) {
      clearInterval(this.pollingTimers.doorStatus);
    }
    
    // 停止摄像头流
    this.stopCameraStream();
  },
  
  methods: {
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '未知';
      
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    },
    
    // 获取门禁状态
    async fetchDoorStatus() {
      if (this.loading.doorStatus) return;
      
      this.loading.doorStatus = true;
      this.error.doorStatus = null;
      
      try {
        // 调用API获取门禁状态
        const response = await fetch('/api/door/status');
        
        if (!response.ok) {
          throw new Error(`获取门禁状态失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        this.doorStatus = {
          status: data.isOpen ? '开启' : '关闭',
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };
        
      } catch (error) {
        console.error('获取门禁状态失败:', error);
        this.error.doorStatus = `获取门禁状态失败: ${error.message}`;
        ElMessage.error(this.error.doorStatus);
      } finally {
        this.loading.doorStatus = false;
      }
    },
    
    // 控制门禁
    async controlDoor(action) {
      if (this.loading.doorStatus) return;
      
      const actionText = action === 'open' ? '开启' : '关闭';
      const confirmMsg = `确定要${actionText}门禁吗？`;
      
      try {
        await ElMessageBox.confirm(confirmMsg, '操作确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        this.loading.doorStatus = true;
        this.error.doorStatus = null;
        
        // 调用API控制门禁
        const response = await fetch('/api/door/control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            action: action,
            timestamp: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          throw new Error(`${actionText}门禁失败: ${response.status}`);
        }
        
        // 更新门禁状态
        this.doorStatus = {
          status: action === 'open' ? '开启' : '关闭',
          lastUpdated: new Date().toISOString()
        };
        
        ElMessage.success(`门禁已${actionText}`);
      } catch (error) {
        if (error === 'cancel') return;
        
        console.error(`${actionText}门禁失败:`, error);
        this.error.doorStatus = `${actionText}门禁失败: ${error.message}`;
        ElMessage.error(this.error.doorStatus);
      } finally {
        this.loading.doorStatus = false;
      }
    },
    
    // 获取摄像头数据
    async fetchCameraData() {
      if (this.loading.camera) return;
      
      this.loading.camera = true;
      this.error.camera = null;
      
      try {
        // 请求摄像头权限
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        this.cameraData.stream = stream;
        this.cameraData.isPlaying = true;
        
        // 延迟执行，确保DOM已更新
        this.$nextTick(() => {
          const videoElement = this.$refs.cameraVideo;
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        });
        
      } catch (error) {
        console.error('获取摄像头数据失败:', error);
        this.error.camera = `获取摄像头数据失败: ${error.message}`;
        ElMessage.error(this.error.camera);
      } finally {
        this.loading.camera = false;
      }
    },
    
    // 停止摄像头流
    stopCameraStream() {
      if (this.cameraData.stream) {
        this.cameraData.stream.getTracks().forEach(track => track.stop());
        this.cameraData.stream = null;
      }
      this.cameraData.isPlaying = false;
    },
    
    // 拍摄快照
    takeSnapshot() {
      if (!this.cameraData.isPlaying || !this.$refs.cameraVideo) return;
      
      try {
        const video = this.$refs.cameraVideo;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 获取图像数据
        this.cameraData.snapshot = canvas.toDataURL('image/jpeg');
        
        // 保存快照到服务器
        this.saveSnapshotToServer(this.cameraData.snapshot);
        
      } catch (error) {
        console.error('拍摄快照失败:', error);
        ElMessage.error(`拍摄快照失败: ${error.message}`);
      }
    },
    
    // 保存快照到服务器
    async saveSnapshotToServer(imageData) {
      try {
        const response = await fetch('/api/door/snapshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageData: imageData,
            timestamp: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          throw new Error(`保存快照失败: ${response.status}`);
        }
        
        ElMessage.success('快照已保存');
        
        // 刷新访问记录
        this.fetchAccessRecords();
        
      } catch (error) {
        console.error('保存快照失败:', error);
        ElMessage.error(`保存快照失败: ${error.message}`);
      }
    },
    
    // 获取访问记录
    async fetchAccessRecords() {
      if (this.loading.records) return;
      
      this.loading.records = true;
      this.error.records = null;
      
      try {
        // 调用API获取访问记录
        const response = await fetch(`/api/door/access-records?page=${this.pagination.currentPage}&pageSize=${this.pagination.pageSize}`);
        
        if (!response.ok) {
          throw new Error(`获取访问记录失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        this.accessRecords = data.records || [];
        this.pagination.total = data.total || 0;
        
      } catch (error) {
        console.error('获取访问记录失败:', error);
        this.error.records = `获取访问记录失败: ${error.message}`;
        ElMessage.error(this.error.records);
      } finally {
        this.loading.records = false;
      }
    },
    
    // 处理分页变化
    handlePageChange(page) {
      this.pagination.currentPage = page;
      this.fetchAccessRecords();
    },
    
    // 查看记录详情
    async viewRecordDetail(recordId) {
      try {
        // 调用API获取记录详情
        const response = await fetch(`/api/door/access-records/${recordId}`);
        
        if (!response.ok) {
          throw new Error(`获取记录详情失败: ${response.status}`);
        }
        
        const data = await response.json();
        this.currentRecord = data;
        this.recordDetailVisible = true;
        
      } catch (error) {
        console.error('获取记录详情失败:', error);
        ElMessage.error(`获取记录详情失败: ${error.message}`);
      }
    },
    
    // 查看记录图片
    async viewRecordImage(recordId) {
      try {
        // 调用API获取记录图片
        const response = await fetch(`/api/door/access-records/${recordId}/image`);
        
        if (!response.ok) {
          throw new Error(`获取记录图片失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.imageUrl) {
          throw new Error('没有可用的图片');
        }
        
        // 打开图片预览
        this.currentRecord = {
          id: recordId,
          hasImage: true,
          imageUrl: data.imageUrl
        };
        
        this.recordDetailVisible = true;
        
      } catch (error) {
        console.error('获取记录图片失败:', error);
        ElMessage.error(`获取记录图片失败: ${error.message}`);
      }
    },
    
    // 关闭记录详情对话框
    closeRecordDetail() {
      this.recordDetailVisible = false;
      this.currentRecord = null;
    }
  }
}; 