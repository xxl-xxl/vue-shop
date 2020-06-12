<template>
  <div>
    <Mbx msg1="订单管理" msg2="订单列表"></Mbx>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框和添加区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 数据表 -->
      <el-table :data="orderlist" stripe border>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="95px">
        </el-table-column>
        <el-table-column label="是否付款" width="120px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px">
        </el-table-column>
        <el-table-column label="下单时间" width="130px">
          <template slot-scope="scope">
            {{ scope.row.update_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location-information"
              size="mini"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="rules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="ress1">
          <el-cascader
            v-model="editForm.ress1"
            :options="citydata"
            :props="Props"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="ress2">
          <el-input v-model="editForm.ress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in paogressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 数据总数
      total: 0,
      // 数据列表
      orderlist: [],
      editDialogVisible: false,
      editForm: {
        ress1: [],
        ress2: ''
      },
      citydata: cityData,
      progressVisible: false,
      paogressInfo: [],
      Props: {
        expandTrigger: 'hover'
      },
      rules: {
        ress1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        ress2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      }
    }
  },

  created() {
    this.getOrderList()
  },

  methods: {
    // 获取订单数据
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.total = res.data.total
      this.orderlist = res.data.goods
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
    // 显示修改对话框
    showBox() {
      this.editDialogVisible = true
    },
    editDialogClose() {
      this.editForm.ress1 = []
      this.$refs.editFormRef.resetFields()
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.paogressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
