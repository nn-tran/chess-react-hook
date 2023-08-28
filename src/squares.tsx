import { Piece } from "./piece";

export const Square = (props: {
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

export const ReadOnlySquare = (props: { value: string }) => {
  return (
    <button
      className="square"
      style={{ backgroundColor: "#fff", fontSize: "12px" }}
    >
      {props.value}
    </button>
  )
}