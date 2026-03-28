import clsx from 'clsx';
import classes from './HudOverlay.module.css';

interface HudOverlayProps {
    score: number;
    health: number;
    coins: number;
    gameOver: boolean;
}

export default function HudOverlay({ score, health, coins, gameOver }: HudOverlayProps) {
    const healthPercent = Math.max(0, Math.min(100, health));

    return (
        <div className={classes.hudOverlay}>
            <span className={classes.hudItem}>Score {score}</span>
            <div className={clsx(classes.hudItem, classes.healthBarContainer)}>
                <span className={classes.healthLabel}>Shields</span>
                <div className={classes.healthBarTrack}>
                    <div
                        className={classes.healthBarFill}
                        style={{ width: `${healthPercent}%` }}
                    />
                    <div
                        className={classes.healthBarGlow}
                        style={{ width: `${healthPercent}%` }}
                    />
                    {healthPercent < 30 && !gameOver && (
                        <span className={classes.criticalAlert}>Critical</span>
                    )}
                </div>
            </div>
            <span className={classes.hudItem}>Coins {coins}</span>
        </div>
    );
}
