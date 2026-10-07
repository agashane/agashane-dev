import { cva, type RecipeVariantProps } from "styled-system/css";

export const heading = cva({
  base: {
    fontWeight: "bold",
    lineHeight: "1.25",
    margin: "0",
  },
  variants: {
    level: {
      h1: { fontSize: "4xl", fontWeight: "extrabold", lineHeight: "1" },
      h2: { fontSize: "3xl", fontWeight: "bold" },
      h3: { fontSize: "2xl", fontWeight: "bold" },
      h4: { fontSize: "xl", fontWeight: "semibold" },
      h5: { fontSize: "lg", fontWeight: "semibold" },
      h6: { fontSize: "md", fontWeight: "semibold" },
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

export type HeadingVariants = RecipeVariantProps<typeof heading>;
