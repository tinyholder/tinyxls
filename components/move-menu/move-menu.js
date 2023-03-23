// components/move-menu/move-menu.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mainModel: {
      type: Object,
      value: {}
    },
    menulist: {
      type: Object,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showmenus: true,
    x: 0,
    y: 0,
    position: 2,
    mainSize: {
      width: 0,
      height: 0
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showclick: function (e) {
      var _this = this;
      let isshow = !this.data.showmenus;
      // if (!isshow) {
      //   if ((_this.data.mainSize.width + 8) * _this.properties.menulist.length < e.detail.x) {
      //     console.log('left')
      //   } else {
      //     console.log('right')
      //   }
      // }
      _this.setData({
        ['showmenus']: isshow
      })
    },
    itemclick: function (e) {
      this.showclick();
      let info = e.currentTarget.dataset.item;
      if (info) {
        this.triggerEvent('menuItemClick', {
          "iteminfo": info
        })
      }
    }
  },

  lifetimes: {
    attached: function () {
      var _this = this;
      wx.getSystemInfo({
        success: (result) => {
          _this.setData({
            ['x']: result.windowWidth,
            ['y']: result.windowHeight
          })
        },
      });
      var obj = wx.createSelectorQuery().in(this);
      obj.selectAll('.vMenuMain').boundingClientRect();
      obj.exec(function (rect) {
        if (rect && rect.length > 0) {
          _this.setData({
            ['mainSize']: {
              ['width']: rect[0][0].width,
              ['height']: rect[0][0].height
            }
          });
        }
      });
    }

  }
})