"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/language-context";
import { Swords } from "lucide-react";

export function HowToPlayDialog() {
  const { t } = useLanguage();
  const steps = t("howToPlaySteps") as unknown as string[];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 gap-2 items-center"
        >
          <Swords className="h-5 w-5" />
          {t("howToPlayButton")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-popover text-popover-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("howToPlayTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            {steps.map((step: string, index: number) => (
              <li key={index} className="text-sm">
                {step}
              </li>
            ))}
          </ol>
          <DialogDescription className="text-sm !mt-4 !text-muted-foreground">
            {t("howToPlayTip")}
          </DialogDescription>
        </div>
        <div className="flex justify-end mt-6">
          <DialogTrigger asChild>
            <Button variant="outline">{t("gotIt")}</Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
}
