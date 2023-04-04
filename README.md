### Axios简介

`axios` 是一个轻量的 `HTTP客户端`，它基于 `XMLHttpRequest` 服务来执行 HTTP 请求，支持丰富的配置，支持 `Promise`，支持浏览器端和 `Node.js` 端。

`axios` 的 `API` 链接 [API](http://www.axios-js.com/zh-cn/docs/)

### Axios原生请求

使用原生Axios代码实现数据请求，代码大概是这样的：

~~~javascript
axios('http://localhost:5000/getSomeData', {
  method: 'GET',
  timeout: 1000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'xxx',
  },
  transformRequest: [function (data, headers) {
    return data;
  }]
})
.then((res) => {
  // 业务逻辑代码
  console.log(res);
}, (err) => {
  if (err.response.status === 401) {
  // handle authorization error
  }
  if (err.response.status === 403) {
  // handle server forbidden error
  }
  // 其他错误处理.....
  console.log(err);
})
~~~

可以看出在这段代码中很多都是重复代码，只有业务逻辑代码是真正需要操作的。

**因此，对 `axios` 进行封装，提高代码的复用性，能够提高开发效率，减少代码冗余**

### Axios封装

1. 在src中创建utils/http.js文件

2. 引入axios

   ~~~javascript
   import axios from 'axios';
   ~~~

3. 根据环境变量区分接口默认地址

   ~~~javascript
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
   ~~~

4. 设置超时和跨域请求是否允许携带凭证

   ~~~javascript
   axios.defaults.timeout = 10000;
   axios.defaults.withCredentials = true;
   ~~~

5. 设置POST请求头

   ~~~javascript
   axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
   axios.defaults.transformRequest = data => qs.stringify(data);
   ~~~

6. 设置请求拦截器

   ~~~javascript
   axios.interceptors.request.use(config => {
     let token = localStorage.getItem('token');
     token && (config.headers.Authorization = token);
     return config;
   }, error => {
     return new Promise.reject(error);
   });
   ~~~

7. 响应拦截器

   ~~~javascript
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
   ~~~

8. 默认导出axios

   ~~~javascript
   export default axios;
   ~~~

### Axios封装api使用

- 在src目录下创建 `api` 文件夹，把所有关于HTTP请求的接口都放到这个文件夹中管理

- 创建接口请求文件，例如 `user.js` ，用于请求用户相关信息

  ~~~javascript
  import axios from '@/utils/http';
  function login(params) {
      return axios.get('/login', params);
  }
  function userInfo(params) {
      return axios.get('/getUserInfo', params);
  }
  
  export default {
      login,
      userInfo
  }
  ~~~

- 在 `api` 目录下创建 `index.js` ，用于统筹管理所有的接口文件

  ~~~javascript
  import user from './user';
  
  export default {
      user
  }
  ~~~

- 在 `main.js` 中引入 `api/index.js` ，并指向Vue的原型链上

  ~~~javascript
  import api from '@/api/index';
  Vue.prototype.$api = api;
  ~~~

- 这样项目就可以全局使用 `$api` 来执行HTTP请求了

  ~~~javascript
  <template>
    <div class="home">
      <h1>This is home page</h1>
    </div>
  </template>
  <script>
  export default {
    name: 'home',
    methods: {
      userInfo() {
         this
           .$api
           .user
           .userInfo(params) //axios请求在这里
           .then((res) => {
             // TODO res数据
           })
           .catch((err) => {
             // 打印error
         })    
      } 
        
    },
  };
  </script>
  ~~~

### 总结

1. 封装可以让我们在开发中提高效率，减少代码冗余，增加可维护性和bug定位；
2. `axios` 封装没有绝对标准，只要满足你的项目需求，就算是一个优秀的封装方案；
3. 以上是Vue框架下的axios，不使用vue的情况下，也可以选择直接在组件中导入 `api` 使用。