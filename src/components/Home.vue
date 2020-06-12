<template>
  <!-- 布局 -->
  <el-container class="home-container">
    <!-- 首部 -->
    <el-header>
      <!-- logo -->
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <!-- 退出按钮 -->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="path"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="(item, index) in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconlist[index]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="children.path"
              v-for="children in item.children"
              :key="children.id"
              @click="saveNavState(children.path)"
            >
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ children.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
      menulist: [],
      iconlist: [
        'el-icon-s-custom',
        'el-icon-s-check',
        'el-icon-s-goods',
        'el-icon-s-order',
        'el-icon-s-data'
      ],
      path: ''
    }
  },

  created() {
    this.getMenuList()
    this.path = window.sessionStorage.getItem('path')
  },

  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 获取左侧菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 点击跳转
    saveNavState(path) {
      window.sessionStorage.setItem('path', path)
      this.path = path
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  padding-left: 10px;
  align-items: center;
  background-color: #373d41;
  color: #fff;
  font-size: 20px;
}

.el-header > div {
  display: flex;
  align-items: center;
}

.el-header > div > span {
  margin-left: 15px;
}

.el-aside {
  background-color: #333744;
}

.el-aside .el-menu {
  border-right: 0;
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 30px;
  text-align: center;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
