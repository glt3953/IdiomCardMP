App({
  onLaunch() {
    // 初始化本地存储
    this.initLocalStorage();
  },

  initLocalStorage() {
    // 初始化收藏列表
    const collections = wx.getStorageSync('collections');
    if (!collections) {
      wx.setStorageSync('collections', []);
    }

    // 初始化学习进度
    const progress = wx.getStorageSync('progress');
    if (!progress) {
      wx.setStorageSync('progress', {
        totalLearned: 0,
        todayLearned: 0,
        lastLearnDate: ''
      });
    }
  },

  globalData: {
    userInfo: null
  }
})