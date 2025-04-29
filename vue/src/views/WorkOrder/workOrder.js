// 导入所需依赖
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate as formatDateUtil } from '@/utils/formatter'

export default function useWorkOrder() {
  const router = useRouter()

  // 响应式数据
  const workOrders = ref([])
  const currentOrder = ref(null)
  const tableHeight = ref('calc(100vh - 300px)')
  
  // 分页信息
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 加载状态
  const loading = reactive({
    list: false,
    detail: false,
    submit: false,
    activity: false,
    status: false,
    delete: false
  })

  // 筛选表单
  const filterForm = reactive({
    orderNumber: '',
    status: '',
    dateRange: []
  })

  // 日期快捷选项
  const dateShortcuts = [
    {
      text: '最近一周',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        return [start, end]
      }
    },
    {
      text: '最近一个月',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [start, end]
      }
    },
    {
      text: '最近三个月',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        return [start, end]
      }
    }
  ]

  // 对话框状态
  const dialogs = reactive({
    detail: {
      visible: false
    },
    form: {
      visible: false,
      isEdit: false
    },
    status: {
      visible: false,
      order: null
    }
  })

  // 工单表单
  const orderFormRef = ref(null)
  const orderForm = reactive({
    id: '',
    title: '',
    type: '',
    priority: 'medium',
    ownerName: '',
    contactPhone: '',
    address: '',
    description: ''
  })

  // 工单表单验证规则
  const orderFormRules = {
    title: [
      { required: true, message: '请输入工单标题', trigger: 'blur' },
      { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    type: [
      { required: true, message: '请选择工单类型', trigger: 'change' }
    ],
    priority: [
      { required: true, message: '请选择优先级', trigger: 'change' }
    ],
    ownerName: [
      { required: true, message: '请输入业主姓名', trigger: 'blur' }
    ],
    contactPhone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    address: [
      { required: true, message: '请输入地址', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入工单描述', trigger: 'blur' },
      { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
    ]
  }

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

  // 计算属性：状态颜色映射
  const getStatusTagType = (status) => {
    const statusMap = {
      'pending': 'info',
      'processing': 'warning',
      'completed': 'success',
      'cancelled': 'danger'
    }
    return statusMap[status] || 'info'
  }

  // 计算属性：类型颜色映射
  const getTypeTagType = (type) => {
    const typeMap = {
      'repair': 'danger',
      'complaint': 'warning',
      'suggestion': 'info',
      'other': ''
    }
    return typeMap[type] || ''
  }

  // 计算属性：优先级颜色映射
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

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return formatDateUtil(dateString, 'YYYY-MM-DD HH:mm:ss')
  }

  // 获取工单列表
  const fetchWorkOrders = async () => {
    loading.list = true
    try {
      // 构建查询参数
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        orderNumber: filterForm.orderNumber || undefined,
        status: filterForm.status || undefined
      }

      // 日期范围
      if (filterForm.dateRange && filterForm.dateRange.length === 2) {
        params.startDate = filterForm.dateRange[0]
        params.endDate = filterForm.dateRange[1]
      }

      // 调用API获取工单列表
      const response = await fetch('/api/work-orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('获取工单列表失败')
      }

      const data = await response.json()
      
      // 更新数据
      workOrders.value = data.items || []
      pagination.total = data.total || 0
    } catch (error) {
      ElMessage.error(error.message || '获取工单列表失败')
      console.error('获取工单列表错误:', error)
    } finally {
      loading.list = false
    }
  }

  // 刷新工单列表
  const refreshOrders = () => {
    fetchWorkOrders()
  }

  // 搜索工单
  const handleSearch = () => {
    pagination.current = 1
    fetchWorkOrders()
  }

  // 重置搜索条件
  const resetSearch = () => {
    // 重置表单
    filterForm.orderNumber = ''
    filterForm.status = ''
    filterForm.dateRange = []
    
    // 重置分页并获取数据
    pagination.current = 1
    fetchWorkOrders()
  }

  // 分页大小变更
  const handleSizeChange = (size) => {
    pagination.pageSize = size
    fetchWorkOrders()
  }

  // 当前页变更
  const handleCurrentChange = (page) => {
    pagination.current = page
    fetchWorkOrders()
  }

  // 查看工单详情
  const viewOrderDetail = async (orderId) => {
    loading.detail = true
    try {
      // 调用API获取工单详情
      const response = await fetch(`/api/work-orders/${orderId}`)
      
      if (!response.ok) {
        throw new Error('获取工单详情失败')
      }

      const data = await response.json()
      
      // 更新当前工单
      currentOrder.value = data
      
      // 显示详情对话框
      dialogs.detail.visible = true
    } catch (error) {
      ElMessage.error(error.message || '获取工单详情失败')
      console.error('获取工单详情错误:', error)
    } finally {
      loading.detail = false
    }
  }

  // 创建工单
  const handleCreateOrder = () => {
    // 重置表单
    Object.keys(orderForm).forEach(key => {
      orderForm[key] = ''
    })
    orderForm.priority = 'medium'
    
    // 设置对话框状态
    dialogs.form.isEdit = false
    dialogs.form.visible = true
  }

  // 更新工单
  const handleUpdateOrder = (order) => {
    // 填充表单
    Object.keys(orderForm).forEach(key => {
      if (key in order) {
        orderForm[key] = order[key]
      }
    })
    
    // 设置对话框状态
    dialogs.form.isEdit = true
    dialogs.form.visible = true
  }

  // 删除工单
  const handleDeleteOrder = (order) => {
    ElMessageBox.confirm(
      `确定要删除工单 "${order.title}" 吗？此操作不可逆。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      loading.delete = true
      try {
        // 调用API删除工单
        const response = await fetch(`/api/work-orders/${order.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('删除工单失败')
        }
        
        ElMessage.success('工单删除成功')
        
        // 刷新列表
        fetchWorkOrders()
      } catch (error) {
        ElMessage.error(error.message || '删除工单失败')
        console.error('删除工单错误:', error)
      } finally {
        loading.delete = false
      }
    }).catch(() => {
      // 用户取消删除操作
    })
  }

  // 提交工单表单
  const submitOrderForm = () => {
    orderFormRef.value.validate(async (valid) => {
      if (!valid) return
      
      loading.submit = true
      try {
        const isEdit = dialogs.form.isEdit
        const method = isEdit ? 'PUT' : 'POST'
        const url = isEdit ? `/api/work-orders/${orderForm.id}` : '/api/work-orders'
        
        // 调用API提交工单
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderForm)
        })
        
        if (!response.ok) {
          throw new Error(isEdit ? '更新工单失败' : '创建工单失败')
        }
        
        ElMessage.success(isEdit ? '工单更新成功' : '工单创建成功')
        
        // 关闭对话框并刷新列表
        dialogs.form.visible = false
        fetchWorkOrders()
      } catch (error) {
        ElMessage.error(error.message || (dialogs.form.isEdit ? '更新工单失败' : '创建工单失败'))
        console.error('提交工单表单错误:', error)
      } finally {
        loading.submit = false
      }
    })
  }

  // 显示状态变更对话框
  const showStatusChangeDialog = (order) => {
    // 设置当前工单
    dialogs.status.order = order
    
    // 重置状态表单
    statusForm.status = ''
    statusForm.remark = ''
    
    // 显示对话框
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
    
    loading.status = true
    try {
      const orderId = dialogs.status.order.id
      
      // 调用API更新工单状态
      const response = await fetch(`/api/work-orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusForm.status,
          remark: statusForm.remark
        })
      })
      
      if (!response.ok) {
        throw new Error('更新工单状态失败')
      }
      
      ElMessage.success('工单状态更新成功')
      
      // 关闭对话框并刷新列表
      dialogs.status.visible = false
      fetchWorkOrders()
      
      // 如果当前正在查看该工单的详情，也更新详情
      if (currentOrder.value && currentOrder.value.id === orderId) {
        viewOrderDetail(orderId)
      }
    } catch (error) {
      ElMessage.error(error.message || '更新工单状态失败')
      console.error('更新工单状态错误:', error)
    } finally {
      loading.status = false
    }
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
    
    loading.activity = true
    try {
      const orderId = currentOrder.value.id
      
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
      
      // 清空表单
      activityForm.remark = ''
      
      // 刷新工单详情
      viewOrderDetail(orderId)
    } catch (error) {
      ElMessage.error(error.message || '添加处理记录失败')
      console.error('添加处理记录错误:', error)
    } finally {
      loading.activity = false
    }
  }

  // 生命周期钩子
  onMounted(() => {
    // 初始化获取工单列表
    fetchWorkOrders()
  })

  return {
    // 数据
    workOrders,
    currentOrder,
    tableHeight,
    pagination,
    loading,
    filterForm,
    dateShortcuts,
    dialogs,
    orderFormRef,
    orderForm,
    orderFormRules,
    activityForm,
    statusForm,
    
    // 方法
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
    fetchWorkOrders,
    refreshOrders,
    handleSearch,
    resetSearch,
    handleSizeChange,
    handleCurrentChange,
    viewOrderDetail,
    handleCreateOrder,
    handleUpdateOrder,
    handleDeleteOrder,
    submitOrderForm,
    showStatusChangeDialog,
    submitStatusChange,
    submitActivity
  }
} 