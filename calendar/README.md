# 农历日历项目

这是一个使用 Rust 作为后端、HTML/CSS/JavaScript 作为前端的农历日历应用程序。采用与计算器项目相同的架构模式。

## 项目结构

```
calendar/
├── backend/
│   ├── Cargo.toml          # Rust 项目配置
│   └── src/
│       └── main.rs         # Rust 后端代码（农历计算 API）
└── frontend/
    ├── index.html          # HTML 页面
    ├── script.js           # JavaScript 逻辑
    └── style.css           # CSS 样式
```

## 功能特性

- **农历显示**: 显示农历日期、干支纪年、生肖
- **月历视图**: 标准的月历格子布局，显示公历和农历
- **月份导航**: 支持切换上月/下月，快速返回今天
- **日期详情**: 点击日期查看详细信息
- **键盘支持**: 
  - ←/→: 切换月份
  - T/t: 返回今天
  - ESC: 关闭详情面板
- **国际化**: 支持中文/英文切换
- **响应式设计**: 适配不同屏幕尺寸
- **视觉效果**: 今天高亮显示、周末特殊标记

## 运行说明

### 启动后端服务器

1. 进入后端目录：
```bash
cd calendar/backend
```

2. 运行 Rust 服务器：
```bash
cargo run
```

服务器将在 `http://localhost:3031` 启动。

### 打开前端

1. 在浏览器中打开 `frontend/index.html` 文件
2. 或者使用任何 HTTP 服务器来提供前端文件

## API 接口

### GET /calendar

获取指定年月的日历数据

**参数：**
- `year`: 年份（例如：2024）
- `month`: 月份（1-12）

**响应：**
```json
{
  "year": 2024,
  "month": 1,
  "days": [
    {
      "day": 1,
      "weekday": "一",
      "weekday_num": 1,
      "lunar_day": "二十",
      "lunar_month": "冬月",
      "is_today": false,
      "is_weekend": false
    }
  ],
  "lunar_year": "甲辰年",
  "zodiac": "龙年"
}
```

### GET /lunar

获取指定公历日期对应的农历信息

**参数：**
- `year`: 年份
- `month`: 月份（1-12）
- `day`: 日期（1-31）

**响应：**
```json
{
  "solar_date": "2024-01-01",
  "lunar_date": "冬月二十",
  "lunar_year": "癸卯年",
  "lunar_month": "冬月",
  "lunar_day": "二十",
  "zodiac": "兔年",
  "stem_branch": "癸卯"
}
```

## 技术栈

- **后端**: Rust + Warp web framework + Chrono（日期处理）
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: 现代化 CSS with 渐变、圆角、动画效果
- **通信**: RESTful API with JSON

## 农历计算说明

本项目使用基于农历数据表的算法进行农历日期转换：
- 支持 1900 年至 2100 年的农历计算
- 包含闰月处理
- 准确的干支纪年和生肖计算

## 注意事项

- 确保后端服务器在端口 3031 运行
- 前端通过 CORS 与后端通信
- 建议使用现代浏览器（Chrome, Firefox, Safari, Edge）
