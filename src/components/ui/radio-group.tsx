import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-3", className)}
        role="radiogroup"
        aria-orientation="vertical"
        {...props}
      />
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string
  checked?: boolean
  onChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ className, value, checked, onChange, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 cursor-pointer", className)}
        onClick={() => !disabled && onChange?.(value)}
        role="radio"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onChange?.(value)
          }
        }}
        {...props}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            checked
              ? "border-blue-600 bg-blue-600"
              : "border-slate-300 bg-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {checked && (
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </div>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
