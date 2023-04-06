<template>
  <div class="item">
    <h3>单一图片上传[FORM-DATA]</h3>
    <section class="upload_box" id="upload1">
      <input type="file" accept=".jpg,.png,.jpeg" class="upload_up" @change='uploadChange' />
      <div>
        <button class="upload_button select" @click="uploadClick">选择图片</button>
        <button class="upload_button upload" @click="uploadFile">上传</button>
      </div>
      <ul class="upload_list"></ul>
    </section>
    <div class="upload_tip">{{ fileTip }}</div>
  </div>
</template>

<script>
import instance from '../../utils/instance';
export default {
  name: 'singleFormData',
  data() {
    return {
      fileTip: '图片大小不能超过2MB',
      file: null
    }
  },
  methods: {
    uploadClick() {
      // 点击 `选择文件` 按钮, 触发upload_up上传文件按钮点击事件
      let upload_up = document.querySelector('.upload_up');
      upload_up.click();
    },
    uploadChange(event) {
      let inputDom = event.target // input 本身，从这里获取 files<FileList> 
      let file = inputDom.files[0] // input 中的文件，是 FileList 对象，一个类似数组的文件组，但不是数组，可遍历
      // 判断图片是否存在
      if (!file) return;
      
      // 限制图片大小
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      // 图片数据绑定
      this.fileTip = file.name;
      this.file = file;
    },
    uploadFile() {
      if (!this.file) {
        alert('请选择您要上传的图片~');
        return;
      }
      let formData = new FormData();
      console.log(this.file);
      formData.append('file', this.file);
      formData.append('filename', this.file.name);
      instance
        .post('/upload_single', formData)
        .then(res => {
          if (+res.code === 0) {
            this.fileTip = '图片上传成功!'
            return;
          }
          return Promise.reject(res.codeText);
        })
        .catch(err => {
          console.log(err);
        })
    }
  }
}
</script>

<style lang='less'>
  
</style>