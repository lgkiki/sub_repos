#!/bin/bash

echo "🎨 启动电子衣柜应用"
echo "=========================="

cd backend

echo "📦 编译 Rust 后端..."
cargo build --release

echo "🚀 启动服务器..."
echo "服务器地址: http://192.168.3.176:3030"
echo "按 Ctrl+C 停止服务"
echo ""

cargo run --release