import Phaser from 'phaser';
import { Bullet } from './Bullet.js';

export class PlayerTank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'playerTank');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(32, 32); // Slightly smaller than 40x40 to pass narrow paths
        this.body.setOffset(4, 4);

        this.setCollideWorldBounds(true);
        this.baseSpeed = 150;
        this.hp = 5; // Increased health
        this.maxHP = 5;
        this.direction = 'up';
        this.isInvincible = false;

        // Health bar graphics
        this.hpBar = scene.add.graphics();
        this.updateHealthBar();

        // bullets group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            maxSize: 50 // Increased cap
        });
        this.maxBullets = 50;
        this.lastShotTime = 0;
        this.shootDelay = 150; // ms

        // Input setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D');
        this.spaceBar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    updateHealthBar() {
        this.hpBar.clear();
        if (this.hp <= 0) return;

        // Background
        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRect(this.x - 20, this.y - 30, 40, 6);

        // Health
        const healthPercent = this.hp / this.maxHP;
        const color = healthPercent > 0.5 ? 0x00ff00 : (healthPercent > 0.2 ? 0xffff00 : 0xff0000);
        this.hpBar.fillStyle(color);
        this.hpBar.fillRect(this.x - 20, this.y - 30, 40 * healthPercent, 6);
    }

    update(time) {
        if (!this.active) {
            this.hpBar.clear();
            return;
        }

        this.updateHealthBar();
        this.setVelocity(0);

        let moveX = 0;
        let moveY = 0;

        // Joystick support (inject from scene)
        if (this.scene.joyStickDirection) {
            switch (this.scene.joyStickDirection) {
                case 'up': moveY = -1; break;
                case 'down': moveY = 1; break;
                case 'left': moveX = -1; break;
                case 'right': moveX = 1; break;
            }
        } else {
            if (this.cursors.left.isDown || this.keys.A.isDown) moveX = -1;
            else if (this.cursors.right.isDown || this.keys.D.isDown) moveX = 1;
            else if (this.cursors.up.isDown || this.keys.W.isDown) moveY = -1;
            else if (this.cursors.down.isDown || this.keys.S.isDown) moveY = 1;
        }

        if (moveX !== 0) {
            this.setVelocityX(moveX * this.baseSpeed);
            this.setAngle(moveX === 1 ? 90 : -90);
            this.direction = moveX === 1 ? 'right' : 'left';
            this.setVelocityY(0); // Only move on one axis
        } else if (moveY !== 0) {
            this.setVelocityY(moveY * this.baseSpeed);
            this.setAngle(moveY === 1 ? 180 : 0);
            this.direction = moveY === 1 ? 'down' : 'up';
            this.setVelocityX(0);
        }

        // Shoot handling
        if ((this.spaceBar.isDown || this.scene.isShooting) && time > this.lastShotTime) {
            this.shoot(time);
        }
    }

    shoot(time) {
        if (!this.active) return;

        // Use standard group getting which handles pooling
        let bullet = this.bullets.get(this.x, this.y);

        if (bullet) {
            this.lastShotTime = time + this.shootDelay;
            bullet.fire(this.x, this.y, this.direction, true);
        }
    }

    takeDamage() {
        if (!this.active || this.isInvincible) return;

        this.hp -= 1;
        this.isInvincible = true;

        // 闪烁特效
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.isInvincible = false;
                this.alpha = 1;
            }
        });

        if (this.hp <= 0) {
            this.destroyTank();
        }
        return this.hp;
    }

    destroyTank() {
        this.setActive(false);
        this.setVisible(false);
        this.x = -100;
        this.scene.playerDied();
    }
}
