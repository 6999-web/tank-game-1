import Phaser from 'phaser';
import { PlayerTank } from '../game/PlayerTank.js';
import { EnemyTank } from '../game/EnemyTank.js';
import { Bullet } from '../game/Bullet.js';
import { LevelSystem } from '../systems/LevelSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.currentLevelIndex = data.levelIndex || 0;
    }

    create() {
        this.levelSystem = new LevelSystem(this);
        this.collisionSystem = new CollisionSystem(this);

        this.kills = 0;
        this.targetKills = 0;
        this.spawnedEnemies = 0;
        this.player = null;
        this.base = null;
        this.joyStickDirection = null;
        this.isShooting = false;
        this.gameOverTriggered = false; // 防止死机/重复触发

        // Multi-touch support
        this.input.addPointer(2);

        this.wallGroup = this.physics.add.staticGroup();
        this.steelGroup = this.physics.add.staticGroup();
        this.waterGroup = this.physics.add.staticGroup();
        this.grassGroup = this.physics.add.staticGroup();

        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: EnemyTank, runChildUpdate: true });
        this.powerUps = this.physics.add.group();

        this.initLevel();

        // UI Setup
        this.uiText = this.add.text(20, 10, '', {
            fontSize: '28px',
            fill: '#fff',
            fontWeight: 'bold',
            stroke: '#000',
            strokeThickness: 4,
            backgroundColor: '#0004'
        });
        this.uiText.setScrollFactor(0);
        this.uiText.setDepth(200);

        this.setupMobileControls();
        this.updateUI();

        // Enemy Spawner - Faster spawn
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    initLevel() {
        // Clear previous state safely
        this.wallGroup.clear(true, true);
        this.steelGroup.clear(true, true);
        this.waterGroup.clear(true, true);
        this.grassGroup.clear(true, true);
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);

        if (this.player) {
            if (this.player.hpBar) this.player.hpBar.destroy();
            if (this.player.bullets) this.player.bullets.destroy(true);
            this.player.destroy();
            this.player = null;
        }
        if (this.base) {
            this.base.destroy();
            this.base = null;
        }

        // Build Map
        this.base = this.levelSystem.buildMap(this.currentLevelIndex, this.wallGroup, this.steelGroup, this.waterGroup, this.grassGroup);

        this.targetKills = this.levelSystem.getEnemyCount();
        this.spawnedEnemies = 0;
        this.kills = 0; // Reset kills for current level

        // Create player slightly to the left of the base
        const playerX = this.levelSystem.offsetX + 4 * this.levelSystem.tileSize + this.levelSystem.tileSize / 2;
        const playerY = this.levelSystem.offsetY + 12 * this.levelSystem.tileSize + this.levelSystem.tileSize / 2;
        this.player = new PlayerTank(this, playerX, playerY);

        this.collisionSystem.setup(
            this.player,
            this.enemies,
            this.player.bullets,
            this.enemyBullets,
            this.wallGroup,
            this.steelGroup,
            this.waterGroup,
            this.base
        );

        // PowerUp overlap
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    }

    collectPowerUp(player, powerUp) {
        powerUp.destroy();
        player.shootDelay = Math.max(50, player.shootDelay - 30); // 捡起后射速加快
        player.hp = Math.min(player.hp + 1, player.maxHP); // 恢复 1 点生命值
        this.updateUI();
    }

    updateUI() {
        if (!this.player) return;

        this.uiText.setText(
            `第 ${this.currentLevelIndex + 1} 关 | 生命: ${Math.max(0, this.player.hp)} | ` +
            `击败: ${this.kills} / ${this.targetKills}`
        );
    }

    update(time, delta) {
        if (this.gameOverTriggered) return;
        if (this.player && this.player.active) {
            this.player.update(time);
            if (this.base) this.base.setDepth(1);
        }
        this.updateUI();
    }

    createBullet() {
        return new Bullet(this, 0, 0);
    }

    getEnemyBullet() {
        let b = this.enemyBullets.getFirstDead(false);
        if (!b) {
            b = new Bullet(this, 0, 0);
            this.enemyBullets.add(b);
        }
        return b;
    }

    spawnEnemy() {
        // Limit max alive enemies to prevent lag, but spawn infinitely
        let aliveEnemies = this.enemies.getChildren().filter(e => e.active).length;
        if (aliveEnemies >= 12) return;

        const pt = this.levelSystem.getRandomSpawnPoint();

        let typeRand = Math.random();
        let type = 'basic';
        if (this.currentLevelIndex > 0) {
            if (typeRand > 0.8) type = 'heavy';
            else if (typeRand > 0.5) type = 'fast';
        }

        const enemy = new EnemyTank(this, pt.x, pt.y, type);
        this.enemies.add(enemy);
        this.spawnedEnemies++;
    }

    enemyDestroyed(x, y) {
        this.kills++;

        if (x !== undefined && y !== undefined && Math.random() < 0.3) {
            const pu = this.powerUps.create(x, y, 'powerup');
            this.tweens.add({
                targets: pu,
                y: pu.y - 10,
                yoyo: true,
                repeat: -1,
                duration: 500
            });
        }

        if (this.kills >= this.targetKills) {
            this.levelComplete();
        }
    }

    baseDestroyed() {
        if (this.gameOverTriggered) return;
        this.gameOverTriggered = true;
        
        // 立即暂停物理系统
        this.physics.pause();
        
        if (this.base) {
            this.base.setTexture('base_dead');
            if (this.base.body) {
                this.base.body.enable = false;
            }
        }
        if (this.player) {
            this.player.active = false;
            this.player.setVelocity(0, 0);
        }
        this.triggerGameOver();
    }

    playerDied() {
        if (this.gameOverTriggered) return;
        this.gameOverTriggered = true;
        
        // 立即暂停物理系统
        this.physics.pause();
        
        if (this.player) {
            this.player.active = false;
        }
        this.triggerGameOver();
    }

    triggerGameOver() {
        // 停止所有定时器和动画
        this.time.removeAllEvents();
        this.tweens.killAll();
        
        // 立即切换场景
        this.scene.start('GameOverScene', {
            win: false,
            kills: this.kills,
            levelIndex: this.currentLevelIndex
        });
    }

    levelComplete() {
        // 立即暂停物理系统
        this.physics.pause();
        
        // 更新本次运行的解锁进度（不保存到 localStorage）
        const finishedLevel = this.currentLevelIndex;
        const nextLevelIndex = finishedLevel + 1;

        if (window.unlockedLevel === undefined) window.unlockedLevel = 0;
        if (nextLevelIndex > window.unlockedLevel) {
            window.unlockedLevel = nextLevelIndex;
        }

        // 停止当前游戏，去显示“挑战成功”页面
        this.scene.start('GameOverScene', {
            win: true,
            kills: this.kills,
            levelIndex: finishedLevel,
            hasNext: nextLevelIndex < this.levelSystem.levels.length
        });
    }

    setupMobileControls() {
        // 十字键控制 - 四个方向按钮，紧凑设计
        const dpadX = 100;
        const dpadY = 680;
        const btnSize = 40;
        const spacing = 45;

        // 创建十字键背景容器
        const dpadBg = this.add.graphics();
        dpadBg.fillStyle(0x333333, 0.6);
        dpadBg.fillRoundedRect(dpadX - spacing - 5, dpadY - spacing - 5, spacing * 2 + 10, spacing * 2 + 10, 8);
        dpadBg.setDepth(149).setScrollFactor(0);

        // 上键
        const upBtn = this.add.rectangle(dpadX, dpadY - spacing, btnSize, btnSize, 0x2196F3).setInteractive().setDepth(150).setScrollFactor(0);
        upBtn.on('pointerdown', () => {
            this.joyStickDirection = 'up';
            upBtn.setFillStyle(0x1976D2);
        });
        upBtn.on('pointerup', () => {
            if (this.joyStickDirection === 'up') this.joyStickDirection = null;
            upBtn.setFillStyle(0x2196F3);
        });
        upBtn.on('pointerout', () => {
            if (this.joyStickDirection === 'up') this.joyStickDirection = null;
            upBtn.setFillStyle(0x2196F3);
        });

        // 下键
        const downBtn = this.add.rectangle(dpadX, dpadY + spacing, btnSize, btnSize, 0x2196F3).setInteractive().setDepth(150).setScrollFactor(0);
        downBtn.on('pointerdown', () => {
            this.joyStickDirection = 'down';
            downBtn.setFillStyle(0x1976D2);
        });
        downBtn.on('pointerup', () => {
            if (this.joyStickDirection === 'down') this.joyStickDirection = null;
            downBtn.setFillStyle(0x2196F3);
        });
        downBtn.on('pointerout', () => {
            if (this.joyStickDirection === 'down') this.joyStickDirection = null;
            downBtn.setFillStyle(0x2196F3);
        });

        // 左键
        const leftBtn = this.add.rectangle(dpadX - spacing, dpadY, btnSize, btnSize, 0x2196F3).setInteractive().setDepth(150).setScrollFactor(0);
        leftBtn.on('pointerdown', () => {
            this.joyStickDirection = 'left';
            leftBtn.setFillStyle(0x1976D2);
        });
        leftBtn.on('pointerup', () => {
            if (this.joyStickDirection === 'left') this.joyStickDirection = null;
            leftBtn.setFillStyle(0x2196F3);
        });
        leftBtn.on('pointerout', () => {
            if (this.joyStickDirection === 'left') this.joyStickDirection = null;
            leftBtn.setFillStyle(0x2196F3);
        });

        // 右键
        const rightBtn = this.add.rectangle(dpadX + spacing, dpadY, btnSize, btnSize, 0x2196F3).setInteractive().setDepth(150).setScrollFactor(0);
        rightBtn.on('pointerdown', () => {
            this.joyStickDirection = 'right';
            rightBtn.setFillStyle(0x1976D2);
        });
        rightBtn.on('pointerup', () => {
            if (this.joyStickDirection === 'right') this.joyStickDirection = null;
            rightBtn.setFillStyle(0x2196F3);
        });
        rightBtn.on('pointerout', () => {
            if (this.joyStickDirection === 'right') this.joyStickDirection = null;
            rightBtn.setFillStyle(0x2196F3);
        });

        // 射击按钮
        const shootBtn = this.add.circle(480, 680, 35, 0xFF5252).setInteractive().setDepth(150).setScrollFactor(0);
        shootBtn.on('pointerdown', () => {
            this.isShooting = true;
            shootBtn.setFillStyle(0xD32F2F);
        });
        shootBtn.on('pointerup', () => {
            this.isShooting = false;
            shootBtn.setFillStyle(0xFF5252);
        });
        shootBtn.on('pointerout', () => {
            this.isShooting = false;
            shootBtn.setFillStyle(0xFF5252);
        });

        // 添加射击按钮文字
        this.add.text(480, 680, 'FIRE', {
            fontSize: '16px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(151).setScrollFactor(0);

        // Setup responsiveness helper
        if (this.sys.game.device.os.desktop) {
            dpadBg.setAlpha(0.4);
            upBtn.setAlpha(0.5);
            downBtn.setAlpha(0.5);
            leftBtn.setAlpha(0.5);
            rightBtn.setAlpha(0.5);
            shootBtn.setAlpha(0.5);
        }
    }

}
