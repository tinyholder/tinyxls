// pages/datas/list.js

import Dialog from 'tdesign-miniprogram/dialog/index';
import Message from '../../miniprogram_npm/tdesign-miniprogram/message/index';
let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    category_id: 0,
    category: null,
    page: 1,
    isLoading: false,
    list: [],
    filtering: false,
    menulist: [{
        "id": "1",
        "title": "筛选",
      },
      {
        "id": "2",
        "title": "添加",
      },
    ],
    mainmodel: {
      "title": "菜单",
    },
    dtSetting: {
      visible: false,
      title: '',
      id: 0,
      mode: ["date"],
      date: '',
      format: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const catid = App.globalData.category_id;
    wx.getStorage({
      key: 'tabbar',
      success: res => {
        const selectedData = res.data.filter(item => item.id == catid);
        const idx = res.data.indexOf(selectedData[0]);
        if (typeof this.getTabBar === 'function' &&
          this.getTabBar()) {
          this.getTabBar().setData({
            selected: idx
          })
        }
      }
    });
    this.loadCategory();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      list: [],
      isLoading: false
    });
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
    var param = {
      id: App.globalData.category_id
    };
    var isSearching = false;
    for (var i = 0; i < this.data.category.items.length; i++) {
      var _item = this.data.category.items[i]
      if (_item.value) {
        param['_' + _item.id] = _item.value;
        isSearching = true;
      }
    }
    if (isSearching) {
      this.loadDatas(param);
    } else {
      this.loadDatas(null);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  loadCategory() {
    let _this = this;

    App._post_form('category/detail', {
      id: App.globalData.category_id
    }, function (result) {
      wx.setNavigationBarTitle({
        title: result.title
      })
      _this.setData({
        category: result,
        isLoading: false,
        page: 1
      });
      _this.loadDatas(null);
      wx.setStorageSync('category_detail', JSON.stringify(result));
    }, null, null);

  },
  loadDatas(params) {
    let _this = this;
    if (_this.data.isLoading) {
      return;
    }
    _this.setData({
      isLoading: true
    });
    if (!_this.data.list || _this.data.page == 1) {
      _this.setData({
        list: [],
        isLoading: false
      });
    }
    var _param = params ? {
      id: App.globalData.category_id,
      page: _this.data.page,
      keywords: JSON.stringify(params)
    } : {
      id: App.globalData.category_id,
      page: _this.data.page
    };
    App._post_form('data/list', _param, function (result) {
      _this.setData({
        isLoading: result.length < 20,
        page: _this.data.page + 1,
        list: _this.data.list.concat(result.map(item => {
          item.content = item.content;
          var idx = 0;
          for (var i = 0; i < item.content.length; i++) {
            const field = _this.data.category.items.filter(a => a.id == item.content[i].id)[0];
            if (!field || field.is_list !== 1) continue;
            if (idx == 0) {
              item.title = field.title + ": " + item.content[i].content
            } else {
              if (!item.desc) {
                item.desc = "";
              }
              item.desc += field.title + ": " + item.content[i].content + "\r\n";
            }
            idx++;
          }
          if (!item.title && item.content.length > 0) {
            const field = _this.data.category.items.filter(a => a.id == item.content[0].id)[0];
            item.title = field.title + ": " + item.content[0].content
          }
          return item;
        }))
      });
    }, function () {
      Message.info({
        offset: ['20rpx', 32],
        icon: 'error-circle',
        content: '获取失败',
        duration: 3000,
        closeBtn: true,
      });
    }, null);
  },
  detail: function (e) {
    wx.navigateTo({
      url: `/pages/datas/detail/detail?id=${e.target.dataset.id}&catid=${App.globalData.category_id}`,
    });
  },

  menuItemClick: function (res) {
    let clickInfo = res.detail.iteminfo
    if (parseInt(clickInfo.id) == 1) {
      // 筛选
      this.setData({
        filtering: true
      });
    } else if (parseInt(clickInfo.id) == 2) {
      wx.navigateTo({
        url: `/pages/datas/detail/detail?id=0&catid=${App.globalData.category_id}`,
      });
    }
  },
  onVisibleChange({
    detail
  }) {
    const {
      visible
    } = detail;
    this.setData({
      filtering: visible
    });
  },

  /*验证输入*/
  onNumberInput(e) {
    var numberError = (this.data.category.items.filter(a => a.id === e.target.dataset.id)[0]).error || false;
    const isNumber = /^\d+(\.\d+)?$/.test(e.detail.value);
    if (numberError === isNumber) {
      this.setData({
        ['category.items']: this.data.category.items.map(item => {
          if (item.id === e.target.dataset.id) {
            item.error = !isNumber;
          }
          return item
        })
      });
    }
    if (isNumber) {
      this.setData({
        ['category.items']: this.data.category.items.map(item => {
          if (item.id === e.target.dataset.id) {
            item.value = e.detail.value
          }
          return item
        })
      });
    }
  },
  onTextInput(e) {
    this.setData({
      ['category.items']: this.data.category.items.map(item => {
        if (item.id === e.target.dataset.id) {
          item.value = e.detail.value
        }
        return item
      })
    });
  },
  cancelSearch() {
    this.setData({
      filtering: false
    });
  },
  search() {
    const _this = this;
    var param = {
      id: App.globalData.category_id
    };
    var isSearching = false;
    for (var i = 0; i < this.data.category.items.length; i++) {
      var _item = this.data.category.items[i]
      if (_item.value) {
        param['_' + _item.id] = _item.value;
        isSearching = true;
      }
    }
    _this.setData({
      page: 1,
      list: [],
      isLoading: false
    });
    if (isSearching) {
      _this.loadDatas(param);
    } else {
      _this.loadDatas(null);
    }

    this.setData({
      filtering: false
    });
  },
  handleCalendar: function (e) {
    this.setData({
      ['dtSetting']: {
        visible: true,
        title: e.target.dataset.title,
        id: e.target.dataset.id,
        mode: e.target.dataset.mode.split(","),
        date: e.target.dataset.value,
        format: e.target.dataset.format
      }
    });
  },
  handleDTPickerConfirm: function (e) {
    const {
      value,
      formatValue
    } = e === null || e === void 0 ? void 0 : e.detail;
    const _this = this;
    this.setData({
      ['category.items']: _this.data.category.items.map(item => {
        if (item.id === e.target.dataset.id) {
          item.value = formatValue
        }
        return item
      }),
      ['dtSetting']: {
        visible: false,
        title: '',
        id: 0,
        mode: ["date"],
        date: '',
        format: ''
      }
    })
  },
  hideDTPicker: function (e) {
    const _this = this;
    this.setData({
      ['category.items']: _this.data.category.items.map(item => {
        if (item.id === e.target.dataset.id) {
          item.value = ''
        }
        return item
      }),
      ['dtSetting']: {
        visible: false,
        title: '',
        id: 0,
        mode: ["date"],
        date: '',
        format: ''
      }
    })
  },
})