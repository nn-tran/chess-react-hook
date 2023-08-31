import { useState, useEffect } from "react"
import {
  mailbox,
  mailbox64,
  empty64,
  data,
  startingPosition,
  startingPieceMap,
  startingBoard,
  startingColors,
  hashSeeds,
  extraSeeds,
  //Types
  Piece,
  PieceColor,
} from "./constants"

type BoardState = {
  board: (Piece | null)[]
  colors: Int8Array
  castle: boolean[]
  pieces: Int8Array
  promotion: number
  enPassant: number
  piecesMap: { [key: number]: number }
}

const enum MoveType {
  Quiet = 1,
  Capture = 2,
  EnPassantCapture = 3,
  LongCastle = 4,
  ShortCastle = 5,
  BLongCastle = 6,
  BShortCastle = 7,
  QuietPromote = 8,
  CapturePromote = 9,
}

//for memoization
const executedMoves = new Map<string, BoardState>()

export const useChessHook = () => {
  const [boardDisplay, setDisplay] = useState<(Piece | null)[]>(startingBoard)
  const [color, setColor] = useState<Int8Array>(startingColors)
  const [pieceStates, setPieceStates] = useState(startingPosition)
  const [pieceMapper, setPieceMapper] = useState(startingPieceMap)
  const [promotion, setPromotion] = useState(-1)
  const [enPassantSquare, setEnPassantSquare] = useState(-1)

  const [halfClock, setHalfClock] = useState(0)
  const [turn, setTurn] = useState(true)
  const [gameState, setGameState] = useState(0)
  const [legalMoves, setLegalMoves] = useState<Int8Array>(empty64)
  const [castleAvailable, setCastleAvailable] = useState([
    true,
    true,
    true,
    true,
  ])
  const [history, setHistory] = useState<number[][]>(() => {
    const hash = [0, 0]
    for (let i = 0; i < boardDisplay.length; ++i) {
      if (boardDisplay[i] !== null) {
        const j = data[boardDisplay[i] as Piece].hash
        hash[0] ^= hashSeeds[0][i][j]
        hash[1] ^= hashSeeds[1][i][j]
      }
    }
    return [hash]
  })

  //does not check if move is legal
  //returns the resulting position
  //type:
  //  <0: pawn double move, number is en passant square with negative sign
  //  1: regular move
  //  2: capture
  //  3: en passant capture
  //  4, 5, 6, 7: castling
  //  8+: promotion
  const executeMove = (
    pieceIdx: number,
    startSquare: number,
    finalSquare: number,
    type: number | MoveType,
    hash?: number[]
  ): BoardState => {
    const hashString = hash
      ? hash.join("")
      : hashMove(startSquare, finalSquare).join("")
    const executedMove = executedMoves.get(hashString)
    if (executedMove) {
      if (type >= 8) executedMove.promotion = finalSquare
      return executedMove
    }
    const board = boardDisplay.slice()
    const colors = color.slice()
    const castle = castleAvailable.slice()
    const pieces = pieceStates.slice()
    const piecesMap = { ...pieceMapper }
    const result = {
      board,
      colors,
      castle,
      pieces,
      piecesMap,
      promotion: -1,
      enPassant: -1,
    }

    if (board[finalSquare] !== null) {
      pieces[piecesMap[finalSquare]] = -1 //piece is captured.
    }

    piecesMap[finalSquare] = piecesMap[startSquare]
    piecesMap[startSquare] = 32
    pieces[pieceIdx] = finalSquare
    board[finalSquare] = board[startSquare]
    board[startSquare] = null
    colors[finalSquare] = colors[startSquare]
    colors[startSquare] = 0

    if (type < 0) result.enPassant = -type

    if (type < 3) {
      castle[0] = castle[0] && startSquare !== 56 && startSquare !== 60 //left white rook moved or white king moved
      castle[1] = castle[1] && startSquare !== 63 && startSquare !== 60 //right white rook moved or white king moved
      castle[2] = castle[2] && startSquare !== 0 && startSquare !== 4 //left black rook moved or black king moved
      castle[3] = castle[3] && startSquare !== 7 && startSquare !== 4 //right white rook moved or black king moved
    } else if (type === MoveType.EnPassantCapture) {
      const direction =
        finalSquare > startSquare
          ? finalSquare - startSquare - 8
          : finalSquare - startSquare + 8
      pieces[piecesMap[startSquare + direction]] = -1
      board[startSquare + direction] = null
      colors[startSquare + direction] = 0
    } else if (type < 8) {
      //castling, hard coded
      castle[type - 4] = false //disable the type of castling we just did
      switch (type) {
        case MoveType.LongCastle:
          castle[1] = false //disable the other way of castling (can't castle long after castling short, and vice versa)
          pieces[8] = 59
          board[59] = board[56]
          colors[59] = colors[56]
          board[56] = null
          colors[56] = 0 //these 5 lines are just moving the rook
          break
        case MoveType.ShortCastle:
          castle[0] = false
          pieces[15] = 61
          board[61] = board[63]
          colors[61] = colors[63]
          board[63] = null
          colors[63] = 0
          break
        case MoveType.BLongCastle:
          castle[3] = false
          pieces[24] = 3
          board[3] = board[0]
          colors[3] = colors[0]
          board[0] = null
          colors[0] = 0
          break
        case MoveType.BShortCastle:
          castle[2] = false
          pieces[31] = 5
          board[5] = board[7]
          colors[5] = colors[7]
          board[7] = null
          colors[7] = 0
          break
        default: //do nothing
      }
    } else {
      //promotion
      result.promotion = finalSquare
    }
    executedMoves.set(hashString, result)
    return result
  }

  //use 2 numbers to hash because Javascript Number stops at 53 bit
  const hashMove = (startSquare: number, finalSquare: number) => {
    const iterable = history[history.length - 1].slice()
    const board = boardDisplay
    if (board[finalSquare] !== null) {
      iterable[0] ^=
        hashSeeds[0][finalSquare][data[board[finalSquare] as Piece].hash] //remove captured piece if any
      iterable[1] ^=
        hashSeeds[1][finalSquare][data[board[finalSquare] as Piece].hash]
    }

    iterable[0] ^=
      hashSeeds[0][startSquare][data[board[startSquare] as Piece].hash] //moving
    iterable[1] ^=
      hashSeeds[1][startSquare][data[board[startSquare] as Piece].hash]
    iterable[0] ^=
      hashSeeds[0][finalSquare][data[board[startSquare] as Piece].hash]
    iterable[1] ^=
      hashSeeds[1][finalSquare][data[board[startSquare] as Piece].hash]
    for (let j = 0; j < castleAvailable.length; ++j) {
      iterable[0] ^= (castleAvailable[j] && extraSeeds[j]) as number
      iterable[1] ^= (castleAvailable[j] && extraSeeds[j]) as number
    }
    iterable[0] ^= extraSeeds[4]
    iterable[0] ^= extraSeeds[5] * enPassantSquare
    iterable[1] ^= extraSeeds[4]
    iterable[1] ^= extraSeeds[5] * enPassantSquare

    return iterable
  }

  const realizeMove = (
    pieceNumber: number,
    startSquare: number,
    finalSquare: number,
    type: number | MoveType
  ) => {
    const hashedMove = hashMove(startSquare, finalSquare)
    setHistory((history) => {
      const copy = history.slice()
      copy.push(hashedMove)
      return copy
    })
    return executeMove(pieceNumber, startSquare, finalSquare, type, hashedMove)
  }

  //generates pseudo-legal moves (moves that the pieces could make, but not necessarily results in a legal position)
  const generateMoves = (pieceIdx: number) => {
    const pieces = pieceStates
    const i = pieces[pieceIdx]
    let moves: number[][] = [] //array of [piecePosition, startSquare, finalSquare, moveType]
    if (i === -1) return moves //piece captured
    const board = boardDisplay
    const colors = color
    const enemy =
      colors[i] === PieceColor.White ? PieceColor.Black : PieceColor.White
    const pieceDisplay = board[i]
    const piece = data[pieceDisplay as Piece]
    if (piece.name) {
      //non-pawns
      for (const offset of piece.offset) {
        for (let n = i; ; ) {
          n = mailbox[mailbox64[n] + offset]
          if (n === -1) break /* outside board */
          if (colors[n] !== null) {
            if (colors[n] === enemy)
              moves.push([
                pieceIdx,
                i,
                n,
                MoveType.Capture,
              ]) /* capture from i to n */
            break
          }
          moves.push([
            pieceIdx,
            i,
            n,
            MoveType.Quiet,
          ]) /* quiet move from i to n */
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
            moves.push([pieceIdx, i, n, MoveType.CapturePromote])
          } else moves.push([pieceIdx, i, n, 2])
        } else if (n !== -1 && enPassantSquare === n) {
          //captures en passant
          moves.push([pieceIdx, i, n, 3])
        }
      }
      const n = mailbox[mailbox64[i] + (piece as { move: number }).move] //moving forward
      if (colors[n] === null) {
        if ((n <= 7 && n >= 0) || (n <= 63 && n >= 56)) {
          //pawns reaching last rank must promote
          moves.push([pieceIdx, i, n, MoveType.QuietPromote])
        } else {
          moves.push([pieceIdx, i, n, MoveType.Quiet])
          if (
            (n <= 23 && n >= 16 && colors[i] === PieceColor.Black) ||
            (n <= 47 && n >= 40 && colors[i] === PieceColor.White)
          ) {
            //if the piece could land on the 3rd/6th rank, it must have started from the origin
            const m = mailbox[mailbox64[n] + (piece as { move: number }).move]
            if (colors[m] === null) {
              moves.push([pieceIdx, i, m, -n]) //type carries information required for en passant
            }
          }
        }
      }
    }
    if (pieceDisplay === "\u2654") {
      //castling, hard coded checks
      if (
        castleAvailable[0] &&
        board[57] === null &&
        board[58] === null &&
        board[59] === null
      ) {
        moves.push([pieceIdx, i, i - 2, 4])
      }
      if (castleAvailable[1] && board[61] === null && board[62] === null) {
        moves.push([pieceIdx, i, i + 2, 5])
      }
    } else if (pieceDisplay === "\u265a") {
      if (
        castleAvailable[2] &&
        board[1] === null &&
        board[2] === null &&
        board[3] === null
      ) {
        moves.push([pieceIdx, i, i - 2, 6])
      }
      if (castleAvailable[3] && board[5] === null && board[6] === null) {
        moves.push([pieceIdx, i, i + 2, 7])
      }
    }
    return moves
  }

  //check if square is being attacked
  //0 is not attacked
  //1 is attacked by white
  //2 is attacked by black
  //3 is attacked by both
  const inDanger = (i: number, board: (string | null)[]) => {
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
  }

  //take moves generated by generateMoves and remove illegal ones
  const trimMoves = (moves: number[][]) => {
    return moves.filter((move) => {
      if (move[0] < 16 !== turn) return false
      switch (move[3]) {
        case 4:
          return (
            !(inDanger(60, boardDisplay) & 2) &&
            !(inDanger(59, boardDisplay) & 2) &&
            !(inDanger(58, boardDisplay) & 2)
          )
        case 5:
          return (
            !(inDanger(60, boardDisplay) & 2) &&
            !(inDanger(61, boardDisplay) & 2) &&
            !(inDanger(62, boardDisplay) & 2)
          )
        case 6:
          return (
            !(inDanger(4, boardDisplay) & 1) &&
            !(inDanger(3, boardDisplay) & 1) &&
            !(inDanger(2, boardDisplay) & 1)
          )
        case 7:
          return (
            !(inDanger(4, boardDisplay) & 1) &&
            !(inDanger(5, boardDisplay) & 1) &&
            !(inDanger(6, boardDisplay) & 1)
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
  }

  //get squares available to the piece at current square
  const showLegalSquares = (target: number) => {
    const p = pieceMapper[target]
    let legals = empty64.slice()
    if (p >= 0) {
      const moves = trimMoves(generateMoves(p))
      for (const move of moves) {
        legals[move[2]] = move[3]
      }
    }
    setLegalMoves(legals)
  }

  const handleMove = (start: number, end: number) => {
    const piece = pieceMapper[start]
    const position = realizeMove(piece, start, end, legalMoves[end]) //move from selected to current square
    setHalfClock((halfClock) =>
      position.board[end] === "\u2659" || position.board[end] === "\u265f"
        ? 0
        : halfClock + 1
    )
    setDisplay(position.board)
    setColor(position.colors)
    setPieceStates(position.pieces)
    setPieceMapper(position.piecesMap)
    setCastleAvailable(position.castle)
    setEnPassantSquare(position.enPassant)
    setPromotion(position.promotion)
    setLegalMoves(empty64.slice())
    setTurn(!turn)
  }

  const handlePromote = (piece: Piece) => {
    boardDisplay[promotion] = piece
    setDisplay(boardDisplay.slice())
    setPromotion(-1)
    executedMoves.clear()
  }

  const checkEndGame: 0 | 1 | 2 | 3 = (() => {
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
  })()

  useEffect(() => setGameState(checkEndGame), [checkEndGame])

  return {
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
  }
}
