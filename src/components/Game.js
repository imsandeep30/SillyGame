import React, { useEffect, useRef, useState } from "react";
import Player from "./Player";
import Pillar from "./Pillar";
import GameOver from "./GameOver";
import "./Game.css";

const PLAYER_SIZE = 55;
const PILLAR_WIDTH = 90;
const PILLAR_GAP = 200;

const friends = [
  "/friend1.jpg",
  "/friend2.jpg",
  "/friend3.jpg",
  "/friend4.jpg",
  "/friend5.jpg"
];

function Game({ playerImage }) {
    const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("highScore")) || 0
    );
    const [score, setScore] = useState(0);
    const timerRef = useRef(null);
  const GAME_WIDTH = window.innerWidth;
  const GAME_HEIGHT = window.innerHeight;

  const playerYRef = useRef(250);
  const gravity = useRef(0);
  const animationRef = useRef(null);
  const frameRef = useRef(0);
  const pillarsRef = useRef([]);
  const gameOverTriggered = useRef(false);

  const jumpSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);

  const [playerY, setPlayerY] = useState(250);
  const [pillars, setPillars] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // preload sounds
  useEffect(() => {
    if (!isGameOver) {
        timerRef.current = setInterval(() => {
        setScore((prev) => prev + 1);
        }, 1000);
    }
    jumpSoundRef.current = new Audio("/jump.mp3");

    gameOverSoundRef.current = new Audio("/gameover.mp3");
    gameOverSoundRef.current.loop = true;
    return () => clearInterval(timerRef.current);
  }, [isGameOver]);

  const unlockAudio = () => {
    if (!audioUnlocked && jumpSoundRef.current) {
      jumpSoundRef.current.play().then(() => {
        jumpSoundRef.current.pause();
        jumpSoundRef.current.currentTime = 0;
        setAudioUnlocked(true);
      }).catch(() => {});
    }
  };

  const jump = () => {
    if (isGameOver) return;

    gravity.current = -9;

    if (audioUnlocked && jumpSoundRef.current) {
      jumpSoundRef.current.currentTime = 0;
      jumpSoundRef.current.play().catch(() => {});
    }
  };

  const createPillar = () => {
    const topHeight = Math.random() * (GAME_HEIGHT / 2);

    return {
      x: GAME_WIDTH,
      topHeight,
      bottomY: topHeight + PILLAR_GAP,
      image: friends[Math.floor(Math.random() * friends.length)]
    };
  };

  const gameOver = () => {
    if (gameOverTriggered.current) return;
    gameOverTriggered.current = true;

    cancelAnimationFrame(animationRef.current);
    gravity.current = 0;

    // stop jump sound
    if (jumpSoundRef.current) {
      jumpSoundRef.current.pause();
      jumpSoundRef.current.currentTime = 0;
    }
    clearInterval(timerRef.current);
    // setTimeout(() => {
      setIsGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("highScore", score);
    }

      if (audioUnlocked && gameOverSoundRef.current) {
        gameOverSoundRef.current.currentTime = 0;
        gameOverSoundRef.current.play().catch(() => {});
      }
    // }, 800);
  };

  const restart = () => {
    playerYRef.current = 250;   // 🔥 IMPORTANT FIX
    gravity.current = 0;
    frameRef.current = 0;
    pillarsRef.current = [];
    gameOverTriggered.current = false;
    setScore(0);
    setPlayerY(250);
    setPillars([]);
    setIsGameOver(false);

    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.pause();
      gameOverSoundRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (isGameOver) return;

    const loop = () => {
      gravity.current += 0.5;
      playerYRef.current += gravity.current;

      const currentY = playerYRef.current;

      // floor & ceiling
      if (
        currentY <= 0 ||
        currentY + PLAYER_SIZE >= GAME_HEIGHT
      ) {
        gameOver();
        return;
      }

      // move pillars
      pillarsRef.current = pillarsRef.current.map((pillar) => ({
        ...pillar,
        x: pillar.x - 4
      }));

      // create pillar
      if (frameRef.current % 110 === 0) {
        pillarsRef.current.push(createPillar());
      }

      // remove offscreen
      pillarsRef.current = pillarsRef.current.filter(
        (pillar) => pillar.x > -PILLAR_WIDTH
      );

      // accurate collision
      for (let pillar of pillarsRef.current) {
        const playerX = 40;
        const playerRight = playerX + PLAYER_SIZE;
        const pillarRight = pillar.x + PILLAR_WIDTH;

        const horizontal =
          playerRight > pillar.x &&
          playerX < pillarRight;

        if (horizontal) {
          // small tolerance (makes game fair)
          const tolerance = 4;

          const hitTop =
            currentY + tolerance < pillar.topHeight;

          const hitBottom =
            currentY + PLAYER_SIZE - tolerance >
            pillar.bottomY;

          if (hitTop || hitBottom) {
            gameOver();
            return;
          }
        }
      }

      // render
      setPlayerY(playerYRef.current);
      setPillars([...pillarsRef.current]);

      frameRef.current++;
      animationRef.current =
        requestAnimationFrame(loop);
    };

    animationRef.current =
      requestAnimationFrame(loop);

    return () =>
      cancelAnimationFrame(animationRef.current);
  }, [isGameOver]);

  return (
    <div
      className="game-container"
      onTouchStart={() => {
        unlockAudio();
        jump();
      }}
      onClick={() => {
        unlockAudio();
        jump();
      }}
    >
        <div className="score">
            {score}s
        </div>
      <Player y={playerY} playerImage={playerImage} />

      {pillars.map((pillar, index) => (
        <Pillar key={index} pillar={pillar} />
      ))}

      {isGameOver && (
        <GameOver
            restart={restart}
            score={score}
            highScore={highScore}
        />
        )}
    </div>
  );
}

export default Game;