import axios from "axios";
import qs from 'qs';

/* 
  根据环境变量区分接口默认地址
*/
switch (process.env.NODE_ENV) {
  case "production":
    // 生产环境
    axios.defaults.baseURL = 'http://localhost:5000';
    break;
  case "test":
    // 测试环境
    axios.defaults.baseURL = 'http://localhost:5000';
  default:
    // 默认为开发环境
    axios.defaults.baseURL = 'http://localhost:5000';
}

/*
  设置超时和跨域请求是否允许携带凭证
*/
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;

/*
  设置POST请求头
*/
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.transformRequest = data => qs.stringify(data);

/*
  设置请求拦截器
  client -> 请求拦截器 -> serve
  TOKEN校验(JWT): 接收服务器返回的token, 存储到Vuex/localStorage中
*/
axios.interceptors.request.use(config => {
  let token = localStorage.getItem('token');
  token && (config.headers.Authorization = token);
  return config;
}, error => {
  return new Promise.reject(error);
});

/*
  响应拦截器
  serve返回信息 -> 拦截信息统一处理 -> client获取信息
*/
axios.defaults.validateStatus = status => {
  // 自定义响应成功的HTTP状态码
  return /^(2|3)\d{2}$/.test(status);
}

axios.interceptors.response.use(response => {
  // 返回响应主体中的信息
  return response.data;
}, error => {
  let { response } = error;
  if (response) {
    switch (response.status) {
      //根据不同的状态码进行不同处理
      case 401: //用户未登录状态
        break;
      case 403: // 服务器拒绝执行(token过期)
        localStorage.removeItem('token');
        // 跳转到登录页
        break;
      case 404: // 服务器无对应资源
        // 跳转到404error页
        break;
    }
    return Promise.reject(error.response);
  } else {
    // 断网处理
    if (!window.navigator.onLine) {
      // 跳转断网页面
      return;
    }
    return Promise.reject(error);
  }
})

export default axios;