# Web 坦克大战小游戏

这是一个基于 HTML5 Canvas 和 Phaser.js 引擎开发的经典坦克大战小游戏，支持 PC 键盘和手机触屏操作。

## 游戏特点
- 使用 Phaser.js (v3) 构建，物理引擎采用 Arcade Physics
- 支持 PC 端键盘操作 (W/A/S/D 或方向键移动，空格键射击)
- 支持手机端触屏操作 (左下角虚拟摇杆，右下角射击按钮)
- 包含 3 个关卡，难度递增。不同的墙体和地形（空地、砖墙、钢墙、草丛、水）
- 3 种类型的敌人：普通坦克、快速坦克、重型坦克

## 快速开始

本项目使用 Vite 作为构建工具。如果你安装了 Node.js，可以按照以下步骤运行游戏：

1. 进入项目目录：
   ```bash
   cd tank-game
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行开发服务器：
   ```bash
   npm run dev
   ```

启动后会显示一个本地地址 (例如 `http://localhost:5173`)，请在浏览器中打开该地址即可游玩！

如果是想打包发布：
```bash
npm run build
```

## 目录结构
```text
tank-game/
├── index.html         - 游戏入口页面
├── style.css          - 全局样式 (用于让游戏容器居中并响应式)
├── main.js            - 游戏入口及 Phaser 配置
├── package.json       - npm 依赖配置
├── src/
│   ├── game/
│   │   ├── Bullet.js      - 子弹类
│   │   ├── EnemyTank.js   - 敌方坦克类
│   │   └── PlayerTank.js  - 玩家坦克类
│   ├── scenes/
│   │   ├── GameOverScene.js - 游戏结束场景
│   │   ├── GameScene.js     - 游戏核心场景
│   │   └── MenuScene.js     - 游戏主菜单场景 (包含动态生成素材的代码)
│   └── systems/
│       ├── CollisionSystem.js - 碰撞检测系统
│       └── LevelSystem.js     - 关卡地图生成系统
```

## 技术说明
- 游戏中没有使用任何外部图片，所有素材均在 `MenuScene.js` 中使用 `Graphics` 对象动态生成并注册为纹理，做到了完全免外部素材，一键直接运行。
- 代码全部采用 ES6+ 的 Class 进行模块化抽象，清晰易于扩展。
