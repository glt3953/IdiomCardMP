// pages/index/index.js
const { idiomsData } = require('../../data/idioms.js');

Page({
  data: {
    progress: {
      totalLearned: 0,
      todayLearned: 0
    },
    totalIdioms: 0,
    categories: [],
    recommendedIdiom: null
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    this.loadProgress();
  },

  initData() {
    // 设置总数量
    this.setData({
      totalIdioms: idiomsData.length
    });

    // 统计分类
    this.calculateCategories();
    
    // 设置今日推荐
    this.setRecommendedIdiom();
  },

  loadProgress() {
    const progress = wx.getStorageSync('progress') || {
      totalLearned: 0,
      todayLearned: 0,
      lastLearnDate: ''
    };

    // 检查是否是新的一天
    const today = new Date().toDateString();
    if (progress.lastLearnDate !== today) {
      progress.todayLearned = 0;
      progress.lastLearnDate = today;
      wx.setStorageSync('progress', progress);
    }

    this.setData({ progress });
  },

  calculateCategories() {
    const categoryMap = {};
    const categoryIcons = {
      '历史类': '📜',
      '寓言类': '🐰',
      '艺术类': '🎨',
      '军事类': '⚔️',
      '哲理类': '💭'
    };

    idiomsData.forEach(idiom => {
      const category = idiom.category;
      if (categoryMap[category]) {
        categoryMap[category]++;
      } else {
        categoryMap[category] = 1;
      }
    });

    const categories = Object.keys(categoryMap).map(name => ({
      name,
      count: categoryMap[name],
      icon: categoryIcons[name] || '📖'
    }));

    this.setData({ categories });
  },

  setRecommendedIdiom() {
    // 随机选择一个成语作为今日推荐
    const randomIndex = Math.floor(Math.random() * idiomsData.length);
    this.setData({
      recommendedIdiom: idiomsData[randomIndex]
    });
  },

  // 开始随机学习
  startRandomLearning() {
    const randomIndex = Math.floor(Math.random() * idiomsData.length);
    wx.navigateTo({
      url: `/pages/card/card?id=${idiomsData[randomIndex].id}&mode=random`
    });
  },

  // 开始顺序学习
  startSequentialLearning() {
    wx.navigateTo({
      url: `/pages/card/card?id=1&mode=sequential`
    });
  },

  // 开始难度学习
  startDifficultyLearning() {
    wx.showActionSheet({
      itemList: ['初级', '中级', '高级'],
      success: (res) => {
        const difficulties = ['初级', '中级', '高级'];
        const selectedDifficulty = difficulties[res.tapIndex];
        const filteredIdioms = idiomsData.filter(idiom => idiom.difficulty === selectedDifficulty);
        
        if (filteredIdioms.length > 0) {
          wx.navigateTo({
            url: `/pages/card/card?id=${filteredIdioms[0].id}&mode=difficulty&difficulty=${selectedDifficulty}`
          });
        } else {
          wx.showToast({
            title: '该难度暂无成语',
            icon: 'none'
          });
        }
      }
    });
  },

  // 浏览分类
  browseCategory(e) {
    const category = e.currentTarget.dataset.category;
    const filteredIdioms = idiomsData.filter(idiom => idiom.category === category);
    
    if (filteredIdioms.length > 0) {
      wx.navigateTo({
        url: `/pages/card/card?id=${filteredIdioms[0].id}&mode=category&category=${category}`
      });
    }
  },

  // 查看推荐成语
  viewRecommended() {
    if (this.data.recommendedIdiom) {
      wx.navigateTo({
        url: `/pages/card/card?id=${this.data.recommendedIdiom.id}&mode=single`
      });
    }
  }
});