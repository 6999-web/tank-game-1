import Phaser from 'phaser';
import { MenuScene } from './src/scenes/MenuScene.js';
import { GameScene } from './src/scenes/GameScene.js';
import { GameOverScene } from './src/scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Tank Game',
    parent: 'game-container',
    width: 600,
    height: 800,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 } // 俯视角游戏，无重力
        }
    },
    pixelArt: true, // 保持像素图清晰
    scene: [MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
