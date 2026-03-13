export class CollisionSystem {
    constructor(scene) {
        this.scene = scene;
    }

    setup(player, enemies, playerBullets, enemyBullets, walls, steel, water, base) {
        const physics = this.scene.physics;

        // Player collides with environment
        physics.add.collider(player, walls);
        physics.add.collider(player, steel);
        physics.add.collider(player, water);
        physics.add.collider(player, base); // 基地有碰撞体积？可以作为墙体或者sprite

        // Enemies collide with environment
        physics.add.collider(enemies, walls, (enemy) => enemy.collideWithWall());
        physics.add.collider(enemies, steel, (enemy) => enemy.collideWithWall());
        physics.add.collider(enemies, water, (enemy) => enemy.collideWithWall());
        physics.add.collider(enemies, base, (enemy) => enemy.collideWithWall());

        // Enemies collide with other enemies
        physics.add.collider(enemies, enemies, (enemy1, enemy2) => {
            enemy1.collideWithWall();
            enemy2.collideWithWall();
        });

        // Player vs Enemies (Contact Damage)
        physics.add.collider(player, enemies, (p, e) => {
            if (p.active && e.active) {
                p.takeDamage();
                // Optionally push the enemy back or make it change direction
                if (e.collideWithWall) e.collideWithWall();
            }
        });

        // Player Bullets hits Environment
        physics.add.collider(playerBullets, walls, this.bulletHitWall, null, this);
        physics.add.collider(playerBullets, steel, this.bulletHitSteel, null, this);
        physics.add.collider(playerBullets, base, this.bulletHitBase, null, this);

        // Enemy Bullets hits Environment
        physics.add.collider(enemyBullets, walls, this.bulletHitWall, null, this);
        physics.add.collider(enemyBullets, steel, this.bulletHitSteel, null, this);
        physics.add.collider(enemyBullets, base, this.bulletHitBase, null, this);

        // Player Bullets hit Enemies
        physics.add.overlap(playerBullets, enemies, this.playerBulletHitEnemy, null, this);

        // Enemy Bullets hit Player
        physics.add.overlap(enemyBullets, player, this.enemyBulletHitPlayer, null, this);

        // Bullets hit each other
        physics.add.overlap(playerBullets, enemyBullets, (pBullet, eBullet) => {
            if (pBullet && pBullet.destroyBullet) {
                pBullet.destroyBullet();
            }
            if (eBullet && eBullet.destroyBullet) {
                eBullet.destroyBullet();
            }
        });
    }

    bulletHitWall(bullet, wall) {
        if (bullet && bullet.destroyBullet) {
            bullet.destroyBullet();
        }
        if (wall && wall.destroy) {
            wall.destroy(); // 砖墙被摧毁
        }
    }

    bulletHitSteel(bullet, steel) {
        if (bullet && bullet.destroyBullet) {
            bullet.destroyBullet();
        }
        // 钢墙不可摧毁
    }

    bulletHitBase(bullet, base) {
        if (bullet && bullet.destroyBullet) {
            bullet.destroyBullet();
        }
        // 只在基地还活跃时才触发摧毁
        if (base && base.active && this.scene && !this.scene.gameOverTriggered) {
            this.scene.baseDestroyed();
        }
    }

    playerBulletHitEnemy(bullet, enemy) {
        // 先确保子弹和敌人都还在激活状态
        if (!bullet || !bullet.activeBullet || !enemy || !enemy.active) return;

        if (bullet.destroyBullet) {
            bullet.destroyBullet();
        }

        // 保存敌人的位置再让它受到伤害，可能会被销毁
        const enemyX = enemy.x;
        const enemyY = enemy.y;

        const destroyed = enemy.takeDamage();
        if (destroyed) {
            this.scene.enemyDestroyed(enemyX, enemyY);
        }
    }

    enemyBulletHitPlayer(bullet, player) {
        if (!bullet || !bullet.activeBullet || !player || !player.active) return;

        if (bullet.destroyBullet) {
            bullet.destroyBullet();
        }
        player.takeDamage();
        this.scene.updateUI();
    }
}
