import React from "react"
import ReactDOM from "react-dom/client"

import "./index.css"
import "chess-merida-font/css/chessmerida-webfont.css"

import { data, Piece } from "./constants"
import { Square, ReadOnlySquare } from "./squares"
import { useChessHook } from "./chess-hook"

const Board = () => {
  const {
    legalMoves,
    pieceStates,
    boardDisplay,
    turn,
    gameState,
    promotion,
    inDanger,
    showLegalSquares,
    handleMove,
    handlePromote,
  } = useChessHook()

  const [selected, setSelected] = React.useState(-1)

  //just handle clicking a square
  const handleClick = (i: number) => {
    if (promotion >= 0) return //promoting, board locked
    if (gameState)
      //game state > 0 is game over
      return
    const squares = boardDisplay
    if (
      selected === -1 || //haven't clicked
      selected === i || //clicked the same square
      squares[selected] === null || //clicked an empty square
      legalMoves[i] === 0 //clicked an illegal square
    ) {
      showLegalSquares(i)
      setSelected(i)
    } else {
      handleMove(selected, i)
    }
  }

  const renderSquare = (i: number) => {
    const legal = !(legalMoves[i] === 0)
    //processing for square color
    let color = ""
    if (selected === i) color = "#2f2"
    if (((i & 7) + (i >> 3)) % 2 === 1) {
      //checkerboard pattern
      if (selected !== i) color = "#7d8796"
      else color = "#0d0"
      if (legal) color = "#bbbb00"
    } else if (legal) color = "#ffff00"
    const wKing = pieceStates[12]
    const bKing = pieceStates[28]
    if (
      (wKing === i && inDanger(wKing, boardDisplay) & 2 && turn) ||
      (bKing === i && inDanger(bKing, boardDisplay) & 1 && !turn)
    )
      color = "#f44"
    return (
      <td key={i}>
        <Square
          value={boardDisplay[i]}
          color={color}
          onClick={() => handleClick(i)}
        />
      </td>
    )
  }

  const renderPromoteSquare = (i: Piece) => {
    if (promotion < 0) return null //only visible for promotion
    if ((data[i].color === 2) !== turn) return null //show the right color
    return (
      <td key={i}>
        <Square value={i} color={"#fff"} onClick={() => handlePromote(i)} />
      </td>
    )
  }

  const player = "Next player: " + (turn ? "White" : "Black")
  let gameOverStatus = null
  if (gameState === 1) {
    const wKing = pieceStates[12]
    const bKing = pieceStates[28]
    if (inDanger(wKing, boardDisplay) & 2 && turn) gameOverStatus = "Black wins"
    else if (inDanger(bKing, boardDisplay) & 1 && !turn)
      gameOverStatus = "White wins"
    else gameOverStatus = "Stalemate"
  } else if (gameState === 2) gameOverStatus = "Draw by 3-fold repetition"
  else if (gameState === 3) gameOverStatus = "Draw by inactivity"

  const squares = []
  for (let i = 0; i < 8; i++) {
    const row = []
    for (let j = 0; j < 8; j++) {
      row.push(renderSquare(i * 8 + j))
    }
    const fullRow = (
      <tr className="board-row" key={8 - i}>
        <td>
          <ReadOnlySquare value={String(8 - i)} />
        </td>
        {row}
        <td>
          <ReadOnlySquare value={String(8 - i)} />
        </td>
      </tr>
    )
    squares.push(fullRow)
  }
  const columnChars = " abcdefgh\t"
  const columns = []
  for (const c of columnChars) {
    const cSquare = (
      <td key={c}>
        <ReadOnlySquare value={c} />
      </td>
    )
    columns.push(cSquare)
  }

  const promotePieces = []
  for (let i = 0; i < 3; ++i) {
    const align = (
      <td key={i}>
        <ReadOnlySquare value={" "} />
      </td>
    )
    promotePieces.push(align)
  }
  //promotion order is from most to least common
  //white promoting
  promotePieces.push(renderPromoteSquare("\u2655"))
  promotePieces.push(renderPromoteSquare("\u2658"))
  promotePieces.push(renderPromoteSquare("\u2656"))
  promotePieces.push(renderPromoteSquare("\u2657"))
  //black promoting
  promotePieces.push(renderPromoteSquare("\u265b"))
  promotePieces.push(renderPromoteSquare("\u265e"))
  promotePieces.push(renderPromoteSquare("\u265c"))
  promotePieces.push(renderPromoteSquare("\u265d"))

  return (
    <div>
      <div className="status">{player}</div>
      <table className="board" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>{columns}</tr>
          {squares}
          <tr>{columns}</tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>{promotePieces}</tr>
        </tbody>
      </table>
      <div className="gameOver">{gameOverStatus}</div>
    </div>
  )
}

const Game = () => (
  <div className="game">
    <div className="game-board">
      <Board />
    </div>
    <div className="game-info">
      <div>{/* status */}</div>
      <ol>{/* TODO */}</ol>
    </div>
  </div>
)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
)
