import React, { useState, useEffect, useCallback, useMemo } from "react"
import "./index.css"
import "chess-merida-font/css/chessmerida-webfont.css"

import { mailbox, mailbox64, data, startingPosition, hashSeeds, extraSeeds } from "./constants"
import ReactDOM from "react-dom/client"

const Piece = (props: { display: string | null }) => {
  let display
  switch (props.display) {
    case "\u2654":
      display = "cm cm-w-king"
      break
    case "\u2655":
      display = "cm cm-w-queen"
      break
    case "\u2656":
      display = "cm cm-w-rook"
      break
    case "\u2657":
      display = "cm cm-w-bishop"
      break
    case "\u2658":
      display = "cm cm-w-knight"
      break
    case "\u2659":
      display = "cm cm-w-pawn"
      break
    case "\u265a":
      display = "cm cm-b-king"
      break
    case "\u265b":
      display = "cm cm-b-queen"
      break
    case "\u265c":
      display = "cm cm-b-rook"
      break
    case "\u265d":
      display = "cm cm-b-bishop"
      break
    case "\u265e":
      display = "cm cm-b-knight"
      break
    case "\u265f":
      display = "cm cm-b-pawn"
      break
    default:
      break
  }
  return <i className={display} aria-hidden="true" />
}

const Square = (props: {
  onClick: (e: React.MouseEvent) => void
  color: string
  value: string | null
}) => {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ backgroundColor: props.color }}
    >
      <Piece display={props.value} />
    </button>
  )
}

const ReadOnlySquare = (props: { value: string }) => {
  return (
    <button
      className="square"
      style={{ backgroundColor: "#fff", fontSize: "12px" }}
    >
      {props.value}
    </button>
  )
}

const Board = () => {
  const [selected, setSelected] = useState(-1)
  const [currentBoard, setCurrentBoard] = useState<
    (keyof typeof data | null)[]
  >(() => {
    const board = Array(64).fill(null)
    board[63] = "\u2656"
    board[62] = "\u2658"
    board[61] = "\u2657"
    board[60] = "\u2654"
    board[59] = "\u2655"
    board[58] = "\u2657"
    board[57] = "\u2658"
    board[56] = "\u2656"
    board[55] = "\u2659"
    board[54] = "\u2659"
    board[53] = "\u2659"
    board[52] = "\u2659"
    board[51] = "\u2659"
    board[50] = "\u2659"
    board[49] = "\u2659"
    board[48] = "\u2659"

    board[0] = "\u265c"
    board[1] = "\u265e"
    board[2] = "\u265d"
    board[3] = "\u265b"
    board[4] = "\u265a"
    board[5] = "\u265d"
    board[6] = "\u265e"
    board[7] = "\u265c"
    board[8] = "\u265f"
    board[9] = "\u265f"
    board[10] = "\u265f"
    board[11] = "\u265f"
    board[12] = "\u265f"
    board[13] = "\u265f"
    board[14] = "\u265f"
    board[15] = "\u265f"
    return board
  })
  const [color, setColor] = useState<(number | null)[]>(() => {
    const colors = Array(64).fill(null)
    for (let i = 0; i < 8; ++i) {
      colors[i + 48] = 1
      colors[i + 56] = 1
      colors[i + 8] = 2
      colors[i] = 2
    }
    return colors
  })
  const [pieceStates, setPieceStates] = useState(startingPosition)
  const [promotion, setPromotion] = useState<{
    square: number
    piece: null | string
  }>({ square: -1, piece: null })
  const [enPassantSquare, setEnPassantSquare] = useState(-1)

  const [halfClock, setHalfClock] = useState(0)
  const [turn, setTurn] = useState(true)
  const [gameState, setGameState] = useState(0)
  const [legalMoves, setLegalMoves] = useState(Array(64).fill(0))
  const [castleAvailable, setCastleAvailable] = useState([
    true,
    true,
    true,
    true,
  ])
  const [history, setHistory] = useState<number[][]>(() => {
    const hash = [0, 0]
    for (let i = 0; i < currentBoard.length; ++i) {
      if (currentBoard[i] !== null) {
        const j = data[currentBoard[i] as keyof typeof data].hash
        hash[0] ^= hashSeeds[0][i][j]
        hash[1] ^= hashSeeds[1][i][j]
      }
    }
    return [hash]
  })

  //does not check if move is legal
  //returns the resulting position
  const executeMove = useCallback(
    (
      pieceNumber: number,
      startSquare: number,
      finalSquare: number,
      type: number
    ) => {
      const board = currentBoard.slice()
      const colors = color.slice()
      const castle = castleAvailable.slice()
      const pieces = pieceStates.slice()
      let enPassant = -1
      let promotion = { square: -1, piece: null }

      const result = { board, colors, castle, pieces, enPassant, promotion }

      if (board[finalSquare] !== null) {
        pieces[pieces.indexOf(finalSquare)] = -1 //piece is captured.
      }

      pieces[pieceNumber] = finalSquare
      board[finalSquare] = board[startSquare]
      board[startSquare] = null
      colors[finalSquare] = colors[startSquare]
      colors[startSquare] = null

      if (type < 0) enPassant = -type

      if (type < 3) {
        castle[0] = castle[0] && startSquare !== 56 && startSquare !== 60 //left white rook moved or white king moved
        castle[1] = castle[1] && startSquare !== 63 && startSquare !== 60 //right white rook moved or white king moved
        castle[2] = castle[2] && startSquare !== 0 && startSquare !== 4 //left black rook moved or black king moved
        castle[3] = castle[3] && startSquare !== 7 && startSquare !== 4 //right white rook moved or black king moved
      } else if (type === 3) {
        //en passant capture
        const direction =
          finalSquare > startSquare
            ? finalSquare - startSquare - 8
            : finalSquare - startSquare + 8
        pieces[pieces.indexOf(startSquare + direction)] = -1
        board[startSquare + direction] = null
        colors[startSquare + direction] = null
      } else if (type < 8) {
        //castling, hard coded
        castle[type - 4] = false //disable the type of castling we just did
        switch (type) {
          case 4: //0-0-0
            castle[1] = false //disable the other way of castling (can't castle long after castling short, and vice versa)
            pieces[8] = 59
            board[59] = board[56]
            colors[59] = colors[56]
            board[56] = null
            colors[56] = null //these 5 lines are just moving the rook
            break
          case 5: //0-0
            castle[0] = false
            pieces[15] = 61
            board[61] = board[63]
            colors[61] = colors[63]
            board[63] = null
            colors[63] = null
            break
          case 6: //...0-0-0
            castle[3] = false
            pieces[24] = 3
            board[3] = board[0]
            colors[3] = colors[0]
            board[0] = null
            colors[0] = null
            break
          case 7: //...0-0
            castle[2] = false
            pieces[31] = 5
            board[5] = board[7]
            colors[5] = colors[7]
            board[7] = null
            colors[7] = null
            break
          default: //do nothing
        }
      } else {
        //promotion
        promotion.square = finalSquare
      }
      return result
    },
    [currentBoard, color, castleAvailable, pieceStates]
  )

  //use 2 32-bit hashes for the board instead of 1 64-bit hash because Javascript Number stops at 53 bit
  const hashMove = useCallback(
    (startSquare: number, finalSquare: number) => {
      const iterable = history[history.length - 1].slice()
      const board = currentBoard
      for (let i = 0; i < 2; ++i) {
        if (board[finalSquare] !== null)
          iterable[i] ^=
            hashSeeds[i][finalSquare][
              data[board[finalSquare] as keyof typeof data].hash
            ] //remove captured piece if any
        iterable[i] ^=
          hashSeeds[i][startSquare][
            data[board[startSquare] as keyof typeof data].hash
          ] //moving
        iterable[i] ^=
          hashSeeds[i][finalSquare][
            data[board[startSquare] as keyof typeof data].hash
          ]
        for (let j = 0; j < castleAvailable.length; ++j) {
          iterable[i] ^= (castleAvailable[j] && extraSeeds[j]) as number
        }
        iterable[i] ^= extraSeeds[4]
        iterable[i] ^= extraSeeds[5] * enPassantSquare
      }
      return iterable
    },
    [history, castleAvailable, currentBoard, enPassantSquare]
  )

  const realizeMove = useCallback(
    (
      pieceNumber: number,
      startSquare: number,
      finalSquare: number,
      type: number
    ) => {
      const hashedMove = hashMove(startSquare, finalSquare)
      setHistory((history) => {
        const copy = history.slice()
        copy.push(hashedMove)
        return copy
      })
      return executeMove(pieceNumber, startSquare, finalSquare, type)
    },
    [hashMove, executeMove]
  )

  //generates pseudo-legal moves (moves that the pieces could make, but not necessarily results in a legal position)
  const generateMoves = useCallback(
    (piecePosition: number) => {
      const pieces = pieceStates
      const i = pieces[piecePosition]
      let moves: number[][] = [] //array of [piecePosition, startSquare, finalSquare, moveType]
      if (i === -1) return moves
      const board = currentBoard
      const colors = color
      const enemy = colors[i] === 1 ? 2 : 1
      const pieceID = board[i]
      const piece = data[pieceID as keyof typeof data]
      if (piece.name) {
        //non-pawns
        for (const offset of piece.offset) {
          for (let n = i; ; ) {
            n = mailbox[mailbox64[n] + offset]
            if (n === -1) break /* outside board */
            if (colors[n] !== null) {
              if (colors[n] === enemy)
                moves.push([piecePosition, i, n, 2]) /* capture from i to n */
              break
            }
            moves.push([piecePosition, i, n, 1]) /* quiet move from i to n */
            if (!piece.slide) break /* next direction */
          }
        }
      } else {
        //pawns have custom behaviour
        for (const offset of piece.offset) {
          //capturing diagonally forward
          let n = i
          n = mailbox[mailbox64[n] + offset]
          if (n !== -1 && colors[n] === enemy) {
            if ((n <= 7 && n >= 0) || (n <= 63 && n >= 56)) {
              //pawns reaching last rank must promote
              moves.push([piecePosition, i, n, 9])
            } else moves.push([piecePosition, i, n, 2])
          } else if (n !== -1 && enPassantSquare === n) {
            //captures en passant
            moves.push([piecePosition, i, n, 3])
          }
        }
        const n = mailbox[mailbox64[i] + (piece as { move: number }).move] //moving forward
        if (colors[n] === null) {
          if ((n <= 7 && n >= 0) || (n <= 63 && n >= 56)) {
            //pawns reaching last rank must promote
            moves.push([piecePosition, i, n, 8])
          } else {
            moves.push([piecePosition, i, n, 1])
            if (
              (n <= 23 && n >= 16 && colors[i] === 2) ||
              (n <= 47 && n >= 40 && colors[i] === 1)
            ) {
              //if the piece could land on the 3rd/6th rank, it must have started from the origin
              const m = mailbox[mailbox64[n] + (piece as { move: number }).move]
              if (colors[m] === null) {
                moves.push([piecePosition, i, m, -n]) //type carries information required for en passant
              }
            }
          }
        }
      }
      if (pieceID === "\u2654") {
        //castling, hard coded checks
        if (
          castleAvailable[0] &&
          board[57] === null &&
          board[58] === null &&
          board[59] === null
        ) {
          moves.push([piecePosition, i, i - 2, 4])
        }
        if (castleAvailable[1] && board[61] === null && board[62] === null) {
          moves.push([piecePosition, i, i + 2, 5])
        }
      } else if (pieceID === "\u265a") {
        if (
          castleAvailable[2] &&
          board[1] === null &&
          board[2] === null &&
          board[3] === null
        ) {
          moves.push([piecePosition, i, i - 2, 6])
        }
        if (castleAvailable[3] && board[5] === null && board[6] === null) {
          moves.push([piecePosition, i, i + 2, 7])
        }
      }
      return moves
    },
    [pieceStates, currentBoard, castleAvailable, enPassantSquare, color]
  )

  //check if square is being attacked
  //0 is not attacked
  //1 is attacked by white
  //2 is attacked by black
  //3 is attacked by both
  const inDanger = useCallback((i: number, board: (string | null)[]) => {
    let result = 0
    for (const [pieceID, piece] of Object.entries(data)) {
      for (const offset of piece.offset) {
        //if a piece of the same color can already capture square i, skip this piece
        if (piece.color & result) continue
        for (let n = i; ; ) {
          n = mailbox[mailbox64[n] - offset] //reversed offset for calculating backwards, only relevant for pawns
          if (n === -1) break /* outside board */
          if (board[n] === pieceID) {
            result |= piece.color
            break
          } else if (board[n]) break //ray cast stops when a piece is found
          if (!piece.slide) break /* next direction */
        }
      }
    }
    return result
  }, [])

  //take moves generated by generateMoves and remove illegal ones
  const trimMoves = useCallback(
    (moves: number[][]) => {
      return moves.filter((move) => {
        if ((move[0] < 16) !== turn) return false
        switch (move[3]) {
          case 4:
            return (
              !(inDanger(60, currentBoard) & 2) &&
              !(inDanger(59, currentBoard) & 2) &&
              !(inDanger(58, currentBoard) & 2)
            )
          case 5:
            return (
              !(inDanger(60, currentBoard) & 2) &&
              !(inDanger(61, currentBoard) & 2) &&
              !(inDanger(62, currentBoard) & 2)
            )
          case 6:
            return (
              !(inDanger(4, currentBoard) & 1) &&
              !(inDanger(3, currentBoard) & 1) &&
              !(inDanger(2, currentBoard) & 1)
            )
          case 7:
            return (
              !(inDanger(4, currentBoard) & 1) &&
              !(inDanger(5, currentBoard) & 1) &&
              !(inDanger(6, currentBoard) & 1)
            )
          default:
            break
        }
        const position =
          move[3] >= 8
            ? executeMove(move[0], move[1], move[2], move[3] - 7)
            : executeMove(move[0], move[1], move[2], move[3])
        const wKing = position.pieces[12]
        const bKing = position.pieces[28]
        if (inDanger(wKing, position.board) & 2 && turn) return false
        else if (inDanger(bKing, position.board) & 1 && !turn) return false
        else return true
      })
    },
    [currentBoard, turn, executeMove, inDanger]
  )

  //get squares available to the piece at current square
  const showLegalSquares = useCallback(
    (target: number) => {
      const p = pieceStates.indexOf(target)
      let legals = Array(64).fill(0)
      if (p >= 0) {
        const moves = trimMoves(generateMoves(p))
        for (const move of moves) {
          legals[move[2]] = move[3]
        }
      }
      return legals
    },
    [pieceStates, generateMoves, trimMoves]
  )

  const checkEndGame = useMemo(() => {
    let allMovesAvailable = 0
    for (let i = 0; i < 32; ++i) {
      allMovesAvailable += trimMoves(generateMoves(i)).length
    }
    if (allMovesAvailable === 0) return 1

    let repeat = 0
    for (let hashedMove of history) {
      if (
        history[history.length - 1][0] !== hashedMove[0] ||
        history[history.length - 1][1] !== hashedMove[1]
      ) {
        continue
      } else repeat++
    }
    if (repeat >= 3) return 2
    if (halfClock >= 50) return 3
    return 0
  }, [halfClock, history, trimMoves, generateMoves])

  //just handle clicking a square
  const handleClick = useCallback(
    (i: number) => {
      if (promotion.square >= 0) return //promoting, board locked
      if (gameState)
        //game state > 0 is game over
        return
      const squares = currentBoard
      if (
        selected === -1 || //haven't clicked
        selected === i || //clicked the same square
        squares[selected] === null || //clicked an empty square
        legalMoves[i] === 0 //clicked an illegal square
      ) {
        setLegalMoves(showLegalSquares(i))
        setSelected(i)
      } else {
        const p = pieceStates.indexOf(selected)
        const position = realizeMove(p, selected, i, legalMoves[i]) //move from selected to current square
        setHalfClock((halfClock) =>
          currentBoard[i] === "\u2659" || currentBoard[i] === "\u265f"
            ? 0
            : halfClock + 1
        )
        setSelected(-1)
        setCurrentBoard(position.board)
        setColor(position.colors)
        setPieceStates(position.pieces)
        setCastleAvailable(position.castle)
        setEnPassantSquare(position.enPassant)
        setPromotion(position.promotion)
        setLegalMoves(Array(64).fill(0))
        setTurn(!turn)
      }
    },
    [
      selected,
      promotion,
      gameState,
      currentBoard,
      legalMoves,
      turn,
      pieceStates,
      realizeMove,
      showLegalSquares,
    ]
  )

  const handleClickPromote = useCallback(
    (piece: keyof typeof data) => {
      const promoting = promotion.square
      const board = currentBoard
      board[promoting] = piece
      setCurrentBoard(board.slice())
      setPromotion({ square: -1, piece: null })
    },

    [currentBoard, promotion]
  )

  const renderSquare = useCallback(
    (i: number) => {
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
        (wKing === i && inDanger(wKing, currentBoard) & 2 && turn) ||
        (bKing === i && inDanger(bKing, currentBoard) & 1 && !turn)
      )
        color = "#f44"
      return (
        <td key={i}>
          <Square
            value={currentBoard[i]}
            color={color}
            onClick={() => handleClick(i)}
          />
        </td>
      )
    },
    [
      selected,
      legalMoves,
      pieceStates,
      currentBoard,
      turn,
      inDanger,
      handleClick,
    ]
  )

  const renderPromoteSquare = useCallback(
    (i: keyof typeof data) => {
      if (promotion.square < 0) return null //only visible for promotion
      if ((data[i].color === 2) !== turn) return null //show the right color
      return (
        <td key={i}>
          <Square
            value={i}
            color={"#fff"}
            onClick={() => handleClickPromote(i)}
          />
        </td>
      )
    },
    [promotion, turn, handleClickPromote]
  )

  useEffect(() => setGameState(checkEndGame), [checkEndGame])

  const render = useMemo(() => {
    const player = "Next player: " + (turn ? "White" : "Black")
    let gameOverStatus = null
    if (gameState === 1) {
      const wKing = pieceStates[12]
      const bKing = pieceStates[28]
      if (inDanger(wKing, currentBoard) & 2 && turn)
        gameOverStatus = "Black wins"
      else if (inDanger(bKing, currentBoard) & 1 && !turn)
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
  }, [
    currentBoard,
    pieceStates,
    gameState,
    turn,
    renderSquare,
    renderPromoteSquare,
    inDanger,
  ])
  return render
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
