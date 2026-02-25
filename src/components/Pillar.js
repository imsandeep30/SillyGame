import React from "react";
import "./Pillar.css";

function Pillar({ pillar }) {
  const imageCount = 10;

  return (
    <>
      <div
        className="pillar top"
        style={{
          height: pillar.topHeight,
          left: pillar.x
        }}
      >
        {Array.from({ length: imageCount }).map(
          (_, i) => (
            <img
              key={i}
              src={pillar.image}
              alt=""
            />
          )
        )}
      </div>

      <div
        className="pillar bottom"
        style={{
          top: pillar.bottomY,
          left: pillar.x
        }}
      >
        {Array.from({ length: imageCount }).map(
          (_, i) => (
            <img
              key={i}
              src={pillar.image}
              alt=""
            />
          )
        )}
      </div>
    </>
  );
}

export default Pillar;