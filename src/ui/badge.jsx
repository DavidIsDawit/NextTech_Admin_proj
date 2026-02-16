import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils"

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
                outline: "text-foreground",
                success: "border-transparent bg-green-100 text-green-700",
                error: "border-transparent bg-red-100 text-red-700",
                warning: "border-transparent bg-yellow-100 text-yellow-700",
                // Category variants
                construction: "border-transparent bg-blue-50 text-blue-600",
                consulting: "border-transparent bg-green-50 text-green-600",
                infrastructure: "border-transparent bg-gray-50 text-gray-600",
                design: "border-transparent bg-purple-50 text-purple-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
