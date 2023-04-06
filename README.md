## 文件上传的几种实现方式

### 1. Form-Data方式上传

主要使用form表单方式实现文件上传

~~~javascript
let formData = new FormData();
console.log(this.file);
formData.append('file', this.file);
formData.append('filename', this.file.name);
instance.post('/upload_single', formData).then(res => {
    if (+res.code === 0) {
        this.fileTip = '图片上传成功!'
        return;
    }
    return Promise.reject(res.codeText);
}).catch(err => {
    console.log(err);
})
~~~

### 2. BASE64方式上传

使用FildReader获取文件的base64，将其上传

~~~javascript
let base64 = await changeBase64(that.file);
try {
    const data = await instance
        .post('/upload_single_base64', {
            file: encodeURIComponent(base64), // 防止乱码
            filename: that.file.name
        },{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
    const { code } = data;
    if (code === 0) {
        this.fileTip = '文件上传成功!';
    }
    throw data.codeText; // 抛出异常
} catch (error) {
	console.log(error);
}
~~~

### 3. 文件缩略图显示，文件hash获取

根据文件内容展示缩略图(主要用于图片)，根据内容获取hash值判断后端是否存在该文件，节省上传时间

~~~javascript
// 获取文件hash值
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
// 展示缩略图
let base64 = await changeBase64(file);
upload_abber_img.src = base64;
~~~

### 4. 文件上传进度条实现

展示文件上传进度

~~~javascript
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
~~~

### 5. 文件拖拽上传

使用原生JS事件 `dragenter` 、`drop` 、`dragover` 实现

~~~javascript
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
~~~

### 6. 大文件切片上传

- 首先确定上传规模数量，判断当前文件可以切出多少切片，
- 利用Bole.prototype.slice() 方法对文件进行切片并且对每个文件片作唯一标识(HASH)，
- 从服务器获取已经上传的切片，判断切片是否存在
- 将切片全部上传后，后端进行合并处理

~~~javascript
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
~~~

