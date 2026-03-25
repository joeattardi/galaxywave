import Phaser from 'phaser';

const images = [
    { key: 'player', path: 'assets/playerShip.png' },
    { key: 'enemy', path: 'assets/enemyShip.png' }
] as const;

const audio = [
    { key: 'playerDamage', path: 'assets/playerDamage.wav' },
    { key: 'playerDeath', path: 'assets/playerDeath.wav' },
    { key: 'enemyDestroyed', path: 'assets/enemyDestroyed.wav' },
    { key: 'pickupCoin', path: 'assets/pickupCoin.wav' },
    { key: 'thrusterRumble', path: 'assets/thrusterRumble.wav' },
    { key: 'laserShoot', path: 'assets/laserShoot.wav' },
    { key: 'backgroundMusic', path: 'assets/Nebula_Stalker.mp3' }
] as const;

export function loadAssets(scene: Phaser.Scene): void {
    for (const { key, path } of images) {
        scene.load.image(key, path);
    }
    for (const { key, path } of audio) {
        scene.load.audio(key, path);
    }
}
