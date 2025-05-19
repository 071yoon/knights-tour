"use client";

import { Button } from "@/components/ui/button";
import LengthComboBox from "@/components/lengthComboBox";
import { useLanguage } from "@/lib/i18n/language-context";

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
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 mb-8 justify-center">
      <LengthComboBox setLength={setWidth} length={width} label={t("width")} />
      <span className="text-foreground">{t("multiplySymbol")}</span>
      <LengthComboBox
        setLength={setHeight}
        length={height}
        label={t("height")}
      />

      <Button onClick={onReset} variant="outline">
        {t("resetTour")}
      </Button>

      <Button onClick={onSolve} disabled={isSolving} variant="outline">
        {isSolving ? t("solving") : t("solveTour")}
      </Button>
    </div>
  );
}
