import { useEffect, useRef } from 'react';
import classes from './StoreView.module.css';

interface Props {
    wave: number;
    coins: number;
    onContinue: () => void;
}

export default function StoreView({ wave, coins, onContinue }: Props) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className={classes.overlay}>
            <div className={classes.panel}>
                <div className={classes.header}>
                    <span className={classes.title}>Wave {wave} cleared!</span>
                    <span className={classes.coins}>{coins} coins</span>
                </div>
                <div className={classes.upgradesPlaceholder}>
                    Upgrades coming soon
                </div>
                <button ref={ref} className={classes.continueButton} onClick={onContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
}
