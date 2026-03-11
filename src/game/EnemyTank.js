import Phaser from 'phaser';

export class EnemyTank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        let texture = 'enemy_basic';
        let speed = 80;
        let hp = 1;
        let bulletSpeed = 200;

        if (type === 'fast') {
            texture = 'enemy_fast';
            speed = 120;
            hp = 1;
        } else if (type === 'heavy') {
            texture = 'enemy_heavy';
            speed = 50;
            hp = 3;
            bulletSpeed = 150;
        }

        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(32, 32);
        this.body.setOffset(4, 4);

        // 为老人模式特殊调优 (第一关)
        if (scene.currentLevelIndex === 0) {
            speed *= 0.6; // 移动更慢
            bulletSpeed *= 0.6; // 子弹更慢
        }

        this.setCollideWorldBounds(true);
        this.type = type;
        this.baseSpeed = speed;
        this.hp = hp;
        this.bulletSpeed = bulletSpeed;

        this.direction = 'down';

        // Enemy specific bullets (max 1 usually)
        this.bulletQueue = null;

        this.lastChangeDirTime = 0;
        this.lastShootTime = 0;
        this.changeDirInterval = Phaser.Math.Between(2000, 4000);
        this.shootInterval = Phaser.Math.Between(1500, 3000);
    }

    update(time) {
        if (!this.active) return;

        // Update velocity based on direction permanently
        switch (this.direction) {
            case 'up':
                this.setVelocity(0, -this.baseSpeed);
                this.setAngle(0);
                break;
            case 'down':
                this.setVelocity(0, this.baseSpeed);
                this.setAngle(180);
                break;
            case 'left':
                this.setVelocity(-this.baseSpeed, 0);
                this.setAngle(-90);
                break;
            case 'right':
                this.setVelocity(this.baseSpeed, 0);
                this.setAngle(90);
                break;
        }

        // Random change dir
        if (time > this.lastChangeDirTime) {
            this.changeDirection();
            this.lastChangeDirTime = time + Phaser.Math.Between(1000, 3000);
        }

        // Random shoot
        if (time > this.lastShootTime) {
            this.shoot();
            const shootDelay = this.scene.currentLevelIndex === 0 ? 5000 : 1000;
            this.lastShootTime = time + shootDelay + Phaser.Math.Between(0, 3000);
        }
    }

    collideWithWall() {
        this.changeDirection(true); // 碰到墙强制转向
    }

    changeDirection(excludeCurrent = false) {
        const dirs = ['up', 'down', 'left', 'right'];
        if (excludeCurrent) {
            const idx = dirs.indexOf(this.direction);
            if (idx > -1) dirs.splice(idx, 1);
        }
        this.direction = Phaser.Math.RND.pick(dirs);
        // adjust to grid (optional but helps avoid getting stuck)
    }

    shoot() {
        if (!this.active) return;

        // Request bullet from scene pool
        let bullet = this.scene.getEnemyBullet();
        if (bullet) {
            bullet.fire(this.x, this.y, this.direction, false);
            bullet.speed = this.bulletSpeed; // set specific speed
        }
    }

    takeDamage() {
        if (!this.active) return;
        this.hp -= 1;

        if (this.hp <= 0) {
            this.destroyTank();
            return true; // destroyed
        }

        // 变色提示受伤
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        return false;
    }

    destroyTank() {
        this.setActive(false);
        this.setVisible(false);
        this.x = -100;
        this.body.checkCollision.none = true;
    }
}
