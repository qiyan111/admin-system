<template>
  <div class="sidebar">
    <div class="logo">LOGO</div>
    <div class="logo-subtitle">小区物业后台管理</div>
    <ul class="menu-list">
      <li 
        v-for="(item, index) in menuItems" 
        :key="index" 
        :class="{ 'menu-item': true, 'active': activeIndex === index }"
        @click="setActiveMenu(index)"
      >
        <router-link :to="item.route">
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      activeIndex: 0,
      menuItems: [
        { name: '首页', icon: 'icon-home', route: '/' },
        { name: '门禁监控', icon: 'icon-door', route: '/door-monitor' },
        { name: '业主管理', icon: 'icon-user', route: '/owner-management' },
        { name: '工单管理', icon: 'icon-workorder', route: '/work-order' },
        { name: '访客管理', icon: 'icon-visitor', route: '/visitor' },
        { name: '预约管理', icon: 'icon-appointment', route: '/appointment' },
        { name: '车位管理', icon: 'icon-parking', route: '/parking' }
      ]
    }
  },
  mounted() {
    // 根据当前路径设置活跃菜单
    const currentPath = this.$route.path;
    const index = this.menuItems.findIndex(item => item.route === currentPath);
    if (index !== -1) {
      this.activeIndex = index;
    }
  },
  methods: {
    setActiveMenu(index) {
      this.activeIndex = index;
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #1a2942;
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
}

.logo {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.logo-subtitle {
  text-align: center;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 20px;
}

.menu-list {
  list-style: none;
  padding: 10px 0;
}

.menu-item {
  cursor: pointer;
}

.menu-item a {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  transition: background-color 0.3s;
}

.menu-item:hover a {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active a {
  background-color: rgba(255, 255, 255, 0.2);
  border-left: 3px solid #4a9df8;
}

.menu-item i {
  margin-right: 10px;
  font-size: 16px;
}
</style> 