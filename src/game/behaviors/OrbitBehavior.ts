import Phaser from 'phaser';
import type { SteeringBehavior } from './SteeringBehavior';
import type { Enemy } from '../Enemy';
import type { Player } from '../Player';

/**
 * Circles the player at a fixed radius, then darts in for a fast charge.
 * Angular speed is derived from the enemy's linear speed so it always moves
 * at full pace even while orbiting.
 */
export class OrbitBehavior implements SteeringBehavior {
    private static readonly ORBIT_RADIUS = 260;
    private static readonly CHARGE_SPEED_MULT = 1.4;

    private orbitTimer = 0;
    private readonly orbitDuration: number; // ms before charging
    private readonly orbitDir: number; // +1 = clockwise, -1 = counter-clockwise
    private charging = false;

    constructor() {
        this.orbitDuration = Phaser.Math.Between(2500, 4500);
        this.orbitDir = Math.random() < 0.5 ? 1 : -1;
    }

    steer(enemy: Enemy, player: Player, scene: Phaser.Scene, delta: number): void {
        if (this.charging) {
            scene.physics.moveToObject(
                enemy,
                player,
                enemy.definition.speed * OrbitBehavior.CHARGE_SPEED_MULT,
            );
            return;
        }

        this.orbitTimer += delta;
        if (this.orbitTimer >= this.orbitDuration) {
            this.charging = true;
            return;
        }

        // Advance the orbit angle based on linear speed and radius
        const currentAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const angularSpeed = (enemy.definition.speed / OrbitBehavior.ORBIT_RADIUS) * this.orbitDir;
        const nextAngle = currentAngle + angularSpeed * (delta / 1000);

        const targetX = player.x + Math.cos(nextAngle) * OrbitBehavior.ORBIT_RADIUS;
        const targetY = player.y + Math.sin(nextAngle) * OrbitBehavior.ORBIT_RADIUS;

        scene.physics.moveTo(enemy, targetX, targetY, enemy.definition.speed);
    }
}
