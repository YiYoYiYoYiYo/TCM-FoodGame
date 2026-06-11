// ========== 魔法厨房 · UI 交互 (ui.js) ==========
// 纯前端，零依赖

(function () {
  'use strict';

  var selectedIds = [];
  var lastResult = null;
  var MAX = 5;
  var sidebarTab = 'history';
  var creativeMode = false;

  // ========== 初始化 ==========
  function init() {
    // 恢复 AI 开关状态
    creativeMode = localStorage.getItem('magic_kitchen_creative') === '1';
    var toggle = document.getElementById('ai-toggle');
    if (toggle) toggle.checked = creativeMode;

    renderGrid();
    renderHistory();
    renderFavorites();
    updatePot();
    updateCookBtn();
    updateStats();
    bindEvents();
  }

  function updateStats() {
    var stats = KitchenStorage.getStats();
    var cookEl = document.getElementById('stat-cook-count');
    var scoreEl = document.getElementById('stat-high-score');
    if (cookEl) cookEl.textContent = stats.totalCooks || 0;
    if (scoreEl) scoreEl.textContent = stats.highestScore || 0;
  }

  // ========== 创意模式 ==========
  function handleCreativeToggle() {
    var cb = document.getElementById('ai-toggle');
    if (!cb) return;
    creativeMode = cb.checked;
    localStorage.setItem('magic_kitchen_creative', creativeMode ? '1' : '0');
    if (creativeMode) {
      toast('✨ 创意模式已开启 — 菜名会更加多样！');
    } else {
      toast('已切换为标准命名模式');
    }
  }

  // ========== 渲染食材网格 ==========
  function renderGrid() {
    var colorMeta = [
      { color: 'green',  label: '🟢 木·肝', cls: 'green' },
      { color: 'red',    label: '🔴 火·心', cls: 'red' },
      { color: 'yellow', label: '🟡 土·脾', cls: 'yellow' },
      { color: 'white',  label: '⚪ 金·肺', cls: 'white' },
      { color: 'black',  label: '⚫ 水·肾', cls: 'black' },
    ];

    var grid = document.getElementById('ingredient-grid');
    grid.innerHTML = '';

    colorMeta.forEach(function (meta) {
      var col = document.createElement('div');
      col.className = 'ing-col';

      var header = document.createElement('div');
      header.className = 'ing-col-header ' + meta.cls;
      header.textContent = meta.label;
      col.appendChild(header);

      var list = document.createElement('div');
      list.className = 'ing-col-list';

      var items = INGREDIENTS.filter(function (i) { return i.color === meta.color; });
      items.forEach(function (ing) {
        var card = document.createElement('div');
        card.className = 'ing-mini-card';
        card.dataset.id = ing.id;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.title = ing.name + ' — ' + ing.benefit;
        card.innerHTML =
          '<span class="ing-mini-emoji">' + ing.emoji + '</span>' +
          '<span class="ing-mini-name">' + ing.name + '</span>' +
          '<span class="ing-mini-check">✓</span>';
        card.addEventListener('click', function () { toggleIng(ing.id); });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleIng(ing.id); }
        });
        list.appendChild(card);
      });

      col.appendChild(list);
      grid.appendChild(col);
    });

    updateCardStates();
  }

  // ========== 选中/取消 ==========
  function toggleIng(id) {
    var idx = selectedIds.indexOf(id);
    if (idx >= 0) {
      selectedIds.splice(idx, 1);
    } else {
      if (selectedIds.length >= MAX) { toast('最多选 ' + MAX + ' 种哦！'); return; }
      selectedIds.push(id);
    }
    updatePot();
    updateCookBtn();
    updateCardStates();
  }

  function updateCardStates() {
    document.querySelectorAll('.ing-mini-card').forEach(function (card) {
      var id = card.dataset.id;
      var sel = selectedIds.includes(id);
      card.classList.toggle('selected', sel);
      var locked = !sel && selectedIds.length >= MAX;
      card.classList.toggle('locked', locked);
    });
  }

  // ========== 锅区 ==========
  function updatePot() {
    var pot = document.getElementById('pot-slots');
    pot.innerHTML = '';

    if (selectedIds.length === 0) {
      pot.innerHTML = '<span class="pot-placeholder">点击食材加入…</span>';
    } else {
      selectedIds.forEach(function (id, i) {
        var ing = INGREDIENTS.find(function (x) { return x.id === id; });
        if (!ing) return;
        var div = document.createElement('span');
        div.className = 'pot-slot';
        div.style.animationDelay = (i * 0.06) + 's';
        div.innerHTML =
          '<span class="slot-emoji">' + ing.emoji + '</span>' +
          ing.name +
          '<span class="slot-remove" data-id="' + id + '">×</span>';
        div.querySelector('.slot-remove').addEventListener('click', function (e) {
          e.stopPropagation(); toggleIng(id);
        });
        pot.appendChild(div);
      });
    }

    var countEl = document.getElementById('selected-count');
    if (countEl) countEl.textContent = selectedIds.length;
  }

  function updateCookBtn() {
    var btn = document.getElementById('cook-btn');
    var n = selectedIds.length;
    btn.disabled = n < 1;
    btn.className = 'cook-btn' + (n >= 1 ? ' active' : '');
    btn.textContent = n >= 1 ? '🔥 开始烹饪（' + n + '种）' : '🔥 开始烹饪';
  }

  // ========== 烹饪主流程 ==========
  async function cook() {
    if (selectedIds.length < 1) return;

    var resultArea = document.getElementById('result-area');
    resultArea.classList.remove('show');

    var potRow = document.getElementById('pot-area');
    potRow.classList.add('cooking');

    await sleep(1500);

    potRow.classList.remove('cooking');

    try {
      lastResult = WuxingEngine.cook(selectedIds, creativeMode);
    } catch (err) {
      console.error('烹饪引擎出错:', err);
      toast('⚠️ 烹饪出错了，请重试！');
      return;
    }

    if (!lastResult) { toast('⚠️ 未能生成菜品，请重试！'); return; }

    var stats = KitchenStorage.updateStats(lastResult);
    var newAch = KitchenStorage.checkAchievements(stats);

    showResult(lastResult);

    if (newAch.length > 0) showAchToast(newAch);
    updateStats();
  }

  // ========== 显示结果 ==========
  function showResult(r, fromHistory) {
    if (!fromHistory) lastResult = r;
    var area = document.getElementById('result-area');
    area.classList.add('show');

    document.getElementById('dish-name').textContent = r.dishName;
    document.getElementById('result-ingredients').innerHTML =
      r.ingredients.map(function (i) { return i.emoji + ' ' + i.name; }).join(' ＋ ');

    document.getElementById('score-num').textContent = r.score;

    document.getElementById('taste-val').textContent = r.tasteScore;
    document.getElementById('nutrition-val').textContent = r.nutritionScore;
    document.getElementById('creativity-val').textContent = r.creativityScore;
    document.getElementById('color-count-val').textContent = r.colorCount;

    var wuxingText = r.wuxing.relationText;
    if (r.wuxing.benefitText) {
      wuxingText += '；' + r.wuxing.benefitText;
    }
    document.getElementById('wuxing-text').textContent = wuxingText;
    document.getElementById('health-tip').textContent = r.healthTip;

    if (fromHistory) {
      document.getElementById('fav-btn').disabled = true;
    } else {
      updateFavBtn();
      KitchenStorage.addHistory(r);
      renderHistory();
    }
  }

  // ========== 关闭结果卡 ==========
  function closeResult() {
    lastResult = null;
    document.getElementById('result-area').classList.remove('show');
    updateFavBtn();
  }

  // ========== 收藏 ==========
  function updateFavBtn() {
    var btn = document.getElementById('fav-btn');
    if (!lastResult) { btn.disabled = true; return; }
    var ids = lastResult.ingredients.map(function (i) { return i.id; });
    var isFav = KitchenStorage.isFavorited(ids);
    btn.textContent = isFav ? '❤️ 已收藏' : '🤍 收藏';
    btn.dataset.action = isFav ? 'remove' : 'add';
    btn.disabled = false;
  }

  function toggleFav() {
    if (!lastResult) return;
    var btn = document.getElementById('fav-btn');
    var ids = lastResult.ingredients.map(function (i) { return i.id; });
    if (btn.dataset.action === 'add') {
      var res = KitchenStorage.addFavorite(lastResult);
      toast(res.message);
      if (res.success) {
        btn.textContent = '❤️ 已收藏'; btn.dataset.action = 'remove';
        renderFavorites();
      }
    } else {
      var idsKey = ids.sort().join(',');
      var fav = KitchenStorage.getFavorites().find(function (f) {
        return f.ingredients.map(function (i) { return i.id; }).sort().join(',') === idsKey;
      });
      if (fav) KitchenStorage.removeFavorite(fav.favoriteId);
      toast('已取消收藏');
      btn.textContent = '🤍 收藏';
      btn.dataset.action = 'add';
      renderFavorites();
    }
  }

  // ========== 侧边栏标签切换 ==========
  function switchTab(tab) {
    sidebarTab = tab;
    document.querySelectorAll('.sb-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    var histList = document.getElementById('history-list');
    var favList = document.getElementById('favorites-list');
    var achList = document.getElementById('achievements-list');
    var title = document.getElementById('sb-title');
    var clearBtn = document.getElementById('clear-history');

    histList.style.display = 'none';
    favList.style.display = 'none';
    if (achList) achList.style.display = 'none';
    clearBtn.style.display = 'none';

    if (tab === 'history') {
      histList.style.display = '';
      if (title) title.textContent = '烹饪记录';
      clearBtn.style.display = '';
      clearBtn.title = '清空记录';
    } else if (tab === 'favorites') {
      favList.style.display = '';
      if (title) title.textContent = '我的收藏';
    } else if (tab === 'achievements') {
      if (achList) achList.style.display = '';
      if (title) title.textContent = '成就徽章';
      renderAchievements();
    }
  }

  // ========== 历史记录侧边栏 ==========
  function renderHistory() {
    var list = document.getElementById('history-list');
    var history = KitchenStorage.getHistory();

    if (history.length === 0) {
      list.innerHTML = '<div class="sb-empty">还没有烹饪记录，<br>快去搭配美食吧！</div>';
      return;
    }

    list.innerHTML = '';
    history.forEach(function (h) {
      var div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML =
        '<div class="hi-top">' +
          '<span class="hi-name">🍲 ' + h.dishName + '</span>' +
          '<span class="hi-score">' + h.score + '</span>' +
        '</div>' +
        '<div class="hi-ing">' + h.ingredients.map(function(i) { return i.emoji; }).join(' ') + '</div>';
      div.title = '点击查看详情';
      div.addEventListener('click', function () {
        var fakeResult = {
          dishName: h.dishName,
          score: h.score,
          ingredients: h.ingredients.map(function(i) {
            return INGREDIENTS.find(function(ing) { return ing.emoji === i.emoji && ing.name === i.name; }) || i;
          }),
          tasteScore: '-',
          nutritionScore: '-',
          creativityScore: '-',
          colorCount: '-',
          wuxing: { relationText: '📋 历史记录', benefitText: '' },
          healthTip: '这是之前的烹饪记录。',
        };
        showResult(fakeResult, true);
      });
      list.appendChild(div);
    });
  }

  // ========== 收藏列表 ==========
  function renderFavorites() {
    var list = document.getElementById('favorites-list');
    var favorites = KitchenStorage.getFavorites();

    if (favorites.length === 0) {
      list.innerHTML = '<div class="sb-empty">还没有收藏菜品，<br>烹饪后点击 ❤️ 收藏吧！</div>';
      return;
    }

    list.innerHTML = '';
    favorites.forEach(function (fav) {
      var div = document.createElement('div');
      div.className = 'history-item';

      var ingNames = fav.ingredients.map(function (i) { return i.name; }).join('、');
      var ingEmojis = fav.ingredients.map(function (i) { return i.emoji; }).join(' ');

      div.innerHTML =
        '<div class="hi-top">' +
          '<span class="hi-name">🍲 ' + fav.dishName + '</span>' +
          '<span class="hi-score">' + fav.score + '</span>' +
        '</div>' +
        '<div class="hi-ing">' + ingEmojis + ' ' + ingNames + '</div>' +
        '<button class="fav-del" data-fid="' + fav.favoriteId + '">删除</button>';

      div.querySelector('.fav-del').addEventListener('click', function (e) {
        e.stopPropagation();
        KitchenStorage.removeFavorite(fav.favoriteId);
        renderFavorites();
        updateFavBtn();
        toast('已删除收藏');
      });

      div.title = '点击查看详情';
      div.addEventListener('click', function () {
        var fakeResult = {
          dishName: fav.dishName,
          score: fav.score,
          ingredients: fav.ingredients.map(function(i) {
            return INGREDIENTS.find(function(ing) { return ing.emoji === i.emoji && ing.name === i.name; }) || i;
          }),
          tasteScore: '-',
          nutritionScore: '-',
          creativityScore: '-',
          colorCount: '-',
          wuxing: { relationText: '❤️ 收藏菜品', benefitText: '' },
          healthTip: '这是你的收藏菜品。',
        };
        showResult(fakeResult, true);
      });

      list.appendChild(div);
    });
  }

  // ========== 成就面板 ==========
  function renderAchievements() {
    var list = document.getElementById('achievements-list');
    if (!list) return;
    var earned = KitchenStorage.getAchievements();
    var stats = KitchenStorage.getStats();

    var ALL_ACH = [
      { id: 'cook_10',    icon: '🍳', name: '厨师学徒',   desc: '搭配 10 次',         progress: Math.min(stats.totalCooks || 0, 10),  target: 10 },
      { id: 'cook_20',    icon: '🏆', name: '金牌大厨',   desc: '搭配 20 次',         progress: Math.min(stats.totalCooks || 0, 20),  target: 20 },
      { id: 'five_colors',icon: '🌈', name: '五色俱全',   desc: '用齐 5 种颜色',      progress: (stats.uniqueColors || []).length,      target: 5 },
      { id: 'classic_5',  icon: '⭐', name: '名菜收割机', desc: '命中 5 道经典名菜',  progress: Math.min(stats.classicHits || 0, 5),   target: 5 },
      { id: 'high_score', icon: '✨', name: '营养大师',   desc: '评分 ≥ 90',          progress: (stats.highScoreCount || 0) > 0 ? 1 : 0,target: 1 },
      { id: 'dark_dish',  icon: '😈', name: '黑暗料理王', desc: '评分 < 20',           progress: (stats.lowScoreCount || 0) > 0 ? 1 : 0,  target: 1 },
    ];

    list.innerHTML = '';
    ALL_ACH.forEach(function (ach) {
      var got = earned.includes(ach.id);
      var div = document.createElement('div');
      div.className = 'ach-card' + (got ? ' ach-got' : '');
      var pct = Math.round(ach.progress / ach.target * 100);

      div.innerHTML =
        '<div class="ach-icon">' + ach.icon + '</div>' +
        '<div class="ach-info">' +
          '<div class="ach-name">' + ach.name + (got ? ' ✅' : '') + '</div>' +
          '<div class="ach-desc">' + ach.desc + '</div>' +
          '<div class="ach-bar-track"><div class="ach-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="ach-desc">' + Math.min(ach.progress, ach.target) + '/' + ach.target + '</div>' +
        '</div>';

      list.appendChild(div);
    });
  }

  // ========== 事件绑定 ==========
  function bindEvents() {
    document.getElementById('cook-btn').addEventListener('click', cook);

    document.getElementById('reset-btn').addEventListener('click', function () {
      selectedIds = []; lastResult = null;
      updatePot(); updateCookBtn(); updateCardStates();
      document.getElementById('result-area').classList.remove('show');
    });

    // 关闭结果
    var closeBtn = document.getElementById('result-close');
    if (closeBtn) closeBtn.addEventListener('click', closeResult);

    // 再来一道
    var resetResultBtn = document.getElementById('reset-result-btn');
    if (resetResultBtn) {
      resetResultBtn.addEventListener('click', function () {
        lastResult = null;
        document.getElementById('result-area').classList.remove('show');
        updateFavBtn();
      });
    }

    document.getElementById('fav-btn').addEventListener('click', toggleFav);

    // 清空按钮
    var clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('确定要清空所有记录吗？')) {
          if (sidebarTab === 'history') {
            KitchenStorage.clearHistory();
            renderHistory();
          }
          toast('记录已清空');
        }
      });
    }

    // 侧边栏标签
    document.querySelectorAll('.sb-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchTab(tab.dataset.tab);
      });
    });

    // 创意模式开关
    var aiToggle = document.getElementById('ai-toggle');
    if (aiToggle) {
      aiToggle.addEventListener('change', handleCreativeToggle);
    }
  }

  // ========== 成就弹窗 ==========
  function showAchToast(list) {
    var toastEl = document.getElementById('ach-toast');
    var ul = document.getElementById('ach-toast-list');
    if (!toastEl || !ul) return;
    ul.innerHTML = '';
    var ICONS = {
      cook_10: '🍳', cook_20: '🏆', five_colors: '🌈',
      classic_5: '⭐', dark_dish: '💀', high_score: '✨',
    };
    list.forEach(function (ach) {
      var li = document.createElement('li');
      li.textContent = (ICONS[ach.id] || '🏅') + ' ' + ach.name;
      ul.appendChild(li);
    });
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
  }

  // ========== 工具 ==========
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 2500);
  }

  function sleep(ms) { return new Promise(function (r) { return setTimeout(r, ms); }); }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
