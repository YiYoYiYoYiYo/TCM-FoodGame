// ========== 魔法厨房 · 收藏系统 (storage.js) ==========

const KitchenStorage = (() => {
  const STORAGE_KEY = 'magic_kitchen_favorites';
  const ACHIEVEMENT_KEY = 'magic_kitchen_achievements';
  const STATS_KEY = 'magic_kitchen_stats';
  const MAX_FAVORITES = 20;

  // ---- 收藏操作 ----
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveFavorites(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_FAVORITES)));
  }

  function addFavorite(dishResult) {
    const favorites = getFavorites();
    // 去重：相同食材组合不重复收藏
    const idsKey = dishResult.ingredients.map((i) => i.id).sort().join(',');
    const exists = favorites.some(
      (f) => f.ingredients.map((i) => i.id).sort().join(',') === idsKey
    );
    if (exists) return { success: false, message: '这道菜已经在收藏里啦！' };

    if (favorites.length >= MAX_FAVORITES) {
      return { success: false, message: `最多只能收藏 ${MAX_FAVORITES} 道菜哦！` };
    }

    favorites.push({
      ...dishResult,
      favoriteId: `fav_${Date.now()}`,
      favoriteAt: new Date().toLocaleString('zh-CN'),
    });
    saveFavorites(favorites);
    return { success: true, message: '收藏成功！✅' };
  }

  function removeFavorite(favoriteId) {
    const favorites = getFavorites().filter((f) => f.favoriteId !== favoriteId);
    saveFavorites(favorites);
  }

  function isFavorited(ingredientIds) {
    const idsKey = [...ingredientIds].sort().join(',');
    return getFavorites().some(
      (f) => f.ingredients.map((i) => i.id).sort().join(',') === idsKey
    );
  }

  // ---- 成就系统 ----
  function getStats() {
    try {
      return (
        JSON.parse(localStorage.getItem(STATS_KEY)) || {
          totalCooks: 0,
          uniqueColors: [],
          classicHits: 0,
          lowScoreCount: 0,
          highScoreCount: 0,
        }
      );
    } catch {
      return { totalCooks: 0, uniqueColors: [], classicHits: 0, lowScoreCount: 0, highScoreCount: 0 };
    }
  }

  function updateStats(dishResult) {
    const stats = getStats();
    stats.totalCooks += 1;
    // 五色统计
    const colors = dishResult.ingredients.map((i) => i.color);
    stats.uniqueColors = [...new Set([...stats.uniqueColors, ...colors])];
    // 经典菜命中
    if (dishResult.nameSource === 'classic' || dishResult.nameSource === 'classic-single') {
      stats.classicHits += 1;
    }
    // 高分/低分
    if (dishResult.score >= 80) stats.highScoreCount += 1;
    if (dishResult.score < 30) stats.lowScoreCount += 1;

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  }

  function getAchievements() {
    try {
      return JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY)) || [];
    } catch {
      return [];
    }
  }

  function checkAchievements(stats) {
    const existing = getAchievements();
    const newOnes = [];

    const check = (id, name, desc, condition) => {
      if (!existing.includes(id) && condition) {
        existing.push(id);
        newOnes.push({ id, name, desc });
      }
    };

    check('cook_10', '🍳 厨师学徒', '搭配 10 次', stats.totalCooks >= 10);
    check('cook_20', '🏆 金牌大厨', '搭配 20 次', stats.totalCooks >= 20);
    check('five_colors', '🌈 五色俱全', '用齐 5 种颜色的食材', stats.uniqueColors.length >= 5);
    check('classic_5', '⭐ 名菜收割机', '命中 5 道经典名菜', stats.classicHits >= 5);
    check('dark_dish', '😈 黑暗料理王', '制作出评分 < 20 的菜品', stats.lowScoreCount >= 1);
    check('high_score', '✨ 营养大师', '做出评分 ≥ 90 的菜品', stats.highScoreCount >= 1);

    if (newOnes.length > 0) {
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(existing));
    }
    return newOnes;
  }

  // ---- 烹饪历史 ----
  const HISTORY_KEY = 'magic_kitchen_history';
  const MAX_HISTORY = 30;

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
  }

  function addHistory(dishResult) {
    var history = getHistory();
    history.unshift({
      dishName: dishResult.dishName,
      score: dishResult.score,
      ingredients: dishResult.ingredients.map(function(i) { return { emoji: i.emoji, name: i.name }; }),
      timestamp: Date.now(),
    });
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  // 公开 API
  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    getStats,
    updateStats,
    getAchievements,
    checkAchievements,
    getHistory,
    addHistory,
    clearHistory,
    MAX_FAVORITES,
  };
})();
