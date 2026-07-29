// Public surface for the gallery module.
import type { Plugin, BuilderHandle } from "../core/plugins";
import { galleryRegistry, type GalleryDefinition } from "./registry";

export { galleryRegistry } from "./registry";
export type { GalleryDefinition, GalleryItem } from "./registry";
export { sampleGallery } from "./sampleGallery";

/**
 * Plugin factory that registers one or more galleries with the builder.
 *
 * @example
 *   import { registerPlugin } from "@one-million-lines/email-builder";
 *   import { galleryPlugin, sampleGallery } from "@one-million-lines/email-builder";
 *   registerPlugin(galleryPlugin(sampleGallery));
 */
export function galleryPlugin(...galleries: GalleryDefinition[]): Plugin {
  return {
    name: "gallery",
    // Galleries are just extra modules; reuse the "modules" plugin type.
    type: "modules",
    setup(_builder: BuilderHandle) {
      for (const g of galleries) galleryRegistry.registerGallery(g);
    },
  };
}
