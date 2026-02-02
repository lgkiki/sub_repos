# 电子衣柜

一个使用 Rust 后端和 HTML/CSS/JavaScript 前端的电子衣柜管理系统。

## 功能特性

- 🌟 按季节分类衣物（春秋装/夏装/冬装）
- 👕 按类型分类衣物（上衣/裤子/裙子/外套）
- 🏷️ 为每件衣物添加自定义标签
- 🔢 记录和修改穿着次数
- 📸 支持添加衣物图片
- 📅 记录购买时间
- 📱 响应式设计，支持移动端

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
- HTML5
- CSS3 (响应式设计)
- Vanilla JavaScript
- Fetch API

## 特性说明

1. **无数据库设计** - 数据存储在内存中，重启后数据会重置
2. **实时更新** - 所有操作立即反映在界面上
3. **图片支持** - 可以为每件衣物添加图片URL
4. **智能筛选** - 支持按季节和类型组合筛选
5. **计数功能** - 方便记录每件衣物的使用频率

## 开发说明

这个项目使用内存存储，适合演示和学习使用。如果需要持久化存储，可以考虑：

- 集成 SQLite 数据库
- 添加数据导出/导入功能
- 实现用户认证和多用户支持