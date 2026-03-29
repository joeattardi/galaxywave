import Phaser from 'phaser';
import { Player } from './Player';

export interface WeaponData {
    id: string;
    name: string;
    fireRate: number;
    fireDelay: number;
    bulletSpeed: number;
    damage: number;
    maxDistance: number;
    texture: string;
    trailTexture: string;
    tint: string;
    sound: string;
}

export class Weapons {
    readonly bullets: Phaser.Physics.Arcade.Group;
    private lastFired = Infinity;
    private readonly trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private readonly definition: WeaponData
    ) {
        this.bullets = this.scene.physics.add.group({
            defaultKey: definition.texture,
            maxSize: 50
        });

        this.trailEmitter = this.scene.add.particles(0, 0, definition.trailTexture, {
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
            this.lastFired = time + this.definition.fireDelay;
        }
        if (time > this.lastFired) {
            this.fire();
            this.lastFired = time + this.definition.fireRate;
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
            bullet.setTint(parseInt(this.definition.tint, 16));
            bullet.setBlendMode(Phaser.BlendModes.ADD);
            bullet.setData('damage', this.definition.damage);

            const vx = Math.cos(this.player.rotation) * this.definition.bulletSpeed;
            const vy = Math.sin(this.player.rotation) * this.definition.bulletSpeed;

            bullet.body.setVelocity(vx, vy);
            this.scene.sound.play(this.definition.sound, { volume: 0.25 });
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
        const bd2 = this.definition.maxDistance * this.definition.maxDistance;
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
