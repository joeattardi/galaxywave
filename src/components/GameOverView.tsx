import { useEffect, useRef } from 'react';
import classes from './GameOverView.module.css';
import useGameContext from './useGameContext';

interface Props {
    stats: { score: number; wave: number; coins: number };
}

export default function GameOverView({ stats }: Props) {
    const { resetGame } = useGameContext();
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className={classes.gameOverOverlay}>
            <div className={classes.gameOverMessage}>
                Game Over
            </div>
            <div className={classes.stats}>
                <span>Wave {stats.wave}</span>
                <span>Score {stats.score}</span>
                <span>Coins {stats.coins}</span>
            </div>
            <button
                className={classes.resetButton}
                onClick={resetGame}
                ref={ref}
            >
                Try Again
            </button>
        </div>
    );
}
