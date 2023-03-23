// pages/setting/category.js

import Dialog from 'tdesign-miniprogram/dialog/index';
import Message from '../../miniprogram_npm/tdesign-miniprogram/message/index';
let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    this.loadListing();
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
  loadListing() {
    let _this = this;
    App._post_form('category/list', {}, function (result) {
      _this.setData({
        category: result
      });
      wx.setStorageSync('category', result);
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
  detail(e) {
    wx.navigateTo({
      url: `/pages/setting/detail?id=${e.target.dataset.id}`,
    });
  },
  addField() {
    wx.navigateTo({
      url: `/pages/setting/detail?id=0`,
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
      App._post_form('category/delete', {
        id: e.target.dataset.id
      }, function (result) {
        if (result.status) {
          _this.loadListing();
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
    });
  }

})