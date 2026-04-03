import Phaser from 'phaser';

export class GameState {
    private _score = 0;
    private _coins = 0;
    private _enemiesKilled = 0;
    private _health = 100;

    constructor(private gameEvents: Phaser.Events.EventEmitter) {}

    get score(): number {
        return this._score;
    }

    get coins(): number {
        return this._coins;
    }

    get enemiesKilled(): number {
        return this._enemiesKilled;
    }

    get health(): number {
        return this._health;
    }

    set health(value: number) {
        this._health = value;
        this.gameEvents.emit('health-changed', this._health);
    }

    addScore(points: number): void {
        this._score += points;
        this.gameEvents.emit('score-changed', this._score);
    }

    collectCoin(): void {
        this._coins += 1;
        this.gameEvents.emit('coin-collected', this._coins);
    }

    recordKill(): void {
        this._enemiesKilled += 1;
    }

    emitGameOver(): void {
        this.gameEvents.emit('game-over', {
            score: this._score,
            coins: this._coins,
            enemiesKilled: this._enemiesKilled,
        });
    }
}
