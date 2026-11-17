/**
 * TenantEmailBuilder — multi-tenant email editor integration.
 *
 * Demonstrates:
 *  1. Loading a per-tenant brand theme (custom + generic presets available).
 *  2. Registering tenant-specific starter templates into the Templates modal.
 *  3. Starting the editor with the tenant's default email structure.
 *  4. Preventing a previous tenant's autosaved draft from bleeding in.
 *  5. Providing a "Reset & start fresh" button that picks any registered theme.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  EmailBuilder,
  clearEmailBuilderDocument,
  templateRegistry,
  defaultThemes,
  type EmailDocument,
  type Theme,
  type TemplateDefinition,
} from "@one-million-lines/email-builder";
import "@one-million-lines/email-builder/styles.css";

// Tenant-specific assets — import your own theme files here.
import campmorStarterDef, { campmorTheme } from "./campmor-theme";
import { campmorBlocks } from "./campmor-blocks";
import hamangiuStarterDef, { hamangiuTheme } from "./hamangiu-theme";
import feroshopStarterDef, { feroshopTheme } from "./feroshop-theme";
import { hamangiuBlocks } from "./hamangiu-blocks";
import { feroshopBlocks } from "./feroshop-blocks";

// ─── Tenant configuration registry ──────────────────────────────────────────

interface TenantConfig {
  /** Themes available in the editor's Themes panel. Tenant theme always first. */
  themes: Theme[];
  /** Template used to seed a fresh editor session for this tenant. */
  starterTemplate: TemplateDefinition;
  /**
   * Tenant-specific custom blocks. These appear in the "Custom" tab (purple
   * accent, puzzle icon) in the left sidebar. All blocks should use
   * `category: "custom"` and can use `htmlOverride` for complex layouts that
   * the standard element system cannot produce.
   */
  modules?: import("@one-million-lines/email-builder").ModuleDefinition[];
}

/**
 * Map tenant IDs to their brand configuration.
 */
const TENANT_CONFIGS: Record<string, TenantConfig> = {
  hamangiu: {
    themes:          [hamangiuTheme, ...defaultThemes],
    starterTemplate: hamangiuStarterDef,
    modules:         hamangiuBlocks,   // Category Nav, Book Feature, Promo Badge
  },

  feroshop: {
    themes:          [feroshopTheme, ...defaultThemes],
    starterTemplate: feroshopStarterDef,
    modules:         feroshopBlocks,   // Promo Strip, Deal Badge, B2B Features
  },

  campmor: {
    themes: [campmorTheme, ...defaultThemes],
    starterTemplate: campmorStarterDef,
    modules: campmorBlocks,
  },

  // Generic / no custom brand — just the five built-in themes.
  generic: {
    themes: defaultThemes,
    starterTemplate: {
      id:          "generic-starter",
      name:        "Generic Starter",
      category:    "newsletter",
      description: "Blank email with no preset content.",
      build:       (): EmailDocument => ({
        version:  "1.0",
        meta:     { name: "Untitled email", previewText: "" },
        theme:    defaultThemes[0],
        settings: {
          width:                   600,
          backgroundColor:         "{colors.background}",
          contentBackgroundColor:  "{colors.surface}",
        },
        modules: [],
      }),
    },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export interface TenantEmailBuilderProps {
  /** Identifies the brand / client. Must match a key in TENANT_CONFIGS. */
  tenantId: string;
  /**
   * Unique identifier for the email being edited.
   * Changing this causes the editor to remount with a clean state.
   */
  emailId: string;
  /**
   * Provide an existing document to resume editing.
   * When omitted the tenant's starter template is used instead.
   */
  existingDocument?: EmailDocument;
  onSave?:       (doc: EmailDocument) => void;
  onExportHtml?: (html: string) => void;
}

export function TenantEmailBuilder({
  tenantId,
  emailId,
  existingDocument,
  onSave,
  onExportHtml,
}: TenantEmailBuilderProps) {
  // Increment to force a full remount of <EmailBuilder> without changing the URL.
  const [resetKey, setResetKey] = useState(0);

  const config = TENANT_CONFIGS[tenantId] ?? TENANT_CONFIGS.generic;

  // ── Register all tenant templates once ────────────────────────────────────
  // templateRegistry is a global singleton — registering the same id twice is
  // harmless (the Map entry is simply overwritten).
  useEffect(() => {
    templateRegistry.register(hamangiuStarterDef);
    templateRegistry.register(feroshopStarterDef);
  }, []);

  // ── Prevent cross-tenant / cross-email draft bleed ─────────────────────────
  // The editor autosaves to a single localStorage key. Without this guard,
  // opening a different tenant's email would restore the previous tenant's draft.
  //
  // We track the previous values with a ref so the clear runs synchronously
  // *before* React queues the next render (avoids a flash of stale content).
  const prevContextRef = useRef(`${tenantId}:${emailId}`);
  const context = `${tenantId}:${emailId}`;

  if (prevContextRef.current !== context) {
    prevContextRef.current = context;
    clearEmailBuilderDocument(); // synchronous — empties localStorage before remount
  }

  // ── "Reset & start fresh" ──────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (!window.confirm("Reset the editor? Unsaved changes will be lost.")) return;
    clearEmailBuilderDocument();
    setResetKey((k) => k + 1); // triggers remount → localStorage is now empty
  }, []);

  // ── Resolve the initial document ───────────────────────────────────────────
  // Priority: existingDocument prop > tenant starter template.
  const initialDocument = existingDocument ?? config.starterTemplate.build();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Minimal host toolbar — style as needed */}
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          padding:      "6px 16px",
          borderBottom: "1px solid #E5E7EB",
          background:   "#F9FAFB",
          fontSize:     13,
        }}
      >
        <span style={{ marginRight: "auto", color: "#374151" }}>
          Editing for: <strong>{tenantId}</strong>
        </span>
        <button
          onClick={handleReset}
          style={{
            padding:         "4px 12px",
            border:          "1px solid #D1D5DB",
            borderRadius:    6,
            background:      "#FFFFFF",
            cursor:          "pointer",
            fontSize:        12,
          }}
        >
          🔄 Reset &amp; start fresh
        </button>
      </div>

      {/* The email builder fills the remaining height */}
      <div style={{ flex: 1 }}>
        <EmailBuilder
          /**
           * The key prop is the primary remount trigger.
           * Any change to tenantId, emailId, or resetKey causes a full
           * unmount → mount cycle, giving the builder a clean slate.
           */
          key={`${tenantId}:${emailId}:${resetKey}`}

          /**
           * Themes shown in the left-sidebar Themes panel.
           * The first theme in the array is pre-selected on first load.
           */
          themes={config.themes}

          /**
           * Tenant-specific custom blocks. These appear in the "Custom" tab
           * (purple accent, puzzle icon) in the left sidebar — only visible
           * when at least one module with category "custom" is registered.
           */
          modules={config.modules}

          /**
           * Starting document: either the tenant's existing email (resume
           * editing) or a fresh document built from the starter template.
           */
          initialDocument={initialDocument}

          onChange={onSave}
          onExportHtml={onExportHtml}
        />
      </div>
    </div>
  );
}

// ─── Usage example ────────────────────────────────────────────────────────────
//
// import { TenantEmailBuilder } from "./TenantEmailBuilder";
//
// function EmailEditorPage() {
//   const { tenantId } = useCurrentTenant();   // from your auth context
//   const { emailId }  = useParams();
//
//   const handleSave = async (doc) => {
//     await api.saveEmail(emailId, doc);
//   };
//
//   return (
//     <TenantEmailBuilder
//       tenantId={tenantId}
//       emailId={emailId}
//       onSave={handleSave}
//       onExportHtml={(html) => console.log("HTML length:", html.length)}
//     />
//   );
// }
