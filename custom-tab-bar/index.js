// pages/customer-tab-bar/index.js
let App = getApp();

Component({
  data: {
    loadedTabbar: false,
    selected: null,
    color: "#000",
    selectedColor: "#202737",
    list: [{
      pagePath: "/pages/datas/list",
      text: "分类",
      id: 1
    }, {
      pagePath: "/pages/info/info",
      text: "个人中心"
    }]
  },
  attached() {
    var userStr = wx.getStorageSync('user');
    if (!userStr) {
      wx.setStorageSync('tabbar', []);
      this.setData({
        ['loadedTabbar']: true,
        ['list']: [{
          pagePath: "/pages/info/info",
          text: "个人中心"
        }]
      });
      return
    }
    if (!App.globalData.tabbarLoaded) {
      let _this = this;
      App._post_form('category/tabbar', {}, function (result) {
        if (result && result.length > 0) {
          _this.setData({
            ['loadedTabbar']: true,
            ['selected']: result.length,
            ['list']: result.map(item => {
              return {
                pagePath: "/pages/datas/list",
                text: `${item.title}`,
                id: item.id
              }
            }).concat({
              pagePath: "/pages/info/info",
              text: "个人中心"
            })
          });
          wx.setStorageSync('tabbar', result);
          App.globalData.tabbarLoaded = true
        } else {
          _this.setData({
            ['loadedTabbar']: true,
            ['list']: {
              pagePath: "/pages/info/info",
              text: "个人中心"
            }
          });
        }
      }, null, null);
    } else {
      wx.getStorage({
        key: 'tabbar',
        success: res => {
          this.setData({
            ['loadedTabbar']: true,
            ['list']: res.data.map(item => {
              return {
                pagePath: "/pages/datas/list",
                text: `${item.title}`,
                id: item.id
              }
            }).concat({
              pagePath: "/pages/info/info",
              text: "个人中心"
            })
          });
        },
        fail: () => {
          wx.setStorageSync('tabbar', []);
          this.setData({
            ['loadedTabbar']: true,
            ['list']: [{
              pagePath: "/pages/info/info",
              text: "个人中心"
            }]
          });
        }
      });
    }
  },
  methods: {

    setPath(e) {
      App.globalData.category_id = e.currentTarget.dataset.id;
      wx.switchTab({
        url: e.currentTarget.dataset.path,
        success: function (e) {
          var page = getCurrentPages().pop();
          if (App.globalData.category_id && page) {
            page.onHide();
            page.onShow();
          }
        }
      });
      this.setData({
        selected: null
      });
    }
  }
})