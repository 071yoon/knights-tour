type Position = {
  row: number;
  col: number;
};

export const getPossibleMoves = (row: number, col: number, width: number, height: number): Position[] => {
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

export const findSolution = (
  startRow: number,
  startCol: number,
  width: number,
  height: number,
  visitedCells: { [key: string]: number }
): Position[] | null => {
  const visited = new Set<string>();
  const path: (Position | null)[] = [];
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

      const moves = getPossibleMoves(row, col, width, height).filter(
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
      return path.filter((p): p is Position => p !== null);
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
      accessibility[r][c] = getPossibleMoves(r, c, width, height).length;
    }
  }

  const getAccessScore = (row: number, col: number, visited: Set<string>) => {
    const moves = getPossibleMoves(row, col, width, height);
    let score = 0;

    for (const move of moves) {
      if (!visited.has(`${move.row},${move.col}`)) {
        const subMoves = getPossibleMoves(move.row, move.col, width, height);
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

    const moves = getPossibleMoves(row, col, width, height)
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
        return path.filter((p): p is Position => p !== null);
      }
    }
  }

  // If corner didn't work, try the specified position
  if (solveFromScratch(startRow, startCol, 1)) {
    return path.filter((p): p is Position => p !== null);
  }

  return null;
}; 