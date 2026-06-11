// ========== 魔法厨房 · 匹配引擎 (engine.js) ==========
// 路径 A：模板引擎（主）+ 路径 B：ONNX 可选增强

const WuxingEngine = (() => {

  // ---- 工具函数 ----
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  const uniq = (arr) => [...new Set(arr)];

  // 检查是否是经典名菜
  function findClassicDish(ids) {
    const sortedIds = [...ids].sort();
    for (const dish of CLASSIC_DISHES) {
      const dishIds = [...dish.ingredients].sort();
      if (
        dishIds.length === sortedIds.length &&
        dishIds.every((id, i) => id === sortedIds[i])
      ) {
        return dish;
      }
    }
    return null;
  }

  // 检查是否是单品菜
  function findSingleDish(id) {
    return SINGLE_DISHES.find((d) => d.ingredient === id) || null;
  }

  // ---- 命名引擎（路径 A：模板） ----
  function generateNameByTemplate(ingredients) {
    const names = ingredients.map((ing) => ing.name);
    const emojis = ingredients.map((ing) => ing.emoji);
    const colors = uniq(ingredients.map((ing) => ing.color));
    const wuxings = uniq(ingredients.map((ing) => ing.wuxing));

    // 提取主要食材（按五行优先级：水>火>土>金>木）
    const wuxingPriority = { '水': 0, '火': 1, '土': 2, '金': 3, '木': 4 };
    const sorted = [...ingredients].sort(
      (a, b) => wuxingPriority[a.wuxing] - wuxingPriority[b.wuxing]
    );
    const main = sorted[0];
    const rest = sorted.slice(1);

    const mainName = main.name;
    const restNames = rest.map((r) => r.name);
    const colorName = colors.length === 1 ? COLOR_NAMES[colors[0]] : '';
    const wuxingName =
      wuxings.length === 1 ? WUXING_NAMES[wuxings[0]] || '' : '';

    // 单品菜
    if (ingredients.length === 1) {
      const single = findSingleDish(ingredients[0].id);
      if (single) return { name: single.name, source: 'classic-single' };
      const singleTemplates = [
        `清炒${mainName}`,
        `蒸${mainName}`,
        `${mainName}单品行`,
        `原味${mainName}`,
        `${mainName}沙拉`,
      ];
      return { name: pick(singleTemplates), source: 'template-single' };
    }

    // 2 种食材
    if (ingredients.length === 2) {
      const classic = findClassicDish(ingredients.map((i) => i.id));
      if (classic) return { name: classic.name, source: 'classic' };

      const [a, b] = [ingredients[0].name, ingredients[1].name];
      const templates2 = [
        `${a}炒${b}`,
        `${b}炒${a}`,
        `${a}${b}汤`,
        `${a}${b}煲`,
        `蒜蓉${a}${b}`,
        `${a}拌${b}`,
        `黄金${a}${b}`,
        `${COLOR_NAMES[ingredients[0].color] || ''}${COLOR_NAMES[ingredients[1].color] || ''}双拼`,
      ];
      return { name: pick(templates2), source: 'template-2' };
    }

    // 3 种食材
    if (ingredients.length === 3) {
      const templates3 = [
        `${mainName}${restNames.join('')}煲`,
        `${colorName}三鲜${mainName}`,
        `${mainName}炖${restNames.join('')}`,
        `三色${restNames.join('')}`,
        `五行${mainName}荟萃`,
        `${wuxingName}系三味煲`,
      ];
      return { name: pick(templates3), source: 'template-3' };
    }

    // 4~5 种食材
    const shortNames = ingredients.map((ing) =>
      ing.name.length <= 2 ? ing.name : ing.name.slice(0, 2)
    );
    const templatesN = [
      `${colorName || '五彩'}${shortNames.join('')}荟萃`,
      `${wuxingName || '五行'}养生${mainName}煲`,
      `${shortNames.slice(0, 3).join('')}大杂烩`,
      `全家福${shortNames.join('')}`,
      `${HEALTH_WORDS[Math.floor(Math.random() * HEALTH_WORDS.length)]}${shortNames.join('')}`,
      `${shortNames.length}珍${mainName}煲`,
    ];
    return { name: pick(templatesN), source: 'template-n' };
  }

  // ---- 评分引擎 ----
  function calculateScore(ingredients) {
    const ids = ingredients.map((i) => i.id);
    const classic = findClassicDish(ids);
    const single = ingredients.length === 1 ? findSingleDish(ids[0]) : null;
    const colorCount = uniq(ingredients.map((i) => i.color)).length;
    const rareIds = ['black_chicken', 'walnut', 'tremella', 'wood_ear'];
    const hasRare = ids.some((id) => rareIds.includes(id));

    // ① 经典匹配 (35%) — 10 分制
    var classicScore;
    if (classic)      classicScore = 10;
    else if (single)  classicScore = 8;
    else if (ingredients.length === 2) classicScore = 7;
    else if (ingredients.length === 3) classicScore = 6;
    else              classicScore = 5;

    // ② 五色均衡 (25%) — 颜色越多越值钱，10 分制
    var colorScore = 1 + colorCount * 1.8; // 1色=2.8, 5色=10

    // ③ 创意维度 (15%) — 颜色组合创造力，10 分制
    var creativityScore = colorCount * 2; // 1色=2, 5色=10

    // ④ 稀有食材 (10%) — 10 分制
    var rareScore = 4;
    if (hasRare) rareScore += 3;
    if (colorCount === 5) rareScore += 3;
    rareScore = Math.min(rareScore, 10);

    // ⑤ 基础保底 (15%) — 所有菜品都有底线
    var baseScore = 5;

    // 加权 × 13.3 → 理论满分 100
    var weighted = classicScore * 0.35 + colorScore * 0.25 + creativityScore * 0.15 + rareScore * 0.10 + baseScore * 0.15;
    var base = Math.round(weighted * 13.3);
    var jitter = Math.floor(Math.random() * 7) - 3;
    var finalScore = Math.min(100, Math.max(10, base + jitter));

    return {
      score: finalScore,
      tasteScore: Math.round(classicScore),
      nutritionScore: Math.round(colorScore * 10) / 10,
      creativityScore: Math.round(creativityScore),
      colorCount,
    };
  }

  // ---- 五行分析（展示用，不计入评分） ----
  function analyzeWuxing(ingredients) {
    const wuxings = ingredients.map((i) => i.wuxing);
    const wuxingCounts = {};
    wuxings.forEach((w) => (wuxingCounts[w] = (wuxingCounts[w] || 0) + 1));

    const dominant = Object.entries(wuxingCounts).sort((a, b) => b[1] - a[1])[0];
    const colorList = uniq(ingredients.map((i) => COLOR_NAMES[i.color] + '色')).join('+');
    const organList = uniq(ingredients.map((i) => i.organ)).join('、');

    let relationText = '';
    const uniqueWuxing = uniq(wuxings);
    if (uniqueWuxing.length === 1) {
      relationText = `同属性叠加 → ${WUXING_NAMES[uniqueWuxing[0]] || ''}能量加倍！`;
    } else {
      const shengList = uniqueWuxing
        .filter((w) => SHENG_MAP[w] && uniqueWuxing.includes(SHENG_MAP[w]))
        .map((w) => `${WUXING_NAMES[w] || w}生${WUXING_NAMES[SHENG_MAP[w]] || SHENG_MAP[w]}`);
      if (shengList.length > 0) {
        relationText = `含相生关系：${shengList.join('、')}，搭配和谐✨`;
      } else {
        relationText = `五行搭配多样，营养更全面！`;
      }
    }

    return {
      wuxingCounts,
      dominant: dominant[0],
      colorList,
      organList,
      relationText,
      benefitText: ingredients.map((i) => `${i.emoji} ${i.benefit}`).join('；'),
    };
  }

  // ---- 健康小贴士 ----
  function generateHealthTip(ingredients, score) {
    const allBenefits = ingredients.map((i) => i.benefit);
    const uniqueOrgan = uniq(ingredients.map((i) => i.organ));

    const tips = [
      `这道菜结合了${ingredients.map((i) => i.name).join('、')}的营养，${allBenefits.join('，')}。`,
      `适合${uniqueOrgan.join('和')}虚弱的小朋友，建议每周吃 1-2 次！`,
      score >= 80
        ? '这道菜搭配非常棒，营养很均衡！记得要适量食用哦～'
        : '记得要均衡饮食，这道菜可以作为营养补充的一部分！',
    ];

    // 根据五行加专项建议
    const hasWood = ingredients.some((i) => i.wuxing === '木');
    const hasFire = ingredients.some((i) => i.wuxing === '火');
    if (hasWood && hasFire) {
      tips.push('木火搭配，有助于肝心调和，春天吃特别合适！');
    }

    return tips.slice(0, 2).join('');
  }

  // ---- 创意模式命名（更多模板、更大词库） ----
  function generateCreativeName(ingredients) {
    const names = ingredients.map((i) => i.name);
    const emojis = ingredients.map((i) => i.emoji);
    const colors = uniq(ingredients.map((i) => i.color));
    const wuxings = uniq(ingredients.map((i) => i.wuxing));
    const colorName = colors.length === 1 ? COLOR_NAMES[colors[0]] : '';
    const wuxingName = wuxings.length === 1 ? WUXING_NAMES[wuxings[0]] || '' : '';

    const v = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
    const main = names[0];
    const shortNames = ingredients.map(function (ing) { return ing.name.length <= 2 ? ing.name : ing.name.slice(0, 2); });
    const prefix = v(CREATIVE_PREFIXES);
    const verb = v(CREATIVE_VERBS);
    const style = v(CREATIVE_STYLES);
    const poetic = v(CREATIVE_POETIC);
    const suffix = v(CREATIVE_SUFFIXES);
    var n = ingredients.length;

    // 1 种
    if (n === 1) {
      var singleDish = findSingleDish(ingredients[0].id);
      var templates1 = [
        prefix + verb + main,
        poetic + style + main,
        verb + main + suffix,
        main + '雅' + suffix,
        prefix + '一品' + main,
        poetic + '之' + main,
      ];
      return singleDish ? singleDish.name : v(templates1);
    }

    // 2 种
    if (n === 2) {
      var classic = findClassicDish(ingredients.map(function (i) { return i.id; }));
      if (classic) return classic.name;

      var a = names[0], b = names[1];
      var templates2 = [
        prefix + a + verb + b,
        verb + a + b,
        a + b + suffix,
        style + a + b,
        poetic + a + b,
        COLOR_NAMES[ingredients[0].color] + COLOR_NAMES[ingredients[1].color] + '双' + suffix,
        a + '烩' + style + b,
        prefix + a + '配' + b,
      ];
      return v(templates2);
    }

    // 3 种
    if (n === 3) {
      var templates3 = [
        prefix + main + suffix + shortNames.slice(1).join(''),
        colorName + '三' + suffix + ' (' + shortNames.join('') + ')',
        poetic + main + '三味' + suffix,
        style + shortNames.join('') + suffix,
        prefix + wuxingName + '系三' + suffix,
        verb + main + '拼' + shortNames.slice(1).join(''),
      ];
      return v(templates3);
    }

    // 4~5 种
    var allShort = shortNames.join('');
    var templatesN = [
      prefix + colorName + allShort + suffix,
      poetic + wuxingName + '汇' + suffix,
      style + shortNames.slice(0, 3).join('') + suffix,
      prefix + main + '全家福' + suffix,
      n + '珍' + poetic + suffix,
      prefix + wuxingName + '养生' + suffix,
    ];
    return v(templatesN);
  }

  // ---- 主入口：烹饪！----
  function cook(ingredientIds, creativeMode) {
    const ingredients = ingredientIds
      .map((id) => INGREDIENTS.find((i) => i.id === id))
      .filter(Boolean);

    if (ingredients.length === 0) return null;

    var nameResult;
    if (creativeMode) {
      nameResult = { name: generateCreativeName(ingredients), source: 'creative' };
    } else {
      nameResult = generateNameByTemplate(ingredients);
    }

    const scoreResult = calculateScore(ingredients);
    const wuxingResult = analyzeWuxing(ingredients);
    const tip = generateHealthTip(ingredients, scoreResult.score);

    return {
      ingredients,
      dishName: nameResult.name,
      nameSource: nameResult.source,
      score: scoreResult.score,
      tasteScore: scoreResult.tasteScore,
      nutritionScore: scoreResult.nutritionScore,
      creativityScore: scoreResult.creativityScore,
      colorCount: scoreResult.colorCount,
      wuxing: wuxingResult,
      healthTip: tip,
      timestamp: Date.now(),
    };
  }

  // 公开 API
  return { cook, findClassicDish, findSingleDish, analyzeWuxing };
})();
