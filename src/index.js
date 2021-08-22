import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {

  return (
    <button
      className = {(props.idX + props.idY )%2 === 0 ? "square" : "squareBlack"}
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
        selected: -1,
        xNext: true,
      };
      //white pieces
      this.state.squares[63] = '\u2656';
      this.state.squares[62] = '\u2658';
      this.state.squares[61] = '\u2657';
      this.state.squares[60] = '\u2654';
      this.state.squares[59] = '\u2655';
      this.state.squares[58] = '\u2657';
      this.state.squares[57] = '\u2658';
      this.state.squares[56] = '\u2656';
      for (let i = 0; i < 8; ++i){
        this.state.squares[i+48] = '\u2659';
      }
      //black pieces
      this.state.squares[0] = '\u265c';
      this.state.squares[1] = '\u265e';
      this.state.squares[2] = '\u265d';
      this.state.squares[3] = '\u265b';
      this.state.squares[4] = '\u265a';
      this.state.squares[5] = '\u265d';
      this.state.squares[6] = '\u265e';
      this.state.squares[7] = '\u265c';
      for (let i = 0; i < 8; ++i){
        this.state.squares[i+8] = '\u265f';
      }
  }



  handleClick(i){
    const squares = this.state.squares.slice();
    const selected = this.state.selected;
    if (selected == -1 || selected == i || squares[selected] == null) {
      this.setState({selected: i});
    } else {
      squares[i] = squares[selected];
      squares[selected] = null;
      this.setState({
        squares: squares,
        selected: -1,
        xNext: !this.state.xNext,
      });
    }
  }

  renderSquare(i) {
    return (
    <Square
      idX={i%8}
      idY={i/8>>0}
      selected={(this.state.selected==i)? true : false}
      value={this.state.squares[[i]]}
      onClick={() => this.handleClick(i)}
    />
    );
  }

  render() {
    const status = 'Next player: ' + (this.state.xNext ? 'White' : 'Black')
      + '\nSelected: ' + this.state.selected;
    var counter = 0;
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
