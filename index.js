import axios from 'axios';

import utils from './utils';
import sender from './sender';

const defaultChunkSize = 10 * 1024 * 1024;

// config format
// {
//   bucket: <bucket name>,
//   zone: <pek3a>, <sh1a> ...,
// }
export default class MultiPartUpload {
  constructor(file, config = {}) {
    this.file = file;
    this.name = file.name;
    this.contentType = utils.getContentType(this.file);
    this.position = 0;

    this.fileChunks = this.getFileChunks();
    this.partNumber = 0;

    this.config = config;
  }

  send() {
    return this.initMultipartUpload().then(() => {
      return this.uploadChunks();
    }).then(() => {
      return this.completeMultipartUpload();
    });
  }

  // init multipart upload
  initMultipartUpload() {
    const dateUTC = new Date().toUTCString();

    return utils.getRequestSign({
      method: 'post',
      uri: `/${this.config.bucket}/${this.name}?uploads`,
      contentType: utils.getContentType(this.file),
      XQSDate: dateUTC,
    }).then((result) => {
      return axios({
        method: 'post',
        url: `https://${this.config.bucket}.${this.config.zone}.qingstor.com/${this.name}?uploads`,
        headers: {
          Authorization: result.auth,
          'X-QS-Date': dateUTC,
          'Content-Type': this.contentType,
        },
      });
    }).then((response) => {
      this.uploadId = response.data.upload_id;

      return Promise.resolve();
    });
  }

  uploadChunks() {
    const { done, value: chunk } = this.fileChunks.next();

    if (done) {
      return Promise.resolve();
    }

    chunk.name = this.name;

    return this.uploadSingleChunk(chunk, this.partNumber).then(() => {
      this.partNumber += 1;

      return this.uploadChunks();
    });
  }

  uploadSingleChunk(chunk, partNumber) {
    return sender({
      file: chunk,
      method: 'put',
      params: {
        upload_id: this.uploadId,
        part_number: partNumber,
      },
    });
  }

  completeMultipartUpload() {
    const dateUTC = new Date().toUTCString();

    return utils.getRequestSign({
      method: 'post',
      uri: `/${this.config.bucket}/${this.name}?upload_id=${this.uploadId}`,
      XQSDate: dateUTC,
      contentType: 'application/json',
    }).then((result) => {
      return axios({
        method: 'post',
        url: `https://${this.config.bucket}.${this.config.zone}.qingstor.com/${this.name}?upload_id=${this.uploadId}`,
        headers: {
          Authorization: result.auth,
          'X-QS-Date': dateUTC,
          'Content-Type': 'application/json',
        },
        data: {
          object_parts: Array.from(Array(this.partNumber).keys()).map((partNumber) => {
            return { part_number: partNumber };
          }),
        },
      });
    });
  }

  * getFileChunks() {
    while (this.position + defaultChunkSize < this.file.size) {
      yield this.file.slice(this.position, this.position + defaultChunkSize);
      this.position += defaultChunkSize;
    }

    yield this.file.slice(this.position, this.file.size);
  }
}
