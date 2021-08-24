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
      legals: Array(64).fill(0),
      canCastle: true,
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

  castle(i, side){

  }

  castle(direction){
    
  }

  generateMove(start, final, type){
    const board = this.state.squares.slice();
    const colors = this.state.colors;
    const enemy = this.state.bNext;

    if (type !== 2){
      board[final] = board[start];
      board[start] = null;
    } else {//en passant
      board[final] = board[start];
      board[start] = null;
      let direction = (mailbox64[start] - mailbox64[final]) % 9 == 0 ? -1 : 1;
      //no regular mailbox check because generateMoves already checked
      board[start + direction] = null;
    }

  }

  generateMoves(i){
    const board = this.state.squares;
    const colors = this.state.colors;
    const enemy = this.state.bNext;
    if (colors[i] !== enemy && board[i] !== null){
      let pieceID = board[i];
      let piece = data[pieceID];
      if (pieceID !== '\u2659' && pieceID !== '\u265f'){//non-pawns
        piece.offset.forEach(element => {
          for (let n = i;;){
            n = mailbox[mailbox64[n] + element];
            if (n === -1) break; /* outside board */
            if (colors[n] !== null) {
              if (colors[n] === enemy)
                this.generateMove(i, n, 1); /* capture from i to n */
              break;
            }
            this.generateMove(i, n, 0); /* quiet move from i to n */
            if (!piece.slide) break; /* next direction */
          }
        });

      } else {//pawns have custom behaviour
        piece.offset.capture.forEach((element, index) => {//capturing diagonally forward
          let n = i;
          n = mailbox[mailbox64[n] + element];
          if (n !== -1 && colors[n] === enemy) this.generateMove(i, n, 1);
          else if (this.state.enPassant === n) {
            this.generateMove(i, n, 2);
          }
        });
        let n = mailbox[mailbox64[i] + piece.offset.move];//moving forward
        if (colors[n] === null){
          this.generateMove(i,n,0);
          if ( (n <= 15 && n >= 8 && colors[i] === 1)
            || (n <= 55 && n >= 48 && colors[i] === 0))
          {//if the piece could land on the 3rd/6th rank, it must have started from the origin
            let m = mailbox[mailbox64[n] + piece.offset.move];
            if (colors[m] === null) {
              this.generateMove(i, m, 0);
              this.enPassant = n;
            }
          }
        }

      }
    }
  }

  handleClick(i){
    const squares = this.state.squares.slice();
    const selected = this.state.selected;
    if (selected === -1 || selected === i || squares[selected] === null) {
      this.setState({selected: i});
    } else {
      squares[i] = squares[selected];
      squares[selected] = null;
      this.setState({
        squares: squares,
        selected: -1,
        bNext: !this.state.bNext,
      });
    }
  }

  renderSquare(i) {
    return (
    <Square
      idX={i%8}
      idY={i>>3}
      selected={(this.state.selected==i)? true : false}
      value={this.state.squares[[i]]}
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
