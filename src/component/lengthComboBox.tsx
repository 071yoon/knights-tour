import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

export default function LengthComboBox({
  setLength,
  length,
  label,
}: {
  setLength: (length: number) => void;
  length: number;
  label: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[120px] justify-between"
        >
          {label} {length}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Enter board height..." />
          <CommandEmpty>No height found.</CommandEmpty>
          <CommandGroup>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
              <CommandItem
                key={size}
                value={size.toString()}
                onSelect={() => {
                  setLength(size);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    length === size ? "opacity-100" : "opacity-0"
                  )}
                />
                {size}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
