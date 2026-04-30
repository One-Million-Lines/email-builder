// Importing each template file triggers its self-registration into templateRegistry.
import "./weeklyNewsletter";
import "./flashSale";
import "./abandonedCart";
import "./productLaunch";
import "./welcomeOnboarding";
import "./eventInvite";
import "./orderReceipt";
import "./blogDigest";

export {
  templateRegistry,
  TEMPLATE_CATEGORY_LABELS,
} from "./registry";
export type { TemplateDefinition, TemplateCategory } from "./registry";
