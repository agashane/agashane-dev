import { default as Breadcrumb } from "./breadcrumb.astro";
import { default as BreadcrumbItem } from "./breadcrumb-item.astro";
import { default as BreadcrumbSeparator } from "./breadcrumb-separator.astro";
import { default as BreadcrumbCurrentLink } from "./breadcrumb-current-link.astro";
import { default as BreadcrumbList } from "./breadcrumb-list.astro";
import { default as BreadcrumbLink } from "./breadcrumb-link.astro";
import { default as BreadcrumbEllipsis } from "./breadcrumb-ellipsis.astro";

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbCurrentLink,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbEllipsis,

  //
  Breadcrumb as Root,
  BreadcrumbCurrentLink as CurrentLink,
  BreadcrumbItem as Item,
  BreadcrumbLink as Link,
  BreadcrumbSeparator as Separator,
  BreadcrumbList as List,
  BreadcrumbEllipsis as Ellipsis,
};
