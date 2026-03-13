# 可复用的开发经验和模式

基于坦克游戏开发过程中的实践总结，这些模式可以应用到其他项目中。

## 一、问题诊断模式

### 1.1 系统级问题的识别方法

**症状**: 页面卡死、性能下降、异常行为

**诊断步骤**:
1. **观察现象** - 记录具体的表现（何时发生、在什么条件下）
2. **追踪调用链** - 从用户操作 → 事件触发 → 系统响应
3. **检查系统状态** - 物理系统、定时器、事件监听器是否正常
4. **分析根本原因** - 不是表面现象，而是深层的系统问题

**案例**: 基地摧毁卡机
```
表面现象: 页面冻结
↓
调用链: 子弹击中基地 → 碰撞回调 → baseDestroyed() → 场景切换
↓
系统状态: 物理系统仍在运行，敌人和子弹继续移动
↓
根本原因: 物理系统未暂停，导致持续碰撞触发
↓
解决方案: this.physics.pause()
```

### 1.2 问题优先级判断

**优先级排序**:
1. **致命问题** (游戏无法进行) → 立即修复
2. **严重问题** (影响用户体验) → 高优先级
3. **功能问题** (功能不完整) → 中优先级
4. **优化问题** (性能、美观) → 低优先级

**今天的例子**:
- 卡机问题 → 致命 (优先级 1)
- 敌人生成间隔 → 严重 (优先级 2)
- 十字键美化 → 优化 (优先级 4)

---

## 二、防御性编程模式

### 2.1 对象存在性检查

**问题**: 对象可能被销毁、为 null 或 undefined

**模式**:
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

### 2.2 状态检查模式

**问题**: 同一事件可能被多次触发

**模式**:
```javascript
// 使用标志位防止重复触发
if (this.gameOverTriggered) return;
this.gameOverTriggered = true;

// 执行关键操作
this.triggerGameOver();
```

**应用场景**:
- 游戏结束处理
- 关键事件触发
- 资源加载完成

### 2.3 链式检查模式

**问题**: 多个条件需要同时满足

**模式**:
```javascript
// 检查多个条件
if (base && base.active && this.scene && !this.scene.gameOverTriggered) {
    this.scene.baseDestroyed();
}
```

**优点**:
- 清晰的逻辑流
- 避免空引用错误
- 易于维护和调试

---

## 三、状态管理模式

### 3.1 标志位管理

**用途**: 控制程序流程，防止重复执行

**模式**:
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

**最佳实践**:
- 在 `create()` 中初始化所有标志位
- 使用清晰的命名（动词过去式表示状态）
- 在关键位置检查标志位

### 3.2 方向状态管理

**模式**:
```javascript
// 存储当前方向
this.joyStickDirection = null;  // 初始状态

// 按钮按下时设置
upBtn.on('pointerdown', () => {
    this.joyStickDirection = 'up';
});

// 按钮松开时清除
upBtn.on('pointerup', () => {
    if (this.joyStickDirection === 'up') {
        this.joyStickDirection = null;
    }
});

// 在 update 中使用
if (this.joyStickDirection === 'up') {
    this.player.moveUp();
}
```

---

## 四、系统级解决方案模式

### 4.1 物理系统管理

**问题**: 需要暂停所有物理运动

**解决方案**:
```javascript
// 暂停所有物理运动和碰撞检测
this.physics.pause();

// 恢复物理运动
this.physics.resume();
```

**优点**:
- 一行代码解决所有物理相关问题
- 比逐个禁用物体更高效
- 易于理解和维护

### 4.2 事件清理模式

**问题**: 场景切换时需要清理所有事件

**模式**:
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

**应用场景**:
- 场景切换前
- 游戏结束时
- 重新开始游戏时

---

## 五、UI/UX 设计模式

### 5.1 按钮反馈模式

**模式**:
```javascript
const btn = this.add.rectangle(x, y, width, height, color);

btn.on('pointerdown', () => {
    btn.setFillStyle(darkerColor);  // 按下时变深
    this.action();
});

btn.on('pointerup', () => {
    btn.setFillStyle(originalColor);  // 松开时恢复
});

btn.on('pointerout', () => {
    btn.setFillStyle(originalColor);  // 移出时恢复
});
```

**优点**:
- 给用户清晰的视觉反馈
- 提高交互体验
- 让用户知道按钮被按下了

### 5.2 UI 分组模式

**模式**:
```javascript
// 创建背景容器
const dpadBg = this.add.graphics();
dpadBg.fillStyle(0x333333, 0.6);
dpadBg.fillRoundedRect(x, y, width, height, 8);

// 在背景上添加按钮
const upBtn = this.add.rectangle(x, y - spacing, size, size, color);
const downBtn = this.add.rectangle(x, y + spacing, size, size, color);
// ...
```

**优点**:
- 视觉上更整体
- 易于管理相关 UI 元素
- 提高代码组织性

### 5.3 颜色设计模式

**模式**:
```javascript
// 定义颜色常量
const COLORS = {
    PRIMARY: 0x2196F3,      // 主色 - 蓝色
    PRIMARY_DARK: 0x1976D2, // 主色深 - 深蓝色
    ACCENT: 0xFF5252,       // 强调色 - 红色
    ACCENT_DARK: 0xD32F2F,  // 强调色深 - 深红色
    BG: 0x333333,           // 背景 - 深灰色
};

// 使用
const btn = this.add.rectangle(x, y, w, h, COLORS.PRIMARY);
btn.on('pointerdown', () => {
    btn.setFillStyle(COLORS.PRIMARY_DARK);
});
```

**优点**:
- 统一的视觉风格
- 易于修改和维护
- 提高代码可读性

---

## 六、迭代开发模式

### 6.1 功能优先，优化其次

**步骤**:
1. **实现功能** - 先让功能工作
2. **修复问题** - 解决 bug 和卡机
3. **优化体验** - 改进 UI 和性能
4. **打磨细节** - 颜色、动画、反馈

**今天的例子**:
```
第一步: 实现十字键功能 ✓
第二步: 修复卡机问题 ✓
第三步: 美化十字键 UI ✓
第四步: 添加按钮反馈 ✓
```

### 6.2 单一职责原则

**模式**: 每次只改一个问题

**好处**:
- 易于测试和验证
- 如果出现新问题，容易定位
- 代码改动最小化

**今天的例子**:
- 改动 1: 敌人生成间隔
- 改动 2: 基地摧毁卡机
- 改动 3: 十字键 UI

---

## 七、代码组织模式

### 7.1 方法分离模式

**问题**: 一个方法做太多事情

**模式**:
```javascript
// ❌ 不好 - 一个方法做所有事
baseDestroyed() {
    // 检查状态
    // 暂停物理
    // 更新 UI
    // 切换场景
}

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

### 7.2 常量提取模式

**模式**:
```javascript
// 在方法开头定义常量
setupMobileControls() {
    const dpadX = 100;
    const dpadY = 680;
    const btnSize = 40;
    const spacing = 45;
    
    // 使用常量
    const upBtn = this.add.rectangle(dpadX, dpadY - spacing, btnSize, btnSize);
}
```

**优点**:
- 易于调整参数
- 代码更清晰
- 减少魔法数字

---

## 八、调试和测试模式

### 8.1 问题复现模式

**步骤**:
1. 记录问题发生的条件
2. 找到最小复现步骤
3. 在该条件下测试修复
4. 验证修复不会引入新问题

**今天的例子**:
```
问题: 击中基地时卡机
复现: 射击 → 击中基地 → 页面冻结
修复: 添加 physics.pause()
验证: 击中基地 → 正常显示游戏结束界面
```

### 8.2 增量测试模式

**模式**:
- 修改一个文件
- 测试该文件的功能
- 确认没有引入新问题
- 再修改下一个文件

**优点**:
- 快速定位问题
- 减少调试时间
- 提高代码质量

---

## 九、文档和版本控制模式

### 9.1 提交信息模式

**格式**:
```
类型: 简短描述

详细说明:
- 改动 1
- 改动 2
- 改动 3
```

**例子**:
```
Update: 优化游戏控制和碰撞系统

- 将遥感控制改为十字键
- 修复基地被摧毁时的卡机问题
- 改进碰撞系统的安全检查
- 敌人生成间隔从2秒改为1秒
```

### 9.2 技术文档模式

**结构**:
1. 问题描述
2. 根本原因分析
3. 解决方案
4. 代码示例
5. 应用场景
6. 最佳实践

---

## 十、性能优化模式

### 10.1 对象池模式

**问题**: 频繁创建和销毁对象导致性能下降

**模式**:
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

### 10.2 限制活跃对象数量

**模式**:
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

**优点**:
- 防止内存溢出
- 保持稳定的帧率
- 提高游戏流畅度

---

## 总结：可复用的核心原则

| 原则 | 说明 | 应用 |
|------|------|------|
| **防御性编程** | 检查对象存在性和状态 | 碰撞处理、事件回调 |
| **状态管理** | 使用标志位控制流程 | 游戏结束、按钮状态 |
| **系统级解决** | 从系统层面解决问题 | 物理系统暂停 |
| **单一职责** | 每个方法只做一件事 | 方法分离 |
| **快速迭代** | 功能优先，优化其次 | 开发流程 |
| **清晰文档** | 记录问题和解决方案 | 技术文档 |
| **版本控制** | 定期提交，记录改动 | Git 提交 |
| **性能优化** | 对象池、限制数量 | 内存管理 |

这些模式不仅适用于游戏开发，也适用于其他类型的项目。掌握这些模式，能帮助你写出更健壮、更易维护的代码。
