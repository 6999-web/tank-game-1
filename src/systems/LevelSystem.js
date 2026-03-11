export class LevelSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 0;
        this.basePosition = { x: 6, y: 12 }; // Grid coords
        this.enemySpawnPoints = [
            { x: 0, y: 0 },
            { x: 6, y: 0 },
            { x: 12, y: 0 }
        ];

        // 0: 空地, 1: 砖墙, 2: 钢墙, 3: 草丛, 4: 水, 5: 基地
        this.levels = [
            // Level 1: 超级简单 (合适80岁以上的老人玩) - 非常开阔，墙很少
            [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 5, 5, 5, 1, 0, 1, 1, 0]
            ],
            // Level 2: 难一点
            [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 2, 2, 2, 2, 2, 0, 1, 1, 0],
                [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
                [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 5, 5, 5, 1, 0, 1, 1, 0]
            ],
            // Level 3: 再难一点
            [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 4, 4, 0, 4, 4, 0, 1, 1, 0],
                [0, 1, 2, 0, 4, 4, 0, 4, 4, 0, 2, 1, 0],
                [0, 1, 2, 0, 1, 1, 0, 1, 1, 0, 2, 1, 0],
                [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
                [0, 3, 3, 3, 2, 0, 0, 0, 2, 3, 3, 3, 0],
                [0, 3, 3, 3, 2, 1, 1, 1, 2, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 0, 1, 1, 1, 3, 1, 1, 1, 0, 1, 1],
                [0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 5, 5, 5, 1, 0, 1, 1, 0]
            ],
            // Level 4: 还要难一点
            [
                [2, 2, 0, 0, 2, 2, 4, 2, 2, 0, 0, 2, 2],
                [2, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 2],
                [0, 0, 2, 2, 0, 0, 4, 0, 0, 2, 2, 0, 0],
                [1, 0, 2, 2, 3, 3, 0, 3, 3, 2, 2, 0, 1],
                [1, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 1],
                [0, 0, 1, 1, 2, 2, 0, 2, 2, 1, 1, 0, 0],
                [4, 4, 1, 1, 2, 0, 0, 0, 2, 1, 1, 4, 4],
                [4, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 4],
                [0, 1, 1, 0, 2, 2, 2, 2, 2, 0, 1, 1, 0],
                [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 5, 5, 5, 1, 0, 1, 1, 0]
            ]
        ];

        this.tileSize = 40;
        this.offsetX = (600 - 13 * this.tileSize) / 2; // Center horizontally
        this.offsetY = 60; // Leave space for UI
    }

    // 基地周围保护墙，5 表示基地核心，其余5是墙。我们在buildMap中特殊处理基地
    buildMap(levelIndex, wallGroup, steelGroup, waterGroup, grassGroup) {
        this.currentLevel = levelIndex % this.levels.length;
        const mapData = this.levels[this.currentLevel];

        let baseObj = null;

        for (let row = 0; row < 13; row++) {
            for (let col = 0; col < 13; col++) {
                const type = mapData[row][col];
                const x = this.offsetX + col * this.tileSize + this.tileSize / 2;
                const y = this.offsetY + row * this.tileSize + this.tileSize / 2;

                if (type === 1) {
                    const b = wallGroup.create(x, y, 'brick');
                    b.setImmovable(true);
                } else if (type === 2) {
                    const s = steelGroup.create(x, y, 'steel');
                    s.setImmovable(true);
                } else if (type === 3) {
                    const g = grassGroup.create(x, y, 'grass');
                    g.setDepth(10); // 在坦克上方
                } else if (type === 4) {
                    const w = waterGroup.create(x, y, 'water');
                    w.setImmovable(true);
                } else if (type === 5) {
                    // base
                    if (row === 12 && col === 6) {
                        baseObj = this.scene.physics.add.sprite(x, y, 'base');
                        baseObj.setImmovable(true);
                    } else {
                        // base surround walls
                        const b = wallGroup.create(x, y, 'brick');
                        b.setImmovable(true);
                    }
                }
            }
        }

        return baseObj;
    }

    getEnemyCount() {
        if (this.currentLevel === 0) return 5;
        return 10 + this.currentLevel * 5;
    }

    getRandomSpawnPoint() {
        const pt = Phaser.Math.RND.pick(this.enemySpawnPoints);
        return {
            x: this.offsetX + pt.x * this.tileSize + this.tileSize / 2,
            y: this.offsetY + pt.y * this.tileSize + this.tileSize / 2
        };
    }
}
