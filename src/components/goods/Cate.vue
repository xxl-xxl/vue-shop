<template>
  <div>
    <!-- 面包屑导航 -->
    <mbx msg1="商品管理" msg2="商品分类"></mbx>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" class="btn" @click="showAddDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        show-index
        index-text="#"
        border
        :selectable="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-error"
            style="color: red;"
            v-if="scope.row.cat_deleted"
          ></i>
          <i class="el-icon-success" style="color: lightgreen;" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id, scope.row.cat_name)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
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
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
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
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <!-- v-model选中项绑定值 -->
          <!-- options数据源 -->
          <!-- props 数据源的配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentsCateList"
            :props="cascaderProps"
            clearable
            @change="handleChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取列表所需数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据数
      total: 0,
      // 商品分类列表
      catelist: [],
      // tree-table列的定义
      columns: [
        {
          title: '分类名称',
          key: 'cat_name'
        },
        {
          title: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          title: '排序',
          type: 'template',
          template: 'order'
        },
        {
          title: '操作',
          type: 'template',
          width: '200px',
          template: 'opt'
        }
      ],
      // 控制修改分类对话框
      editDialogVisible: false,
      // 修改分类请求数据
      editForm: {
        id: 0,
        cat_name: ''
      },
      // 控制添加分类对话框
      addDialogVisible: false,
      // 添加分类对话框表单
      addForm: {
        // 分类名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 级联选择器选中项数据
      selectedKeys: [],
      // 级联选择器数据源
      parentsCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 表单验证规则
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    // 获取分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.total = res.data.total
      this.catelist = res.data.result
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 删除分类
    async delCate(id) {
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
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      if (this.queryInfo.pagenum !== 1) {
        if (this.catelist.length === 1) {
          this.queryInfo.pagenum -= 1
        }
      }
      this.getCateList()
    },
    // show修改对话框
    showEditDialog(id, name) {
      this.editForm.id = id
      this.editForm.cat_name = name
      this.editDialogVisible = true
    },
    // 关闭清空修改分类对话框
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 验证成功后发送修改请求
    editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.put(
          `categories/${this.editForm.id}`,
          {
            cat_name: this.editForm.cat_name
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getCateList()
      })
    },
    // 获取前两级分类数据
    async getParentsCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentsCateList = res.data
    },
    // 显示添加分类对话框
    showAddDialog() {
      this.getParentsCateList()
      this.addDialogVisible = true
    },
    // 级联选择器选中项改变
    handleChange() {
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_level = this.selectedKeys.length
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        return null
      }
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    // 验证提交添加请求
    async addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addDialogVisible = false
      })
    },
    // 关闭清空添加分类对话框
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    }
  }
}
</script>
<style lang="less" scoped>
.btn {
  margin-bottom: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
