import axios from 'axios';

import utils from './utils';

// config format
// {
//   file: file,
//   method: 'put' or 'post',
//   bucket: <your bucket name>,
//   zone: <pek3a>, <sh1a> ...,
//   params: <query params>
// }
export default function sender(config) {
  const dateUTC = new Date().toUTCString();
  const name = config.file.name;

  return utils.getRequestSign({
    method: config.method || 'put',
    uri: `/${config.bucket}/${name}`,
    contentType: utils.getContentType(config.file),
    XQSDate: dateUTC,
    params: config.params || {},
  }).then((result) => {
    let url = `https://${config.bucket}.${config.zone}.qingstor.com/${name}`;
    const query = utils.buildQueryString(config.params || {});
    if (query) {
      url += `?${query}`;
    }

    return utils.uploadFile({
      method: config.method || 'put',
      url: url,
      auth: result.auth,
      XQSDate: dateUTC,
      file: config.file,
    })
  });
}
