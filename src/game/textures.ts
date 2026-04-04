import Phaser from 'phaser';

export function createTextures(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('bullet', 8, 8);

    graphics.clear();
    graphics.fillStyle(0x66bbff, 0.12);
    graphics.fillCircle(12, 12, 12);
    graphics.fillStyle(0x88ddff, 0.3);
    graphics.fillCircle(12, 12, 7);
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(12, 12, 3);
    graphics.generateTexture('bulletGlow', 24, 24);

    graphics.clear();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('coin', 8, 8);

    graphics.clear();
    graphics.fillStyle(0xffffff, 0.22);
    graphics.fillCircle(10, 10, 10);
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(10, 10, 6);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 10, 3);
    graphics.generateTexture('thruster', 20, 20);

    graphics.clear();
    graphics.fillStyle(0xaaccff, 0.2);
    graphics.fillCircle(14, 14, 14);
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillCircle(14, 14, 8);
    graphics.generateTexture('thrusterHalo', 28, 28);

    graphics.clear();
    graphics.fillStyle(0x88ccff, 0.42);
    graphics.fillCircle(5, 5, 5);
    graphics.fillStyle(0xffffff, 0.55);
    graphics.fillCircle(5, 5, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(5, 5, 1.5);
    graphics.generateTexture('rcsPuff', 10, 10);

    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(1, 1, 0.75);
    graphics.generateTexture('starPin', 3, 3);

    graphics.clear();
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillCircle(4, 4, 3.5);
    graphics.fillStyle(0xffffff, 0.85);
    graphics.fillCircle(4, 4, 1.4);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 0.6);
    graphics.generateTexture('starSoft', 8, 8);

    graphics.clear();
    graphics.fillStyle(0xaaccff, 0.2);
    graphics.fillCircle(8, 8, 7);
    graphics.fillStyle(0xffffff, 0.45);
    graphics.fillCircle(8, 8, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 1.1);
    graphics.generateTexture('starGlow', 16, 16);

    graphics.clear();
    graphics.fillStyle(0x888888, 0.15);
    graphics.fillCircle(2, 2, 2);
    graphics.fillStyle(0xaaaaaa, 0.25);
    graphics.fillCircle(2, 2, 1);
    graphics.generateTexture('cosmicDust', 4, 4);

    // Muzzle flash — bright wide glow for weapon fire
    graphics.clear();
    graphics.fillStyle(0x66bbff, 0.08);
    graphics.fillCircle(16, 16, 16);
    graphics.fillStyle(0x88ddff, 0.2);
    graphics.fillCircle(16, 16, 10);
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(16, 16, 5);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 2);
    graphics.generateTexture('muzzleFlash', 32, 32);

    // Shockwave ring for explosions
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 0.7);
    graphics.strokeCircle(24, 24, 22);
    graphics.lineStyle(4, 0xffffff, 0.2);
    graphics.strokeCircle(24, 24, 20);
    graphics.generateTexture('shockwaveRing', 48, 48);

    // Soft spark for debris / hit sparks
    graphics.clear();
    graphics.fillStyle(0xffffff, 0.15);
    graphics.fillCircle(6, 6, 6);
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(6, 6, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(6, 6, 1);
    graphics.generateTexture('spark', 12, 12);

    // Coin sparkle
    graphics.clear();
    graphics.fillStyle(0xffff66, 0.15);
    graphics.fillCircle(8, 8, 8);
    graphics.fillStyle(0xffffaa, 0.4);
    graphics.fillCircle(8, 8, 4);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(8, 8, 1.5);
    graphics.generateTexture('coinSparkle', 16, 16);

    // Warp-in flash for enemy spawn
    graphics.clear();
    graphics.fillStyle(0xff4444, 0.06);
    graphics.fillCircle(20, 20, 20);
    graphics.fillStyle(0xff6666, 0.15);
    graphics.fillCircle(20, 20, 12);
    graphics.fillStyle(0xffaaaa, 0.35);
    graphics.fillCircle(20, 20, 5);
    graphics.generateTexture('warpFlash', 40, 40);
}
