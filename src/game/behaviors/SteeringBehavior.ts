import type Phaser from 'phaser';
import type { Enemy } from '../Enemy';
import type { Player } from '../Player';

export interface SteeringBehavior {
    steer(enemy: Enemy, player: Player, scene: Phaser.Scene, delta: number): void;
}
