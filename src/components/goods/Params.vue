<template>
  <div>
    <!-- 面包屑导航 -->
    <mbx msg1="商品管理" msg2="参数列表"></mbx>
    <!-- 卡片 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            clearable
            @change="handleChange"
          >
          </el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加按钮 -->
          <el-button
            type="primary"
            class="btn"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
            >添加参数</el-button
          >
          <!-- 数据表格 -->
          <el-table :data="manyTableData" @tab-click="handleChange">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加按钮 -->
          <el-button
            type="primary"
            class="btn"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
            >添加属性</el-button
          >
          <!-- 数据表格 -->
          <el-table :data="onlyTableData" @tab-click="handleChange">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 表单 -->
      <el-form
        :model="editForm"
        :rules="rules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加属性对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 表单 -->
      <el-form
        :model="addForm"
        :rules="rules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 级联选择器选中项数据
      selectedKeys: [],
      // 级联选择器数据源
      cateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 标签页显示内容
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 修改对话框显示隐藏
      editDialogVisible: false,
      // 修改表单数据
      editForm: {},
      // 添加对话框显示隐藏
      addDialogVisible: false,
      // 添加对话框表单数据
      addForm: {
        attr_name: ''
      },
      // 表单验证
      rules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ],
        attr_name1: [
          { required: true, message: '请输入属性名称', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 获取参数/属性
    async getParamList() {
      // 判断级联选择器选中的是否为第三级元素
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据选中的分类id以及tab显示内容查询数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      // 修改attr_vals的格式
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      // 根据当前tab栏显示内容存储数据
      if (this.activeName === 'many') {
        return (this.manyTableData = res.data)
      }
      this.onlyTableData = res.data
    },
    // 级联选择器内容发生改变
    // 切换tab调用
    handleChange() {
      this.getParamList()
    },
    // 控制修改对话框
    async showEditDialog(id) {
      // 查询当前参数信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭清空修改对话框
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交修改请求
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getParamList()
      })
    },
    // 删除请求
    async delParams(id) {
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
        `categories/${this.cateId}/attributes/${id}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getParamList()
    },
    // 关闭清空添加对话框
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 发送添加请求
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getParamList()
      })
    },
    // 点击显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 显示输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 回车或失去焦点 输入框触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''

      // 保存请求
      this.savaArreVals(row)
    },
    // 保存请求
    async savaArreVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },
    // 删除
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.savaArreVals(row)
    },
    // tab栏切换
    handleTabClick() {
      this.getParamList()
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中第三级元素 返回id
    cateId() {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      return null
    },
    // 标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.el-alert {
  margin-bottom: 15px;
}

.btn {
  margin-bottom: 15px;
}

.el-tag {
  margin-right: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
