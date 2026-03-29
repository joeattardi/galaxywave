import { useRef, useEffect, useCallback } from 'react';
import classes from './MainMenu.module.css';

interface MainMenuProps {
    onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        buttonRef.current?.focus();

        const audio = new Audio('assets/Nebula_Navigator.mp3');
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        const playOnInteraction = () => {
            audio.play().catch(() => {});
            window.removeEventListener('click', playOnInteraction);
            window.removeEventListener('keydown', playOnInteraction);
        };

        audio.play().catch(() => {
            window.addEventListener('click', playOnInteraction);
            window.addEventListener('keydown', playOnInteraction);
        });

        return () => {
            audio.pause();
            audio.src = '';
            window.removeEventListener('click', playOnInteraction);
            window.removeEventListener('keydown', playOnInteraction);
        };
    }, []);

    const handleStart = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        onStartGame();
    }, [onStartGame]);

    return (
        <div className={classes.mainMenu}>
            <div className={classes.menuContent}>
                <h1 className={classes.menuTitle}>GALAXY WAVE</h1>
                <button ref={buttonRef} className={classes.menuButton} onClick={handleStart}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
