/**
 * ActorDo custom email blocks — full HTML fidelity + editableSlots.
 *
 * Every block keeps its exact original HTML design (via htmlOverride) but
 * exposes editable content through the `editableSlots` mechanism:
 *
 *   - `data-slot="key"` markers in the HTML identify editable nodes.
 *   - `create()` returns `editableSlots` with the default values.
 *   - The email builder's right sidebar shows a "Content" panel where
 *     users can change text, links and images without touching HTML.
 *
 * Slot types:
 *   "text"  — replace element's plain text content
 *   "html"  — replace element's innerHTML (preserves inline markup)
 *   "href"  — replace a link's href attribute
 *   "image" — replace img src and alt
 */
import { uid, type ModuleDefinition } from "@one-million-lines/email-builder";

// ── Shared colors ─────────────────────────────────────────────────────────────
const p = "{colors.primary}";      // primary blue
const muted = "{colors.muted}";
const text = "{colors.text}";
const bg = "{colors.background}";
const surface = "{colors.surface}";

// ── 1. Actor signature (logo + nav) — complex structure, no text slots ────────
// The design is intentionally static — only the href values are editable.
const SIGNATURE_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:22px 24px;color:${text};border-bottom:1px solid #DDE1EA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:25px;letter-spacing:4px;font-weight:bold;">
            <a data-slot="logo_link" href="https://actordo.com/" style="color:#111111;text-decoration:none;">ACTOR</a>
          </td>
          <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;">
            <a data-slot="nav_link" href="https://actordo.com/features/" style="color:${text};">Explore Actor</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ── 2. Hero — headline, body, CTA (fully editable text + link) ────────────────
const HERO_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:32px 24px;color:${text};">
      <p data-slot="eyebrow" style="margin:0 0 14px;color:${p};font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;">YOUR AI AGENT FOR EVERYDAY WORK</p>
      <h1 data-slot="headline" style="margin:0;font-size:34px;line-height:39px;letter-spacing:-1px;">Less everyday admin.<br><span style="color:${p};">More time for<br>your business.</span></h1>
      <div style="height:18px;line-height:18px;">&nbsp;</div>
      <p data-slot="body_text" style="margin:0;font-size:16px;line-height:25px;color:${muted};">Ask Actor to help with your calendar, tasks, or email from the conversation you are already in.</p>
      <div style="height:22px;line-height:22px;">&nbsp;</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="${p}" style="border-radius:6px;mso-padding-alt:14px 22px;">
            <a data-slot="cta_link" href="https://actor.do/web" style="font-family:Arial,Helvetica,sans-serif;display:inline-block;padding:14px 22px;font-size:16px;line-height:20px;font-weight:bold;color:#FFFFFF;text-decoration:none;"><span data-slot="cta_label">Try Actor free &#8599;</span></a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ── 3. Channels grid (2×2 integration tiles) — keep static by design ─────────
const CHANNELS_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:20px 24px;color:${text};">
      <p data-slot="channels_eyebrow" style="margin:0 0 14px;color:${p};font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;">WORKS WHERE YOU WORK</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" >
        <tr>
          <td width="50%" style="font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:${text};" data-slot="cell_teams">Microsoft Teams</td>
          <td width="50%" style="font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:${text};" data-slot="cell_slack">Slack</td>
        </tr>
        <tr>
          <td width="50%" style="font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:${text};" data-slot="cell_outlook">Outlook add-in</td>
          <td width="50%" style="font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:${text};" data-slot="cell_webapp">Web app</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ── 4. Demo conversation (lavender / result strip) — editable quotes ──────────
const DEMO_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:0 24px 24px;color:${text};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:18px;color:${text};background-color:#F4F3FF;">
            <p style="margin:0 0 14px;color:${p};font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;">YOU</p>
            <p data-slot="user_message" style="margin:0;font-size:16px;line-height:25px;color:${muted};">&ldquo;Add a focus block tomorrow at 10.&rdquo;</p>
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:18px;color:${text};">
            <p style="margin:0 0 14px;color:${p};font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;">ACTOR</p>
            <h2 data-slot="actor_response" style="margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;"><span style="color:${p};">Focus time added</span></h2>
            <p data-slot="actor_detail" style="margin:0;font-size:16px;line-height:25px;color:${muted};">Tomorrow &middot; 10:00&ndash;11:00<br>Project work</p>
          </td>
        </tr>
        <tr>
          <td data-slot="result_strip" style="font-family:Arial,Helvetica,sans-serif;padding:12px 18px;color:${text};background-color:#E8F88A;font-size:16px;line-height:23px;">Less calendar admin.</td>
        </tr>
        <tr>
          <td data-slot="disclaimer" style="font-family:Arial,Helvetica,sans-serif;padding:14px 18px;color:${text};">
            <p style="margin:0;font-size:16px;line-height:25px;color:${muted};">Illustrative example. Available actions depend on your connected accounts and enabled tools.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ── 5. Tasks feature — editable eyebrow, headline, quote ─────────────────────
const TASKS_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:0 24px 20px;color:${text};border-bottom:1px solid #DDE1EA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:20px 20px 4px;color:${text};">
            <p data-slot="tasks_eyebrow" style="margin:0 0 14px;color:${p};font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;">02 / TASKS</p>
            <h2 data-slot="tasks_headline" style="margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;">Capture it while it is fresh.</h2>
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:${text};background-color:#F6F7FA;">
            <p data-slot="tasks_quote" style="margin:0;font-size:16px;line-height:25px;color:${muted};">&ldquo;Create a task to send the proposal on Friday.&rdquo;</p>
          </td>
        </tr>
        <tr>
          <td data-slot="tasks_result" style="font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:${text};font-size:15px;line-height:23px;"><span style="color:${p};font-weight:bold;">&#10003;</span> A task in your connected task list</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ── 6. Studio automations — editable eyebrow, headline, body, link ───────────
const STUDIO_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F9D4" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#F5F9D4;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:${text};">
      <p data-slot="studio_eyebrow" style="margin:0 0 14px;color:${p};font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;">STUDIO AUTOMATIONS</p>
      <h2 data-slot="studio_headline" style="margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;">Useful help,<br>at the right time.</h2>
      <p data-slot="studio_body" style="margin:0;font-size:16px;line-height:25px;color:${muted};">Set up a scheduled briefing, a reminder before a meeting, or an alert for an important email.</p>
      <p style="margin:16px 0 0;font-size:15px;line-height:23px;">
        <a data-slot="studio_cta_link" href="https://actordo.com/docs/automations-studio/actordo-studio-ai-automations/" style="color:${p};font-weight:bold;"><span data-slot="studio_cta_label">Explore Studio automations &#8594;</span></a>
      </p>
    </td>
  </tr>
</table>`;

// ── 7. Compatibility footer band — editable text ──────────────────────────────
const COMPAT_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="font-family:Arial,Helvetica,sans-serif;padding:22px 24px;color:${text};border-top:1px solid #DDE1EA;">
      <p data-slot="compat_line1" style="margin:0;font-size:16px;line-height:25px;color:${muted};">Works with Google Workspace and Microsoft 365.</p>
      <p data-slot="compat_line2" style="margin:10px 0 0;font-size:13px;line-height:20px;color:${muted};">Swiss-made. Clear controls for your work and context.</p>
    </td>
  </tr>
</table>`;

// ── Exports ───────────────────────────────────────────────────────────────────

export const actordoBlocks: ModuleDefinition[] = [
  {
    type: "actordo.header.signature",
    name: "Actor signature",
    category: "custom",
    description: "Wordmark and compact website navigation. Logo link and nav link are editable.",
    tags: ["actordo", "custom", "header"],
    create: () => ({
      id: uid("module"),
      type: "actordo.header.signature",
      name: "Actor signature",
      style: { backgroundColor: surface, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: SIGNATURE_HTML,
      editableSlots: {
        logo_link: { type: "href", value: "https://actordo.com/", label: "Logo link URL" },
        nav_link: { type: "href", value: "https://actordo.com/features/", label: "Nav link URL" },
      },
    }),
  },
  {
    type: "actordo.hero.everyday",
    name: "Everyday work hero",
    category: "custom",
    description: "Blue headline hero with eyebrow, headline, body text and CTA. All text and the CTA link are editable.",
    tags: ["actordo", "custom", "hero"],
    create: () => ({
      id: uid("module"),
      type: "actordo.hero.everyday",
      name: "Everyday work hero",
      style: { backgroundColor: bg, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: HERO_HTML,
      editableSlots: {
        eyebrow:    { type: "text", value: "YOUR AI AGENT FOR EVERYDAY WORK", label: "Eyebrow label" },
        headline:   { type: "html", value: "Less everyday admin.<br><span style=\"color:{colors.primary};\">More time for<br>your business.</span>", label: "Headline (HTML)" },
        body_text:  { type: "text", value: "Ask Actor to help with your calendar, tasks, or email from the conversation you are already in.", label: "Body text" },
        cta_label:  { type: "text", value: "Try Actor free ↗", label: "CTA button label" },
        cta_link:   { type: "href", value: "https://actor.do/web", label: "CTA button link" },
      },
    }),
  },
  {
    type: "actordo.content.channels",
    name: "Where you work",
    category: "custom",
    description: "Four compact integration labels in a 2×2 grid. Eyebrow label is editable.",
    tags: ["actordo", "custom", "content"],
    create: () => ({
      id: uid("module"),
      type: "actordo.content.channels",
      name: "Where you work",
      style: { backgroundColor: surface, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: CHANNELS_HTML,
      editableSlots: {
        channels_eyebrow: { type: "text", value: "WORKS WHERE YOU WORK", label: "Eyebrow label" },
        cell_teams:   { type: "text", value: "Microsoft Teams",  label: "Cell 1: Teams" },
        cell_slack:   { type: "text", value: "Slack",            label: "Cell 2: Slack" },
        cell_outlook: { type: "text", value: "Outlook add-in",   label: "Cell 3: Outlook" },
        cell_webapp:  { type: "text", value: "Web app",          label: "Cell 4: Web app" },
      },
    }),
  },
  {
    type: "actordo.demo.calendar",
    name: "Conversation example",
    category: "custom",
    description: "Lavender request + Actor response + lime result strip. All text content is editable.",
    tags: ["actordo", "custom", "demo"],
    create: () => ({
      id: uid("module"),
      type: "actordo.demo.calendar",
      name: "Conversation example",
      style: { backgroundColor: surface, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: DEMO_HTML,
      editableSlots: {
        user_message:    { type: "text", value: "\u201cAdd a focus block tomorrow at 10.\u201d", label: "User message" },
        actor_response:  { type: "html", value: "<span style=\"color:{colors.primary};\">Focus time added</span>", label: "Actor response headline" },
        actor_detail:    { type: "html", value: "Tomorrow \u00b7 10:00\u201311:00<br>Project work", label: "Actor detail" },
        result_strip:    { type: "text", value: "Less calendar admin.", label: "Result strip text" },
        disclaimer:      { type: "html", value: "<p style=\"margin:0;font-size:16px;line-height:25px;color:{colors.muted};\">Illustrative example. Available actions depend on your connected accounts and enabled tools.</p>", label: "Disclaimer" },
      },
    }),
  },
  {
    type: "actordo.feature.tasks",
    name: "Capture it while it is fresh.",
    category: "custom",
    description: "Numbered tasks use-case card. Eyebrow, headline, quote and result line are all editable.",
    tags: ["actordo", "custom", "feature"],
    create: () => ({
      id: uid("module"),
      type: "actordo.feature.tasks",
      name: "Tasks feature",
      style: { backgroundColor: surface, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: TASKS_HTML,
      editableSlots: {
        tasks_eyebrow:  { type: "text", value: "02 / TASKS", label: "Section number / label" },
        tasks_headline: { type: "text", value: "Capture it while it is fresh.", label: "Headline" },
        tasks_quote:    { type: "text", value: "\u201cCreate a task to send the proposal on Friday.\u201d", label: "User quote" },
        tasks_result:   { type: "html", value: "<span style=\"color:{colors.primary};font-weight:bold;\">&#10003;</span> A task in your connected task list", label: "Result line" },
      },
    }),
  },
  {
    type: "actordo.content.studio",
    name: "Proactive Studio panel",
    category: "custom",
    description: "Pale lime automation panel. Eyebrow, headline, body text and CTA are all editable.",
    tags: ["actordo", "custom", "content"],
    create: () => ({
      id: uid("module"),
      type: "actordo.content.studio",
      name: "Studio automations",
      style: { backgroundColor: "#F5F9D4", paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: STUDIO_HTML,
      editableSlots: {
        studio_eyebrow:   { type: "text", value: "STUDIO AUTOMATIONS", label: "Eyebrow label" },
        studio_headline:  { type: "text", value: "Useful help, at the right time.", label: "Headline" },
        studio_body:      { type: "text", value: "Set up a scheduled briefing, a reminder before a meeting, or an alert for an important email.", label: "Body text" },
        studio_cta_label: { type: "text", value: "Explore Studio automations \u2192", label: "CTA label" },
        studio_cta_link:  { type: "href", value: "https://actordo.com/docs/automations-studio/actordo-studio-ai-automations/", label: "CTA link" },
      },
    }),
  },
  {
    type: "actordo.footer.compatibility",
    name: "Compatibility and controls",
    category: "custom",
    description: "Quiet closing band for workspace compatibility and controls. Both text lines are editable.",
    tags: ["actordo", "custom", "footer"],
    create: () => ({
      id: uid("module"),
      type: "actordo.footer.compatibility",
      name: "Compatibility",
      style: { backgroundColor: surface, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [],
      htmlOverride: COMPAT_HTML,
      editableSlots: {
        compat_line1: { type: "text", value: "Works with Google Workspace and Microsoft 365.", label: "Line 1" },
        compat_line2: { type: "text", value: "Swiss-made. Clear controls for your work and context.", label: "Line 2" },
      },
    }),
  },
];
