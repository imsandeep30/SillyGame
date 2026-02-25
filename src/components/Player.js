import React from "react";
import "./Player.css";

function Player({ y, playerImage}) {
  return (
    <div
      className="player"
      style={{ top: `${y}px` }}
    >
        <img src={playerImage} alt="" />
    </div>
  );
}

export default Player;