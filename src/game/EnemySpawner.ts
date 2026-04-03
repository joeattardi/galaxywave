import Phaser from 'phaser';
import { Player } from './Player';
import { Enemy, EnemyData } from './Enemy';

const DEFAULT_CULL_DISTANCE = 3400;
const DEFAULT_MAX_ENEMIES = 220;

export class EnemySpawner {
    readonly group: Phaser.Physics.Arcade.Group;
    private readonly maxEnemies: number;
    private readonly cullDistance: number;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private enemyDef: EnemyData,
        { maxEnemies = DEFAULT_MAX_ENEMIES, cullDistance = DEFAULT_CULL_DISTANCE } = {}
    ) {
        this.maxEnemies = maxEnemies;
        this.cullDistance = cullDistance;

        this.group = this.scene.physics.add.group();
    }

    update(delta: number): void {
        this.group.getChildren().forEach((obj) => {
            const enemy = obj as Enemy;
            enemy.behavior.steer(enemy, this.player, this.scene, delta);
        });
        this.cullDistant();
    }

    spawnOne(): void {
        if (this.player?.health <= 0) {
            return;
        }
        if (this.group.countActive(true) >= this.maxEnemies) {
            return;
        }

        const cam = this.scene.cameras.main;
        const halfW = cam.width * 0.5;
        const halfH = cam.height * 0.5;
        const margin = 90;
        const minR = Math.sqrt(halfW * halfW + halfH * halfH) + margin;
        const maxR = minR + 520;

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist = Phaser.Math.FloatBetween(minR, maxR);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        const enemy = new Enemy(this.scene, x, y, this.enemyDef);
        this.group.add(enemy);
    }

    private cullDistant(): void {
        const px = this.player.x;
        const py = this.player.y;
        const d2 = this.cullDistance * this.cullDistance;
        (this.group.getChildren() as Phaser.GameObjects.Sprite[]).forEach((enemy) => {
            const dx = enemy.x - px;
            const dy = enemy.y - py;
            if (dx * dx + dy * dy > d2) {
                enemy.destroy();
            }
        });
    }
}
