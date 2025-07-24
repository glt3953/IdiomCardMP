// pages/story/story.js
const { idiomsData } = require('../../data/idioms.js');

Page({
  data: {
    idiom: null,
    isCollected: false
  },

  onLoad(options) {
    const { id } = options;
    this.loadStory(parseInt(id));
  },

  loadStory(id) {
    const idiom = idiomsData.find(item => item.id === id);
    if (!idiom) {
      wx.showToast({
        title: '成语不存在',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    const isCollected = this.checkIfCollected(id);

    this.setData({
      idiom,
      isCollected
    });

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: idiom.idiom
    });
  },

  checkIfCollected(id) {
    const collections = wx.getStorageSync('collections') || [];
    return collections.includes(id);
  },

  // 切换收藏状态
  toggleCollection() {
    const { idiom, isCollected } = this.data;
    let collections = wx.getStorageSync('collections') || [];
    let collectTimes = wx.getStorageSync('collectTimes') || {};

    if (isCollected) {
      collections = collections.filter(id => id !== idiom.id);
      delete collectTimes[idiom.id];
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      });
    } else {
      collections.push(idiom.id);
      collectTimes[idiom.id] = new Date().toLocaleDateString();
      wx.showToast({
        title: '已添加收藏',
        icon: 'success'
      });
    }

    wx.setStorageSync('collections', collections);
    wx.setStorageSync('collectTimes', collectTimes);
    
    this.setData({
      isCollected: !isCollected
    });
  },

  // 分享故事
  shareStory() {
    const { idiom } = this.data;
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 朗读故事
  speakStory() {
    const { idiom } = this.data;
    wx.showToast({
      title: '朗读功能需要真机测试',
      icon: 'none'
    });
    
    // 在真实环境中可以使用语音合成API
    console.log('朗读故事:', idiom.idiom, idiom.story);
  },

  // 分享配置
  onShareAppMessage() {
    const { idiom } = this.data;
    return {
      title: `成语故事：${idiom.idiom}`,
      desc: idiom.meaning,
      path: `/pages/story/story?id=${idiom.id}`
    };
  },

  onShareTimeline() {
    const { idiom } = this.data;
    return {
      title: `${idiom.idiom} - ${idiom.meaning}`,
      query: `id=${idiom.id}`
    };
  }
});