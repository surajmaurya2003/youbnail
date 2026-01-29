import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-white border border-[rgba(239,68,68,0.3)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_15px_rgba(239,68,68,0.1)] hover:-translate-y-0.5 hover:border-[rgba(239,68,68,0.5)] font-semibold",
        destructive:
          "text-white border border-[rgba(239,68,68,0.3)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_15px_rgba(239,68,68,0.1)] hover:-translate-y-0.5 hover:border-[rgba(239,68,68,0.5)] font-semibold",
        outline:
          "border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:shadow-[var(--shadow-md),0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 font-semibold backdrop-blur-sm",
        secondary:
          "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] shadow-[var(--shadow-sm)] hover:bg-[rgba(239,68,68,0.1)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:shadow-[var(--shadow-md),0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 font-semibold backdrop-blur-sm",
        ghost: "hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] text-[var(--text-secondary)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
