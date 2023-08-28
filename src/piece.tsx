export const Piece = (props: { display: string | null }) => {
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