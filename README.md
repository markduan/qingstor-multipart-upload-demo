# Qingstor 对象存储前端分段上传 Demo

## 依赖

- axios: https://github.com/axios/axios
- 签名服务器： https://github.com/yunify?utf8=%E2%9C%93&q=signature-server&type=&language=

## 用法

```javascript
import MultiPartUpload from './qingstor-multipart-upload-demo';

const file = input.files[0];

const uploder = new MultiPartUpload(file, {
  bucket: 'mybucket',
  zone: 'pek3a'
});

uploder.send();
```

## 注意

本 Demo 只是示例代码，无法直接 import 运行，您可以参考其中的逻辑，然后将其改写到自己的项目中。
