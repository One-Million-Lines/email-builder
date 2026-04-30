// Aggregates and registers every default module pack.
import { moduleRegistry, type ModuleDefinition } from "./registry";
import { basicModules } from "./basic";
import { headerModules } from "./header";
import { menuModules } from "./menu";
import { contentModules } from "./content";
import { featureModules } from "./feature";
import { ctaModules } from "./cta";
import { ecommerceModules } from "./ecommerce";
import { transactionalModules } from "./transactional";
import { socialModules } from "./social";
import { footerModules } from "./footer";

export const defaultModules: ModuleDefinition[] = [
  ...basicModules,
  ...headerModules,
  ...menuModules,
  ...contentModules,
  ...featureModules,
  ...ctaModules,
  ...ecommerceModules,
  ...transactionalModules,
  ...socialModules,
  ...footerModules,
];

let registered = false;
export function registerDefaultModules() {
  if (registered) return;
  for (const d of defaultModules) moduleRegistry.register(d);
  registered = true;
}

export {
  basicModules,
  headerModules,
  menuModules,
  contentModules,
  featureModules,
  ctaModules,
  ecommerceModules,
  transactionalModules,
  socialModules,
  footerModules,
};
