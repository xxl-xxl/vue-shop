import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element'
import './assets/css/global.css'
import Mbx from './components/Mbx.vue'
import axios from 'axios'
import TreeTable from 'tree-table-vue'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 拦截器
axios.interceptors.request.use(config => {
  // 展示进度条
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  // 隐藏进度条
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
Vue.component('Mbx', Mbx)
Vue.use(VueQuillEditor)
Vue.filter('dataFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
