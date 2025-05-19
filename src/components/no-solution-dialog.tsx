"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NoSolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoSolutionDialog({
  open,
  onOpenChange,
}: NoSolutionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle>No Solution Found</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            There is no valid Knight's Tour solution from the current position.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
