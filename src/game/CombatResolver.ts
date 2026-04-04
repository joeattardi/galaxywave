import Phaser from 'phaser';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { CoinManager } from './CoinManager';
import { GameState } from './GameState';

export class CombatResolver {
    private readonly explosionEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly sparkEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly shieldHitEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly fireEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private coinManager: CoinManager,
        private state: GameState
    ) {
        this.explosionEmitter = this.scene.add.particles(0, 0, 'bulletGlow', {
            speed: { min: 60, max: 200 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xff2200, 0xff6600, 0xffaa00, 0xffff00],
            lifespan: 600,
            blendMode: Phaser.BlendModes.ADD,
            gravityY: 0,
            emitting: false
        });

        this.sparkEmitter = this.scene.add.particles(0, 0, 'spark', {
            speed: { min: 100, max: 350 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xffcc44, 0xff8800, 0xffffff],
            lifespan: 400,
            blendMode: Phaser.BlendModes.ADD,
            gravityY: 0,
            emitting: false
        });

        this.fireEmitter = this.scene.add.particles(0, 0, 'muzzleFlash', {
            speed: { min: 10, max: 50 },
            scale: { start: 2, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: [0xff4400, 0xff8800, 0xffcc00],
            lifespan: 350,
            blendMode: Phaser.BlendModes.ADD,
            gravityY: 0,
            emitting: false
        });

        this.shieldHitEmitter = this.scene.add.particles(0, 0, 'spark', {
            speed: { min: 60, max: 180 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: [0x66ffff, 0x88ddff, 0xffffff],
            lifespan: 250,
            blendMode: Phaser.BlendModes.ADD,
            gravityY: 0,
            emitting: false
        });
    }

    hitEnemy(
        bullet: Phaser.GameObjects.GameObject,
        enemy: Phaser.GameObjects.GameObject
    ): void {
        const b = bullet as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        const e = enemy as Enemy;
        b.setActive(false);
        b.setVisible(false);
        b.body.enable = false;
        b.body.setVelocity(0, 0);

        // Clean up bullet glow sprite
        const glow = b.getData('glow') as Phaser.GameObjects.Image | null;
        if (glow) { glow.destroy(); b.setData('glow', null); }

        const damage = (b.getData('damage') as number) ?? 50;
        this.spawnDamageNumber(e.x, e.y - 24, damage);
        if (!e.definition.oneShot) {
            e.health -= damage;
            this.scene.sound.play('damage');
            if (e.health > 0) {
                this.shieldHitEmitter.explode(10, b.x, b.y);
                e.setTintFill(0xffffff);
                this.scene.time.delayedCall(80, () => e.clearTint());
                return;
            }
        }

        this.spawnExplosion(e.x, e.y);
        this.coinManager.spawn(e.x, e.y);
        e.destroy();

        this.state.addScore(10);
        this.state.recordKill();
        this.scene.sound.play('enemyDestroyed');
        this.scene.cameras.main.flash(80, 200, 200, 200);
    }

    private spawnExplosion(x: number, y: number, large = false): void {
        const count = large ? 30 : 18;
        const sparkCount = large ? 20 : 10;

        this.explosionEmitter.explode(count, x, y);
        this.sparkEmitter.explode(sparkCount, x, y);
        this.fireEmitter.explode(large ? 12 : 5, x, y);

        // Shockwave ring
        const ring = this.scene.add.image(x, y, 'shockwaveRing')
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.8)
            .setScale(large ? 0.3 : 0.2);
        this.scene.tweens.add({
            targets: ring,
            scale: large ? 4 : 2.5,
            alpha: 0,
            duration: large ? 500 : 350,
            ease: 'Cubic.Out',
            onComplete: () => ring.destroy(),
        });
    }

    private spawnDamageNumber(x: number, y: number, amount: number): void {
        const text = this.scene.add.text(x, y, `-${amount}`, {
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        });
        text.setOrigin(0.5, 1);
        this.scene.tweens.add({
            targets: text,
            y: y - 40,
            alpha: 0,
            duration: 700,
            ease: 'Cubic.Out',
            onComplete: () => text.destroy(),
        });
    }

    hitPlayer(
        _player: Phaser.GameObjects.GameObject,
        enemy: Phaser.GameObjects.GameObject
    ): void {
        const e = enemy as Enemy;
        this.spawnExplosion(e.x, e.y);
        e.destroy();

        this.scene.sound.play('damage');

        this.scene.cameras.main.flash(200, 255, 0, 0);
        this.scene.cameras.main.shake(200, 0.01);

        this.state.health -= e.definition.damage;

        if (this.state.health <= 0) {
            this.player.stopEffects();
            this.scene.physics.pause();
            this.player.setTint(0xff0000);
            this.player.setVisible(false);

            // Multi-stage death explosion
            this.spawnExplosion(this.player.x, this.player.y, true);
            this.scene.time.delayedCall(120, () =>
                this.spawnExplosion(this.player.x + 20, this.player.y - 15, false));
            this.scene.time.delayedCall(250, () =>
                this.spawnExplosion(this.player.x - 15, this.player.y + 20, true));

            this.scene.cameras.main.shake(500, 0.05);
            this.scene.cameras.main.flash(500, 255, 255, 255);

            this.scene.sound.stopAll();
            this.state.emitGameOver();

            this.scene.sound.play('playerDeath');
        }
    }
}
