import React, { useState } from 'react';
import './App.css';

// COLORS (used in inline styles as accents/themes)
const PRIMARY = '#1976d2';
const SECONDARY = '#424242';
const ACCENT = '#ffeb3b';

/** Single square (cell) for the Tic Tac Toe board. */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      style={{
        color: value === 'X' ? PRIMARY : value === 'O' ? SECONDARY : undefined,
        background: highlight ? ACCENT : '',
        outline: 'none',
      }}
      aria-label={value ? `Cell: ${value}` : 'Empty cell'}
    >
      {value}
    </button>
  );
}

/** Board rendering 3x3 Tic Tac Toe grid. */
function Board({ squares, onCellClick, winningLine }) {
  function renderSquare(i) {
    const highlight = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onCellClick(i)}
        highlight={highlight}
      />
    );
  }
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {[0, 1, 2].map(row =>
        <div key={row} className="ttt-board-row" role="row">
          {[0, 1, 2].map(col => renderSquare(row * 3 + col))}
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Board state: 9 cells, 'X', 'O', or null.
  const [squares, setSquares] = useState(Array(9).fill(null));
  // true if it's X's turn, false if O's turn.
  const [xIsNext, setXIsNext] = useState(true);
  // null if no winner/draw, 'X' or 'O' if won, 'draw' if board filled
  const [gameStatus, setGameStatus] = useState({ status: "ongoing", winner: null, line: null });

  // Reset state to initial values.
  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameStatus({ status: "ongoing", winner: null, line: null });
  }

  // Handle a click on a cell (square index).
  // PUBLIC_INTERFACE
  function handleCellClick(i) {
    if (squares[i] || gameStatus.status !== "ongoing") return;  // Ignore if filled or game over

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);

    // Check for winner or draw
    const { winner, line } = calculateWinner(nextSquares);
    if (winner) {
      setGameStatus({ status: "win", winner, line });
    } else if (nextSquares.every(cell => cell)) {
      setGameStatus({ status: "draw", winner: null, line: null });
    } else {
      setXIsNext(!xIsNext);
    }
  }

  // Render current status message
  let statusText;
  if (gameStatus.status === "win") {
    statusText = (
      <span>
        <b style={{ color: gameStatus.winner === 'X' ? PRIMARY : SECONDARY }}>
          {gameStatus.winner}
        </b> wins! 🎉
      </span>
    );
  } else if (gameStatus.status === "draw") {
    statusText = <span>It's a draw! 🤝</span>;
  } else {
    statusText = (
      <span>
        Next: <b style={{ color: xIsNext ? PRIMARY : SECONDARY }}>{xIsNext ? "X" : "O"}</b>
      </span>
    );
  }

  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <p className="ttt-desc">Play local 2-player mode: X & O take turns. Get three in a row to win!</p>
      </header>
      <main className="ttt-main-container">
        <Board squares={squares} onCellClick={handleCellClick} winningLine={gameStatus.line} />
        <div className="ttt-status">{statusText}</div>
        <button className="ttt-restart-btn" onClick={handleRestart}>
          Restart Game
        </button>
      </main>
      <footer className="ttt-footer">
        <small>
          Minimalistic, light theme • React • <span style={{ color: ACCENT }}>Accent</span>
        </small>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (let line of lines) {
    const [a,b,c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}

export default App;
