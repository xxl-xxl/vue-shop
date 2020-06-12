<template>
  <div>
    <Mbx msg1="权限管理" msg2="权限列表"></Mbx>

    <!-- 卡片 -->
    <el-vard>
      <el-table :data="rightsList" stripe border>
        <el-table-column
          label="序号"
          type="index"
          width="80px"
        ></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-vard>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList: []
    }
  },

  created() {
    this.getRightList()
  },

  methods: {
    // 获取权限列表
    async getRightList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
    }
  }
}
</script>
<style lang="less" scoped></style>
