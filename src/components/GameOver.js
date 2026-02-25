import React, { useEffect, useRef } from "react";
import "./GameOver.css";

function GameOver({ restart, score, highScore }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="gameover">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          loop
          playsInline
        >
          <source src="/gameover.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="score-box">
        <div>
          <p>Score</p>
          <h2>{score}s</h2>
        </div>

        <div>
          <p>High Score</p>
          <h2>{highScore}s</h2>
        </div>
      </div>
      <h1>GAME OVER</h1>

      <button onClick={restart}>
        Restart
      </button>
    </div>
  );
}

export default GameOver;