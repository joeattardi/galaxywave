import Phaser from 'phaser';
import { Player } from './Player';

export class Weapons {
    readonly bullets: Phaser.Physics.Arcade.Group;
    private lastFired = Infinity;
    private readonly fireRate: number;
    private readonly fireDelay: number;
    private readonly maxDistance: number;
    private readonly trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        { fireRate = 500, fireDelay = 1000, maxDistance = 1600 } = {}
    ) {
        this.fireRate = fireRate;
        this.fireDelay = fireDelay;
        this.maxDistance = maxDistance;

        this.bullets = this.scene.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50
        });

        this.trailEmitter = this.scene.add.particles(0, 0, 'bulletGlow', {
            speed: { min: 5, max: 20 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: [0x66bbff, 0x88ddff],
            lifespan: 200,
            blendMode: Phaser.BlendModes.ADD,
            emitting: false
        });
    }

    update(time: number): void {
        if (this.lastFired === Infinity) {
            this.lastFired = time + this.fireDelay;
        }
        if (time > this.lastFired) {
            this.fire();
            this.lastFired = time + this.fireRate;
        }
        this.cullDistant();
        this.emitTrails();
    }

    reset(): void {
        this.lastFired = Infinity;
    }

    private fire(): void {
        const offset = 20;
        const spawnX = this.player.x + Math.cos(this.player.rotation) * offset;
        const spawnY = this.player.y + Math.sin(this.player.rotation) * offset;

        const bullet = this.bullets.get(
            spawnX,
            spawnY
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null;

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.enable = true;
            bullet.setTint(0x88ddff);
            bullet.setBlendMode(Phaser.BlendModes.ADD);

            const bulletSpeed = 500;
            const vx = Math.cos(this.player.rotation) * bulletSpeed;
            const vy = Math.sin(this.player.rotation) * bulletSpeed;

            bullet.body.setVelocity(vx, vy);
            this.scene.sound.play('laserShoot', { volume: 0.25});
        }
    }

    private emitTrails(): void {
        this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            if (!bullet.active) return;
            this.trailEmitter.emitParticleAt(bullet.x, bullet.y, 1);
        });
    }

    private cullDistant(): void {
        const px = this.player.x;
        const py = this.player.y;
        const bd2 = this.maxDistance * this.maxDistance;
        this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            if (!bullet.active) return;
            const dx = bullet.x - px;
            const dy = bullet.y - py;
            if (dx * dx + dy * dy > bd2) {
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.setVelocity(0, 0);
            }
        });
    }
}
