<template>
  <div>
    <Mbx msg1="权限管理" msg2="角色列表"></Mbx>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 数据显示区域 -->
      <el-table :data="rolesList" border strip>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcen']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="delRightById(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 !== 0 ? 'bdtop' : '', 'vcen']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="delRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, index3) in item2.children"
                      :class="index3 !== 0 ? 'bdtop' : ''"
                      :key="item3.id"
                      closable
                      @close="delRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="delRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleClose"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addForm"
        :rules="Rules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleClose"
    >
      <!-- 表单区域 -->
      <el-form
        :model="editForm"
        :rules="Rules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="clearDefks"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defks"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sllotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 控制添加角色对话框
      addRoleDialogVisible: false,
      // 添加角色表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制修改角色对话框
      editRoleDialogVisible: false,
      // 修改角色表单数据
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制分配权限对话框
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      // 树形结构
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 当前角色的权限列表
      defks: [],
      // 分配当前角色的id
      roleId: '',
      // 表单验证
      Rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getRoleList()
  },

  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
    },
    // 添加角色表单关闭清空
    addRoleClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色请求
    async addRole() {
      const { data: res } = await this.$http.post('roles', this.addForm)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.addRoleDialogVisible = false
      this.getRoleList()
    },
    // 显示修改角色对话框
    showEditDialog(row) {
      this.editForm = row
      this.editRoleDialogVisible = true
    },
    // 修改角色对话框关闭清空
    editRoleClose() {
      this.$refs.editFormRef.resetFields()
      this.editForm = {}
    },
    // 验证后提交修改请求刷新页面
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        // const { data: res } = await this.$http.put(`roles/${this.editId}`, this.editForm)
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.id}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editRoleDialogVisible = false
        this.getRoleList()
      })
    },
    // 删除角色
    async delRoles(id) {
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
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRoleList()
    },
    // 删除权限
    async delRightById(row, id) {
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
      const { data: res } = await this.$http.delete(
        `roles/${row.id}/rights/${id}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      row.children = res.data
    },
    // 显示对话框获取所有权限
    async showSetRightDialog(row) {
      this.roleId = row.id
      // 获取所有权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      this.getLeafKeys(row, this.defks)
      this.setRightDialogVisible = true
    },
    // 当前角色权限id列表
    getLeafKeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 清空分配权限内容
    clearDefks() {
      this.defks = []
    },
    // 保存修改
    async sllotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcen {
  display: flex;
  align-items: center;
}
</style>
