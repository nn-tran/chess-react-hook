import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const mailbox = [
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
];

const mailbox64 = [
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98
];

const data = {
    '\u2659':{ offset: {capture: [ -9, -11 ], move: -10, enPassant: [-1,1]}}, /* PAWN */
    '\u2658':{ slide: false, offset: [ -21, -19,-12, -8, 8, 12, 19, 21 ], /* KNIGHT */ },
	'\u2657':{ slide: true,  offset: [ -11,  -9,  9, 11 ], /* BISHOP */ },
	'\u2656':{ slide: true,  offset: [ -10,  -1,  1, 10 ], /* ROOK */ },
	'\u2655':{ slide: true,  offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ], /* QUEEN */ },
	'\u2654':{ slide: false, offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ],  /* KING */ },

    //black pieces
    '\u265f':{ offset: {capture: [ 9, 11 ], move: 10, enPassant: [-1,1]}}, /* PAWN */
    '\u265e':{ slide: false, offset: [ -21, -19,-12, -8, 8, 12, 19, 21 ], /* KNIGHT */},
    '\u265d':{ slide: true,  offset: [ -11,  -9,  9, 11 ], /* BISHOP */},
    '\u265c':{ slide: true,  offset: [ -10,  -1,  1, 10 ], /* ROOK */},
    '\u265b':{ slide: true,  offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ], /* QUEEN */},
    '\u265a':{ slide: false, offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ]  /* KING */},
};

function Square(props) {
  return (
    <button
      className = {(props.idX + props.idY ) %2 === 0 ? "square" : "squareBlack"}
      onClick = {props.onClick}
      style={{backgroundColor: props.color}}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(64).fill(null),
      colors: Array(64).fill(null),
      //generate move per piece requires tracking pieces
      pieces: [48, 49, 50, 51, 52, 53, 54, 55,
               56, 57, 58, 59, 60, 61, 62, 63,//white
                8,  9, 10, 11, 12, 13, 14, 15,
                0,  1,  2,  3,  4,  5,  6,  7],//black

      legals: Array(64).fill(0),
      kingSafe: Array(64).fill(0),//0: neither safe, 1: white king safe, 2: black king safe, 3: both kings safe
      canCastle: Array(4).fill(1),//white-long, white-short, black-long, black-short
      enPassant: -1,
      selected: -1,
      bNext: true,
    };

    const board = this.state.squares;
    //white pieces
    board[63] = '\u2656';
    board[62] = '\u2658';
    board[61] = '\u2657';
    board[60] = '\u2654';
    board[59] = '\u2655';
    board[58] = '\u2657';
    board[57] = '\u2658';
    board[56] = '\u2656';
    for (let i = 0; i < 8; ++i){
      board[i+48] = '\u2659';
      this.state.colors[i+48] = 1;
      this.state.colors[i+56] = 1;
    }
    //black pieces
    board[0] = '\u265c';
    board[1] = '\u265e';
    board[2] = '\u265d';
    board[3] = '\u265b';
    board[4] = '\u265a';
    board[5] = '\u265d';
    board[6] = '\u265e';
    board[7] = '\u265c';
    for (let i = 0; i < 8; ++i){
      board[i+8] = '\u265f';
      this.state.colors[i+8] = 0;
      this.state.colors[i] = 0;
    }
  }

  moveLegal(move){//move is [start, final, type]
    const old = this.state.board.slice();
    this.executeMove(move);
    if ((this.state.kingSafe[this.state.pieces[12]] & 1)//white king safe
      &&(this.state.kingSafe[this.state.pieces[28]] & 2)){//black king safe
        return;
      }
    this.setState({
      squares: old
    });
  }

  generateDeathMap(){//king safety map
    const kingSafe = Array(64).fill(0);
    const bMoves = [];
    const wMoves = [];
    for (let j = 0; j < 16; ++j){
      wMoves.concat(this.generateMoves(this.state.pieces[j]));
    }
    wMoves.forEach((element) => {//an element is a move, i.e. [start, final, type]
      kingSafe[element[1]] |= 2;//all white-accessible squares are dangerous for the black king
    });
    for (let j = 16; j < 32; ++j){
      bMoves.concat(this.generateMoves(this.state.pieces[j]));
    }
    bMoves.forEach((element) => {
      kingSafe[element[1]] |= 1;
    });
    this.setState({kingSafe: kingSafe});
  }

  switchPlayer(){
    this.setState({bNext:!this.state.bNext});
  }

  updateLegals(i){
    const p = this.state.pieces.indexOf(i);
    let legals = Array(64).fill(0);
    if (p>=0) {
      const moves = this.generateMoves(p);
      moves.forEach((element) => {
        legals[element[2]] = element[3];
      });
    }
    this.setState({legals: legals});
  }

  castle(direction){
    switch(direction){
      case 0:
        this.executeMove(12,60,58, 0);//0-0-0
        this.executeMove( 8,56,59, 0);
        break;
      case 1:
        this.executeMove(12,60,62, 0);//0-0
        this.executeMove(15,63,61, 0);
        break;
      case 2:
        this.executeMove(28, 4, 2, 0);//...0-0-0
        this.executeMove(24, 0, 3, 0);
        break;
      case 3:
        this.executeMove(28, 4, 6, 0);//...0-0
        this.executeMove(31, 7, 5, 0);
        break;
      default:
        throw 'castle bug';
    }
  }

  executeMove(p, start, final, type){//does not check if move is legal
    const board = this.state.squares.slice();
    const colors = this.state.colors;
    const castle = this.state.canCastle.slice();
    const pieces = this.state.pieces.slice();

    if (board[final] !== null){
      pieces[this.state.pieces.indexOf(final)] = -1;//piece is captured.
    }

    pieces[p] = final;
    board[final] = board[start];
    board[start] = null;
    colors[final] = colors[start];
    colors[start] = null;
    if (type < 0) this.setState({enPassant: -type});
    else this.setState({enPassant: -1});
    if (type < 3){
      castle[0] &= (start !== 56) && (start !== 60);//left white rook moved or white king moved
      castle[1] &= (start !== 63) && (start !== 60);//right white rook moved or white king moved
      castle[2] &= (start !==  0) && (start !==  4);//left black rook moved or black king moved
      castle[3] &= (start !==  7) && (start !==  4);//right white rook moved or black king moved

    } else {//en passant capture
      const direction = (final - start) > 0 ? (final - start - 8) : (final - start + 8);
      pieces[this.state.pieces.indexOf(start + direction)] = -1;
      board[start + direction] = null;
      colors[start + direction] = null;
    }
    this.setState({
      squares: board,
      colors: colors,
      pieces: pieces,
      canCastle: castle,
    });
  }

  generateMoves(p){
    const board = this.state.squares;
    const colors = this.state.colors;
    const enemy = this.state.bNext? 0 : 1;
    const i = this.state.pieces[p];
    let moves = [];
    if (colors[i] !== enemy && board[i] !== null){
      const pieceID = board[i];
      const piece = data[pieceID];
      if (pieceID !== '\u2659' && pieceID !== '\u265f'){//non-pawns
        piece.offset.forEach((element, index) => {
          for (let n = i;;){
            n = mailbox[mailbox64[n] + element];
            if (n === -1) break; /* outside board */
            if (colors[n] !== null) {
              if (colors[n] === enemy)
                moves.push([p, i, n, 2]); /* capture from i to n */
              break;
            }
            moves.push([p, i, n, 1]); /* quiet move from i to n */
            if (!piece.slide) break; /* next direction */
          }
        });
      } else {//pawns have custom behaviour
        piece.offset.capture.forEach((element, index) => {//capturing diagonally forward
          let n = i;
          n = mailbox[mailbox64[n] + element];
          if (n !== -1 && colors[n] === enemy) moves.push([p, i, n, 2]);
          else if (this.state.enPassant === n) {//captures en passant
            moves.push([p, i, n, 3]);
          }
        });
        let n = mailbox[mailbox64[i] + piece.offset.move];//moving forward
        if (colors[n] === null){
          moves.push([p, i, n, 1]);
          if ( (n <= 23 && n >= 16 && colors[i] === 0)
            || (n <= 47 && n >= 40 && colors[i] === 1))
          {//if the piece could land on the 3rd/6th rank, it must have started from the origin
            let m = mailbox[mailbox64[n] + piece.offset.move];
            if (colors[m] === null) {
              moves.push([p, i, m, -n]);//type carries information required for en passant
            }
          }
        }
      }
    }
    return moves;
  }

  handleClick(i){
    const squares = this.state.squares.slice();
    const selected = this.state.selected;
    if (selected === -1 //haven't clicked
       || selected === i //clicked the same square
       || squares[selected] === null //clicked an empty square
       || this.state.legals[i] === 0 //clicked an illegal square
       ) {
      this.updateLegals(i);
      this.setState({selected: i});
    } else {
      const p = this.state.pieces.indexOf(selected);
      this.executeMove(p, selected, i, this.state.legals[i]);
      this.switchPlayer();
      this.setState({legals: Array(64).fill(0)});
    }
  }

  renderSquare(i) {
    return (
    <Square
      idX={i%8}
      idY={i>>3}
      selected={(this.state.selected===i)? true : false}
      value={this.state.squares[i]}
      color={this.state.legals[i] === 0 ? "" : "yellow"}
      onClick={() => this.handleClick(i)}
    />
    );
  }

  render() {
    const status = 'Next player: ' + (this.state.bNext ? 'White' : 'Black')
      + '\nSelected: ' + this.state.selected;
    let counter = 0;
    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
        <div className="board-row">
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
          {this.renderSquare(counter++)}
        </div>
      </div>

    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
