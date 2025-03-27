import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const headingVariants = cva("font-bold tracking-tight text-foreground", {
  variants: {
    variant: {
      h1: "text-4xl md:text-5xl",
      h2: "text-3xl md:text-4xl",
      h3: "text-2xl md:text-3xl",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
  },
  defaultVariants: {
    variant: "h1",
  },
});

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Component =
      as || (variant as "h1" | "h2" | "h3" | "h4" | "h5" | "h6") || "h1";
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

const paragraphVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "leading-7",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(paragraphVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
Paragraph.displayName = "Paragraph";

export { Heading, Paragraph };
