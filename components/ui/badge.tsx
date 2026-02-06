import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-1.5 text-xs font-medium leading-normal transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]/70",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--accent-primary)] text-white",
        secondary: "border-transparent bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        destructive: "border-transparent bg-[var(--accent-primary)] text-white",
        outline: "text-[var(--text-primary)] border-[var(--border-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
