import Phaser from 'phaser';
import { Player } from './Player';
import { GameState } from './GameState';

export class CoinManager {
    readonly group: Phaser.Physics.Arcade.Group;
    private readonly magnetRange: number;
    private readonly baseMagnetSpeed: number;
    private readonly sparkleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private state: GameState,
        { magnetRange = 100, baseMagnetSpeed = 100 } = {}
    ) {
        this.magnetRange = magnetRange;
        this.baseMagnetSpeed = baseMagnetSpeed;
        this.group = this.scene.physics.add.group();

        this.sparkleEmitter = this.scene.add.particles(0, 0, 'coinSparkle', {
            speed: { min: 40, max: 120 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xffff44, 0xffffaa, 0xffffff],
            lifespan: 350,
            blendMode: Phaser.BlendModes.ADD,
            emitting: false
        });
    }

    spawn(x: number, y: number): void {
        this.group.create(x, y, 'coin');
    }

    collect(
        _player: Phaser.GameObjects.GameObject,
        coin: Phaser.GameObjects.GameObject
    ): void {
        const c = coin as Phaser.GameObjects.Sprite;
        this.sparkleEmitter.explode(8, c.x, c.y);
        coin.destroy();
        this.state.collectCoin();
        this.scene.sound.play('pickupCoin');
    }

    updateMagnet(): void {
        this.group.getChildren().forEach((obj) => {
            const coin = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                coin.x,
                coin.y
            );
            if (distance < this.magnetRange) {
                const proximity = 1 - distance / this.magnetRange;
                const speed = this.baseMagnetSpeed + proximity * proximity * 600;
                this.scene.physics.moveToObject(coin, this.player, speed);
            } else {
                if (coin.body.velocity.x !== 0 || coin.body.velocity.y !== 0) {
                    coin.body.setVelocity(0, 0);
                }
            }
        });
    }
}
