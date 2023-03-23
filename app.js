// 工具类
const util = require('./utils/util.js');

App({
  /**
   * 全局变量
   */
  globalData: {
    user_id: null,
    category_id: 0,
    tabbarLoaded: false
  },

  // api地址
  api_root: '',
  siteInfo: require('siteinfo.js'),


  /**
   * 生命周期函数--监听小程序初始化
   */
  onLaunch: function (e) {
    // 设置api地址
    this.setApiRoot();
    // 小程序主动更新
    this.updateManager();
    // 小程序启动场景
    this.onStartupScene(e.query);
  },

  /**
   * 小程序启动场景
   */
  onStartupScene: function (query) {

  },


  onShow() {

  },


  /**
   * 设置api地址
   */
  setApiRoot: function () {
    this.api_root = this.siteInfo.siteroot;
  },

  /**
   * 执行用户登录
   */
  doLogin: function () {
    // 保存当前页面
    let pages = getCurrentPages();
    if (pages.length) {
      let currentPage = pages[pages.length - 1];
      "pages/login/login" != currentPage.route &&
        wx.setStorageSync("currentPage", currentPage);
    }
    // 跳转授权页面
    wx.navigateTo({
      url: "/pages/login/login"
    });
  },

  /**
   * 当前用户id
   */
  getUserId: function () {
    return wx.getStorageSync('user_id');
  },

  /**
   * 显示成功提示框
   */
  showSuccess: function (msg, callback) {
    wx.showToast({
      title: msg,
      icon: 'success',
      mask: true,
      duration: 1500,
      success: function () {
        callback && (setTimeout(function () {
          callback();
        }, 1500));
      }
    });
  },

  /**
   * 显示失败提示框
   */
  showError: function (msg, callback) {
    wx.showModal({
      title: '友情提示',
      content: msg,
      showCancel: false,
      success: function (res) {
        // callback && (setTimeout(function() {
        //   callback();
        // }, 1500));
        callback && callback();
      }
    });
  },

  /**
   * get请求
   */
  _get: function (url, data, success, fail, complete, check_login) {
    wx.showNavigationBarLoading();
    let App = this;
    // 构造请求参数
    data = data || {};

    // 构造get请求
    let request = function () {
      data.token = wx.getStorageSync('token');
      wx.request({
        url: App.api_root + url,
        header: {
          'content-type': 'application/json'
        },
        data: data,
        success: function (res) {
          if (res.statusCode !== 200 || typeof res.data !== 'object') {
            console.log(res);
            App.showError('网络请求出错');
            return false;
          }
          if (res.data.code === -1) {
            // 登录态失效, 重新登录
            wx.hideNavigationBarLoading();
            App.doLogin();
          } else if (res.data.code === 0) {
            App.showError(res.data.msg, function () {
              fail && fail(res);
            });
            return false;
          } else {
            success && success(res.data);
          }
        },
        fail: function (res) {
          App.showError(res.errMsg, function () {
            fail && fail(res);
          });
        },
        complete: function (res) {
          wx.hideNavigationBarLoading();
          complete && complete(res);
        },
      });
    };
    // 判断是否需要验证登录
    check_login ? App.doLogin(request) : request();
  },

  /**
   * post提交
   */
  _post_form: function (url, data, success, fail, complete) {
    let App = this;
    data.token = wx.getStorageSync('token');
    wx.showNavigationBarLoading();
    wx.request({
      url: App.api_root + url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      data: data,
      success: function (res) {
        if (res.statusCode !== 200 || typeof res.data !== 'object') {
          App.showError('网络请求出错');
          return false;
        }
        if (res.data.code === -1) {
          // 登录态失效, 重新登录
          wx.hideNavigationBarLoading();
          App.doLogin();
          return false;
        } else if (res.data.code === 0) {
          App.showError(res.data.msg, function () {
            fail && fail(res);
          });
          return false;
        }
        success && success(res.data);
      },
      fail: function (res) {
        // console.log(res);
        App.showError(res.errMsg, function () {
          fail && fail(res);
        });
      },
      complete: function (res) {
        wx.hideNavigationBarLoading();
        // wx.hideLoading();
        complete && complete(res);
      }
    });
  },

  /**
   * 验证是否存在user_info
   */
  validateUserInfo: function () {
    let user_info = wx.getStorageSync('user_info');
    return !!wx.getStorageSync('user_info');
  },

  /**
   * 对象转URL
   */
  urlEncode: function (data) {
    var _result = [];
    for (var key in data) {
      var value = data[key];
      if (value.constructor == Array) {
        value.forEach(function (_value) {
          _result.push(key + "=" + _value);
        });
      } else {
        _result.push(key + '=' + value);
      }
    }
    return _result.join('&');
  },

  /**
   * 小程序主动更新
   */
  updateManager: function () {
    if (!wx.canIUse('getUpdateManager')) {
      return false;
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，即将重启应用',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    });
  },

  /**
   * 获取tabBar页面路径列表
   */
  getTabBarLinks: function () {
    return tabBarLinks;
  },

  /**
   * 跳转到指定页面
   * 支持tabBar页面
   */
  navigationTo: function (url) {
    if (!url || url.length == 0) {
      return false;
    }
    let tabBarLinks = this.getTabBarLinks();
    // tabBar页面
    if (tabBarLinks.indexOf(url) > -1) {
      wx.switchTab({
        url: '/' + url
      });
    } else {
      // 普通页面
      wx.navigateTo({
        url: '/' + url
      });
    }
  },

});