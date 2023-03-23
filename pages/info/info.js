import Message from '../../miniprogram_npm/tdesign-miniprogram/message/index';
let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var userStr = wx.getStorageSync('user');
    if (userStr) {
      this.setData({
        user: JSON.parse(userStr)
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.getStorage({
      key: 'tabbar',
      success: res => {
        if (res && res.data.length > 0) {
          if (typeof this.getTabBar === 'function' &&
            this.getTabBar()) {
            this.getTabBar().setData({
              selected: res.data.length
            })
          }
        } else {
          if (typeof this.getTabBar === 'function' &&
            this.getTabBar()) {
            this.getTabBar().setData({
              selected: 0
            })
          }
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 登录
   */
  login(e) {
    let _this = this;
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      return false;
    }
    wx.showLoading({
      title: "正在登录",
      mask: true
    });

    // 执行微信登录
    wx.login({
      success: function (res) {
        // 发送用户信息
        App._post_form('user/login', {
          code: res.code,
          user_info: e.detail.rawData,
          encrypted_data: e.detail.encryptedData,
          iv: e.detail.iv,
          signature: e.detail.signature,
        }, function (result) {
          // 记录token user_id
          _this.setData({
            user: result
          });
          wx.setStorageSync('user', JSON.stringify(result));
          wx.setStorageSync('token', result.token);
          wx.setStorageSync('user_id', result.user_id);
          _this.setTabbars();
        }, function () {
          Message.info({
            offset: ['20rpx', 32],
            icon: 'error-circle',
            content: '登录失败',
            duration: 3000,
            closeBtn: true,
          });
        }, function () {
          wx.hideLoading();
        });
      }
    });
  },

  setTabbars() {
    let _this = this;
    App._post_form('category/tabbar', {}, function (result) {
      if (result && result.length > 0) {
        let pages = getCurrentPages()
        let rootPage = pages[0].getTabBar()
        if (rootPage) {
          var newTabs = result.map(a => {
            return {
              pagePath: "/pages/datas/list",
              text: a.title,
              id: a.id
            }
          })
          newTabs.push({
            pagePath: "/pages/info/info",
            text: "个人中心"
          })
          rootPage.setData({
            ['list']: newTabs,
            ['selected']: newTabs.length - 1
          })
        }
        wx.setStorageSync('tabbar', result);
      }
    }, null, null);
  },
  /*
   * 设置分类
   */
  setting() {
    wx.navigateTo({
      url: `/pages/setting/category`,
    });
  },

  /*
   * 反馈
   */
  feedback() {
    wx.navigateTo({
      url: '/pages/feedback/index',
    })
  },
  about() {
    wx.navigateTo({
      url: '/pages/about/version',
    })
  },
  getTemplate() {
    wx.navigateTo({
      url: '/pages/forms/index',
    })
  }
})