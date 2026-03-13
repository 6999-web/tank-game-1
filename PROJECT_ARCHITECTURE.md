# Tank Game 项目完整架构文档

## 目录
1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [核心架构](#核心架构)
5. [逻辑流程](#逻辑流程)
6. [关键系统](#关键系统)
7. [可复用经验](#可复用经验)
8. [最佳实践](#最佳实践)
9. [扩展指南](#扩展指南)

---

## 项目概述

### 项目简介
Tank Game 是一个基于 Phaser 3 的 2D 坦克射击游戏。玩家控制坦克击败敌人，保护基地，通过多个关卡的挑战。

### 核心特性
- ✅ 多关卡系统（4 个难度递增的关卡）
- ✅ 敌人 AI 系统（基础、快速、重型三种类型）
- ✅ 碰撞检测和物理系统
- ✅ 移动端十字键控制
- ✅ 游戏结束和重新挑战机制
- ✅ 关卡解锁系统

### 游戏流程
```
菜单场景 → 游戏场景 → 游戏结束场景 → 菜单/下一关
```

---

## 技术栈

### 核心框架
- **Phaser 3.80.1** - 游戏引擎
- **Vite 5.0.0** - 构建工具
- **JavaScript (ES6+)** - 编程语言

### 开发工具
- **ESLint 8.56.0** - 代码检查
- **vite-plugin-singlefile 2.3.0** - 单文件打包

### 运行环境
- Node.js + npm
- 现代浏览器（支持 WebGL）

---

## 项目结构

```
tank-game/
├── src/
│   ├── game/                    # 游戏对象类
│   │   ├── Bullet.js           # 子弹类
│   │   ├── PlayerTank.js        # 玩家坦克类
│   │   └── EnemyTank.js         # 敌人坦克类
│   │
│   ├── scenes/                  # 游戏场景
│   │   ├── MenuScene.js         # 菜单场景
│   │   ├── GameScene.js         # 游戏主场景
│   │   └── GameOverScene.js     # 游戏结束场景
│   │
│   └── systems/                 # 游戏系统
│       ├── CollisionSystem.js   # 碰撞检测系统
│       └── LevelSystem.js       # 关卡系统
│
├── index.html                   # 入口 HTML
├── main.js                      # 游戏初始化
├── style.css                    # 样式文件
├── vite.config.js              # Vite 配置
├── package.json                # 项目配置
└── README.md                   # 项目说明
```

### 文件职责说明

| 文件 | 职责 | 行数 |
|------|------|------|
| `main.js` | 初始化 Phaser 游戏配置 | ~50 |
| `Bullet.js` | 子弹对象、运动、销毁逻辑 | ~70 |
| `PlayerTank.js` | 玩家坦克、移动、射击、伤害 | ~150 |
| `EnemyTank.js` | 敌人坦克、AI、行为 | ~200 |
| `MenuScene.js` | 菜单界面、关卡选择 | ~100 |
| `GameScene.js` | 游戏主逻辑、场景管理 | ~350 |
| `GameOverScene.js` | 游戏结束界面、按钮 | ~100 |
| `CollisionSystem.js` | 碰撞检测、伤害处理 | ~100 |
| `LevelSystem.js` | 地图生成、关卡数据 | ~150 |

---

## 核心架构

### 1. 分层架构

```
┌─────────────────────────────────────┐
│         场景层 (Scenes)              │
│  MenuScene | GameScene | GameOverScene
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         系统层 (Systems)             │
│  CollisionSystem | LevelSystem       │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         对象层 (Game Objects)        │
│  PlayerTank | EnemyTank | Bullet     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Phaser 引擎 (Physics/Graphics)  │
└─────────────────────────────────────┘
```

### 2. 数据流向

```
用户输入 (触摸/鼠标)
    ↓
场景处理 (GameScene)
    ↓
对象更新 (PlayerTank.update())
    ↓
系统处理 (CollisionSystem)
    ↓
状态改变 (敌人死亡、基地摧毁等)
    ↓
场景切换 (GameOverScene)
```

### 3. 对象关系图

```
GameScene
├── PlayerTank
│   ├── bullets (Group)
│   └── hpBar (Graphics)
├── EnemyTank[] (Group)
│   └── bullets (Group)
├── CollisionSystem
│   └── 处理所有碰撞
├── LevelSystem
│   ├── wallGroup
│   ├── steelGroup
│   ├── waterGroup
│   ├── grassGroup
│   └── base (Sprite)
└── UI
    └── uiText (Text)
```

---

## 逻辑流程

### 1. 游戏初始化流程

```
main.js
  ↓
Phaser.Game 创建
  ↓
加载资源 (preload)
  ↓
创建场景 (create)
  ├── MenuScene
  ├── GameScene
  └── GameOverScene
  ↓
启动 MenuScene
```

### 2. 游戏场景流程

```
GameScene.create()
  ├── 初始化变量
  ├── 创建物理组
  ├── 调用 initLevel()
  │   ├── 清理旧数据
  │   ├── 构建地图 (LevelSystem.buildMap)
  │   ├── 创建玩家 (PlayerTank)
  │   └── 设置碰撞 (CollisionSystem.setup)
  ├── 创建 UI
  ├── 设置移动控制 (setupMobileControls)
  └── 启动敌人生成定时器
  
GameScene.update(time, delta)
  ├── 检查游戏是否结束
  ├── 更新玩家 (player.update)
  ├── 更新 UI
  └── 检查关卡完成条件

敌人生成定时器 (每 1 秒)
  ├── 检查活跃敌人数量
  ├── 创建新敌人 (EnemyTank)
  └── 添加到敌人组
```

### 3. 碰撞处理流程

```
子弹与环境碰撞
  ├── 子弹与砖墙 → 子弹销毁 + 砖墙销毁
  ├── 子弹与钢墙 → 子弹销毁
  ├── 子弹与基地 → 子弹销毁 + baseDestroyed()
  └── 子弹与水 → 子弹销毁

子弹与敌人碰撞
  ├── 玩家子弹 + 敌人 → 敌人受伤 + 子弹销毁
  └── 敌人子弹 + 玩家 → 玩家受伤 + 子弹销毁

坦克与环境碰撞
  ├── 坦克与墙 → 改变方向
  ├── 坦克与敌人 → 双方改变方向
  └── 坦克与基地 → 改变方向
```

### 4. 游戏结束流程

```
基地被摧毁 或 玩家死亡
  ↓
baseDestroyed() / playerDied()
  ├── 设置 gameOverTriggered = true
  ├── 暂停物理系统 (physics.pause)
  ├── 禁用玩家
  └── 调用 triggerGameOver()
  
triggerGameOver()
  ├── 移除所有定时器
  ├── 杀死所有动画
  └── 切换到 GameOverScene
  
GameOverScene
  ├── 显示游戏结果
  ├── 显示击杀数
  └── 显示按钮
      ├── 重新挑战 (失败时)
      ├── 下一关 (成功时)
      └── 返回首页
```

### 5. 关卡完成流程

```
敌人数量 >= targetKills
  ↓
enemyDestroyed() 被调用
  ├── kills++
  └── 检查 kills >= targetKills
  
levelComplete()
  ├── 暂停物理系统
  ├── 更新解锁进度
  └── 切换到 GameOverScene (win: true)
```

---

## 关键系统

### 1. 碰撞系统 (CollisionSystem)

**职责**: 管理所有碰撞检测和碰撞响应

**核心方法**:
```javascript
setup()                    // 设置所有碰撞
bulletHitWall()           // 子弹击中砖墙
bulletHitSteel()          // 子弹击中钢墙
bulletHitBase()           // 子弹击中基地
playerBulletHitEnemy()    // 玩家子弹击中敌人
enemyBulletHitPlayer()    // 敌人子弹击中玩家
```

**安全检查模式**:
```javascript
// 检查对象存在性
if (!bullet || !bullet.activeBullet || !enemy || !enemy.active) return;

// 检查方法存在性
if (bullet && bullet.destroyBullet) {
    bullet.destroyBullet();
}

// 检查场景状态
if (base && base.active && this.scene && !this.scene.gameOverTriggered) {
    this.scene.baseDestroyed();
}
```

### 2. 关卡系统 (LevelSystem)

**职责**: 管理地图数据、生成地图、敌人生成点

**核心方法**:
```javascript
buildMap()              // 根据地图数据生成地图
getEnemyCount()         // 获取该关卡的敌人数量
getRandomSpawnPoint()   // 获取随机敌人生成点
```

**地图数据格式**:
```javascript
// 0: 空地, 1: 砖墙, 2: 钢墙, 3: 草丛, 4: 水, 5: 基地
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // ... 更多行
]
```

### 3. 玩家坦克系统 (PlayerTank)

**职责**: 管理玩家坦克的移动、射击、伤害

**核心属性**:
```javascript
x, y              // 位置
hp, maxHP         // 生命值
direction         // 当前方向
shootDelay        // 射击冷却时间
bullets           // 子弹组
```

**核心方法**:
```javascript
update(time)      // 每帧更新
move(direction)   // 移动
shoot()           // 射击
takeDamage()      // 受伤
```

### 4. 敌人坦克系统 (EnemyTank)

**职责**: 管理敌人坦克的 AI、移动、射击

**敌人类型**:
- **basic**: 基础敌人，速度和伤害正常
- **fast**: 快速敌人，速度快但伤害低
- **heavy**: 重型敌人，速度慢但伤害高

**AI 行为**:
```javascript
// 随机移动
随机选择方向 → 移动一段距离 → 改变方向

// 随机射击
每隔一段时间 → 随机射击
```

### 5. 子弹系统 (Bullet)

**职责**: 管理子弹的运动、碰撞、销毁

**生命周期**:
```
fire() → 激活 → 运动 → 碰撞/超时 → destroyBullet() → 销毁
```

**销毁条件**:
- 击中障碍物
- 击中敌人/玩家
- 超出屏幕边界
- 存在超过 5 秒

---

## 可复用经验

### 1. 防御性编程模式

#### 1.1 对象存在性检查
```javascript
// ❌ 不安全
bullet.destroyBullet();

// ✅ 安全
if (bullet && bullet.destroyBullet) {
    bullet.destroyBullet();
}
```

**应用场景**:
- 碰撞回调中的对象处理
- 事件监听器中的对象操作
- 异步操作完成后的对象访问

#### 1.2 状态检查模式
```javascript
// 防止重复触发
if (this.gameOverTriggered) return;
this.gameOverTriggered = true;

// 执行关键操作
this.triggerGameOver();
```

**应用场景**:
- 游戏结束处理
- 关键事件触发
- 资源加载完成

#### 1.3 链式检查模式
```javascript
// 检查多个条件
if (base && base.active && this.scene && !this.scene.gameOverTriggered) {
    this.scene.baseDestroyed();
}
```

### 2. 状态管理模式

#### 2.1 标志位管理
```javascript
// 初始化
this.gameOverTriggered = false;
this.isShooting = false;
this.joyStickDirection = null;

// 使用
if (this.gameOverTriggered) return;

// 修改
this.gameOverTriggered = true;
```

#### 2.2 方向状态管理
```javascript
// 存储当前方向
this.joyStickDirection = null;

// 按钮按下时设置
upBtn.on('pointerdown', () => {
    this.joyStickDirection = 'up';
});

// 在 update 中使用
if (this.joyStickDirection === 'up') {
    this.player.moveUp();
}
```

### 3. 系统级解决方案模式

#### 3.1 物理系统管理
```javascript
// 暂停所有物理运动
this.physics.pause();

// 恢复物理运动
this.physics.resume();
```

**优点**:
- 一行代码解决所有物理相关问题
- 比逐个禁用物体更高效
- 易于理解和维护

#### 3.2 事件清理模式
```javascript
triggerGameOver() {
    // 停止所有定时器
    this.time.removeAllEvents();
    
    // 杀死所有补间动画
    this.tweens.killAll();
    
    // 立即切换场景
    this.scene.start('GameOverScene', {...});
}
```

### 4. UI/UX 设计模式

#### 4.1 按钮反馈模式
```javascript
const btn = this.add.rectangle(x, y, width, height, color);

btn.on('pointerdown', () => {
    btn.setFillStyle(darkerColor);  // 按下时变深
});

btn.on('pointerup', () => {
    btn.setFillStyle(originalColor);  // 松开时恢复
});
```

#### 4.2 UI 分组模式
```javascript
// 创建背景容器
const dpadBg = this.add.graphics();
dpadBg.fillStyle(0x333333, 0.6);
dpadBg.fillRoundedRect(x, y, width, height, 8);

// 在背景上添加按钮
const upBtn = this.add.rectangle(x, y - spacing, size, size, color);
```

### 5. 性能优化模式

#### 5.1 对象池模式
```javascript
// 预先创建对象池
this.enemyBullets = this.physics.add.group({ 
    classType: Bullet, 
    runChildUpdate: true 
});

// 复用对象而不是创建新对象
getEnemyBullet() {
    let b = this.enemyBullets.getFirstDead(false);
    if (!b) {
        b = new Bullet(this, 0, 0);
        this.enemyBullets.add(b);
    }
    return b;
}
```

#### 5.2 限制活跃对象数量
```javascript
spawnEnemy() {
    // 限制最大活跃敌人数量
    let aliveEnemies = this.enemies.getChildren()
        .filter(e => e.active).length;
    if (aliveEnemies >= 12) return;
    
    // 创建新敌人
    const enemy = new EnemyTank(this, x, y);
    this.enemies.add(enemy);
}
```

### 6. 代码组织模式

#### 6.1 方法分离模式
```javascript
// ✅ 好 - 分离职责
baseDestroyed() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this.physics.pause();
    this.triggerGameOver();
}

triggerGameOver() {
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.scene.start('GameOverScene', {...});
}
```

#### 6.2 常量提取模式
```javascript
setupMobileControls() {
    const dpadX = 100;
    const dpadY = 680;
    const btnSize = 40;
    const spacing = 45;
    
    // 使用常量
    const upBtn = this.add.rectangle(dpadX, dpadY - spacing, btnSize, btnSize);
}
```

---

## 最佳实践

### 1. 命名规范

**类名**: PascalCase
```javascript
class PlayerTank { }
class EnemyTank { }
class CollisionSystem { }
```

**方法名**: camelCase
```javascript
baseDestroyed()
triggerGameOver()
playerBulletHitEnemy()
```

**常量**: UPPER_SNAKE_CASE
```javascript
const MAX_ENEMIES = 12;
const SPAWN_INTERVAL = 1000;
const PLAYER_SPEED = 150;
```

**私有属性**: 前缀下划线
```javascript
this._internalState = false;
this._cachedValue = null;
```

### 2. 代码组织

**单一职责原则**:
- 每个类只负责一个功能
- 每个方法只做一件事
- 系统之间通过接口通信

**依赖注入**:
```javascript
// ✅ 好 - 注入依赖
class CollisionSystem {
    constructor(scene) {
        this.scene = scene;
    }
}

// ❌ 不好 - 硬编码依赖
class CollisionSystem {
    constructor() {
        this.scene = window.gameScene;  // 全局依赖
    }
}
```

### 3. 错误处理

**防御性检查**:
```javascript
// 检查参数
if (!scene || !enemies || !playerBullets) {
    console.error('Invalid parameters');
    return;
}

// 检查状态
if (this.gameOverTriggered) return;

// 检查对象
if (bullet && bullet.destroyBullet) {
    bullet.destroyBullet();
}
```

### 4. 性能考虑

**避免在 update 中创建对象**:
```javascript
// ❌ 不好 - 每帧创建新对象
update() {
    const newBullet = new Bullet(this, x, y);  // 频繁创建
}

// ✅ 好 - 使用对象池
update() {
    const bullet = this.getEnemyBullet();  // 复用对象
}
```

**缓存计算结果**:
```javascript
// ❌ 不好 - 每次都计算
if (Math.sqrt(dx * dx + dy * dy) > maxDist) { }

// ✅ 好 - 缓存结果
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist > maxDist) { }
```

### 5. 调试技巧

**使用标志位追踪状态**:
```javascript
// 添加调试标志
this.DEBUG = true;

// 在关键位置输出日志
if (this.DEBUG) {
    console.log('Enemy spawned:', enemy.type);
    console.log('Collision detected:', bullet, target);
}
```

**使用浏览器开发者工具**:
- 设置断点
- 监视变量
- 查看网络请求
- 检查性能

---

## 扩展指南

### 1. 添加新的敌人类型

**步骤**:
1. 在 `EnemyTank.js` 中添加新类型
2. 定义新类型的属性（速度、伤害、生命值）
3. 实现新的 AI 行为
4. 在 `GameScene.spawnEnemy()` 中添加生成逻辑

**示例**:
```javascript
// 在 EnemyTank 构造函数中
if (type === 'boss') {
    this.speed = 80;
    this.hp = 5;
    this.shootDelay = 500;
    this.shootRange = 300;
}
```

### 2. 添加新的关卡

**步骤**:
1. 在 `LevelSystem.js` 的 `levels` 数组中添加新地图
2. 定义地图数据（13x13 网格）
3. 设置敌人数量

**示例**:
```javascript
// 在 levels 数组中添加
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // ... 更多行
    [0, 1, 1, 0, 1, 5, 5, 5, 1, 0, 1, 1, 0]
]
```

### 3. 添加新的游戏机制

**示例 - 添加护盾系统**:
```javascript
// 在 PlayerTank 中添加
this.shield = false;
this.shieldDuration = 0;

// 在 update 中更新
if (this.shield) {
    this.shieldDuration--;
    if (this.shieldDuration <= 0) {
        this.shield = false;
    }
}

// 在碰撞处理中检查
if (this.shield) {
    this.shield = false;  // 护盾消耗
    return;  // 不受伤
}
```

### 4. 添加音效系统

**步骤**:
1. 在 `main.js` 中加载音频资源
2. 在关键事件处播放音效

**示例**:
```javascript
// 在 preload 中
this.load.audio('shoot', 'assets/shoot.mp3');
this.load.audio('explosion', 'assets/explosion.mp3');

// 在事件中播放
this.sound.play('shoot');
this.sound.play('explosion');
```

### 5. 添加动画效果

**示例 - 爆炸动画**:
```javascript
// 在 enemyDestroyed 中
const explosion = this.add.sprite(x, y, 'explosion');
this.tweens.add({
    targets: explosion,
    scale: 1.5,
    alpha: 0,
    duration: 300,
    onComplete: () => {
        explosion.destroy();
    }
});
```

### 6. 添加存档系统

**步骤**:
1. 使用 localStorage 保存数据
2. 在游戏初始化时读取

**示例**:
```javascript
// 保存
localStorage.setItem('unlockedLevel', this.unlockedLevel);
localStorage.setItem('highScore', this.highScore);

// 读取
const unlockedLevel = localStorage.getItem('unlockedLevel') || 0;
const highScore = localStorage.getItem('highScore') || 0;
```

---

## 总结

### 核心要点

| 方面 | 要点 |
|------|------|
| **架构** | 分层架构，清晰的职责划分 |
| **逻辑** | 事件驱动，状态管理 |
| **性能** | 对象池，限制活跃对象 |
| **代码** | 防御性编程，单一职责 |
| **扩展** | 模块化设计，易于扩展 |

### 可复用的核心模式

1. **防御性编程** - 检查对象存在性和状态
2. **状态管理** - 使用标志位控制流程
3. **系统级解决** - 从系统层面解决问题
4. **对象池** - 复用对象，提高性能
5. **事件驱动** - 解耦各个系统
6. **分层架构** - 清晰的职责划分

### 后续改进方向

- 🎵 添加音效系统
- ✨ 添加粒子效果
- 🎮 添加更多敌人类型
- 💾 添加存档系统
- 📱 优化移动端适配
- 🏆 添加排行榜系统
- 🎯 添加成就系统

---

## 快速参考

### 常用 API

**Phaser 物理系统**:
```javascript
this.physics.pause()              // 暂停物理
this.physics.resume()             // 恢复物理
this.physics.add.collider()       // 添加碰撞
this.physics.add.overlap()        // 添加重叠检测
```

**Phaser 时间系统**:
```javascript
this.time.addEvent({...})         // 添加定时器
this.time.removeAllEvents()       // 移除所有定时器
this.time.delayedCall()           // 延迟执行
```

**Phaser 场景系统**:
```javascript
this.scene.start()                // 启动场景
this.scene.stop()                 // 停止场景
this.scene.switch()               // 切换场景
```

**Phaser 补间系统**:
```javascript
this.tweens.add({...})            // 添加补间
this.tweens.killAll()             // 杀死所有补间
```

---

## 相关文档

- [SKILL.md](./SKILL.md) - 今日开发技能总结
- [REUSABLE_PATTERNS.md](./REUSABLE_PATTERNS.md) - 可复用的开发模式
- [README.md](./README.md) - 项目说明
- [TankGame_Manual.md](./TankGame_Manual.md) - 游戏手册

---

**最后更新**: 2026-03-13  
**版本**: 1.0.0  
**作者**: Tank Game Development Team
