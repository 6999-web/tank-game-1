import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 300;
        this.isPlayer = false;
        this.activeBullet = false;
    }

    fire(x, y, direction, isPlayer) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        if (this.body) {
            this.body.enable = true;
            this.body.reset(x, y);
        }

        this.isPlayer = isPlayer;
        this.activeBullet = true;
        this.startTime = this.scene.time.now;

        switch (direction) {
            case 'up':
                this.setVelocity(0, -this.speed);
                this.setAngle(0);
                break;
            case 'down':
                this.setVelocity(0, this.speed);
                this.setAngle(180);
                break;
            case 'left':
                this.setVelocity(-this.speed, 0);
                this.setAngle(-90);
                break;
            case 'right':
                this.setVelocity(this.speed, 0);
                this.setAngle(90);
                break;
        }
    }

    update() {
        if (!this.active) {
            this.activeBullet = false;
            return;
        }

        // Failsafe: destroy after 5 seconds to prevent "ghost" bullets
        if (this.scene.time.now - this.startTime > 5000) {
            this.destroyBullet();
            return;
        }

        const width = this.scene.sys.game.config.width;
        const height = this.scene.sys.game.config.height;

        if (this.x < -20 || this.x > width + 20 ||
            this.y < -20 || this.y > height + 20) {
            this.destroyBullet();
        }
    }

    destroyBullet() {
        this.setActive(false);
        this.setVisible(false);
        if (this.body) {
            this.body.enable = false;
            this.setVelocity(0, 0);
        }
        this.activeBullet = false;
        // Move far away to avoid any accidental collisions before the frame ends
        this.setPosition(-100, -100);
    }
}
