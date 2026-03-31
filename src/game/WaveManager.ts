import Phaser from 'phaser';
import { Player } from './Player';
import { EnemySpawner } from './EnemySpawner';

type WaveState = 'incoming' | 'spawning' | 'waitingForClear' | 'waitingForStore' | 'cleared';

export class WaveManager {
    private wave = 0;
    private state: WaveState = 'cleared';
    private enemiesInWave = 0;
    private enemiesSpawned = 0;
    private spawnTimer = 0;
    private readonly spawnInterval = 800;
    private readonly incomingDuration = 2500;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private spawner: EnemySpawner
    ) {
        scene.game.events.on('store-dismissed', () => {
            if (this.state === 'waitingForStore') {
                this.startNextWave();
            }
        });
    }

    start(): void {
        this.startNextWave();
    }

    private startNextWave(): void {
        if (this.player.health <= 0) return;
        this.wave++;
        this.enemiesInWave = this.wave * 5;
        this.enemiesSpawned = 0;
        this.state = 'incoming';
        this.scene.game.events.emit('wave-start', this.wave);

        this.scene.time.delayedCall(this.incomingDuration, () => {
            if (this.player.health <= 0) return;
            this.spawnTimer = this.spawnInterval; // trigger first spawn immediately
            this.state = 'spawning';
        });
    }

    update(delta: number): void {
        if (this.state === 'spawning') {
            this.spawnTimer += delta;
            while (this.spawnTimer >= this.spawnInterval && this.enemiesSpawned < this.enemiesInWave) {
                this.spawnTimer -= this.spawnInterval;
                this.spawner.spawnOne();
                this.enemiesSpawned++;
            }
            if (this.enemiesSpawned >= this.enemiesInWave) {
                this.state = 'waitingForClear';
            }
        } else if (this.state === 'waitingForClear') {
            if (this.spawner.group.countActive(true) === 0) {
                this.state = 'waitingForStore';
                this.scene.sound.play('storeOpen');
                this.scene.game.events.emit('wave-cleared', this.wave);
            }
        }
    }
}
