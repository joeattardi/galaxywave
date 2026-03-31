import type Phaser from 'phaser';
import type { SteeringBehavior } from './SteeringBehavior';
import type { Enemy } from '../Enemy';
import type { Player } from '../Player';

/** Beelines straight at the player every frame. */
export class DirectChaseBehavior implements SteeringBehavior {
    steer(enemy: Enemy, player: Player, scene: Phaser.Scene): void {
        scene.physics.moveToObject(enemy, player, enemy.definition.speed);
    }
}
