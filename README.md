# 小区物业后台管理系统

一个现代化的小区物业管理系统前端界面，提供各种物业管理功能的直观展示。

## 功能特点

- **门禁管理**：远程控制小区门禁系统
- **车位监控**：实时显示总车位和剩余车位数量
- **业主管理**：统计业主缴费、审核和拒绝情况
- **工单系统**：展示维修工单和报修工单的处理状态
- **实时监控**：集成小区监控摄像头画面
- **公告和投诉处理**：系统集成公告发布和投诉处理功能

## 技术实现

- 纯前端实现，使用HTML5、CSS3和JavaScript
- 响应式设计，适配各种屏幕大小的设备
- 使用Chart.js实现数据可视化图表
- 模块化布局，便于扩展和维护

## 使用方法

1. 克隆或下载本项目到本地
2. 直接在浏览器中打开`index.html`文件即可预览系统界面
3. 如需部署到服务器，请将整个目录上传到您的Web服务器

## 项目结构

```
property-management-system/
├── css/
│   └── style.css           # 样式文件
├── js/
│   └── main.js             # JavaScript功能实现
├── images/
│   └── logo.svg            # 系统Logo
└── index.html              # 主页面
```

## 自定义与扩展

本系统为纯前端演示系统，如需接入实际后端服务：

1. 修改`main.js`中的模拟数据部分，改为从API获取真实数据
2. 在实际应用中，推荐将敏感操作（如门禁控制）设置访问权限
3. 可根据实际需求添加更多功能模块，如访客管理、缴费系统等

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Edge
- Safari

## 注意事项

- 本系统为前端演示项目，未包含实际的后端逻辑
- 门禁控制和监控摄像头等功能需要硬件设备支持
- 实际应用中应加强系统安全性和用户权限管理 