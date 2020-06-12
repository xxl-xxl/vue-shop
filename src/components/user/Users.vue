<template>
  <div>
    <!-- 面包屑导航 -->
    <Mbx msg1="用户管理" msg2="用户列表"></Mbx>

    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框和添加用户按钮 -->
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="userList" stripe border>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addForm"
        :rules="Rules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 表单区域 -->
      <el-form
        :model="editForm"
        :rules="Rules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="roleClose"
    >
      <div>
        <p>当前用户：{{ userinfo.username }}</p>
        <p>当前角色：{{ userinfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="setRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleslist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 校验手机号规则
    const checkMobile = (rule, value, cb) => {
      const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (reg.test(value)) {
        // 合法
        return cb()
      }
      cb(new Error('手机号码不合法'))
    }
    return {
      // 查询用户列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表数据总数
      total: 0,
      // 用户列表数据
      userList: [],
      // 控制添加用户对话框
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 控制修改用户对话框
      editDialogVisible: false,
      // 修改用户表单数据
      editForm: {},
      // 控制分配角色对话框
      setRoleDialogVisible: false,
      // 分配角色对话框当前角色信息
      userinfo: {},
      // 分配角色选择后的角色id
      setRoleId: '',
      // 角色列表
      roleslist: [],
      // 表单验证规则
      Rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },

  created() {
    this.getUserList()
  },

  methods: {
    // 获取用户列表信息
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 添加用户列表关闭清空
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户请求
    addUser() {
      // 验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 修改用户状态
    async userStateChange(row) {
      const { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      )
      if (res.meta.status !== 200) {
        row.mg_state = !row.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 显示修改用户对话框
    showEditDialog(row) {
      this.editForm = row
      this.editDialogVisible = true
    },
    // 关闭修改用户对话框，清空数据
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户数据
    editUser(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.put(
          `/users/${id}`,
          this.editForm
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 根据id删除用户
    async removeUserById(id) {
      // 弹窗
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确定删除，返回字符串confirm。用户取消返回字符串cancel
      if (confirmRes !== 'confirm') {
        return this.$message.info('已经取消删除操作')
      }
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      if (this.queryInfo.pagenum !== 1) {
        if (this.userList.length === 1) {
          this.queryInfo.pagenum -= 1
        }
      }
      this.getUserList()
    },
    // 分配角色对话框
    async setRole(row) {
      this.userinfo = row
      this.setRoleDialogVisible = true
      // 获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleslist = res.data
    },
    // 关闭分配角色对话框清空数据
    roleClose() {
      this.userinfo = {}
      this.setRoleId = ''
    },
    // 保存修改后信息
    async saveRoleInfo() {
      if (!this.setRoleId) return this.$message.error('请选择')
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        {
          rid: this.setRoleId
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.setRoleDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-table,
.el-pagination {
  margin-top: 15px;
  font-size: 12px;
}
</style>
