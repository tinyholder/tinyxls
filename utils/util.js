/**
 * 工具类
 */
module.exports = {

  /**
   * scene解码
   */
  scene_decode: function(e) {
    if (e === undefined)
      return {};
    let scene = decodeURIComponent(e),
      params = scene.split(','),
      data = {};
    for (let i in params) {
      var val = params[i].split(':');
      val.length > 0 && val[0] && (data[val[0]] = val[1] || null)
    }
    return data;
  },

};