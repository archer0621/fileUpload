<template>
  <div class="item" id="dragBox" @dragenter='dragenter' @drop='drop' @dragover='dragover'>
    <h3>单一文件上传[拖拽上传]</h3>
    <section class="upload_box" id="upload5">
      <input type="file" class="upload_up" @change='uploadChange' />
      <div class="upload-box">
          <i class="icon"></i>
          <span>将文件拖到此处,或</span>
          <span id="upload-button" style="color: rgb(58, 58, 193); cursor: pointer" @click="click">点击上传</span>
      </div>
    </section>
    <div class="upload_tip">{{ fileTip }}</div>
  </div>
</template>

<script>
import instance from '../../utils/instance';

const uploadFile = (file) => {
  const that = this;
  if (!file) {
    alert('请选择您要上传的文件~');
    return;
  }
  let formData = new FormData();
  formData.append('file', file);
  formData.append('filename', file.name);
  let flag = false;
  flag = instance
    .post('/upload_single', formData)
    .then(res => {
      if (res.code === 0) {
        return true;
      }
      return Promise.reject(res.codeText);
    })
    .catch(err => {
      console.log(err);
    })
  return flag ? '文件上传成功!': '文件上传失败!';
}


export default {
  name: 'dragDrop',
  data() {
    return {
      fileTip: '0.0',
      file: null
    }
  },
  methods: {
    dragenter(e) {
      e.preventDefault();
    },
    drop(e) {
      e.preventDefault();
      const {
          dataTransfer: { files },
      } = e;
      const file = files[0];
     this.fileTip = uploadFile(file);
    },
    dragover(e) {
      e.preventDefault();
    },
    uploadChange(e) {
      const file = e.target.files[0];
      this.fileTip = uploadFile(file);
    },
    click() {
      let dragBox = document.querySelector('#dragBox');
      let upload_up = dragBox.querySelector('.upload_up');
      upload_up.click();
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
.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  .icon {
    width: 200px;
    height: 250px;
    background: url('../../../public/img/upload2.png') no-repeat center;
  }
}

</style>