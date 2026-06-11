// ========== 40 种食材数据库 ==========
// 五行属性：木(绿)=肝, 火(红)=心, 土(黄)=脾, 金(白)=肺, 水(黑)=肾

const INGREDIENTS = [
  // 🟢 木·肝（8种）
  { id: 'broccoli',   emoji: '🥦', name: '西蓝花', color: 'green',  wuxing: '木', organ: '肝', benefit: '排毒护肝' },
  { id: 'spinach',    emoji: '🥬', name: '菠菜',   color: 'green',  wuxing: '木', organ: '肝', benefit: '补铁养血' },
  { id: 'cucumber',   emoji: '🥒', name: '黄瓜',   color: 'green',  wuxing: '木', organ: '肝', benefit: '清热利水' },
  { id: 'pea',         emoji: '🫛', name: '豌豆',   color: 'green',  wuxing: '木', organ: '肝', benefit: '健脾益气' },
  { id: 'kiwi',       emoji: '🥝', name: '猕猴桃', color: 'green',  wuxing: '木', organ: '肝', benefit: '维C之王' },
  { id: 'green_apple', emoji: '🍏', name: '青苹果', color: 'green',  wuxing: '木', organ: '肝', benefit: '酸甜生津' },
  { id: 'lettuce',    emoji: '🥗', name: '生菜',   color: 'green',  wuxing: '木', organ: '肝', benefit: '清爽降火' },
  { id: 'celery',     emoji: '🌿', name: '芹菜',   color: 'green',  wuxing: '木', organ: '肝', benefit: '平肝降压' },

  // 🔴 火·心（8种）
  { id: 'tomato',     emoji: '🍅', name: '番茄',   color: 'red',    wuxing: '火', organ: '心', benefit: '番茄红素护心' },
  { id: 'strawberry',  emoji: '🍓', name: '草莓',   color: 'red',    wuxing: '火', organ: '心', benefit: '维C亮肤' },
  { id: 'red_apple',  emoji: '🍎', name: '红苹果', color: 'red',    wuxing: '火', organ: '心', benefit: '养血安神' },
  { id: 'red_date',   emoji: '❤️', name: '红枣',   color: 'red',    wuxing: '火', organ: '心', benefit: '补气血' },
  { id: 'red_pepper',  emoji: '🫑', name: '红椒',   color: 'red',    wuxing: '火', organ: '心', benefit: '维A维C双高' },
  { id: 'cherry',      emoji: '🍒', name: '樱桃',   color: 'red',    wuxing: '火', organ: '心', benefit: '铁元素丰富' },
  { id: 'watermelon', emoji: '🍉', name: '西瓜',   color: 'red',    wuxing: '火', organ: '心', benefit: '清热解暑' },
  { id: 'red_bean',   emoji: '🫘', name: '红豆',   color: 'red',    wuxing: '火', organ: '心', benefit: '利水消肿' },

  // 🟡 土·脾（8种）
  { id: 'corn',       emoji: '🌽', name: '玉米',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '膳食纤维冠军' },
  { id: 'banana',     emoji: '🍌', name: '香蕉',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '快乐水果' },
  { id: 'carrot',     emoji: '🥕', name: '胡萝卜', color: 'yellow', wuxing: '土', organ: '脾', benefit: '维A护眼' },
  { id: 'potato',     emoji: '🥔', name: '土豆',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '健脾养胃' },
  { id: 'honey',      emoji: '🍯', name: '蜂蜜',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '天然润燥' },
  { id: 'chestnut',   emoji: '🌰', name: '栗子',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '益气健脾' },
  { id: 'pumpkin',    emoji: '🎃', name: '南瓜',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '护胃养脾' },
  { id: 'soybean',    emoji: '🫘', name: '黄豆',   color: 'yellow', wuxing: '土', organ: '脾', benefit: '植物蛋白' },

  // ⚪ 金·肺（8种）
  { id: 'milk',       emoji: '🥛', name: '牛奶',   color: 'white', wuxing: '金', organ: '肺', benefit: '钙质宝库' },
  { id: 'pear',       emoji: '🍐', name: '雪梨',   color: 'white', wuxing: '金', organ: '肺', benefit: '润肺止咳' },
  { id: 'radish',     emoji: '🥕', name: '白萝卜', color: 'white', wuxing: '金', organ: '肺', benefit: '顺气化痰' },
  { id: 'tremella',  emoji: '🍄', name: '银耳',   color: 'white', wuxing: '金', organ: '肺', benefit: '平民燕窝' },
  { id: 'sesame_w',   emoji: '🥜', name: '白芝麻', color: 'white', wuxing: '金', organ: '肺', benefit: '滋养润肤' },
  { id: 'onion',      emoji: '🧅', name: '洋葱',   color: 'white', wuxing: '金', organ: '肺', benefit: '抗菌卫士' },
  { id: 'lotus',      emoji: '🪷', name: '莲藕',   color: 'white', wuxing: '金', organ: '肺', benefit: '清热润燥' },
  { id: 'tofu',       emoji: '🧈', name: '豆腐',   color: 'white', wuxing: '金', organ: '肺', benefit: '补中益气' },

  // ⚫ 水·肾（8种）
  { id: 'black_bean',  emoji: '🫘', name: '黑豆',   color: 'black', wuxing: '水', organ: '肾', benefit: '补肾乌发' },
  { id: 'black_sesame', emoji: '🖤', name: '黑芝麻', color: 'black', wuxing: '水', organ: '肾', benefit: '滋养肝肾' },
  { id: 'grape',      emoji: '🍇', name: '黑葡萄', color: 'black', wuxing: '水', organ: '肾', benefit: '抗氧化' },
  { id: 'black_rice',  emoji: '🍚', name: '黑米',   color: 'black', wuxing: '水', organ: '肾', benefit: '米中之王' },
  { id: 'walnut',     emoji: '🌰', name: '核桃',   color: 'black', wuxing: '水', organ: '肾', benefit: '益智健脑' },
  { id: 'laver',      emoji: '🥬', name: '紫菜',   color: 'black', wuxing: '水', organ: '肾', benefit: '含碘补钙' },
  { id: 'wood_ear',   emoji: '🍄', name: '黑木耳', color: 'black', wuxing: '水', organ: '肾', benefit: '清肺活血' },
  { id: 'black_chicken', emoji: '🐔', name: '乌鸡', color: 'black', wuxing: '水', organ: '肾', benefit: '滋阴补肾' },
];

// ========== 经典名菜库（硬编码，食材ID匹配） ==========
const CLASSIC_DISHES = [
  { ingredients: ['black_chicken', 'wood_ear'],    name: '乌鸡木耳汤',     rating: 98 },
  { ingredients: ['tomato', 'tofu'],              name: '番茄豆腐汤',     rating: 90 },
  { ingredients: ['spinach', 'tofu'],             name: '菠菜豆腐羹',     rating: 82 },
  { ingredients: ['broccoli', 'onion'],            name: '蒜蓉西蓝花',     rating: 88 },
  { ingredients: ['walnut', 'black_sesame'],       name: '芝麻核桃糊',     rating: 96 },
  { ingredients: ['red_date', 'tremella'],          name: '红枣银耳羹',     rating: 97 },
  { ingredients: ['pear', 'honey'],                name: '蜂蜜炖雪梨',     rating: 95 },
  { ingredients: ['radish', 'tofu'],               name: '萝卜炖豆腐',     rating: 78 },
  { ingredients: ['pumpkin', 'chestnut'],          name: '南瓜栗子煲',     rating: 89 },
  { ingredients: ['celery', 'tofu'],               name: '芹菜拌豆腐',     rating: 80 },
  { ingredients: ['cucumber', 'wood_ear'],         name: '凉拌黄瓜木耳',   rating: 85 },
  { ingredients: ['walnut', 'red_date'],            name: '枣夹核桃',       rating: 87 },
  { ingredients: ['red_bean', 'black_rice'],       name: '红豆黑米粥',     rating: 91 },
  { ingredients: ['corn', 'carrot'],               name: '胡萝卜玉米汤',   rating: 92 },
  { ingredients: ['milk', 'strawberry'],           name: '草莓奶昔',       rating: 93 },
  { ingredients: ['black_bean', 'soybean'],       name: '双豆养肾粥',     rating: 84 },
  { ingredients: ['kiwi', 'honey'],                name: '猕猴桃蜜饮',     rating: 86 },
  { ingredients: ['potato', 'corn'],               name: '土豆玉米饼',     rating: 83 },
  { ingredients: ['strawberry', 'banana'],          name: '草莓香蕉奶昔',   rating: 90 },
  { ingredients: ['tremella', 'lotus'],            name: '银耳莲藕羹',     rating: 94 },
];

// ========== 单品菜（1种食材时） ==========
const SINGLE_DISHES = [
  { ingredient: 'broccoli',  name: '清炒西蓝花',   rating: 82 },
  { ingredient: 'spinach',   name: '蒜蓉菠菜',     rating: 80 },
  { ingredient: 'cucumber',  name: '拍黄瓜',       rating: 78 },
  { ingredient: 'tomato',    name: '糖拌番茄',     rating: 85 },
  { ingredient: 'carrot',    name: '清炒胡萝卜丝', rating: 79 },
  { ingredient: 'pumpkin',   name: '蒸南瓜',       rating: 84 },
  { ingredient: 'corn',      name: '水煮玉米',     rating: 81 },
  { ingredient: 'milk',      name: '热牛奶',       rating: 76 },
  { ingredient: 'pear',      name: '冰糖炖雪梨',   rating: 90 },
  { ingredient: 'honey',     name: '蜂蜜柚子茶',   rating: 83 },
  { ingredient: 'tremella',  name: '红枣银耳羹',   rating: 91 },
  { ingredient: 'black_bean', name: '黑豆豆浆',     rating: 86 },
  { ingredient: 'walnut',    name: '琥珀核桃',     rating: 88 },
  { ingredient: 'wood_ear',  name: '凉拌木耳',     rating: 82 },
  { ingredient: 'tofu',      name: '麻婆豆腐',     rating: 89 },
];

// ========== 五行中文名 ==========
const WUXING_NAMES = { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' };

// ========== 五行相生关系 ==========
const SHENG_MAP = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const SHENG_NAMES = { '木': '春风', '火': '艳阳', '土': '沃土', '金': '清露', '水': '源泉' };

// ========== 颜色中文名 ==========
const COLOR_NAMES = { green: '绿', red: '红', yellow: '黄', white: '白', black: '黑' };

// ========== 功效关键词库（用于随机创意命名） ==========
const COOKING_VERBS = ['炒', '炖', '蒸', '拌', '烤', '烩', '焖', '卤', '炸', '烫'];

// 创意模式扩展词库
const CREATIVE_VERBS = ['清炒', '红烧', '糖醋', '蒜蓉', '葱油', '酱爆', '干煸', '水煮', '油焖', '椒盐', '蜜汁', '醋溜', '宫保', '鱼香', '麻辣', '孜然', '咖喱', '炭烤', '慢炖', '白灼'];
const CREATIVE_STYLES = ['翡翠', '玛瑙', '琥珀', '白玉', '黄金', '碧玉', '珊瑚', '墨玉', '水晶', '彩虹', '珍珠', '琉璃', '云锦', '锦绣', '琉璃', '瑶池', '仙露', '琼浆'];
const CREATIVE_PREFIXES = ['秘制', '私房', '古法', '御膳', '祖传', '特级', '招牌', '限定', '功夫', '养生'];
const CREATIVE_SUFFIXES = ['煲', '汤', '烩', '拼', '荟', '集', '宴', '席', '盏', '品'];
const CREATIVE_POETIC = ['春风', '夏雨', '秋月', '冬雪', '朝露', '晚霞', '流云', '繁星', '晨曦', '暮光', '碧波', '翠微', '丹霞', '玉露', '金风'];

const STYLE_WORDS = ['翡翠', '玛瑙', '琥珀', '白玉', '黄金', '碧玉', '珊瑚', '墨玉', '水晶', '彩虹'];
const TASTE_WORDS = ['鲜香', '甘甜', '爽脆', '软糯', '清香', '浓醇', '酸甜', '麻辣'];
const HEALTH_WORDS = ['养生', '滋补', '清润', '健脾', '护肝', '润肺', '补肾', '暖胃', '益气', '养血'];
