<template>
  <div>
    <Mbx msg1="商品管理" msg2="商品列表"></Mbx>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage"
            >添加商品</el-button
          >
        </el-col>
      </el-row>

      <!-- 数据表 -->
      <el-table :data="goodlist" stripe border>
        <el-table-column label="序号" type="index"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px">
        </el-table-column>
        <el-table-column label="创建时间" width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
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
              @click="removeGoodById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[30, 50, 70, 90]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改商品对话框 -->
    <el-dialog
      title="修改商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="Rules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGood(editForm.goods_id)"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品信息列表
      goodlist: [],
      // 分页信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 30
      },
      // 数据总数
      total: 0,
      // 修改商品的数据
      editForm: {},
      // 修改商品对话框显示隐藏
      editDialogVisible: false,
      // 表单验证
      Rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getGoodsList()
  },

  methods: {
    // 获取商品数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodlist = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听页码改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 显示修改商品对话框
    showEditDialog(row) {
      this.editForm = row
      this.editDialogVisible = true
    },
    // 关闭清空修改表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
      this.editForm = {}
    },
    // 验证提交修改请求
    editGood(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验失败')
        const { data: res } = await this.$http.put(`goods/${id}`, this.editForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getGoodsList()
      })
    },
    // 删除商品
    async removeGoodById(id) {
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
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      if (this.queryInfo.pagenum !== 1) {
        if (this.userList.length === 1) {
          this.queryInfo.pagenum -= 1
        }
      }
      this.getGoodsList()
    },
    // 跳转添加商品页面
    goAddpage() {
      this.$router.push('/add')
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
