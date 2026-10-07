import { default as Card } from "./card.astro";
import { default as CardHeader } from "./card-header.astro";
import { default as CardBody } from "./card-body.astro";
import { default as CardFooter } from "./card-footer.astro";
import { default as CardTitle } from "./card-title.astro";
import { default as CardDescription } from "./card-description.astro";
import { card, type CardVariants } from "./card.recipe.ts";

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  card,
  type CardVariants,

  //
  Card as Root,
  CardHeader as Header,
  CardBody as Body,
  CardFooter as Footer,
  CardTitle as Title,
  CardDescription as Description,
};
