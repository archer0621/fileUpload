<template>
  <div id="app">
    <div class="container">
      <singleFormData />
      <singleBase64 />
      <thumbnail />
      <progressBar />
      <dragDrop />
      <chunk />
    </div>
  </div>
</template>

<script>
import singleFormData from './components/upload/singleFormData.vue';
import singleBase64 from './components/upload/singleBase64.vue';
import thumbnail from './components/upload/thumbnail.vue';
import progressBar from './components/upload/progressBar.vue';
import dragDrop from './components/upload/dragDrop.vue';
import chunk from './components/upload/chunk.vue';
export default {
  components: { 
    singleFormData, 
    singleBase64,
    thumbnail,
    progressBar,
    dragDrop,
    chunk 
  },
  name: 'App',

}
</script>

<style lang="less">
#app {
  display: flex;
  justify-content: center;
  .container {
    display: flex;
    align-items: center;
    width: 2000px;
    justify-content: center;
    flex-wrap: wrap;
    &::after {
      content: '';
      width: 1038px;
    }
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 20px;
      margin-bottom: 20px;
      width: 500px;
      height: 400px;
      justify-content: center;
    }
    .upload_box {
      border: 1px dashed rgb(95, 35, 206);
      width: 500px;
      height: 400px;
    }
    .upload_up {
      display: none;
    }
    .upload_button {
      width: 100px;
      height: 40px;
      border: 0px;
      margin: 20px;
      cursor: pointer;
      border-radius: 5px;
    }
    .select {
      background-color: rgb(56, 160, 234);
      color: #fff;
    }
    .upload {
      background-color: rgb(60, 187, 10);
      color: #fff;
    }
    .upload_tip {
      color: rgb(235, 43, 9);
      margin: 0 auto;
    }
    .upload_abber {
      margin: 0 auto;
      width: 200px;
      height: 230px;
      img {
        width: 100%;
        height: 100%;
        display: none;
      }
    }
  }
}
</style>
