<template>
  <div class="item">
    <h3>大文件文件上传[切片实现]</h3>
    <section class="upload_box" id="upload6">
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
import sparkMD5 from 'spark-md5';
const changeBuffer = (file) => {
    return new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            let buffer = e.target.result;
            const spark = new sparkMD5.ArrayBuffer();
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
  name: 'chunk',
  data() {
    return {
      fileTip: '可实现大文件上传',
      file: null
    }
  },
  methods: {
    uploadClick() {
      // 点击 `选择文件` 按钮, 触发upload_up上传文件按钮点击事件
      let upload = document.querySelector('#upload6');
      let upload_up = upload.querySelector('.upload_up');
      upload_up.click();
    },
    uploadChange(event) {
      let inputDom = event.target // input 本身，从这里获取 files<FileList> 
      let file = inputDom.files[0] // input 中的文件，是 FileList 对象，一个类似数组的文件组，但不是数组，可遍历
      // 判断文件是否存在
      if (!file) return;
      // 文件数据绑定
      this.fileTip = file.name;
      this.file = file;
    },
    async uploadFile() {
      let upload = document.querySelector('#upload6');
      let upload_progress = upload.querySelector('.upload_progress');
      let upload_progrees_value = upload_progress.querySelector('.progress')
      upload_progress.style.display = 'block';
      if (!this.file) {
        alert('请选择您要上传的文件~');
        return;
      }
      let chunkList = [], 
          alreadyChunkList = [], 
          maxSize = 1024 * 1024,
          maxCount = Math.ceil(this.file.size / maxSize),
          index = 0;
      const { HASH, suffix } = await this.fileHash(this.file);
      if (maxCount > 10) {
        // 如果切片数量大于最大值
        maxSize =this.file.size / 10; // 则改变切片大小
        maxCount = 10;
      }
      
      while (index < maxCount) {
        chunkList.push({
          file: this.file.slice(index * maxSize, (index + 1) * maxSize),
          filename: `${HASH}_${index + 1}.${suffix}`,
        });
        index++;
      }
      
      // 先获取已经上传的切片
      const data = await instance.post(
          '/upload_already',
          {
              HASH: HASH,
          },
          {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
          }
      );
      index = 0;

      const clear = () => {
        upload_progress.style.display = 'none';
        upload_progrees_value.style.width = '0%'
      }
      const complate = async () => {
          index++;
          upload_progress.style.display = 'block';
          upload_progrees_value.style.width = `${ (index / maxCount) * 100 }%`;
          if (index < maxCount) {
            return;
          }
          upload_progrees_value.style.width = `100%`;
          try {
            let res = await instance
              .post('/upload_merge', 
                {
                  HASH,
                  maxCount
                }, 
                {
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }
            );
            if (res.code === 0) {
              this.fileTip = '大文件切片上传成功!';
              clear();
              return;
            }
            throw data.codeText;
          } catch (error) {
            clear();
          }
      }

      const { fileList } = data;
      alreadyChunkList = fileList;
      chunkList.forEach(item => {
        if (alreadyChunkList.length > 0 && alreadyChunkList.includes(item.filename)) {
          debugger
          // 切片已经存在
          complate()
          return;
        }
        const fm = new FormData();
        fm.append('file', item.file);
        fm.append('filename', item.filename);
        instance
          .post('/upload_chunk', fm)
          .then(data => {
            if (+data.code === 0) {
              complate();
              return;
            }
            return Promise.reject(data.codeText);
          })
          .catch(() => {
            this.fileTip = '上传失败';
            clear();
          })
      });
    },



    async fileHash(file) {
      const chunks = []
      let cur = 0, size = 10 * 1024 *1024
      while (cur < file.size) { // this.file 为 e.target.files[0]
        chunks.push({ index: cur, file: file.slice(cur, cur + size)}) // 1MB/片
        cur += size
      }
      return new Promise( resolve => {
          const spark = new sparkMD5.ArrayBuffer()
          let count = 0

          const appendToSpark = async file => {
            return new Promise( resolve => {
              const reader = new FileReader()
              reader.readAsArrayBuffer(file)
              reader.onload = e => {
                spark.append(e.target.result)
                resolve()
              }
            })
          }
          const workLoop = async deadline => {
            while (count < chunks.length && deadline.timeRemaining() > 1) {
              //浏览器存在空闲时间
              await appendToSpark(chunks[count].file)
              count++
              if (count < chunks.length) {
                this.hashProgress = Number( ((100 * count) / chunks.length).toFixed(2) )
              } else {
                this.hashProgress = 100
                const HASH = spark.end();
                const suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1];
                resolve({
                  HASH,
                  suffix
                })
              }
            }
            window.requestIdleCallback(workLoop) // 给 workLoop 函数一个浏览器状态参数 deadline
          }
          window.requestIdleCallback(workLoop)   // 给 workLoop 函数一个浏览器状态参数 deadline
        })
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