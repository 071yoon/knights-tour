"use client";

import { useState, useEffect } from "react";
import LengthComboBox from "./lengthComboBox";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [cellSize, setCellSize] = useState(0); // Start with size 0
  const [isLoading, setIsLoading] = useState(true);
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
  const [showNoSolutionDialog, setShowNoSolutionDialog] = useState(false);
  const [latestMove, setLatestMove] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Initialize cell size on client-side only
  useEffect(() => {
    setCellSize(calculateCellSize(width, height));
    setIsLoading(false);
  }, []); // Run once on mount

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
    const path: ({ row: number; col: number } | null)[] = [];
    let existingMoveCount = 0;

    // Add all existing visited cells to the visited set and path
    Object.entries(visitedCells).forEach(([key, moveNumber]) => {
      visited.add(key);
      const [row, col] = key.split(",").map(Number);
      path[moveNumber - 1] = { row, col };
      existingMoveCount++;
    });

    // If we have player moves, we only need to find a path from the last move
    if (existingMoveCount > 0) {
      const solve = (row: number, col: number, moveCount: number): boolean => {
        // If we've completed the tour
        if (moveCount === width * height) {
          return true;
        }

        const moves = getPossibleMoves(row, col).filter(
          (move) => !visited.has(`${move.row},${move.col}`)
        );

        for (const move of moves) {
          visited.add(`${move.row},${move.col}`);
          path[moveCount] = move;

          if (solve(move.row, move.col, moveCount + 1)) {
            return true;
          }

          visited.delete(`${move.row},${move.col}`);
          path[moveCount] = null;
        }

        return false;
      };

      // Start from the last player move
      if (solve(startRow, startCol, existingMoveCount)) {
        return path.filter(
          (p): p is { row: number; col: number } => p !== null
        );
      }
      return null;
    }

    // For fresh start (no player moves), use the optimized algorithm
    const accessibility = Array(height)
      .fill(0)
      .map(() =>
        Array(width)
          .fill(0)
          .map(() => 0)
      );

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        accessibility[r][c] = getPossibleMoves(r, c).length;
      }
    }

    const getAccessScore = (row: number, col: number, visited: Set<string>) => {
      const moves = getPossibleMoves(row, col);
      let score = 0;

      for (const move of moves) {
        if (!visited.has(`${move.row},${move.col}`)) {
          const subMoves = getPossibleMoves(move.row, move.col);
          const unvisitedSubMoves = subMoves.filter(
            (m) => !visited.has(`${m.row},${m.col}`)
          ).length;
          score += unvisitedSubMoves;
        }
      }

      return score;
    };

    const isNearBorder = (row: number, col: number) => {
      return row <= 1 || row >= height - 2 || col <= 1 || col >= width - 2;
    };

    const solveFromScratch = (
      row: number,
      col: number,
      moveCount: number
    ): boolean => {
      const key = `${row},${col}`;

      if (visited.has(key)) {
        return false;
      }

      visited.add(key);
      path[moveCount - 1] = { row, col };

      if (moveCount === width * height) {
        return true;
      }

      const moves = getPossibleMoves(row, col)
        .filter((move) => !visited.has(`${move.row},${move.col}`))
        .map((move) => ({
          ...move,
          score: getAccessScore(move.row, move.col, visited),
          nearBorder: isNearBorder(move.row, move.col),
          baseAccess: accessibility[move.row][move.col],
        }))
        .sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score;
          if (moveCount < (width * height) / 2) {
            if (a.nearBorder !== b.nearBorder) return a.nearBorder ? -1 : 1;
          }
          return a.baseAccess - b.baseAccess;
        });

      for (const move of moves) {
        if (solveFromScratch(move.row, move.col, moveCount + 1)) {
          return true;
        }
      }

      visited.delete(key);
      path[moveCount - 1] = null;
      return false;
    };

    // Try corners first for fresh start
    const corners = [
      [0, 0],
      [0, width - 1],
      [height - 1, 0],
      [height - 1, width - 1],
    ];

    for (const [r, c] of corners) {
      if (r === startRow && c === startCol) {
        if (solveFromScratch(r, c, 1)) {
          return path.filter(
            (p): p is { row: number; col: number } => p !== null
          );
        }
      }
    }

    // If corner didn't work, try the specified position
    if (solveFromScratch(startRow, startCol, 1)) {
      return path.filter((p): p is { row: number; col: number } => p !== null);
    }

    return null;
  };

  const solveTour = () => {
    let startRow: number;
    let startCol: number;
    let shouldKeepExistingMoves = false;

    if (knightPosition.row !== null && knightPosition.col !== null) {
      // Continue from current position if knight is placed
      startRow = knightPosition.row;
      startCol = knightPosition.col;
      shouldKeepExistingMoves = true;
    } else {
      // Try from (0,0) if no knight is placed
      startRow = 0;
      startCol = 0;
      shouldKeepExistingMoves = false;
    }

    // Find solution
    const solution = findSolution(startRow, startCol);
    if (!solution) {
      setShowNoSolutionDialog(true);
      return;
    }

    // If we started from (0,0), now we can safely place the knight
    if (!shouldKeepExistingMoves) {
      setKnightPosition({ row: startRow, col: startCol });
      setVisitedCells({});
      setMoveCount(0);
    }

    // Filter solution to only include new moves if continuing from existing position
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

    // Make the first move immediately
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

    // Execute first move immediately
    makeMove(0);
    let currentMove = 1; // Start from second move

    // Set up interval for remaining moves
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
        setLatestMove(null);
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
      setLatestMove({ row: prevRow, col: prevCol });
      return;
    }

    if (visitedCells[cellKey]) {
      return; // Don't allow clicking already visited cells
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
      setLatestMove({ row, col });

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
    <div className="min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">
          Knight's Tour
        </h1>
        <div className="flex items-center gap-2 mb-8 justify-center">
          <LengthComboBox setLength={setWidth} length={width} label="Width:" />
          <span className="text-foreground">x</span>
          <LengthComboBox
            setLength={setHeight}
            length={height}
            label="Height:"
          />

          <Button
            onClick={() => {
              setKnightPosition({ row: null, col: null });
              setVisitedCells({});
              setMoveCount(0);
              setIsSolving(false);
              setSolution([]);
            }}
            variant="outline"
          >
            Reset Tour
          </Button>

          <Button onClick={solveTour} disabled={isSolving} variant="outline">
            {isSolving ? "Solving..." : "Solve Tour"}
          </Button>
        </div>
        <div className="flex flex-col items-center min-h-[50vh] justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
          ) : (
            <div
              className="grid gap-[1px] bg-gray-300 dark:bg-gray-600"
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
                        ? "bg-emerald-100 dark:bg-emerald-900/50"
                        : moveNumber
                        ? "bg-slate-100 dark:bg-gray-800"
                        : "bg-white dark:bg-gray-900"
                    }`}
                  >
                    {row === knightPosition.row &&
                    col === knightPosition.col ? (
                      <div
                        className={`rounded-full flex items-center justify-center text-slate-800 dark:text-gray-100 font-bold text-lg ${
                          latestMove &&
                          latestMove.row === row &&
                          latestMove.col === col
                            ? "bg-yellow-200 dark:bg-yellow-300/80"
                            : "bg-blue-200 dark:bg-blue-300/80"
                        }`}
                        style={{
                          width: `${Math.floor(cellSize * 0.7)}px`,
                          height: `${Math.floor(cellSize * 0.7)}px`,
                        }}
                      >
                        {moveNumber}
                      </div>
                    ) : (
                      moveNumber && (
                        <div
                          className={`rounded-full flex items-center justify-center text-slate-800 dark:text-gray-100 font-bold text-lg ${
                            latestMove &&
                            latestMove.row === row &&
                            latestMove.col === col
                              ? "bg-yellow-200 dark:bg-yellow-300/80"
                              : "bg-blue-200 dark:bg-blue-300/80"
                          }`}
                          style={{
                            width: `${Math.floor(cellSize * 0.7)}px`,
                            height: `${Math.floor(cellSize * 0.7)}px`,
                          }}
                        >
                          {moveNumber}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showNoSolutionDialog}
        onOpenChange={setShowNoSolutionDialog}
      >
        <DialogContent className="bg-popover text-popover-foreground">
          <DialogHeader>
            <DialogTitle>No Solution Found</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              There is no valid Knight's Tour solution from the current
              position.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowNoSolutionDialog(false)}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
