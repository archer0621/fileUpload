import axios from '../utils/http';

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