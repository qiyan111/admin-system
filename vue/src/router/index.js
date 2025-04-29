import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard/Dashboard.vue' // 修正路径

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/monitoring',
    name: 'monitoring',
    // 懒加载组件
    component: () => import(/* webpackChunkName: "monitoring" */ '../views/DoorMonitor/DoorMonitor.vue') // 修正路径，假设门禁监控是 DoorMonitor
  },
  {
    path: '/owner-management',
    name: 'ownerManagement',
    component: () => import(/* webpackChunkName: "owner-management" */ '../views/OwnerManagement/OwnerManagement.vue') // 修正路径
  },
  {
    path: '/work-order',
    name: 'workOrder',
    component: () => import(/* webpackChunkName: "work-order" */ '../views/WorkOrder/WorkOrder.vue') // 修正路径
  },
  // 将原来指向 placeholder 的路由也设置好
  {
    path: '/visitor', // 访客管理
    name: 'visitor',
    component: () => import(/* webpackChunkName: "visitor" */ '../views/Visitor/Visitor.vue') // 修正路径，假设 Placeholder.vue 不再需要，直接用对应组件
  },
  {
    path: '/appointment', // 预约管理
    name: 'appointment',
    component: () => import(/* webpackChunkName: "appointment" */ '../views/Appointment/Appointment.vue') // 修正路径
  },
  {
    path: '/parking', // 车位管理
    name: 'parking',
    component: () => import(/* webpackChunkName: "parking" */ '../views/Parking/Parking.vue') // 修正路径
  },
  // 可以添加一个 404 页面或者重定向到首页
  // { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/'), // 使用 process.env.BASE_URL 或默认为 '/'
  routes
})

export default router 