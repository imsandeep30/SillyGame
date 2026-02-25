import React from "react";
import Game from "./components/Game";
import Intro from "./components/intro";
import { useState } from "react";
function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <>
      {!selectedPlayer ? (
        <Intro setSelectedPlayer={setSelectedPlayer} />
      ) : (
        <Game playerImage={selectedPlayer} />
      )}
    </>
  );
}

export default App;