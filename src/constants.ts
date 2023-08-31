
//mailbox from https://www.chessprogramming.org/10x12_Board
export const mailbox = new Int8Array([
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
  -1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
  -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
  -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
  -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
  -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
  -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
  -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
])

export const mailbox64 = new Int8Array([
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
])

export type Piece = keyof typeof data;

export const data = {
  '\u2659':{ color: 1, hash: 0, name:  '', slide: false, offset: [ -9, -11 ], move: -10}, /* PAWN */
  '\u2658':{ color: 1, hash: 1, name: 'N', slide: false, offset: [ -21, -19,-12, -8, 8, 12, 19, 21 ], /* KNIGHT */ },
  '\u2657':{ color: 1, hash: 2, name: 'B', slide: true,  offset: [ -11,  -9,  9, 11 ], /* BISHOP */ },
  '\u2656':{ color: 1, hash: 3, name: 'R', slide: true,  offset: [ -10,  -1,  1, 10 ], /* ROOK */ },
  '\u2655':{ color: 1, hash: 4, name: 'Q', slide: true,  offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ], /* QUEEN */ },
  '\u2654':{ color: 1, hash: 5, name: 'K', slide: false, offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ],  /* KING */ },
  //black pieces
  '\u265f':{ color: 2, hash: 6, name:  '', slide: false, offset: [ 9, 11 ], move: 10}, /* PAWN */
  '\u265e':{ color: 2, hash: 7, name: 'N', slide: false, offset: [ -21, -19,-12, -8, 8, 12, 19, 21 ], /* KNIGHT */},
  '\u265d':{ color: 2, hash: 8, name: 'B', slide: true,  offset: [ -11,  -9,  9, 11 ], /* BISHOP */},
  '\u265c':{ color: 2, hash: 9, name: 'R', slide: true,  offset: [ -10,  -1,  1, 10 ], /* ROOK */},
  '\u265b':{ color: 2, hash: 10,name: 'Q', slide: true,  offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ], /* QUEEN */},
  '\u265a':{ color: 2, hash: 11,name: 'K', slide: false, offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ]  /* KING */},
}

export const startingPosition = new Int8Array([
  48, 49, 50, 51, 52, 53, 54, 55,
  56, 57, 58, 59, 60, 61, 62, 63,//white
  8,  9, 10, 11, 12, 13, 14, 15,
  0,  1,  2,  3,  4,  5,  6,  7,//black,
  -1//sentinel
])

export const startingPieceMap: {[key: number]: number} = {
  0: 24, 1: 25, 2: 26, 3: 27, 4: 28, 5: 29, 6: 30, 7: 31, 8: 16, 9: 17, 10: 18, 11: 19, 12: 20, 13: 21, 14: 22, 15: 23, 
  48: 0, 49: 1, 50: 2, 51: 3, 52: 4, 53: 5, 54: 6, 55: 7, 56: 8, 57: 9, 58: 10, 59: 11, 60: 12, 61: 13, 62: 14, 63: 15,
  64: 32//sentinel
}

export const startingBoard: (Piece | null)[] = Array(64).fill(null)
startingBoard[63] = "\u2656"
startingBoard[62] = "\u2658"
startingBoard[61] = "\u2657"
startingBoard[60] = "\u2654"
startingBoard[59] = "\u2655"
startingBoard[58] = "\u2657"
startingBoard[57] = "\u2658"
startingBoard[56] = "\u2656"
startingBoard[55] = "\u2659"
startingBoard[54] = "\u2659"
startingBoard[53] = "\u2659"
startingBoard[52] = "\u2659"
startingBoard[51] = "\u2659"
startingBoard[50] = "\u2659"
startingBoard[49] = "\u2659"
startingBoard[48] = "\u2659"

startingBoard[0] = "\u265c"
startingBoard[1] = "\u265e"
startingBoard[2] = "\u265d"
startingBoard[3] = "\u265b"
startingBoard[4] = "\u265a"
startingBoard[5] = "\u265d"
startingBoard[6] = "\u265e"
startingBoard[7] = "\u265c"
startingBoard[8] = "\u265f"
startingBoard[9] = "\u265f"
startingBoard[10] = "\u265f"
startingBoard[11] = "\u265f"
startingBoard[12] = "\u265f"
startingBoard[13] = "\u265f"
startingBoard[14] = "\u265f"
startingBoard[15] = "\u265f"

export const enum PieceColor {
  White = 1,
  Black = 2,
}

export const startingColors = new Int8Array(64)
for (let i = 0; i < 8; ++i) {
  startingColors[i + 48] = PieceColor.White
  startingColors[i + 56] = PieceColor.White
  startingColors[i + 8] = PieceColor.Black
  startingColors[i] = PieceColor.Black
}

export const empty64 = new Int8Array(64)

//initialize a table of hashes for a modified Zobrist hashing
//https://www.chessprogramming.org/Zobrist_Hashing
//64x12 hash
const initRNGTable = () => {
  const table: number[][] = []
  for (let i = 0; i < 64; ++i) {
    table.push([])
    for (let j = 0; j < 12; ++j) {
      table[i].push(Math.floor(Math.random() * 2 ** 32))
    }
  }
  return table
}

export const hashSeeds = [initRNGTable(), initRNGTable()] //hashing table position for game draw check
export const extraSeeds = Array.from({ length: 6 }, () =>
  Math.floor(Math.random() * 2 ** 40)
) //for hashing other data
//seed 0-3 is for castling, seed 4 for turn player, seed 5 for en passant