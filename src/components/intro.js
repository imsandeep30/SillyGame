import React, { useState, useRef, useEffect } from "react";
import "./intro.css";

const friends = [
  { name: "bandi murali", image: "/friend1.jpg" },
  { name: "mabbu harsha", image: "/friend2.jpg" },
  { name: "ugadi harish", image: "/friend3.jpg" },
  { name: "saipaa", image: "/friend4.jpg" }
];

function Intro({ setSelectedPlayer }) {
  const [inputName, setInputName] = useState("");
  const [showList, setShowList] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const introMusicRef = useRef(null);
  const errorSoundRef = useRef(null);

  // 🔊 Preload audio once
  useEffect(() => {
    introMusicRef.current = new Audio("/randirandi.mp3");
    

    errorSoundRef.current = new Audio("/eemingakoduku.mp3");

    return () => {
      // Cleanup when component unmounts
      if (introMusicRef.current) {
        introMusicRef.current.pause();
        introMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  // 🔓 Unlock audio & start intro music
  const unlockAudio = () => {
    if (!audioUnlocked && introMusicRef.current) {
      introMusicRef.current.play()
        .then(() => {
          setAudioUnlocked(true);
        })
        .catch(() => {});
    }
  };

  // 🔇 Stop intro music safely
  const stopIntroMusic = () => {
    if (introMusicRef.current) {
      introMusicRef.current.pause();
      introMusicRef.current.currentTime = 0;
    }
  };

  const goToGame = (image) => {
    stopIntroMusic();

    // Small delay ensures audio fully stops before unmount
    setTimeout(() => {
      setSelectedPlayer(image);
    }, 100);
  };

  const handleSubmit = () => {
    unlockAudio();

    const cleanedName = inputName.trim().toLowerCase();

    const match = friends.find(
      (f) => f.name.toLowerCase() === cleanedName
    );

    if (match) {
      goToGame(match.image);
    } else {
      if (audioUnlocked && errorSoundRef.current) {
        errorSoundRef.current.currentTime = 0;
        errorSoundRef.current.play().catch(() => {});
      }
      setShowList(true);
    }
  };

  return (
    <div
      className="intro-container"
      onClick={unlockAudio}
      onTouchStart={unlockAudio}
    >
      <h1>Nee Peru Kottu ra Zumka</h1>

      <input
        type="text"
        placeholder="ikkada ikkada kottu..."
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Start Game
      </button>

      {showList && (
        <div className="user-list">
          <h3>
            Nee peru ledhu le kani veelalo okadi meedha noku
          </h3>

          {friends.map((friend, index) => (
            <div
              key={index}
              className="user-card"
              onClick={() => goToGame(friend.image)}
            >
              <img src={friend.image} alt="" />
              <p>{friend.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Intro;