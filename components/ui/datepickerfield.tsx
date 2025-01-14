import * as React from "react";
import { cn } from "@/lib/utils";

const DatePickerField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, onChange, ...props }, ref) => {
  const isValidDate = React.useCallback(
    (day: number, month: number, year: number): boolean => {
      if (month < 1 || month > 12) return false;

      const currentYear = new Date().getFullYear();
      if (year < currentYear) return false;

      const daysInMonth = new Date(year, month, 0).getDate();
      return day > 0 && day <= daysInMonth;
    },
    []
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[\d]/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.replace(/\./g, "");
      const newValue = value.slice(0, -1);

      let formattedValue = "";
      if (newValue.length >= 4) {
        formattedValue = `${newValue.slice(0, 2)}.${newValue.slice(
          2,
          4
        )}.${newValue.slice(4)}`;
      } else if (newValue.length >= 2) {
        formattedValue = `${newValue.slice(0, 2)}.${newValue.slice(2)}`;
      } else {
        formattedValue = newValue;
      }

      input.value = formattedValue;
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) return;

    // Daha sıkı gün validasyonu
    if (value.length >= 2) {
      const day = parseInt(value.substring(0, 2));
      if (day > 31) value = "31" + value.substring(2);
      if (day < 1) value = "01" + value.substring(2);
    }

    // Daha sıkı ay validasyonu
    if (value.length >= 4) {
      const month = parseInt(value.substring(2, 4));
      if (month > 12) value = value.substring(0, 2) + "12" + value.substring(4);
      if (month < 1) value = value.substring(0, 2) + "01" + value.substring(4);
    }

    // Yıl kontrolü - 4 rakam girildiğinde
    if (value.length >= 8) {
      const year = parseInt(value.substring(4, 8));
      if (year > 2025) {
        value = value.substring(0, 4) + "2025";
      }
      if (year < 1925) value = value.substring(0, 4) + "1925";
    }

    if (value.length === 9) {
      const day = parseInt(value.substring(0, 2));
      const month = parseInt(value.substring(2, 4));
      const year = parseInt(value.substring(4, 8));

      if (!isValidDate(day, month, year)) {
        return;
      }
    }

    if (value.length >= 2)
      value = value.substring(0, 2) + "." + value.substring(2);
    if (value.length >= 5)
      value = value.substring(0, 5) + "." + value.substring(5);

    e.target.value = value;
    onChange?.(e);
  };

  return (
    <input
      type="text"
      maxLength={10}
      onKeyUp={handleKeyPress}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onChange={handleDateInput}
      ref={ref}
      {...props}
    />
  );
});
DatePickerField.displayName = "DatePickerField";

export { DatePickerField };
