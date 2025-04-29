import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'Dashboard',
  data() {
    return {
      dashboardData: {
        pendingOrders: 0,
        totalOwners: 0,
        visitorCount: 0,
        availableParkingSpots: 0
      },
      recentVisitors: [],
      workOrderChart: null,
      workOrderTypeChart: null
    }
  },
  mounted() {
    this.fetchDashboardData();
    this.fetchRecentVisitors();
    this.initCharts();
  },
  beforeUnmount() {
    // 销毁图表资源
    if (this.workOrderChart) {
      this.workOrderChart.destroy();
    }
    if (this.workOrderTypeChart) {
      this.workOrderTypeChart.destroy();
    }
  },
  methods: {
    fetchDashboardData() {
      // 实际项目中这里应该从API获取数据
      // 这里使用模拟数据
      setTimeout(() => {
        this.dashboardData = {
          pendingOrders: 24,
          totalOwners: 156,
          visitorCount: 35,
          availableParkingSpots: 42
        };
      }, 500);
    },
    fetchRecentVisitors() {
      // 模拟从API获取最近访客记录
      setTimeout(() => {
        this.recentVisitors = [
          { name: '张先生', targetPerson: '李业主', reason: '亲友拜访', visitTime: '2023-04-22 10:30', status: 'completed' },
          { name: '王女士', targetPerson: '赵业主', reason: '送快递', visitTime: '2023-04-22 09:15', status: 'in-progress' },
          { name: '刘先生', targetPerson: '陈业主', reason: '维修水电', visitTime: '2023-04-21 14:45', status: 'completed' },
          { name: '孙女士', targetPerson: '吴业主', reason: '商务拜访', visitTime: '2023-04-21 11:20', status: 'pending' }
        ];
      }, 700);
    },
    initCharts() {
      this.$nextTick(() => {
        // 初始化工单处理情况图表
        const workOrderCtx = this.$refs.workOrderChart;
        if (workOrderCtx) {
          this.workOrderChart = new Chart(workOrderCtx, {
            type: 'bar',
            data: {
              labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
              datasets: [
                {
                  label: '已完成',
                  data: [12, 19, 15, 22, 25, 18],
                  backgroundColor: '#4caf50'
                },
                {
                  label: '进行中',
                  data: [5, 8, 6, 9, 10, 7],
                  backgroundColor: '#2196f3'
                },
                {
                  label: '待处理',
                  data: [3, 2, 4, 5, 2, 3],
                  backgroundColor: '#ff9800'
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                }
              }
            }
          });
        }

        // 初始化工单类型占比图表
        const workOrderTypeCtx = this.$refs.workOrderTypeChart;
        if (workOrderTypeCtx) {
          this.workOrderTypeChart = new Chart(workOrderTypeCtx, {
            type: 'doughnut',
            data: {
              labels: ['水电维修', '设施报修', '公共设施', '安全问题', '其他'],
              datasets: [
                {
                  data: [35, 25, 15, 10, 15],
                  backgroundColor: [
                    '#4caf50',
                    '#2196f3',
                    '#ff9800',
                    '#f44336',
                    '#9c27b0'
                  ]
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                }
              }
            }
          });
        }
      });
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待处理',
        'in-progress': '进行中',
        'completed': '已完成'
      };
      return statusMap[status] || status;
    }
  }
} 