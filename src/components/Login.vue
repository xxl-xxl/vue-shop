<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单 -->
      <el-form
        class="demo-ruleForm login_form"
        ref="loginFromRef"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 表单数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  created () {},

  methods: {
    resetLoginForm () {
      this.$refs.loginFromRef.resetFields()
    },
    login () {
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return this.$message.error('验证失败')
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
}

.avatar-box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 130px;
  width: 130px;
  background-color: #fff;
  border: 1px solid #eeeeee;
  border-radius: 50%;
  padding: 3px;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eeeeee;
}

.login_form {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px;
  bottom: 0;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
