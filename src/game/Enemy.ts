import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    health: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(false);
        this.health = 100;
    }
}
