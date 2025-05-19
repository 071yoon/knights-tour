"use client";

import { Button } from "@/components/ui/button";
import LengthComboBox from "@/components/lengthComboBox";

interface BoardControlsProps {
  width: number;
  height: number;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  onReset: () => void;
  onSolve: () => void;
  isSolving: boolean;
}

export function BoardControls({
  width,
  height,
  setWidth,
  setHeight,
  onReset,
  onSolve,
  isSolving,
}: BoardControlsProps) {
  return (
    <div className="flex items-center gap-2 mb-8 justify-center">
      <LengthComboBox setLength={setWidth} length={width} label="Width:" />
      <span className="text-foreground">x</span>
      <LengthComboBox setLength={setHeight} length={height} label="Height:" />

      <Button onClick={onReset} variant="outline">
        Reset Tour
      </Button>

      <Button onClick={onSolve} disabled={isSolving} variant="outline">
        {isSolving ? "Solving..." : "Solve Tour"}
      </Button>
    </div>
  );
}
