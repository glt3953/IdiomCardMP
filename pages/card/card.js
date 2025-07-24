// pages/card/card.js
const { idiomsData } = require('../../data/idioms.js');

Page({
  data: {
    currentIdiom: null,
    currentIndex: 0,
    totalCount: 0,
    showBack: false,
    backType: 'meaning', // 'meaning' 或 'story'
    isCollected: false,
    mode: 'single',
    modeText: '单个学习',
    idiomsList: [],
    learnedCount: 0,
    showCompletion: false
  },

  onLoad(options) {
    const { id, mode, difficulty, category } = options;
    this.initLearningMode(mode, difficulty, category);
    this.loadIdiom(parseInt(id));
  },

  initLearningMode(mode, difficulty, category) {
    let idiomsList = [];
    let modeText = '';

    switch (mode) {
      case 'random':
        idiomsList = [...idiomsData].sort(() => Math.random() - 0.5);
        modeText = '随机学习';
        break;
      case 'sequential':
        idiomsList = [...idiomsData];
        modeText = '顺序学习';
        break;
      case 'difficulty':
        idiomsList = idiomsData.filter(idiom => idiom.difficulty === difficulty);
        modeText = `${difficulty}难度`;
        break;
      case 'category':
        idiomsList = idiomsData.filter(idiom => idiom.category === category);
        modeText = `${category}学习`;
        break;
      default:
        idiomsList = idiomsData;
        modeText = '单个学习';
    }

    this.setData({
      mode,
      modeText,
      idiomsList,
      totalCount: idiomsList.length
    });
  },

  loadIdiom(id) {
    const idiom = this.data.idiomsList.find(item => item.id === id);
    if (!idiom) return;

    const currentIndex = this.data.idiomsList.findIndex(item => item.id === id);
    const isCollected = this.checkIfCollected(id);

    this.setData({
      currentIdiom: idiom,
      currentIndex,
      isCollected,
      showBack: false,
      backType: 'meaning'
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

  // 翻转卡片
  flipCard() {
    this.setData({
      showBack: !this.data.showBack
    });
  },

  // 显示释义
  showMeaning() {
    this.setData({
      showBack: true,
      backType: 'meaning'
    });
  },

  // 显示故事
  showStory() {
    this.setData({
      showBack: true,
      backType: 'story'
    });
  },

  // 切换收藏状态
  toggleCollection() {
    const { currentIdiom, isCollected } = this.data;
    let collections = wx.getStorageSync('collections') || [];

    if (isCollected) {
      collections = collections.filter(id => id !== currentIdiom.id);
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      });
    } else {
      collections.push(currentIdiom.id);
      wx.showToast({
        title: '已添加收藏',
        icon: 'success'
      });
    }

    wx.setStorageSync('collections', collections);
    this.setData({
      isCollected: !isCollected
    });
  },

  // 标记为已学习
  markLearned() {
    this.updateProgress();
    this.setData({
      learnedCount: this.data.learnedCount + 1
    });

    wx.showToast({
      title: '已标记为掌握',
      icon: 'success'
    });

    // 自动跳转到下一个
    setTimeout(() => {
      this.nextCard();
    }, 1000);
  },

  updateProgress() {
    let progress = wx.getStorageSync('progress') || {
      totalLearned: 0,
      todayLearned: 0,
      lastLearnDate: ''
    };

    const today = new Date().toDateString();
    if (progress.lastLearnDate !== today) {
      progress.todayLearned = 0;
      progress.lastLearnDate = today;
    }

    progress.totalLearned++;
    progress.todayLearned++;

    wx.setStorageSync('progress', progress);
  },

  // 上一个卡片
  previousCard() {
    if (this.data.currentIndex > 0) {
      const newIndex = this.data.currentIndex - 1;
      const newIdiom = this.data.idiomsList[newIndex];
      this.loadIdiom(newIdiom.id);
    }
  },

  // 下一个卡片
  nextCard() {
    if (this.data.currentIndex < this.data.totalCount - 1) {
      const newIndex = this.data.currentIndex + 1;
      const newIdiom = this.data.idiomsList[newIndex];
      this.loadIdiom(newIdiom.id);
    } else {
      // 学习完成
      this.setData({
        showCompletion: true
      });
    }
  },

  // 朗读成语
  speakIdiom() {
    const { currentIdiom } = this.data;
    if (currentIdiom) {
      wx.showToast({
        title: '朗读功能需要真机测试',
        icon: 'none'
      });
      
      // 在真实环境中可以使用语音合成API
      // 这里只是示例
      console.log('朗读:', currentIdiom.idiom);
    }
  },

  // 返回首页
  backToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 重新开始学习
  restartLearning() {
    this.setData({
      currentIndex: 0,
      learnedCount: 0,
      showCompletion: false
    });
    
    const firstIdiom = this.data.idiomsList[0];
    this.loadIdiom(firstIdiom.id);
  }
});