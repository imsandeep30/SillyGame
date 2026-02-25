import React, { useEffect, useRef, useState, useCallback } from "react";
import Player from "./Player";
import Pillar from "./Pillar";
import GameOver from "./GameOver";
import "./Game.css";

const PLAYER_SIZE = 55;
const PILLAR_WIDTH = 90;
const PILLAR_GAP = 200;

const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

const friends = [
  "/friend1.jpg",
  "/friend2.jpg",
  "/friend3.jpg",
  "/friend4.jpg",
  "/friend5.jpg"
];

function Game({ playerImage }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("highScore")) || 0
  );
  const [playerY, setPlayerY] = useState(250);
  const [pillars, setPillars] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const playerYRef = useRef(250);
  const gravity = useRef(0);
  const animationRef = useRef(null);
  const frameRef = useRef(0);
  const pillarsRef = useRef([]);
  const gameOverTriggered = useRef(false);
  const timerRef = useRef(null);

  const jumpSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);

  // 🔊 Preload sounds
  useEffect(() => {
    jumpSoundRef.current = new Audio("/jump.mp3");
    jumpSoundRef.current.preload = "auto";

    gameOverSoundRef.current = new Audio("/gameover.mp3");
    gameOverSoundRef.current.loop = true;
  }, []);

  // ⏱ Score timer
  useEffect(() => {
    if (!isGameOver) {
      timerRef.current = setInterval(() => {
        setScore((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isGameOver]);

  const jump = () => {
    if (isGameOver) return;

    gravity.current = -9;

    if (jumpSoundRef.current) {
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

  const gameOver = useCallback(() => {
    if (gameOverTriggered.current) return;
    gameOverTriggered.current = true;

    cancelAnimationFrame(animationRef.current);
    clearInterval(timerRef.current);
    gravity.current = 0;

    if (jumpSoundRef.current) {
      jumpSoundRef.current.pause();
      jumpSoundRef.current.currentTime = 0;
    }

    setHighScore((prev) => {
      if (score > prev) {
        localStorage.setItem("highScore", score);
        return score;
      }
      return prev;
    });

    setIsGameOver(true);

    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.currentTime = 0;
      gameOverSoundRef.current.play().catch(() => {});
    }
  }, [score]);

  const restart = () => {
    playerYRef.current = 250;
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
      gravity.current += 0.25;
      playerYRef.current += gravity.current;

      const currentY = playerYRef.current;

      // Floor & ceiling collision
      if (currentY <= 0 || currentY + PLAYER_SIZE >= GAME_HEIGHT) {
        gameOver();
        return;
      }

      // Move pillars
      pillarsRef.current = pillarsRef.current.map((pillar) => ({
        ...pillar,
        x: pillar.x - 4
      }));

      // Create new pillar
      if (frameRef.current % 110 === 0) {
        pillarsRef.current.push(createPillar());
      }

      // Remove offscreen
      pillarsRef.current = pillarsRef.current.filter(
        (pillar) => pillar.x > -PILLAR_WIDTH
      );

      // Collision detection
      for (let pillar of pillarsRef.current) {
        const playerX = 40;
        const playerRight = playerX + PLAYER_SIZE;
        const pillarRight = pillar.x + PILLAR_WIDTH;

        const horizontal =
          playerRight > pillar.x && playerX < pillarRight;

        if (horizontal) {
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

      setPlayerY(playerYRef.current);
      setPillars([...pillarsRef.current]);

      frameRef.current++;
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () =>
      cancelAnimationFrame(animationRef.current);

  }, [isGameOver, gameOver]);

  return (
    <div
      className="game-container"
      onTouchStart={jump}
      onClick={jump}
    >
      <div className="score">{score}s</div>

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