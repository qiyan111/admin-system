document.addEventListener('DOMContentLoaded', function() {
    // 确保Chart.js已加载
    if (typeof Chart === 'undefined') {
        console.error('Chart.js 未加载，请检查网络连接');
        return;
    }

    // 初始化图表
    initCharts();
    
    // 门禁控制按钮事件
    const openDoorBtn = document.querySelector('.door-open');
    const closeDoorBtn = document.querySelector('.door-close');
    
    if (openDoorBtn && closeDoorBtn) {
        openDoorBtn.addEventListener('click', function() {
            alert('门已开启');
        });
        
        closeDoorBtn.addEventListener('click', function() {
            alert('门已关闭');
        });
    }
    
    // 摄像头全屏按钮
    const fullscreenBtns = document.querySelectorAll('.fullscreen-button');
    
    fullscreenBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const cameraFeed = this.closest('.camera-feed');
            if (cameraFeed) {
                toggleFullScreen(cameraFeed);
            }
        });
    });
    
    // 更新时间戳
    updateTimestamps();
    setInterval(updateTimestamps, 1000);
});

// 初始化所有图表
function initCharts() {
    try {
        // 业主管理饼图
        initPropertyChart();
        
        // 维修工单饼图
        initRepairChart();
        
        // 报修工单饼图
        initReportChart();
        
        console.log('所有图表初始化成功');
    } catch (error) {
        console.error('图表初始化失败:', error);
    }
}

// 业主管理饼图
function initPropertyChart() {
    const propertyCtx = document.getElementById('propertyPieChart');
    if (!propertyCtx) {
        console.error('找不到业主管理图表容器');
        return;
    }
    
    new Chart(propertyCtx, {
        type: 'pie',
        data: {
            labels: ['已缴订', '待审核', '已拒绝'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    '#4fc3f7',  // 浅蓝色
                    '#ffc107',  // 黄色
                    '#e53935'   // 红色
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    bodyFont: {
                        size: 10
                    },
                    titleFont: {
                        size: 10
                    }
                }
            }
        }
    });
}

// 维修工单饼图
function initRepairChart() {
    const repairCtx = document.getElementById('repairOrderChart');
    if (!repairCtx) {
        console.error('找不到维修工单图表容器');
        return;
    }
    
    const repairChart = new Chart(repairCtx, {
        type: 'doughnut',
        data: {
            labels: ['已完成', '待维修'],
            datasets: [{
                data: [70, 30],
                backgroundColor: [
                    '#4fc3f7',  // 浅蓝色
                    '#ffc107'   // 黄色
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    bodyFont: {
                        size: 10
                    },
                    titleFont: {
                        size: 10
                    }
                }
            }
        }
    });
    
    // 添加中心文字
    addCenterText(repairCtx, '维修工单');
}

// 报修工单饼图
function initReportChart() {
    const reportCtx = document.getElementById('reportOrderChart');
    if (!reportCtx) {
        console.error('找不到报修工单图表容器');
        return;
    }
    
    const reportChart = new Chart(reportCtx, {
        type: 'doughnut',
        data: {
            labels: ['待缴费', '已缴费', '已取消'],
            datasets: [{
                data: [45, 40, 15],
                backgroundColor: [
                    '#ffc107',  // 黄色
                    '#4fc3f7',  // 浅蓝色
                    '#1976d2'   // 深蓝色
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    bodyFont: {
                        size: 10
                    },
                    titleFont: {
                        size: 10
                    }
                }
            }
        }
    });
    
    // 添加中心文字
    addCenterText(reportCtx, '报修工单');
}

// 为环形图添加中心文字
function addCenterText(ctx, text) {
    // 获取canvas的DOM元素
    const canvas = ctx;
    if (!canvas || !canvas.parentNode) return;
    
    // 创建文本容器
    const textContainer = document.createElement('div');
    textContainer.className = 'chart-center-text';
    textContainer.textContent = text;
    
    // 定位到图表中心
    const chartContainer = canvas.parentNode;
    chartContainer.style.position = 'relative';
    
    // 添加样式
    textContainer.style.position = 'absolute';
    textContainer.style.top = '50%';
    textContainer.style.left = '50%';
    textContainer.style.transform = 'translate(-50%, -50%)';
    textContainer.style.textAlign = 'center';
    textContainer.style.fontWeight = 'bold';
    textContainer.style.fontSize = '12px';
    textContainer.style.color = '#333';
    
    // 添加到DOM
    chartContainer.appendChild(textContainer);
}

// 更新摄像头时间戳
function updateTimestamps() {
    const timestamps = document.querySelectorAll('.timestamp');
    const now = new Date();
    
    // 格式化日期: YYYY-MM-DD HH:MM:SS
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    timestamps.forEach(timestamp => {
        timestamp.textContent = formattedTime;
    });
}

// 全屏切换功能
function toggleFullScreen(element) {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

// 生成随机数据的辅助函数（用于演示）
function getRandomData(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 模拟数据更新（仅用于演示）
function simulateDataUpdate() {
    // 更新车位数据
    document.querySelector('.stats:nth-child(2) .big-number').textContent = 'XXXX';
    document.querySelector('.stats:nth-child(3) .big-number').textContent = 'XX';
    
    // 更新业主数量
    document.querySelector('.property-count-inner .big-number').textContent = 'XXX';
    
    // 图表数据也可以在这里更新
    // 例如: myChart.data.datasets[0].data = [newValue1, newValue2, ...];
    // myChart.update();
}

// 在实际应用中，您可能希望从后端API获取这些数据
// 例如:
/*
async function fetchDashboardData() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        // 更新UI元素
        document.querySelector('.stats:nth-child(2) .big-number').textContent = data.totalParkingSpaces;
        document.querySelector('.stats:nth-child(3) .big-number').textContent = data.availableParkingSpaces;
        document.querySelector('.property-count-inner .big-number').textContent = data.totalOwners;
        
        // 更新图表数据
        // ...
        
    } catch (error) {
        console.error('获取仪表盘数据失败:', error);
    }
}
*/ 