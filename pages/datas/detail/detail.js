// pages/datas/detail/detail.js

let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    catid: 0,
    date: new Date().getTime(),
    dtSetting: {
      visible: false,
      title: '',
      index: 0,
      mode: ["date"],
      date: '',
      format: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id: options.id || 0,
      catid: options.catid || 0,
      contents: [],
      dtSetting: {
        visible: false,
        title: '',
        index: 0,
        mode: ["date"],
        date: '',
        format: ''
      }
    });
    this.loadDetail();
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
    const _this = this;
    wx.getStorage({
      key: 'category',
      success: res => {
        const selectedData = res.data.filter(item => item.id == _this.data.catid);

        wx.setNavigationBarTitle({
          title: selectedData[0].title
        })
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

  loadDetail() {
    const _this = this;
    App._post_form('data/detail', {
      id: _this.data.id,
      catid: _this.data.catid
    }, function (result) {
      wx.getStorage({
        key: 'category_detail',
        success: res => {
          const catDetail = JSON.parse(res.data);
          const optionContents = catDetail.items
            .filter(a => (a.field_id == 7 || a.field_id == 8) && _this.isJSON(a.content))
            .map(a => JSON.parse(a.content))
          var bindedCatIds = []
          for (var i = 0; i < optionContents.length; i++) {
            for (var j = 0; j < optionContents[i].length; j++) {
              bindedCatIds.push(optionContents[i][j].category);
            }
          }
          bindedCatIds.push(4)
          if (bindedCatIds.length > 0) {
            App._post_form('data/listbycatids', {
              ids: bindedCatIds
            }, function (cats) {
              result.content.forEach(c => {
                if (c.field_id && (c.field_id == 7 || c.field_id == 8)) {
                  const singleOptions = catDetail.items.filter(a => a.id == c.id)[0];
                  if (_this.isJSON(singleOptions.content)) {
                    var tmpIds = []
                    var tmpOptionContents = JSON.parse(singleOptions.content)
                    for (var i = 0; i < tmpOptionContents.length; i++) {
                      tmpIds.push(tmpOptionContents[i].category)
                    }
                    c['options'] = cats.filter(a => tmpIds.indexOf(a.category_id) > -1).map(opt => {
                      return {
                        label: opt.content[0].content,
                        value: JSON.stringify({
                          id: opt.id,
                          content: opt.content[0].content
                        }),
                        disabled: false,
                      }
                    })
                  } else {
                    c['options'] = singleOptions.content.split("\n").map(opt => {
                      return {
                        label: opt,
                        value: opt,
                        disabled: false,
                      }
                    })
                  }
                }
                if (c.field_id && c.field_id == 7) {
                  if (c.content) {
                    if (_this.isJSON(c.content)) {
                      var tmp = typeof c.content == 'object' ? JSON.parse(JSON.stringify(c.content)) : JSON.parse(c.content)
                      c['content'] = tmp
                      c['showContent'] = tmp.content
                    } else {
                      c['content'] = c.content
                      c['showContent'] = c.content
                    }
                  } else {
                    c['content'] = []
                  }
                }
                if (c.field_id && c.field_id == 8) {
                  if (c.content) {
                    if (_this.isJSON(c.content)) {
                      var tmp = typeof c.content == 'object' ? JSON.parse(JSON.stringify(c.content)) : JSON.parse(c.content)
                      c['content'] = tmp
                      if (tmp.length && tmp.length > 0) {
                        c['showContent'] = tmp.map(a => {
                          return _this.isJSON(a) ? JSON.parse(a).content : a
                        })
                      } else {
                        c['showContent'] = tmp.content
                      }
                    } else {
                      c['content'] = c.content
                      c['showContent'] = c.content
                    }
                  } else {
                    c['content'] = []
                  }
                }
              });
              _this.setData({
                ['contents']: result.content
              })
            })
          } else {
            result.content.forEach(c => {
              if (c.field_id && (c.field_id == 7 || c.field_id == 8)) {
                const singleOptions = catDetail.items.filter(a => a.id == c.id)[0];
                if (!_this.isJSON(singleOptions.content)) {
                  c['options'] = singleOptions.content.split("\n").map(opt => {
                    return {
                      label: opt,
                      value: opt,
                      disabled: false,
                    }
                  })
                }
              }
              if (c.field_id && (c.field_id == 7 || c.field_id == 8)) {
                if (c.content) {
                  if (_this.isJSON(c.content)) {
                    var tmp = typeof c.content == 'object' ? JSON.parse(JSON.stringify(c.content)) : JSON.parse(c.content)
                    c['content'] = tmp
                  } else {
                    c['content'] = c.content
                  }
                } else {
                  c['content'] = []
                }
              }
            });
            _this.setData({
              ['contents']: result.content
            })
          }
        }
      });
    }, null, null);

  },
  /*
  保存数据
  */
  save() {
    const _this = this;
    var errMsg = [];
    for (var i = 0; i < _this.data.contents.length; i++) {
      if (_this.data.contents[i].allow_empty == 0 && _this.data.contents[i].content == '') {
        errMsg.push(_this.data.contents[i].title);
      }
    }
    if (errMsg.length > 0) {
      App.showError(`"${errMsg.join("、")}"不能为空`);
      return;
    }

    const param = {
      id: parseInt(_this.data.id),
      category: parseInt(_this.data.catid),
      content: JSON.stringify(_this.data.contents.map(item => {
        return {
          id: item.id,
          content: item.content
        }
      })),
      is_active: 1
    }
    App._post_form('data/save', param, function (result) {
      if (result.status) {
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
  textValueChanged: function (e) {
    const idx = e.target.dataset.idx
    this.data.contents[idx].content = e.detail.value
    this.setData({
      ['contents']: this.data.contents
    })
  },
  handleCalendar: function (e) {
    var dateStr = this.getDateString(new Date(), e.target.dataset.format);
    if (isNaN(e.target.dataset.value) && !isNaN(Date.parse(e.target.dataset.value))) {
      dateStr = e.target.dataset.value;
    }
    console.log(dateStr)
    this.setData({
      ['dtSetting']: {
        visible: true,
        title: e.target.dataset.title,
        index: e.target.dataset.idx,
        mode: e.target.dataset.mode.split(","),
        date: dateStr,
        format: e.target.dataset.format
      }
    });
  },
  hideDTPicker: function () {
    this.setData({
      ['dtSetting']: {
        visible: false,
        title: '',
        index: 0,
        mode: ["date"],
        date: '',
        format: ''
      }
    });
  },
  handleDTPickerConfirm: function (e) {
    const {
      value,
      formatValue
    } = e === null || e === void 0 ? void 0 : e.detail;
    const idx = e.target.dataset.idx
    this.data.contents[idx].content = formatValue
    this.setData({
      ['contents']: this.data.contents,
      ['dtSetting']: {
        visible: false,
        title: '',
        index: 0,
        mode: ["date"],
        date: '',
        format: ''
      }
    })
  },
  handleSingleSelect(e) {
    const idx = e.target.dataset.idx
    var singleSelector = this.selectComponent("#singleSelect_" + idx);
    this.data.contents[idx].content = e.detail.value
    this.data.contents[idx].showContent = this.isJSON(e.detail.value) ? JSON.parse(e.detail.value).content : e.detail.value
    this.setData({
      ['contents']: this.data.contents
    })
    singleSelector.data.bar.setData({
      activeIdx: -1,
    });
    singleSelector.setData({
      show: false,
    });
  },
  handleMultipleSelect(e) {
    const _this = this
    const idx = e.target.dataset.idx
    this.data.contents[idx].content = e.detail.value
    this.data.contents[idx].showContent = e.detail.value.map(a => {
      return _this.isJSON(a) ? JSON.parse(a).content : a
    })
    this.setData({
      ['contents']: this.data.contents
    })
  },
  isJSON(str) {
    if (typeof str == 'string' || typeof str == "object") {
      try {
        var obj = typeof str == "object" ? (JSON.parse(JSON.stringify(str))) : JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
    if (typeof str == "object") {
      return true;
    }
    return false;
  },
  getDateString(date, format) {
    var o = {
      "M+": date.getMonth() + 1, // month
      "D+": date.getDate(), // day
      "d+": date.getDate(), // day
      "H+": date.getHours(), // hour
      "h+": date.getHours(), // hour
      "m+": date.getMinutes(), // minute
      "s+": date.getSeconds(), // second
      "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
      "S": date.getMilliseconds()
    }
    if (/(Y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + "")
        .substr(4 - RegExp.$1.length));
    }
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + "")
        .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return format;
  }
})