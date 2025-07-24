// pages/collection/collection.js
const { idiomsData } = require('../../data/idioms.js');

Page({
  data: {
    collections: [],
    batchMode: false,
    selectedItems: [],
    selectedCount: 0
  },

  onLoad() {
    this.loadCollections();
  },

  onShow() {
    this.loadCollections();
  },

  loadCollections() {
    const collectionIds = wx.getStorageSync('collections') || [];
    const collections = collectionIds.map(id => {
      const idiom = idiomsData.find(item => item.id === id);
      if (idiom) {
        return {
          ...idiom,
          collectTime: this.getCollectTime(id)
        };
      }
      return null;
    }).filter(Boolean);

    // 按收藏时间倒序排列
    collections.sort((a, b) => new Date(b.collectTime) - new Date(a.collectTime));

    this.setData({
      collections,
      batchMode: false,
      selectedItems: [],
      selectedCount: 0
    });
  },

  getCollectTime(id) {
    // 这里简化处理，实际应用中可以存储具体的收藏时间
    const collectTimes = wx.getStorageSync('collectTimes') || {};
    return collectTimes[id] || new Date().toLocaleDateString();
  },

  // 查看成语详情
  viewIdiom(e) {
    if (this.data.batchMode) {
      this.toggleSelection(e);
      return;
    }

    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/card/card?id=${id}&mode=single`
    });
  },

  // 移除单个收藏
  removeCollection(e) {
    const id = e.currentTarget.dataset.id;
    const idiom = this.data.collections.find(item => item.id === id);
    
    wx.showModal({
      title: '确认删除',
      content: `确定要取消收藏"${idiom.idiom}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doRemoveCollection(id);
        }
      }
    });
  },

  doRemoveCollection(id) {
    let collections = wx.getStorageSync('collections') || [];
    collections = collections.filter(collectionId => collectionId !== id);
    wx.setStorageSync('collections', collections);

    // 同时清理收藏时间记录
    const collectTimes = wx.getStorageSync('collectTimes') || {};
    delete collectTimes[id];
    wx.setStorageSync('collectTimes', collectTimes);

    this.loadCollections();
    
    wx.showToast({
      title: '已取消收藏',
      icon: 'success'
    });
  },

  // 清空所有收藏
  clearAllCollections() {
    if (this.data.collections.length === 0) return;

    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有收藏吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('collections', []);
          wx.setStorageSync('collectTimes', {});
          this.loadCollections();
          
          wx.showToast({
            title: '已清空收藏',
            icon: 'success'
          });
        }
      }
    });
  },

  // 切换批量操作模式
  toggleBatchMode() {
    const batchMode = !this.data.batchMode;
    this.setData({
      batchMode,
      selectedItems: [],
      selectedCount: 0
    });

    // 动态添加/移除批量模式样式类
    const query = wx.createSelectorQuery();
    query.select('.page').boundingClientRect();
    query.exec((res) => {
      if (batchMode) {
        wx.addClass({
          selector: '.page',
          className: 'batch-mode'
        });
      } else {
        wx.removeClass({
          selector: '.page',
          className: 'batch-mode'
        });
      }
    });
  },

  // 切换选择状态
  toggleSelection(e) {
    const id = e.currentTarget.dataset.id;
    let selectedItems = [...this.data.selectedItems];
    
    const index = selectedItems.indexOf(id);
    if (index > -1) {
      selectedItems.splice(index, 1);
      // 移除选中样式
      wx.removeClass({
        selector: `[data-id="${id}"]`,
        className: 'selected'
      });
    } else {
      selectedItems.push(id);
      // 添加选中样式
      wx.addClass({
        selector: `[data-id="${id}"]`,
        className: 'selected'
      });
    }

    this.setData({
      selectedItems,
      selectedCount: selectedItems.length
    });
  },

  // 取消批量操作
  cancelBatch() {
    this.toggleBatchMode();
  },

  // 批量删除
  batchRemove() {
    const { selectedItems, selectedCount } = this.data;
    
    if (selectedCount === 0) {
      wx.showToast({
        title: '请先选择要删除的成语',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedCount} 个成语吗？`,
      success: (res) => {
        if (res.confirm) {
          let collections = wx.getStorageSync('collections') || [];
          const collectTimes = wx.getStorageSync('collectTimes') || {};
          
          // 移除选中的收藏
          selectedItems.forEach(id => {
            collections = collections.filter(collectionId => collectionId !== id);
            delete collectTimes[id];
          });
          
          wx.setStorageSync('collections', collections);
          wx.setStorageSync('collectTimes', collectTimes);
          
          this.loadCollections();
          
          wx.showToast({
            title: `已删除 ${selectedCount} 个收藏`,
            icon: 'success'
          });
        }
      }
    });
  },

  // 前往首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});