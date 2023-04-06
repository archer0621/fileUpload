<template>
  <div class="item">
    <h3>单一图片上传[缩略图]</h3>
    <section class="upload_box" id="upload3">
      <input type="file" accept=".jpg,.png,.jpeg" class="upload_up" @change='uploadChange' />
      <div>
        <button class="upload_button select" @click="uploadClick">选择图片</button>
        <button class="upload_button upload" @click="uploadFile">上传</button>
      </div>
      <div class="upload_abber">
          <img
              src=""
              alt=""
          />
      </div>
    </section>
    <div class="upload_tip">{{ fileTip }}</div>
  </div>
</template>

<script>
import instance from '../../utils/instance';
import SparkMD5 from 'spark-md5';
const changeBase64 = (file) => {
    return new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (e) => {
            resolve(e.target.result);
        };
    });
};

const changeBuffer = (file) => {
    return new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            let buffer = e.target.result;
            const spark = new SparkMD5.ArrayBuffer();
            spark.append(buffer);
            const HASH = spark.end();
            const suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1];
            resolve({
                buffer,
                HASH,
                suffix,
                filename: `${HASH}.${suffix}`,
            });
        };
    });
};

export default {
  name: 'thumbnail',
  data() {
    return {
      fileTip: '图片大小不能超过2MB',
      file: null
    }
  },
  methods: {
    uploadClick() {
      // 点击 `选择文件` 按钮, 触发upload_up上传文件按钮点击事件
      let upload = document.querySelector('#upload3');
      let upload_up = upload.querySelector('.upload_up');
      upload_up.click();
    },
    async uploadChange(event) {
      let upload = document.querySelector('#upload3');
      let upload_abber = upload.querySelector('.upload_abber');
      let upload_abber_img = upload_abber.querySelector('img');
      let inputDom = event.target // input 本身，从这里获取 files<FileList> 
      let file = inputDom.files[0] // input 中的文件，是 FileList 对象，一个类似数组的文件组，但不是数组，可遍历
      // 判断图片是否存在
      if (!file) return;
      
      // 限制图片大小
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      let base64 = null;
      base64 = await changeBase64(file);
      upload_abber_img.src = base64;
      upload_abber_img.style.display = 'block';
      // 图片数据绑定
      this.fileTip = file.name;
      this.file = file;
    },
    async uploadFile() {
      if (!this.file) {
        alert('请选择您要上传的图片~');
        return;
      }
      let formData = new FormData();
      const { filename } = await changeBuffer(this.file);
      formData.append('file', this.file);
      formData.append('filename', filename);
      console.log(filename);
      instance
        .post('/upload_single_name', formData)
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