# Rust 计算器项目

这是一个使用 Rust 作为后端、HTML/CSS/JavaScript 作为前端的基础计算器应用程序。

## 项目结构

```
calculator-project/
├── backend/
│   ├── Cargo.toml          # Rust 项目配置
│   └── src/
│       └── main.rs         # Rust 后端代码
└── frontend/
    ├── index.html          # HTML 页面
    ├── script.js           # JavaScript 逻辑
    └── style.css           # CSS 样式
```

## 运行说明

### 启动后端服务器

1. 进入后端目录：
```bash
cd calculator-project/backend
```

2. 运行 Rust 服务器：
```bash
cargo run
```

服务器将在 `http://localhost:3030` 启动。

### 打开前端

1. 在浏览器中打开 `frontend/index.html` 文件
2. 或者使用任何 HTTP 服务器来提供前端文件

## 功能特性

- **基本算术运算**：支持加法 (+)、减法 (-)、乘法 (*)、除法 (/)
- **键盘支持**：可以使用键盘输入数字和运算符
  - Enter: 计算
  - Escape: 清除
  - Backspace: 删除最后一个字符
- **响应式设计**：适配不同屏幕尺寸
- **实时状态反馈**：显示计算状态和错误信息
- **现代化界面**：渐变背景、圆角按钮、动画效果

## API 接口

### POST /calculate

计算数学表达式

**请求体：**
```json
{
  "expression": "5 + 3"
}
```

**响应：**
```json
{
  "result": 8.0,
  "error": null
}
```

**错误响应：**
```json
{
  "result": 0.0,
  "error": "Division by zero"
}
```

## 技术栈

- **后端**: Rust + Warp web framework
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: 现代化 CSS with 渐变和动画
- **通信**: RESTful API with JSON