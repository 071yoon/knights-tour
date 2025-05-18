"use client";

import { useState, useEffect } from "react";
import LengthComboBox from "./lengthComboBox";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function Board() {
  const [width, setWidth] = useState(5);
  const [height, setHeight] = useState(5);
  const [knightPosition, setKnightPosition] = useState<{
    row: number | null;
    col: number | null;
  }>({ row: null, col: null });
  const [moveCount, setMoveCount] = useState(0);
  const [visitedCells, setVisitedCells] = useState<{ [key: string]: number }>(
    {}
  );
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<{ row: number; col: number }[]>([]);

  const getPossibleMoves = (row: number, col: number) => {
    const moves = [
      { row: row - 2, col: col - 1 },
      { row: row - 2, col: col + 1 },
      { row: row - 1, col: col - 2 },
      { row: row - 1, col: col + 2 },
      { row: row + 1, col: col - 2 },
      { row: row + 1, col: col + 2 },
      { row: row + 2, col: col - 1 },
      { row: row + 2, col: col + 1 },
    ];

    return moves.filter(
      (move) =>
        move.row >= 0 && move.row < height && move.col >= 0 && move.col < width
    );
  };

  const findSolution = (startRow: number, startCol: number) => {
    const visited = new Set<string>();
    const path: { row: number; col: number }[] = [];

    const dfs = (row: number, col: number): boolean => {
      const key = `${row},${col}`;
      visited.add(key);
      path.push({ row, col });

      if (visited.size === width * height) {
        return true;
      }

      const moves = getPossibleMoves(row, col);
      for (const move of moves) {
        const moveKey = `${move.row},${move.col}`;
        if (!visited.has(moveKey)) {
          if (dfs(move.row, move.col)) {
            return true;
          }
        }
      }

      visited.delete(key);
      path.pop();
      return false;
    };

    if (dfs(startRow, startCol)) {
      return path;
    }
    return null;
  };

  const solveTour = () => {
    if (knightPosition.row === null || knightPosition.col === null) {
      alert("Please place the knight first!");
      return;
    }

    const solution = findSolution(knightPosition.row, knightPosition.col);
    if (!solution) {
      alert("No solution exists for this configuration!");
      return;
    }

    setIsSolving(true);
    setSolution(solution);
  };

  useEffect(() => {
    if (!isSolving || solution.length === 0) return;

    let currentMove = 0;
    const startingMoveCount = moveCount - 1; // Subtract 1 to account for current position
    const interval = setInterval(() => {
      if (currentMove >= solution.length) {
        setIsSolving(false);
        clearInterval(interval);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        return;
      }

      const move = solution[currentMove];
      setKnightPosition({ row: move.row, col: move.col });
      setVisitedCells((prev) => ({
        ...prev,
        [`${move.row},${move.col}`]: startingMoveCount + currentMove + 1,
      }));
      setMoveCount(startingMoveCount + currentMove + 1);
      currentMove++;
    }, 1000);

    return () => clearInterval(interval);
  }, [isSolving, solution]);

  const handleClick = (row: number, col: number) => {
    if (isSolving) return; // Prevent clicks while solving

    const cellKey = `${row},${col}`;

    // If clicking current knight position, undo the last move
    if (row === knightPosition.row && col === knightPosition.col) {
      const previousMoves = Object.entries(visitedCells).sort(
        (a, b) => a[1] - b[1]
      );

      if (previousMoves.length <= 1) {
        // If this is the first move, reset everything
        setKnightPosition({ row: null, col: null });
        setVisitedCells({});
        setMoveCount(0);
        return;
      }

      // Get the previous position
      const previousMove = previousMoves[previousMoves.length - 2];
      const [prevKey] = previousMove;
      const [prevRow, prevCol] = prevKey.split(",").map(Number);

      // Remove current position from visited cells
      const newVisitedCells = { ...visitedCells };
      delete newVisitedCells[cellKey];

      // Update state
      setKnightPosition({ row: prevRow, col: prevCol });
      setVisitedCells(newVisitedCells);
      setMoveCount(moveCount - 1);
      return;
    }

    if (visitedCells[cellKey]) {
      return; // Don't allow clicking already visited cells
    }

    if (knightPosition.row === null || knightPosition.col === null) {
      setKnightPosition({ row, col });
      setVisitedCells({ [`${row},${col}`]: moveCount + 1 });
      setMoveCount(1);
      return;
    }

    const possibleMoves = getPossibleMoves(
      knightPosition.row,
      knightPosition.col
    );
    const isValidMove = possibleMoves.some(
      (move) => move.row === row && move.col === col
    );
    if (isValidMove) {
      setKnightPosition({ row, col });
      const newVisitedCells = {
        ...visitedCells,
        [`${row},${col}`]: moveCount + 1,
      };
      setVisitedCells(newVisitedCells);
      setMoveCount(moveCount + 1);

      // Check if all cells are visited
      if (Object.keys(newVisitedCells).length === width * height) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const possibleMoves =
    knightPosition.row !== null && knightPosition.col !== null
      ? getPossibleMoves(knightPosition.row, knightPosition.col)
      : [];

  return (
    <>
      <div className="flex items-center gap-2 mb-4 justify-center">
        <LengthComboBox setLength={setWidth} length={width} label="Width:" />
        <span>x</span>
        <LengthComboBox setLength={setHeight} length={height} label="Height:" />

        <Button
          onClick={() => {
            setKnightPosition({ row: null, col: null });
            setVisitedCells({});
            setMoveCount(0);
            setIsSolving(false);
            setSolution([]);
          }}
        >
          Reset Tour
        </Button>

        <Button
          onClick={solveTour}
          disabled={isSolving || knightPosition.row === null}
        >
          {isSolving ? "Solving..." : "Solve Tour"}
        </Button>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: width * height }, (_, index) => {
            const row = Math.floor(index / width);
            const col = index % width;
            const isPossibleMove = possibleMoves.some(
              (move) => move.row === row && move.col === col
            );
            const cellKey = `${row},${col}`;
            const moveNumber = visitedCells[cellKey];

            return (
              <div
                key={index}
                onClick={() => handleClick(row, col)}
                className={`w-10 h-10 border border-gray-300 flex items-center justify-center ${
                  moveNumber || isSolving ? "" : "cursor-pointer"
                } ${
                  isPossibleMove && !moveNumber && !isSolving
                    ? "bg-green-200"
                    : moveNumber
                    ? "bg-blue-100"
                    : "bg-white"
                }`}
              >
                {row === knightPosition.row && col === knightPosition.col ? (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {moveNumber}
                  </div>
                ) : (
                  moveNumber && <span className="text-sm">{moveNumber}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
