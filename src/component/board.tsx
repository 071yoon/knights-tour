"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { PageTitle } from "@/components/page-title";
import { BoardControls } from "@/components/board-controls";
import { NoSolutionDialog } from "@/components/no-solution-dialog";
import { findSolution, getPossibleMoves } from "@/lib/knights-tour";
import { ChessPiece } from "@/components/chess-piece";

interface KnightPosition {
  row: number | null;
  col: number | null;
}

export default function Board() {
  const calculateCellSize = (boardWidth: number, boardHeight: number) => {
    const maxBoardWidth = window.innerWidth * 0.8;
    const maxBoardHeight = window.innerHeight * 0.6;

    const cellByWidth = Math.floor(maxBoardWidth / boardWidth);
    const cellByHeight = Math.floor(maxBoardHeight / boardHeight);

    return Math.max(Math.min(cellByWidth, cellByHeight), 30);
  };

  const [width, setWidth] = useState(5);
  const [height, setHeight] = useState(5);
  const [cellSize, setCellSize] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [knightPosition, setKnightPosition] = useState<KnightPosition>({
    row: null,
    col: null,
  });
  const [moveCount, setMoveCount] = useState(0);
  const [visitedCells, setVisitedCells] = useState<{ [key: string]: number }>(
    {}
  );
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<{ row: number; col: number }[]>([]);
  const [showNoSolutionDialog, setShowNoSolutionDialog] = useState(false);
  const [latestMove, setLatestMove] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Initialize cell size on client-side only
  useEffect(() => {
    setCellSize(calculateCellSize(width, height));
    setIsLoading(false);
  }, []);

  // Update cell size on window resize
  useEffect(() => {
    const updateCellSize = () => {
      setCellSize(calculateCellSize(width, height));
    };

    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, [width, height]);

  // Update cell size when board dimensions change
  useEffect(() => {
    setCellSize(calculateCellSize(width, height));
  }, [width, height]);

  const handleReset = () => {
    setKnightPosition({ row: null, col: null });
    setVisitedCells({});
    setMoveCount(0);
    setIsSolving(false);
    setSolution([]);
  };

  const solveTour = () => {
    let startRow: number;
    let startCol: number;
    let shouldKeepExistingMoves = false;

    if (knightPosition.row !== null && knightPosition.col !== null) {
      startRow = knightPosition.row;
      startCol = knightPosition.col;
      shouldKeepExistingMoves = true;
    } else {
      startRow = 0;
      startCol = 0;
      shouldKeepExistingMoves = false;
    }

    const solution = findSolution(
      startRow,
      startCol,
      width,
      height,
      visitedCells
    );
    if (!solution) {
      setShowNoSolutionDialog(true);
      return;
    }

    if (!shouldKeepExistingMoves) {
      setKnightPosition({ row: startRow, col: startCol });
      setVisitedCells({});
      setMoveCount(0);
    }

    const finalSolution = shouldKeepExistingMoves
      ? solution.filter((pos, index) => {
          const key = `${pos.row},${pos.col}`;
          return !visitedCells[key] || visitedCells[key] > index + 1;
        })
      : solution;

    setIsSolving(true);
    setSolution(finalSolution);
  };

  useEffect(() => {
    if (!isSolving || solution.length === 0) return;

    const startingMoveCount = moveCount;
    const makeMove = (moveIndex: number) => {
      const move = solution[moveIndex];
      setKnightPosition({ row: move.row, col: move.col });
      setVisitedCells((prev) => ({
        ...prev,
        [`${move.row},${move.col}`]: startingMoveCount + moveIndex + 1,
      }));
      setMoveCount(startingMoveCount + moveIndex + 1);
      setLatestMove(move);
    };

    makeMove(0);
    let currentMove = 1;

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

      makeMove(currentMove);
      currentMove++;
    }, 1000);

    return () => clearInterval(interval);
  }, [isSolving, solution]);

  const handleClick = (row: number, col: number) => {
    if (isSolving) return;

    const cellKey = `${row},${col}`;

    if (row === knightPosition.row && col === knightPosition.col) {
      const previousMoves = Object.entries(visitedCells).sort(
        (a, b) => a[1] - b[1]
      );

      if (previousMoves.length <= 1) {
        setKnightPosition({ row: null, col: null });
        setVisitedCells({});
        setMoveCount(0);
        setLatestMove(null);
        return;
      }

      const previousMove = previousMoves[previousMoves.length - 2];
      const [prevKey] = previousMove;
      const [prevRow, prevCol] = prevKey.split(",").map(Number);

      const newVisitedCells = { ...visitedCells };
      delete newVisitedCells[cellKey];

      setKnightPosition({ row: prevRow, col: prevCol });
      setVisitedCells(newVisitedCells);
      setMoveCount(moveCount - 1);
      setLatestMove({ row: prevRow, col: prevCol });
      return;
    }

    if (visitedCells[cellKey]) {
      return;
    }

    if (knightPosition.row === null || knightPosition.col === null) {
      setKnightPosition({ row, col });
      setVisitedCells({ [`${row},${col}`]: moveCount + 1 });
      setMoveCount(1);
      setLatestMove({ row, col });
      return;
    }

    const possibleMoves = getPossibleMoves(
      knightPosition.row,
      knightPosition.col,
      width,
      height
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
      setLatestMove({ row, col });

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
      ? getPossibleMoves(knightPosition.row, knightPosition.col, width, height)
      : [];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <PageTitle />
        <BoardControls
          width={width}
          height={height}
          setWidth={setWidth}
          setHeight={setHeight}
          onReset={handleReset}
          onSolve={solveTour}
          isSolving={isSolving}
        />
        <div className="flex flex-col items-center min-h-[50vh] justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
          ) : (
            <div
              className="grid gap-[1px] bg-gray-300 dark:bg-gray-500"
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
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                    }}
                    className={`flex items-center justify-center ${
                      moveNumber || isSolving ? "" : "cursor-pointer"
                    } ${
                      isPossibleMove && !moveNumber && !isSolving
                        ? "bg-emerald-200 dark:bg-emerald-700"
                        : moveNumber
                        ? "bg-slate-100 dark:bg-slate-700"
                        : "bg-white dark:bg-slate-800"
                    }`}
                  >
                    {row === knightPosition.row &&
                    col === knightPosition.col ? (
                      <ChessPiece
                        moveNumber={moveNumber}
                        isLatestMove={
                          !!(
                            latestMove &&
                            latestMove.row === row &&
                            latestMove.col === col
                          )
                        }
                        cellSize={cellSize}
                      />
                    ) : (
                      moveNumber && (
                        <ChessPiece
                          moveNumber={moveNumber}
                          isLatestMove={
                            !!(
                              latestMove &&
                              latestMove.row === row &&
                              latestMove.col === col
                            )
                          }
                          cellSize={cellSize}
                        />
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <NoSolutionDialog
        open={showNoSolutionDialog}
        onOpenChange={setShowNoSolutionDialog}
      />
    </div>
  );
}
