interface ChessPieceProps {
  moveNumber: number;
  isLatestMove: boolean;
  cellSize: number;
}

export function ChessPiece({
  moveNumber,
  isLatestMove,
  cellSize,
}: ChessPieceProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-lg ${
        isLatestMove
          ? "bg-yellow-300 text-yellow-950 dark:bg-yellow-400 dark:text-yellow-950"
          : "bg-blue-300 text-blue-950 dark:bg-blue-400 dark:text-blue-950"
      }`}
      style={{
        width: `${Math.floor(cellSize * 0.7)}px`,
        height: `${Math.floor(cellSize * 0.7)}px`,
      }}
    >
      {moveNumber}
    </div>
  );
}
