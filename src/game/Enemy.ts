import Phaser from 'phaser';
import { createBehavior } from './behaviors/BehaviorFactory';
import type { SteeringBehavior } from './behaviors/SteeringBehavior';

export interface EnemyData {
    id: string;
    name: string;
    texture: string;
    oneShot?: boolean;
    health: number;
    damage: number;
    speed: number;
    /** Behavior keys to pick from at random on spawn. Defaults to ["direct"]. */
    behaviors?: string[];
}

const BAR_WIDTH = 32;
const BAR_HEIGHT = 4;
const BAR_OFFSET_Y = -24;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    readonly definition: EnemyData;
    readonly behavior: SteeringBehavior;

    private _health: number;
    private healthBar: Phaser.GameObjects.Graphics | null;

    get health(): number { return this._health; }
    set health(value: number) {
        this._health = value;
        this.drawHealthBar();
    }

    constructor(scene: Phaser.Scene, x: number, y: number, definition: EnemyData) {
        super(scene, x, y, definition.texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(false);

        this.definition = definition;
        this._health = definition.health;
        this.healthBar = definition.oneShot ? null : scene.add.graphics({ x, y });
        this.drawHealthBar();

        const keys = definition.behaviors ?? ['direct'];
        this.behavior = createBehavior(keys[Math.floor(Math.random() * keys.length)]);
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        this.healthBar?.setPosition(this.x, this.y);
    }

    destroy(fromScene?: boolean): void {
        this.healthBar?.destroy();
        super.destroy(fromScene);
    }

    private drawHealthBar(): void {
        if (!this.healthBar) return;
        this.healthBar.clear();
        this.healthBar.fillStyle(0x220000);
        this.healthBar.fillRect(-BAR_WIDTH / 2, BAR_OFFSET_Y, BAR_WIDTH, BAR_HEIGHT);
        const fillW = (this._health / this.definition.health) * BAR_WIDTH;
        this.healthBar.fillStyle(0xff3333);
        this.healthBar.fillRect(-BAR_WIDTH / 2, BAR_OFFSET_Y, fillW, BAR_HEIGHT);
    }
}
