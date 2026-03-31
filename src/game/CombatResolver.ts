import Phaser from 'phaser';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { CoinManager } from './CoinManager';

export class CombatResolver {
    private readonly explosionEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly shieldHitEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private score = 0;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private coinManager: CoinManager
    ) {
        this.explosionEmitter = this.scene.add.particles(0, 0, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            tint: [0xff0000, 0xffa500, 0xffff00],
            lifespan: 500,
            gravityY: 0,
            emitting: false
        });

        this.shieldHitEmitter = this.scene.add.particles(0, 0, 'bulletGlow', {
            speed: { min: 40, max: 120 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0x66ffff, 0x88ddff, 0xffffff],
            lifespan: 300,
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

        const damage = (b.getData('damage') as number) ?? 50;
        this.spawnDamageNumber(e.x, e.y - 24, damage);
        if (!e.definition.oneShot) {
            e.health -= damage;
            this.scene.sound.play('damage');
            if (e.health > 0) {
                this.shieldHitEmitter.explode(6, b.x, b.y);
                e.setTintFill(0xffffff);
                this.scene.time.delayedCall(80, () => e.clearTint());
                return;
            }
        }

        this.explosionEmitter.explode(15, e.x, e.y);
        this.coinManager.spawn(e.x, e.y);
        e.destroy();

        this.score += 10;
        this.scene.game.events.emit('score-changed', this.score);
        this.scene.sound.play('enemyDestroyed');
        this.scene.cameras.main.flash(80, 200, 200, 200);
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
        this.explosionEmitter.explode(15, e.x, e.y);
        e.destroy();

        this.scene.sound.play('damage');

        this.scene.cameras.main.flash(200, 255, 0, 0);
        this.scene.cameras.main.shake(200, 0.01);

        this.player.health -= e.definition.damage;
        this.scene.game.events.emit('health-changed', this.player.health);

        if (this.player.health <= 0) {
            this.player.stopEffects();
            this.scene.physics.pause();
            this.player.setTint(0xff0000);
            this.player.setVisible(false);

            this.explosionEmitter.explode(100, this.player.x, this.player.y);

            this.scene.cameras.main.shake(500, 0.05);
            this.scene.cameras.main.flash(500, 255, 255, 255);

            this.scene.sound.stopAll();
            this.scene.game.events.emit('game-over', { score: this.score });

            this.scene.sound.play('playerDeath');
        }
    }
}
