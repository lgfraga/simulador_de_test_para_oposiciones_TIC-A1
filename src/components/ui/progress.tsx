import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorVariant?: "default" | "success" | "warning" | "danger"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorVariant = "default", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    
    const indicatorClasses = {
      default: "bg-blue-600",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
    }

    return (
      <div
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-slate-200", className)}
        {...props}
      >
        <div
          className={`h-full ${indicatorClasses[indicatorVariant]} transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
