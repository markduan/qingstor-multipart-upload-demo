import axios from 'axios';

export default {
  /**
   * get request signautre
   * @param  {Object} requestParams: an object contain `method`, `url`, `file`, `XQSDate`
   * @return {signature object} for example:
   * {auth: 'QS PJLIISKSZHBNHMFSAKSZ:sHxc8wWY0OxOJVHVS3ymDvQjZrzvNMuv6A='}
   */
  getRequestSign: (requestParams) => {
    // const paramsTosign = {
    //   uri: requestParams.uri,
    //   method: requestParams.method.toUpperCase(),
    //   headers: {
    //     'Content-Type': requestParams.contentType,
    //     'X-QS-Date': requestParams.XQSDate,
    //     // sdk bug, this header maybe unnecessary later
    //     'Date': '',
    //   },
    //   params: requestParams.params,
    // };

    // return requestMySignServer(paramsTosign);

    throw("Please send this request to your signature server");
  },

  /**
   * upload file or blob
   * @param  {Object} config: `method`, `url`, `auth`, `XQSDate`, `file`
   * @return {Promise} axios instance
   *
   * TODO: add retry support
   */
  uploadFile: (config) => {
    return axios({
      method: config.method,
      url: config.url,
      headers: {
        Authorization: config.auth,
        'X-QS-Date': config.XQSDate,
        'Content-Type': utils.getContentType(config.file),
      },
      data: config.file,
    });
  },

  // get the Content-Type of file or blob
  // return `application/oct-stream` for other cases
  getContentType: (file) => {
    if (file instanceof File) {
      return file.type;
    }

    return 'application/oct-stream';
  },

  buildQueryString: function(param) {
    return Object.keys(param).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
    }).join('&');
  },
}
