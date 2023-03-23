// pages/feedback/index.js

let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: ''
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

  save() {
    if (!this.data.content) {
      App.showError('请输入反馈内容');
      return false;
    }
    const param = {
      content: this.data.content,
    };
    let _this = this;
    App._post_form('feedback/save', param, function (result) {
      if (result.status) {
        App.showSuccess('提交成功', function () {
          wx.navigateBack({
            delta: 0,
          })
        });

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
})