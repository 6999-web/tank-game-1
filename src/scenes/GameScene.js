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
            delay: 2000,
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
        if (this.base && this.base.texture && this.base.texture.key !== 'base_dead') {
            this.gameOverTriggered = true;
            this.base.setTexture('base_dead');
            if (this.player) {
                this.player.active = false;
                this.player.setVelocity(0, 0);
            }
            this.triggerGameOver();
        }
    }

    playerDied() {
        if (this.gameOverTriggered) return;
        this.gameOverTriggered = true;
        this.triggerGameOver();
    }

    triggerGameOver() {
        // 停止所有定时器和动画，防止崩溃/死机
        this.time.removeAllEvents();
        this.tweens.killAll();
        // 短暂延迟后切换到结算场景
        this.time.delayedCall(800, () => {
            this.scene.start('GameOverScene', {
                win: false,
                kills: this.kills,
                levelIndex: this.currentLevelIndex
            });
        });
    }

    levelComplete() {
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
        // UI Container for mobile (but visible on PC too if resized)
        // Adjust positions for larger controls
        let startX = 120, startY = 680;
        let joyBase = this.add.image(startX, startY, 'joyBase').setInteractive().setDepth(150).setScrollFactor(0);
        let joyStick = this.add.image(startX, startY, 'joyStick').setDepth(151).setScrollFactor(0);

        let joyPointer = null;

        joyBase.on('pointerdown', function (pointer) {
            joyPointer = pointer;
            this.updateJoystick(pointer, startX, startY, joyStick);
        }, this);

        this.input.on('pointermove', function (pointer) {
            if (joyPointer === pointer) {
                this.updateJoystick(pointer, startX, startY, joyStick);
            }
        }, this);

        this.input.on('pointerup', function (pointer) {
            if (joyPointer === pointer) {
                joyPointer = null;
                joyStick.setPosition(startX, startY);
                this.joyStickDirection = null;
            }
        }, this);

        const shootBtn = this.add.image(480, 680, 'shootBtn').setInteractive().setDepth(150).setScrollFactor(0);
        shootBtn.on('pointerdown', () => {
            this.isShooting = true;
            shootBtn.setAlpha(0.6);
        });
        shootBtn.on('pointerup', () => {
            this.isShooting = false;
            shootBtn.setAlpha(1);
        });
        shootBtn.on('pointerout', () => {
            this.isShooting = false;
            shootBtn.setAlpha(1);
        });

        // Setup responsiveness helper
        if (this.sys.game.device.os.desktop) {
            // Maybe make it semi transparent on desktop so it doesn't obstruct too much
            joyBase.setAlpha(0.3);
            joyStick.setAlpha(0.3);
            shootBtn.setAlpha(0.3);
        }
    }

    updateJoystick(pointer, startX, startY, joyStick) {
        let dx = pointer.x - startX;
        let dy = pointer.y - startY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let maxDist = 60; // Increased range

        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        joyStick.setPosition(startX + dx, startY + dy);

        if (dist < 10) {
            this.joyStickDirection = null;
        } else if (Math.abs(dx) > Math.abs(dy)) {
            this.joyStickDirection = dx > 0 ? 'right' : 'left';
        } else {
            this.joyStickDirection = dy > 0 ? 'down' : 'up';
        }
    }
}
