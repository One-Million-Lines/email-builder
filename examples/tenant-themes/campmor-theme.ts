import { type Theme, type TemplateDefinition, templateRegistry, mod, shopInfoText, footerLinks } from "@one-million-lines/email-builder";
import { campmorBlocks } from "./campmor-blocks";

const sans = "Arial, Helvetica, sans-serif";
export const campmorTheme: Theme = {
  id: "campmor", name: "Campmor TrailMail",
  tokens: {
    colors: { background: "#F6F5F1", surface: "#FFFFFF", primary: "#222222", text: "#222222",
      muted: "#555555", buttonBackground: "#FFD238", buttonText: "#222222" },
    fonts: { heading: sans, body: sans, button: sans },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 }, radius: { sm: 0, md: 0, lg: 0 },
  },
};

const starter: TemplateDefinition = {
  id: "campmor-trailmail", name: "Campmor — TrailMail gift guide", category: "ecommerce",
  description: "Gift guide, department directory and Campmor Insider story.", tags: ["campmor","tenant","outdoors"],
  build: () => ({
    version: "1.0", meta: { name: "Campmor TrailMail", previewText: "Outdoor gift ideas and a guide to finding your pack fit." },
    theme: campmorTheme, settings: { width: 600, backgroundColor: "{colors.background}", contentBackgroundColor: "{colors.surface}" },
    modules: [...campmorBlocks.map(block => block.create()), mod("footer.legal", "Mailing details", [
      shopInfoText("Campmor · 810 Route 17 North · Paramus, NJ 07652", { align: "center" }),
      footerLinks([{ label: "View in browser", type: "view_in_browser" }, { label: "Unsubscribe", type: "unsubscribe" }], { align: "center" }),
    ].map(el => ({ ...el, style: Object.fromEntries(Object.entries(el.style ?? {}).filter(([,value]) => value !== undefined)) })), { backgroundColor: "{colors.surface}", paddingTop: 16, paddingBottom: 16 })],
  })
};
templateRegistry.register(starter);
export default starter;
