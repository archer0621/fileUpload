import axios from "axios";
import qs from 'qs';
let instance = axios.create();
instance.defaults.baseURL = 'http://localhost:5000';
instance.defaults.headers['Content-Type'] = 'multipart/form-data';
instance.defaults.transformRequest = (data, headers) => {
  const contentType = headers['Content-Type'];
  if (contentType === 'application/x-www-form-urlencoded') return qs.stringify(data);
  return data;
}

instance.interceptors.response.use(res => {
  return res.data;
}, error => {
  return Promise.reject(error);
});


export default instance;