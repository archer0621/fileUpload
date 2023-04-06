<template>
  <div class="item">
    <h3>单一文件上传[进度条]</h3>
    <section class="upload_box" id="upload4">
      <input type="file" class="upload_up" @change='uploadChange' />
      <div>
        <button class="upload_button select" @click="uploadClick">选择文件</button>
        <button class="upload_button upload" @click="uploadFile">上传</button>
      </div>
      <div class="upload_progress">
          <div class="progress"></div>
      </div>
    </section>
    <div class="upload_tip">{{ fileTip }}</div>
  </div>
</template>

<script>
import instance from '../../utils/instance';
export default {
  name: 'progressBar',
  data() {
    return {
      fileTip: '文件大小不能超过2MB',
      file: null
    }
  },
  methods: {
    uploadClick() {
      // 点击 `选择文件` 按钮, 触发upload_up上传文件按钮点击事件
      let upload = document.querySelector('#upload4');
      let upload_up = upload.querySelector('.upload_up');
      upload_up.click();
    },
    uploadChange(event) {
      let inputDom = event.target // input 本身，从这里获取 files<FileList> 
      let file = inputDom.files[0] // input 中的文件，是 FileList 对象，一个类似数组的文件组，但不是数组，可遍历
      // 判断文件是否存在
      if (!file) return;
      
      // 限制文件大小
      // if (file.size > 1000 * 1024 * 1024) {
      //   alert('文件大小不能超过2MB');
      //   return;
      // }
      // 文件数据绑定
      this.fileTip = file.name;
      this.file = file;
    },
    async uploadFile() {
      let upload = document.querySelector('#upload4');
      let upload_progress = upload.querySelector('.upload_progress');
      let upload_progrees_value = upload_progress.querySelector('.progress')

      if (!this.file) {
        alert('请选择您要上传的文件~');
        return;
      }
      try {
        let formData = new FormData();
        formData.append('file', this.file);
        formData.append('filename', this.file.name);
        const data = await instance.post('/upload_single', formData, {
          onUploadProgress: (e) => {
              const { loaded, total } = e;
              upload_progress.style.display = 'block';
              upload_progrees_value.style.width = `${ (loaded / total) * 100 }%`;
          },
        });
        if (+data.code === 0) {
          upload_progrees_value.style.width = `100%`;
          this.fileTip = '文件上传成功!'
          return;
        }
        throw data.codeText;
      } catch (error) {
        console.log(e);
        this.fileTip = '文件上传失败!'
      } finally {
        upload_progress.style.display = 'none';
        upload_progrees_value.style.width = `0%`;
      }
    }
  }
}
</script>

<style lang='less'>
.upload_progress {
    display: none;
    position: relative;
    margin-top: 10px;
    width: 500px;
    height: 3px;
    border-radius: 3px;
    background: rgb(206, 195, 195);
    overflow: hidden;
}
.progress {
    position: absolute;
    /* width: 30%; */
    height: 3px;
    border-radius: 3px;
    background-color: green;
}  
</style>