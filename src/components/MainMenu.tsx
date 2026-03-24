import { useRef, useEffect } from 'react';
import './MainMenu.css';

interface MainMenuProps {
    onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        buttonRef.current?.focus();
    }, []);

    return (
        <div className="main-menu">
            <div className="menu-content">
                <h1 className="menu-title">GAMMA VECTOR</h1>
                <p className="menu-subtitle">A space survival shooter</p>
                <button ref={buttonRef} className="menu-button" onClick={onStartGame}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
