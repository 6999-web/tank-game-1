import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // 生成占位素材图，不需要加载外部图片资源，即可做到直接运行
        this.generateTextures();
        // 如果有音效可以这里 load.audio
    }

    create() {
        // 标题
        this.add.text(300, 150, 'TANK GAME', {
            fontSize: '64px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(300, 220, '请选择关卡 (Select Level)', {
            fontSize: '24px',
            fill: '#aaa'
        }).setOrigin(0.5);

        // 获取解锁进度（改为仅限当前会话，不保存到 localStorage）
        if (window.unlockedLevel === undefined) window.unlockedLevel = 0;
        const unlockedLevel = window.unlockedLevel;

        // 关卡按钮配置
        const levels = [
            { text: '一、怀旧益智场', index: 0, color: '#4CAF50' },
            { text: '二、初级实战练习', index: 1, color: '#2196F3' },
            { text: '三、中级战术进阶', index: 2, color: '#FF9800' },
            { text: '四、高级巅峰挑战', index: 3, color: '#F44336' }
        ];

        levels.forEach((lvl, i) => {
            const isLocked = i > unlockedLevel;
            const displayText = isLocked ? `🔒 ${lvl.text}` : lvl.text;
            const bgColor = isLocked ? '#555' : lvl.color;

            const btn = this.add.text(300, 300 + i * 75, displayText, {
                fontSize: '24px',
                fill: isLocked ? '#888' : '#fff',
                backgroundColor: bgColor,
                padding: { x: 30, y: 12 },
                fixedWidth: 420,
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            if (!isLocked) {
                btn.setInteractive();
                btn.on('pointerdown', () => {
                    this.scene.start('GameScene', { levelIndex: lvl.index });
                });
                btn.on('pointerover', () => btn.setAlpha(0.8));
                btn.on('pointerout', () => btn.setAlpha(1));
            }
        });

        // 游戏说明
        const instructionText = "PC端：WASD 移动，Space 射击 | 手机端：摇杆移动，红钮射击\n" +
            "目标：保护基地，消灭所有敌人！";

        this.add.text(300, 600, instructionText, {
            fontSize: '16px',
            fill: '#ccc',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // 音效开关
        let soundOn = true;
        const soundBtn = this.add.text(300, 700, '音效: 开', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        soundBtn.on('pointerdown', () => {
            soundOn = !soundOn;
            soundBtn.setText(soundOn ? '音效: 开' : '音效: 关');
            this.sound.mute = !soundOn;
        });
    }

    generateTextures() {
        const graphics = this.add.graphics();
        const tileSize = 40;

        // Player Tank (Yellow)
        graphics.clear();
        graphics.fillStyle(0xffff00);
        graphics.fillRect(5, 5, 30, 30);
        graphics.fillStyle(0xaaaa00);
        graphics.fillRect(15, 0, 10, 20); // 炮管朝上
        graphics.generateTexture('playerTank', tileSize, tileSize);

        // Basic Enemy (Red)
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(5, 5, 30, 30);
        graphics.fillStyle(0xaa0000);
        graphics.fillRect(15, 0, 10, 20);
        graphics.generateTexture('enemy_basic', tileSize, tileSize);

        // Fast Enemy (Pink)
        graphics.clear();
        graphics.fillStyle(0xff66bb);
        graphics.fillRect(5, 5, 30, 30);
        graphics.fillStyle(0xaa4488);
        graphics.fillRect(15, 0, 10, 20);
        graphics.generateTexture('enemy_fast', tileSize, tileSize);

        // Heavy Enemy (Purple)
        graphics.clear();
        graphics.fillStyle(0x8800ff);
        graphics.fillRect(0, 0, 40, 40);
        graphics.fillStyle(0x5500aa);
        graphics.fillRect(15, 0, 10, 20);
        graphics.generateTexture('enemy_heavy', tileSize, tileSize);

        // Bullet
        graphics.clear();
        graphics.fillStyle(0xffaa00);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);

        // Brick (Brown)
        graphics.clear();
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.lineStyle(2, 0x5c2e0b);
        graphics.strokeRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('brick', tileSize, tileSize);

        // Steel (Gray)
        graphics.clear();
        graphics.fillStyle(0x888888);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.lineStyle(2, 0x444444);
        graphics.strokeRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('steel', tileSize, tileSize);

        // Grass (Green, transparent)
        graphics.clear();
        graphics.fillStyle(0x00ff00, 0.4);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('grass', tileSize, tileSize);

        // Water (Blue, animated manually or just plain blue)
        graphics.clear();
        graphics.fillStyle(0x0000ff);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('water', tileSize, tileSize);

        // Base (White flag/building)
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(5, 5, 30, 30);
        graphics.fillStyle(0x00ff00);
        graphics.fillCircle(20, 20, 8);
        graphics.generateTexture('base', tileSize, tileSize);

        // Base Dead
        graphics.clear();
        graphics.fillStyle(0x555555);
        graphics.fillRect(5, 5, 30, 30);
        graphics.fillStyle(0xff0000);
        graphics.lineBetween(5, 5, 35, 35);
        graphics.lineBetween(35, 5, 5, 35);
        graphics.generateTexture('base_dead', tileSize, tileSize);

        // PowerUp
        graphics.clear();
        graphics.fillStyle(0x00FF00); // Green
        graphics.fillCircle(12, 12, 12);
        graphics.fillStyle(0xFFFFFF);
        graphics.fillRect(10, 4, 4, 16);
        graphics.fillRect(4, 10, 16, 4);
        graphics.generateTexture('powerup', 24, 24);

        // UI Btn - Enlarged
        graphics.clear();
        graphics.fillStyle(0xaa0000);
        graphics.fillCircle(60, 60, 60);
        graphics.generateTexture('shootBtn', 120, 120);

        graphics.clear();
        graphics.fillStyle(0x555555, 0.5);
        graphics.fillCircle(75, 75, 75);
        graphics.generateTexture('joyBase', 150, 150);

        graphics.clear();
        graphics.fillStyle(0xaaaaaa, 0.8);
        graphics.fillCircle(40, 40, 40);
        graphics.generateTexture('joyStick', 80, 80);

        graphics.destroy();
    }
}
