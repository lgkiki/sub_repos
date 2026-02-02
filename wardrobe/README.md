# 电子衣柜

一个现代化的电子衣柜管理系统，参考尽简衣橱设计风格，使用 Rust 后端和现代前端技术实现。

## 🎨 设计特色

- **现代简约设计** - 参考尽简衣橱的简洁美学
- **卡片式布局** - 清晰直观的衣物展示
- **响应式设计** - 完美适配桌面和移动设备
- **流畅动画** - 优雅的交互体验

## 功能特性

- 🌟 **智能分类** - 按季节（春秋装/夏装/冬装）和类型（上衣/下装/连衣裙/外套）分类
- 👕 **快速筛选** - 多维度筛选和搜索功能
- 🏷️ **详细记录** - 记录衣物标签、价格、购买时间等信息
- 🔢 **穿着统计** - 追踪每件衣物的使用频率
- 📸 **图片支持** - 为每件衣物添加图片
- 📊 **数据统计** - 实时显示衣橱统计数据
- 📱 **移动友好** - 响应式设计，随时随地管理衣橱

## 项目结构

```
wardrobe/
├── backend/           # Rust 后端服务
│   ├── src/
│   │   ├── main.rs   # 主程序
│   │   └── models.rs # 数据模型
│   └── Cargo.toml    # Rust 项目配置
└── frontend/         # 前端文件
    ├── index.html    # 主页面
    └── static/
        ├── style.css # 样式文件
        └── script.js # JavaScript 逻辑
```

## 快速开始

### 启动后端服务

```bash
cd backend
cargo run
```

服务器将在 http://192.168.3.176:3030 启动

### 访问应用

打开浏览器访问 http://192.168.3.176:3030

**界面预览：**
- 🎨 **现代化卡片设计** - 类似尽简衣橱的简洁风格
- 📱 **响应式布局** - 桌面和移动端完美适配
- ✨ **流畅动画** - 优雅的交互体验
- 🔍 **智能筛选** - 快速找到想要的衣物

## API 接口

### 衣物管理
- `GET /api/clothes` - 获取所有衣物
- `POST /api/clothes` - 添加新衣物
- `GET /api/clothes/{id}` - 获取特定衣物
- `PUT /api/clothes/{id}` - 更新衣物信息
- `DELETE /api/clothes/{id}` - 删除衣物

### 筛选接口
- `GET /api/clothes/season/{season}` - 按季节筛选
- `GET /api/clothes/type/{type}` - 按类型筛选

## 数据模型

```rust
pub struct Clothing {
    pub id: Uuid,
    pub label: String,
    pub clothing_type: ClothingType, // Top, Bottom, Dress, Outerwear
    pub season: Season,              // SpringAutumn, Summer, Winter
    pub wear_count: u32,
    pub purchase_date: DateTime<Utc>,
    pub image_url: Option<String>,
}
```

## 技术栈

**后端:**
- Rust
- Warp (Web 框架)
- Serde (JSON 序列化)
- UUID (唯一标识)
- Chrono (时间处理)

**前端:**
- **HTML5** - 语义化标签和现代API
- **CSS3** - 
  - Grid 和 Flexbox 布局
  - CSS 动画和过渡
  - 响应式设计
  - 现代卡片式设计
- **Vanilla JavaScript** - ES6+ 特性
- **Fetch API** - 异步数据交互
- **Inter 字体** - 现代化字体设计

## 🎯 核心特性

### 1. 现代化界面设计
- **卡片式布局** - 简洁直观的衣物展示
- **流畅动画** - 优雅的悬停和过渡效果
- **暗色/明亮配色** - 专业的视觉体验
- **图标系统** - 直观的视觉引导

### 2. 智能筛选系统
- **多维度筛选** - 类型、季节、标签组合筛选
- **实时搜索** - 即时查找衣物
- **快速过滤** - 一键切换筛选条件

### 3. 数据管理
- **内存存储** - 轻量级数据管理
- **实时同步** - 操作即时生效
- **统计面板** - 衣橱使用情况一目了然

### 4. 移动端优化
- **触屏友好** - 完美的移动交互体验
- **自适应布局** - 各种屏幕尺寸完美适配
- **手势支持** - 滑动、点击等自然操作

## 开发说明

这个项目使用内存存储，适合演示和学习使用。如果需要持久化存储，可以考虑：

- 集成 SQLite 数据库
- 添加数据导出/导入功能
- 实现用户认证和多用户支持