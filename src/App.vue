<template>
  <div id="app">
  </div>
</template>

<script>

export default {
  name: 'App',
  methods: {
    userInfo() {
       this
         .$api
         .user
         .userInfo(params) //axios请求在这里
         .then((res) => {
           // TODO res数据
           console.log(res);
         })
         .catch((err) => {
           // 打印error
           console.log(err);
       })    
    } 
  }
}
</script>

<style lang="less">
</style>
