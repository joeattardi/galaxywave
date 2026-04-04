import Phaser from 'phaser';
import { Player } from './Player';
import { Enemy, EnemyData } from './Enemy';

const DEFAULT_CULL_DISTANCE = 3400;
const DEFAULT_MAX_ENEMIES = 220;

export class EnemySpawner {
    readonly group: Phaser.Physics.Arcade.Group;
    private readonly maxEnemies: number;
    private readonly cullDistance: number;
    private readonly baseEnemyDef: EnemyData;
    private scaledEnemyDef: EnemyData;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        enemyDef: EnemyData,
        { maxEnemies = DEFAULT_MAX_ENEMIES, cullDistance = DEFAULT_CULL_DISTANCE } = {}
    ) {
        this.maxEnemies = maxEnemies;
        this.cullDistance = cullDistance;
        this.baseEnemyDef = enemyDef;
        this.scaledEnemyDef = { ...enemyDef };

        this.group = this.scene.physics.add.group();
    }

    /** Scale enemy stats based on wave number. */
    setWaveScaling(wave: number): void {
        // Flat early, ramps after wave 5
        const ramp = Math.max(0, wave - 5);
        // Speed: +3% per wave past 5 (wave 10 = +15%, wave 15 = +30%)
        const speedMult = 1 + ramp * 0.03;
        // Health: +5% per wave past 5 (wave 10 = +25%, wave 15 = +50%)
        const healthMult = 1 + ramp * 0.05;
        // Damage: +3% per wave past 5
        const damageMult = 1 + ramp * 0.03;

        this.scaledEnemyDef = {
            ...this.baseEnemyDef,
            speed: Math.round(this.baseEnemyDef.speed * speedMult),
            health: Math.round(this.baseEnemyDef.health * healthMult),
            damage: Math.round(this.baseEnemyDef.damage * damageMult),
            // After wave 8, enemies are no longer one-shot
            oneShot: wave <= 8 ? this.baseEnemyDef.oneShot : false,
        };
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

        const enemy = new Enemy(this.scene, x, y, this.scaledEnemyDef);
        this.group.add(enemy);

        // Warp-in flash effect
        const flash = this.scene.add.image(x, y, 'warpFlash')
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.9)
            .setScale(0.3);
        this.scene.tweens.add({
            targets: flash,
            scale: 2.5,
            alpha: 0,
            duration: 350,
            ease: 'Cubic.Out',
            onComplete: () => flash.destroy(),
        });
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
