import React, { useState, useEffect } from 'react';
import './App.css';

// COLORS (used in inline styles as accents/themes)
const PRIMARY = '#1976d2';
const SECONDARY = '#424242';
const ACCENT = '#ffeb3b';

/** Single square (cell) for the Tic Tac Toe board. */
function Square({ value, onClick, highlight, disabled }) {
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
      disabled={disabled}
    >
      {value}
    </button>
  );
}

/** Board rendering 3x3 Tic Tac Toe grid. */
function Board({ squares, onCellClick, winningLine, disabled }) {
  function renderSquare(i) {
    const highlight = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onCellClick(i)}
        highlight={highlight}
        disabled={disabled || !!squares[i]}
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
  // true if it's X's (user's) turn.
  const [xIsNext, setXIsNext] = useState(true);
  // {status: 'ongoing'|'win'|'draw', winner: 'X'|'O'|null, line: [numbers]|null}
  const [gameStatus, setGameStatus] = useState({ status: "ongoing", winner: null, line: null });

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameStatus({ status: "ongoing", winner: null, line: null });
  }

  // PUBLIC_INTERFACE
  function handleCellClick(i) {
    // Only accept clicks if it's user's(X) turn and game is ongoing and cell is empty
    if (!xIsNext || squares[i] || gameStatus.status !== "ongoing") return;

    const nextSquares = squares.slice();
    nextSquares[i] = "X";
    const { winner, line } = calculateWinner(nextSquares);

    if (winner) {
      setSquares(nextSquares);
      setGameStatus({ status: "win", winner, line });
    } else if (nextSquares.every(cell => cell)) {
      setSquares(nextSquares);
      setGameStatus({ status: "draw", winner: null, line: null });
    } else {
      setSquares(nextSquares);
      setXIsNext(false);
      // O(turn) will be handled in useEffect
    }
  }

  // O's auto-move effect. Triggers after X's move (when xIsNext flips to false)
  useEffect(() => {
    let timeoutId;
    if (!xIsNext && gameStatus.status === "ongoing") {
      // Find available moves, pick one (simple AI: first empty)
      timeoutId = setTimeout(() => {
        const emptyIndices = squares
          .map((v, idx) => (v == null ? idx : null))
          .filter(v => v !== null);
        if (emptyIndices.length === 0) return;

        // Simple AI: random move (replace with smarter logic if desired)
        const move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        const nextSquares = squares.slice();
        nextSquares[move] = "O";
        const { winner, line } = calculateWinner(nextSquares);
        if (winner) {
          setSquares(nextSquares);
          setGameStatus({ status: "win", winner, line });
          setXIsNext(true); // X would start new game if restarted
        } else if (nextSquares.every(cell => cell !== null)) {
          setSquares(nextSquares);
          setGameStatus({ status: "draw", winner: null, line: null });
          setXIsNext(true);
        } else {
          setSquares(nextSquares);
          setXIsNext(true); // Back to user's turn
        }
      }, 500); // Brief delay for UX
    }
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [squares, xIsNext, gameStatus.status]);

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
        {xIsNext ? "Your turn (X)" : "O (Bot) is thinking..."}
      </span>
    );
  }

  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <p className="ttt-desc">
          Play against the computer: You are X, O plays automatically.
        </p>
      </header>
      <main className="ttt-main-container">
        <Board
          squares={squares}
          onCellClick={handleCellClick}
          winningLine={gameStatus.line}
          disabled={!xIsNext || gameStatus.status !== 'ongoing'}
        />
        <div className="ttt-status">{statusText}</div>
        <button className="ttt-restart-btn" onClick={handleRestart}>
          Restart Game
        </button>
      </main>
      <footer className="ttt-footer">
        <small>
          Minimalistic, light theme • React • <span style={{ color: ACCENT }}>Bot Mode</span>
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
