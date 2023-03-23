// pages/setting/detail.js
import Dialog from 'tdesign-miniprogram/dialog/index';
import Message from '../../miniprogram_npm/tdesign-miniprogram/message/index';
let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    title: '',
    is_active: 1,
    is_tabbar: 0,
    is_unique: 0,
    tabEnable: false,
    items: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var id = options && options.id ? options.id : App.globalData.category_id
    this.setData({
      id: id
    });
    //if (!options || !options.id) {
    //this.loadCategoryField();
    //}
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
    this.loadCategoryField();
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
    wx.removeStorage({
      key: 'settingFields',
    })
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

  loadCategoryField() {
    let _this = this;
    wx.getStorage({
      key: 'tabbar',
      success: res => {
        _this.setData({
          ['tabEnable']: !(res && res.data && res.data.length > 0 && res.data.filter(a => a.id != _this.data.id).length >= 3)
        })
      },
      fail: () => {
        _this.setData({
          ['tabEnable']: true
        })
      }
    })

    if (this.data.id <= 0) {
      wx.getStorage({
        key: 'settingFields',
        success: res => {
          _this.setData({
            ['items']: res.data
          })
        }
      })
      return
    };
    App._post_form('category/detail', {
      id: _this.data.id
    }, function (result) {
      _this.setData({
        title: result.title,
        is_active: result.is_active,
        is_tabbar: result.is_tabbar,
        is_unique: result.is_unique,
        items: result.items
      });
    }, function () {
      Message.info({
        offset: ['20rpx', 32],
        icon: 'error-circle',
        content: '获取失败',
        duration: 3000,
        closeBtn: true,
      });
    }, function () {
      wx.hideLoading();
    });
  },

  addField() {
    wx.navigateTo({
      url: `/pages/setting/fields/add?catid=${this.data.id}`,
    });
  },

  editField(e) {
    wx.navigateTo({
      url: `/pages/setting/fields/add?catid=${this.data.id}&id=${e.target.dataset.id}`,
    });
  },

  reviewDetail(e) {
    App.globalData.category_id = this.data.id
    wx.navigateTo({
      url: `/pages/datas/review?catid=${this.data.id}`,
    });
  },

  onDelete(e) {
    let _this = this;
    Dialog.confirm({
      title: '提示',
      content: '确定删除吗？',
      confirmBtn: '确认',
      cancelBtn: '取消',
    }).then(() => {
      if (this.data.id <= 0) {
        var listing = wx.getStorageSync('settingFields')
        let exs = listing.filter(a => a.id == e.target.dataset.id)
        if (exs && exs.length > 0) {
          let idx = listing.indexOf(exs[0])
          if (idx > -1) {
            listing.splice(idx, 1)
            wx.setStorageSync('settingFields', listing)
            _this.loadCategoryField();
          }
        }
      } else {
        App._post_form('categoryField/delete', {
          id: e.target.dataset.id
        }, function (result) {
          if (result.status) {
            _this.loadCategoryField();
          } else {
            Message.info({
              offset: ['20rpx', 32],
              icon: 'error-circle',
              content: result.message,
              duration: 3000,
              closeBtn: true,
            });
          }
        }, null, null);
      }
    });
  },

  onChangeTabbar() {
    this.setData({
      is_tabbar: this.data.is_tabbar == 1 ? 0 : 1
    });
  },
  onChangeUnique() {
    this.setData({
      is_unique: this.data.is_unique == 1 ? 0 : 1
    });
  },
  onChangeActive() {
    this.setData({
      is_active: this.data.is_active == 1 ? 0 : 1
    });
  },
  save() {
    if (!this.data.title) {
      App.showError(`标题不能为空`);
      return;
    }
    const param = {
      id: this.data.id,
      title: this.data.title,
      is_tabbar: this.data.is_tabbar,
      is_active: this.data.is_active,
      is_unique: this.data.is_unique,
      items: JSON.stringify(this.data.items)
    };
    let _this = this;
    App._post_form('category/save', param, function (result) {
      if (result.status) {
        wx.getStorage({
          key: 'tabbar',
          success: res => {
            let pages = getCurrentPages()
            let rootPage = pages[0].getTabBar()
            if (res && res.data && res.data.length > 0) {
              if (_this.data.is_tabbar > 0) {
                if (res.data.filter(a => a.id == result.data).length == 0) {
                  res.data.push({
                    id: result.data,
                    title: _this.data.title
                  })
                  if (rootPage) {
                    var newTabs = res.data.map(a => {
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
                      ['list']: newTabs
                    })
                  }
                }
              } else {
                if (res.data.filter(a => a.id == result.data).length > 0) {
                  let tmpData = res.data.filter(a => a.id == result.data)[0]
                  let idx = res.data.indexOf(tmpData)
                  res.data.splice(idx, 1)

                  if (rootPage) {
                    var oldTabs = rootPage.data.list
                    let tmpTab = oldTabs.filter(a => a.id == result.data)[0]
                    let tmpIdx = oldTabs.indexOf(tmpTab)
                    oldTabs.splice(tmpIdx, 1)
                    rootPage.setData({
                      ['list']: oldTabs
                    })
                  }
                }
              }
            } else {
              res.data = []
              res.data.push({
                id: result.data,
                title: _this.data.title
              })
              if (rootPage) {
                rootPage.setData({
                  ['list']: [{
                    pagePath: "/pages/datas/list",
                    text: _this.data.title,
                    id: result.data
                  }, {
                    pagePath: "/pages/info/info",
                    text: "个人中心"
                  }]
                })
              }
            }
            wx.setStorageSync('tabbar', res.data);
          }
        })

        wx.navigateBack({
          delta: 0,
        })
      } else {
        Message.info({
          offset: ['20rpx', 32],
          icon: 'error-circle',
          content: result.message,
          duration: 3000,
          closeBtn: true,
        });
      }

    }, null, null);
  },
})