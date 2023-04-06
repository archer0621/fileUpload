<template>
  <div class="item">
    <h3>单一图片上传[BASE64]</h3>
    <section class="upload_box" id="upload2">
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

const changeBase64 = (file) => {
    return new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (e) => {
            resolve(e.target.result);
        };
    });
};

export default {
  name: 'singleBase64',
  data() {
    return {
      fileTip: '图片大小不能超过2MB',
      file: null
    }
  },
  methods: {
    uploadClick() {
      // 点击 `选择文件` 按钮, 触发upload_up上传文件按钮点击事件
      let upload = document.querySelector('#upload2');
      let upload_up = upload.querySelector('.upload_up');
      upload_up.click();
    },
    uploadChange(event) {
      let upload = document.querySelector('#upload2');
      let upload_up = upload.querySelector('.upload_up');
      let inputDom = event.target // input 本身，从这里获取 files<FileList> 
      let file = inputDom.files[0] // input 中的文件，是 FileList 对象，一个类似数组的文件组，但不是数组，可遍历
      // 判断图片是否存在
      if (!file) return;
      
      // 限制图片大小
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      // 图片数据绑定
      this.fileTip = file.name;
      this.file = file;
    },
    async uploadFile() {
      let upload = document.querySelector('#upload2');
      let upload_up = upload.querySelector('.upload_up');
      const that = this;
      if (!this.file) {
        alert('请选择您要上传的图片~');
        return;
      }
      let base64 = null;
      base64 = await changeBase64(that.file);
      console.log(base64);
      upload_up.value = '';
      try {
        const data = await instance
          .post('/upload_single_base64', 
            {
              file: encodeURIComponent(base64), // 防止乱码
              filename: that.file.name
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              }
            }
          )
          const { code } = data;
          if (code === 0) {
            this.fileTip = '文件上传成功!';
          }
          throw data.codeText; // 抛出异常
      } catch (error) {

      }
    }
  }
}
</script>

<style lang='less'>
  
</style>