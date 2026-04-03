import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';
import HudOverlay from './HudOverlay';
import PauseView from './PauseView';
import GameContext from './GameContext';
import GameOverView from './GameOverView';
import StoreView from './StoreView';

const waveBannerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 5,
};

const waveBannerTextStyle: React.CSSProperties = {
    fontFamily: "'Orbitron Variable', sans-serif",
    fontSize: '48px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0ff',
    textShadow: '0 0 16px #0ff, 0 0 32px #0088ff, 0 0 64px #0044ff',
    animation: 'wave-banner-fade 0.4s ease-out',
};

export default function PhaserGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const waveMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Refs to capture current stats in event listeners without stale closures
    const waveNumberRef = useRef(0);
    const coinsRef = useRef(0);

    const [showGameOver, setShowGameOver] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [paused, setPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [coins, setCoins] = useState(0);
    const [waveNumber, setWaveNumber] = useState(0);
    const [clearedWave, setClearedWave] = useState(0);
    const [waveMessage, setWaveMessage] = useState<string | null>(null);
    const [gameOverStats, setGameOverStats] = useState({ score: 0, wave: 0, coins: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const config = createGameConfig(containerRef.current);
        const game = new Phaser.Game(config);
        gameRef.current = game;

        game.events.on('game-over', ({ score: finalScore, coins: finalCoins }: { score: number; coins: number; enemiesKilled: number }) => {
            setPaused(false);
            setShowStore(false);
            setShowGameOver(true);
            setGameOverStats({ score: finalScore, wave: waveNumberRef.current, coins: finalCoins });
        });
        game.events.on('score-changed', (value: number) => setScore(value));
        game.events.on('health-changed', (value: number) => setHealth(value));
        game.events.on('coin-collected', (value: number) => {
            coinsRef.current = value;
            setCoins(value);
        });
        game.events.on('wave-start', (wave: number) => {
            waveNumberRef.current = wave;
            setWaveNumber(wave);
            if (waveMessageTimeoutRef.current) clearTimeout(waveMessageTimeoutRef.current);
            setWaveMessage(`Wave ${wave} incoming!`);
            waveMessageTimeoutRef.current = setTimeout(() => setWaveMessage(null), 2000);
        });
        game.events.on('wave-cleared', (wave: number) => {
            if (waveMessageTimeoutRef.current) clearTimeout(waveMessageTimeoutRef.current);
            setWaveMessage(null);
            setClearedWave(wave);
            setShowStore(true);
            setTimeout(() => game.events.emit('pause-toggled', true), 500);
        });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const scene = game.scene.getScene('MainScene');
            if (!scene || (!scene.scene.isActive() && !scene.scene.isPaused())) return;
            const isPaused = scene.scene.isPaused();
            setPaused(!isPaused);
            game.events.emit('pause-toggled', !isPaused);
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (waveMessageTimeoutRef.current) clearTimeout(waveMessageTimeoutRef.current);
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    const dismissStore = () => {
        setShowStore(false);
        gameRef.current?.events.emit('pause-toggled', false);
        gameRef.current?.events.emit('store-dismissed');
    };

    const resetGame = () => {
        const game = gameRef.current;
        if (!game) return;
        setShowGameOver(false);
        setShowStore(false);
        setPaused(false);
        setScore(0);
        setHealth(100);
        setCoins(0);
        setWaveNumber(0);
        setWaveMessage(null);
        waveNumberRef.current = 0;
        coinsRef.current = 0;
        if (waveMessageTimeoutRef.current) clearTimeout(waveMessageTimeoutRef.current);
        const scene = game.scene.getScene('MainScene');
        if (scene) {
            scene.sound.stopAll();
            scene.scene.restart();
        }
    };

    const contextValue = {
        game: gameRef.current,
        setPaused,
        resetGame
    };

    return (
        <GameContext.Provider value={contextValue}>
            <div id="game-wrapper">
                <div ref={containerRef} id="game-container" className={showStore ? 'hide-canvas' : undefined}>
                    {paused && !showGameOver && !showStore && <PauseView />}
                    {showStore && !showGameOver && (
                        <StoreView wave={clearedWave} coins={coins} onContinue={dismissStore} />
                    )}
                    {showGameOver && <GameOverView stats={gameOverStats} />}
                    {waveMessage && !showGameOver && !showStore && (
                        <div style={waveBannerStyle}>
                            <span style={waveBannerTextStyle}>{waveMessage}</span>
                        </div>
                    )}
                </div>
                <HudOverlay score={score} health={health} coins={coins} gameOver={showGameOver} wave={waveNumber} />
            </div>
        </GameContext.Provider>
    );
}
