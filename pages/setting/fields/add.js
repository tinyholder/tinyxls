// pages/setting/fields/add.js

import Message from '../../../miniprogram_npm/tdesign-miniprogram/message/index';
let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    category_id: 0,
    title: '',
    content: "",
    categoryContent: null,
    fields: [],
    otherCategories: [],
    is_list: 0,
    is_allow_empty: 0,

    selectedFieldType: {
      value: 1,
      text: ''
    },
    pickerVisible: false,
    radioVisible: false,
    radioValue: "1"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadFields();
    this.loadOtherCategories();
    this.setData({
      category_id: options.catid,
      id: options.id || 0,
    });
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
  onChangeList() {
    this.setData({
      is_list: this.data.is_list == 1 ? 0 : 1
    });
  },
  onChangeAllowEmpty() {
    this.setData({
      is_allow_empty: this.data.is_allow_empty == 1 ? 0 : 1
    });
  },

  save() {
    if (!this.data.title) {
      App.showError(`名称不能为空`);
      return;
    }
    var _content = this.data.content;
    if ((this.data.selectedFieldType.value == 7 || this.data.selectedFieldType.value == 8) && this.data.radioValue == "2") {
      _content = JSON.stringify(this.data.categoryContent);
    }
    const param = {
      id: this.data.id,
      category_id: this.data.category_id,
      title: this.data.title,
      field_id: this.data.selectedFieldType.value,
      content: _content,
      is_list: this.data.is_list,
      is_allow_empty: this.data.is_allow_empty
    };
    let _this = this;
    if (this.data.category_id > 0) {
      // 提交到api
      App._post_form('categoryField/save', param, function (result) {
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
    } else {
      // 临时保存
      var listing = wx.getStorageSync('settingFields') || []
      if (JSON.stringify(listing).indexOf(JSON.stringify(param)) > -1) {
        return
      }
      param.id = -1 - listing.length
      param.field = _this.data.fields.filter(a => a.value == param.field_id)[0].label
      listing.push(param)
      wx.setStorageSync('settingFields', listing)
      wx.navigateBack({
        delta: 0,
      })
    }
  },

  loadCategoryField() {
    if (!this.data.id) {
      return;
    }
    let _this = this;
    App._post_form('categoryField/detail', {
      id: _this.data.id
    }, function (result) {
      _this.setData({
        title: result.title,
        is_list: result.is_list,
        is_allow_empty: result.is_allow_empty,
        selectedFieldType: {
          value: result.field_id,
          text: _this.data.fields.filter(a => parseInt(a.value) == result.field_id)[0].label
        },
        content: result.content
      });
      if (result.field_id == 7 || result.field_id == 8) {
        if (_this.isJSON(result.content)) {
          _this.setData({
            radioVisible: true,
            radioValue: "2",
            categoryContent: JSON.parse(result.content),
            content: ''
          });
        } else {
          _this.setData({
            radioVisible: true,
            radioValue: "1"
          });
        }
      }
      wx.setStorageSync('category', result);
    }, null, null);
  },

  loadFields() {
    let _this = this;
    App._post_form('field/list', {}, function (result) {
      _this.setData({
        fields: result.map(item => {
          return {
            label: item.name,
            value: item.id
          }
        }),
        selectedFieldType: {
          value: result[0].id,
          text: result[0].name
        }
      });
      _this.loadCategoryField();
    }, null, null);
  },

  loadOtherCategories() {
    let _this = this;
    App._post_form('category/list', {}, function (result) {
      if (result && result.length > 0) {
        _this.setData({
          otherCategories: result.filter(a => a.id != _this.data.category_id).map(item => {
            return {
              label: item.title,
              value: item.id
            }
          })
        });
      }
    }, null, null);
  },

  onClickPicker() {
    this.setData({
      pickerVisible: true,
    });
  },
  onPickerChange(e) {},
  onPicker1Confirm(e) {
    this.setData({
      radioVisible: e.detail.value[0].value == 7 || e.detail.value[0].value == 8,
    });

    this.setData({
      pickerVisible: false,
      selectedFieldType: {
        value: e.detail.value[0].value,
        text: e.detail.value[0].label
      }
    });
  },
  onPicker1Cancel() {
    this.setData({
      pickerVisible: false,
    });
  },
  onRadioChange(e) {
    this.setData({
      radioValue: e.detail.value
    });
  },
  onCategoryRadioChange(e) {
    this.setData({
      categoryContent: JSON.parse('[{"category":' + e.detail.value + '}]')
    });
  },
  selectionCancel() {
    this.setData({
      radioVisible: false
    });
  },
  selectionConfirm () {
    this.setData({
      radioVisible: false
    });
  },

  isJSON(str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }
})