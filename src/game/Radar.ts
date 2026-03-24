import Phaser from 'phaser';

export class Radar {
    private graphics!: Phaser.GameObjects.Graphics;
    private readonly x: number;
    private readonly y: number;
    private readonly radius: number;
    private readonly range: number;

    constructor(
        private scene: Phaser.Scene,
        x: number,
        y: number,
        radius: number,
        range: number
    ) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.range = range;
    }

    setup(): void {
        this.graphics = this.scene.add.graphics().setScrollFactor(0);
        this.graphics.setDepth(10);
    }

    update(
        playerX: number,
        playerY: number,
        enemies: Phaser.GameObjects.GameObject[],
        coins: Phaser.GameObjects.GameObject[]
    ): void {
        this.graphics.clear();

        this.graphics.fillStyle(0x000000, 0.5);
        this.graphics.fillCircle(this.x, this.y, this.radius);

        this.graphics.lineStyle(2, 0xffffff, 0.8);
        this.graphics.strokeCircle(this.x, this.y, this.radius);

        this.graphics.lineStyle(1, 0x444444, 0.5);
        this.graphics.strokeCircle(this.x, this.y, this.radius * 0.5);
        this.graphics.strokeCircle(this.x, this.y, this.radius * 0.25);

        this.graphics.lineStyle(1, 0x666666, 0.3);
        this.graphics.lineBetween(this.x - this.radius, this.y, this.x + this.radius, this.y);
        this.graphics.lineBetween(this.x, this.y - this.radius, this.x, this.y + this.radius);

        const scale = this.radius / this.range;

        (enemies as Phaser.GameObjects.Sprite[]).forEach((enemy) => {
            const dx = enemy.x - playerX;
            const dy = enemy.y - playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= this.range) {
                this.graphics.fillStyle(0xff0000, 0.8);
                this.graphics.fillCircle(this.x + dx * scale, this.y + dy * scale, 3);
            }
        });

        (coins as Phaser.GameObjects.Sprite[]).forEach((coin) => {
            const dx = coin.x - playerX;
            const dy = coin.y - playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= this.range) {
                this.graphics.fillStyle(0xffff00, 0.8);
                this.graphics.fillCircle(this.x + dx * scale, this.y + dy * scale, 2);
            }
        });

        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillCircle(this.x, this.y, 2);
    }
}
