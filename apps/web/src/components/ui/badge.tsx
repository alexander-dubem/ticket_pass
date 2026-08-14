import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-white/12 bg-white/[0.03]",
        success:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
        cyan:
          "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
        fuchsia:
          "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300",
        brand:
          "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
        gradient:
          "border-transparent bg-gradient-to-r from-pink-500 to-violet-500 text-white",
        gold:
          "border-amber-400/25 bg-amber-400/10 text-amber-300",
        pink:
          "border-pink-500/25 bg-pink-500/10 text-pink-300",
        violet:
          "border-violet-500/25 bg-violet-500/10 text-violet-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
