import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-white/12 bg-white/[0.04] text-zinc-100 backdrop-blur shadow-sm hover:bg-white/10 hover:border-white/25 hover:-translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-white/10 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        glow:
          "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/45 hover:brightness-110 hover:-translate-y-px",
        gradient:
          "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/45 hover:brightness-110 hover:-translate-y-px",
        "gradient-cyan":
          "bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 text-white font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110 hover:-translate-y-px",
        "outline-glow":
          "border border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-100 backdrop-blur shadow-sm hover:bg-fuchsia-500/15 hover:border-fuchsia-400/50 hover:shadow-fuchsia-500/20",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
