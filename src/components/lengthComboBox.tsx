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
import { ChevronsUpDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function LengthComboBox({
  setLength,
  length,
  label,
}: {
  setLength: (value: number) => void;
  length: number;
  label: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium leading-none dark:text-gray-200">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[60px] justify-between dark:border-gray-600  dark:text-gray-200 "
          >
            {length}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 dark:border-gray-600">
          <Command>
            <CommandInput
              placeholder={t("selectSize")}
              className="h-9 dark:text-gray-200"
            />
            <CommandEmpty className="dark:text-gray-400">
              {t("noSizeFound")}
            </CommandEmpty>
            <CommandGroup className="dark:text-gray-200">
              {Array.from({ length: 8 }, (_, i) => i + 5).map((size) => (
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
                      size === length ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {size}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
