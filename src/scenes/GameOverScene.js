import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.win = data.win || false;
        this.kills = data.kills || 0;
        this.levelIndex = data.levelIndex || 0;
        this.hasNext = data.hasNext || false;
    }

    create() {
        // 背景装饰
        this.add.rectangle(300, 400, 600, 800, 0x000000, 0.8);

        const titleText = this.win ? '✨ 挑战成功 ✨' : '❌ 挑战失败 ❌';
        const subTitleText = this.win ? `恭喜通过第 ${this.levelIndex + 1} 关！` : '基地被毁或生命耗尽';
        const color = this.win ? '#00FF00' : '#FF4444';

        this.add.text(300, 180, titleText, {
            fontSize: '48px',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(300, 250, subTitleText, {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.add.text(300, 320, `本战击杀敌人: ${this.kills}`, {
            fontSize: '28px',
            fill: '#FFD700'
        }).setOrigin(0.5);

        // 按钮间距
        let buttonY = 480;

        if (this.win && this.hasNext) {
            const nextBtn = this.add.text(300, buttonY, '进行下一关 (Next)', {
                fontSize: '32px',
                fill: '#fff',
                backgroundColor: '#2E7D32',
                padding: { x: 40, y: 15 }
            }).setOrigin(0.5).setInteractive();

            nextBtn.on('pointerup', () => {
                this.scene.start('GameScene', { levelIndex: this.levelIndex + 1 });
            });
            nextBtn.on('pointerover', () => nextBtn.setAlpha(0.8));
            nextBtn.on('pointerout', () => nextBtn.setAlpha(1));

            buttonY += 100;
        } else if (!this.win) {
            // 失败时显示重新挑战按钮
            const retryBtn = this.add.text(300, buttonY, '重新挑战 (Retry)', {
                fontSize: '32px',
                fill: '#fff',
                backgroundColor: '#1976D2',
                padding: { x: 40, y: 15 }
            }).setOrigin(0.5).setInteractive();

            retryBtn.on('pointerup', () => {
                this.scene.start('GameScene', { levelIndex: this.levelIndex });
            });
            retryBtn.on('pointerover', () => retryBtn.setAlpha(0.8));
            retryBtn.on('pointerout', () => retryBtn.setAlpha(1));

            buttonY += 100;
        }

        // 返回首页按钮
        const homeBtn = this.add.text(300, buttonY, '返回首页 (Home)', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#D32F2F',
            padding: { x: 40, y: 15 }
        }).setOrigin(0.5).setInteractive();

        homeBtn.on('pointerup', () => {
            this.scene.start('MenuScene');
        });
        homeBtn.on('pointerover', () => homeBtn.setAlpha(0.8));
        homeBtn.on('pointerout', () => homeBtn.setAlpha(1));

        if (this.win) {
            const menuBtn = this.add.text(300, buttonY + 100, '回主菜单 (Menu)', {
                fontSize: '24px',
                fill: '#aaa',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive();

            menuBtn.on('pointerup', () => {
                this.scene.start('MenuScene');
            });
            menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#fff' }));
            menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#aaa' }));
        }
    }
}
