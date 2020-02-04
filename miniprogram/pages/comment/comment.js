// pages/comment/comment.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    comment: '',    // 评价的内容
    score: 5,       // 评分
    images: [],     // 评论中上传的图片
    fileIds: [],    // 将文件id存储到数据库中
    movieid: -1
  },

  // 发布评论
  submit:function(){
    wx.showLoading({
      title: '发布中',
    })
    // 图片上传云存储
    let promiseArr = [];
    for(let i = 0;i < this.data.images.length;i++){
      promiseArr.push(new Promise((reslove,reject)=>{
        let path = this.data.images[i];
        let suffix = /\.\w+$/.exec(path)[0];      // 文件的后缀名的正则表达式
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix,
          filePath: path,
          success: res =>{
            console.log(res.fileID); // 返回相关的fileID
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            })
            reslove();
          },
          fail: console.error
        })
      }))

      // 将多张照片上传云存储后执行插入数据库操作
      Promise.all(promiseArr).then(res =>{
        db.collection('comment').add({
          data: {
            comment: this.data.comment,
            score: this.data.score,
            movieid: this.data.movieid,
            fileIds: this.data.fileIds
          }
        }).then(res =>{
          wx.hideLoading();
          console.log('评论数据插入成功',res);
          wx.showToast({
            title: '发布成功',
          })
        }).catch(err =>{
          wx.hideLoading();
          console.error(err);
          wx.showToast({
            title: '发布失败',
          })
        })
      })
    }
  },

  // 评论改变时
  onCommentChange:function(event){ 
    this.setData({
      comment: event.detail
    })
  },

  // 评分改变时
  onScoreChange:function(event){
    console.log('评分', event);
    this.setData({
      score:event.detail
    })
  },

  // 上传图片
  uploadImg:function(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success: res =>{
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        this.setData({
          images:this.data.images.concat(tempFilePaths)
        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      movieid: options.movieid
    })
    wx.cloud.callFunction({
      name: 'getdetail',
      data: {
        movieid: options.movieid
      }
    }).then(res =>{
      console.log(res);
      this.setData({
        detail: JSON.parse(res.result)
      })
    })
    .catch(err =>{
      console.error(err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})