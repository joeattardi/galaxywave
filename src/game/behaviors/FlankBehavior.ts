import type Phaser from 'phaser';
import type { SteeringBehavior } from './SteeringBehavior';
import type { Enemy } from '../Enemy';
import type { Player } from '../Player';

/** Approaches from the side, then charges once close enough. */
export class FlankBehavior implements SteeringBehavior {
    /** Perpendicular offset from the player when flanking (px). */
    private static readonly FLANK_OFFSET = 200;
    /** Distance at which the enemy stops flanking and charges directly. */
    private static readonly CHARGE_DIST = 180;

    private readonly side: number; // +1 = left, -1 = right relative to approach
    private charging = false;

    constructor() {
        this.side = Math.random() < 0.5 ? 1 : -1;
    }

    steer(enemy: Enemy, player: Player, scene: Phaser.Scene): void {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!this.charging && dist < FlankBehavior.CHARGE_DIST) {
            this.charging = true;
        }

        if (this.charging) {
            scene.physics.moveToObject(enemy, player, enemy.definition.speed);
            return;
        }

        // Target: player position shifted perpendicular to the approach vector
        const nx = dx / dist;
        const ny = dy / dist;
        const targetX = player.x + (-ny * FlankBehavior.FLANK_OFFSET * this.side);
        const targetY = player.y + (nx * FlankBehavior.FLANK_OFFSET * this.side);

        scene.physics.moveTo(enemy, targetX, targetY, enemy.definition.speed);
    }
}
