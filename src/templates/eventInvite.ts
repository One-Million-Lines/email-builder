import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { newsletterEditorial } from "../themes/defaultThemes";
import {
  mod,
  text,
  spacer,
  button,
  image,
  divider,
  heading,
  muted,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "event-invite",
  name: "Event Invite",
  category: "event",
  description:
    "Invite to a live event with a header image, date / time / location card, agenda highlights, and an RSVP button.",
  tags: ["event", "invite", "rsvp", "conference", "meetup"],
  thumbnail: "https://placehold.co/600x800/111827/FAFAF9?text=You're+Invited",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "You're invited: Acme Summit 2026",
      previewText: "Join us June 12 in Brooklyn for talks, food and a rooftop after-party.",
    },
    theme: newsletterEditorial,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.logo", "Logo", [
        text("ACME SUMMIT", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 18,
          fontWeight: "bold",
          letterSpacing: 6,
          paddingTop: 24,
          paddingBottom: 16,
        }),
      ]),
      mod("hero.event", "Event hero", [
        image(PLACEHOLDER(600, 320, "Acme+Summit"), "Acme Summit", {
          width: 600,
          paddingTop: 0,
          paddingBottom: 16,
        }),
        heading("You're invited.", {
          align: "center",
          fontSize: 32,
          paddingTop: 8,
          paddingBottom: 4,
        }),
        muted("A one-day gathering for builders. Brooklyn, NY.", {
          align: "center",
          paddingBottom: 24,
        }),
      ]),
      mod(
        "content.event_card",
        "Event details",
        [
          text("📅  Friday, June 12, 2026", {
            align: "center",
            fontWeight: "bold",
            paddingTop: 24,
            paddingBottom: 4,
          }),
          text("⏰  9:00 AM — 6:00 PM", { align: "center", paddingBottom: 4 }),
          text("📍  The Invisible Dog · 51 Bergen St, Brooklyn", {
            align: "center",
            paddingBottom: 16,
          }),
          button("RSVP — free", "#"),
          spacer(24),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod("content.agenda", "Agenda", [
        divider({ paddingTop: 16, paddingBottom: 16 }),
        eyebrowText("AGENDA HIGHLIGHTS"),
        agendaRow("9:30", "Opening keynote — Maya Chen, Acme"),
        agendaRow("11:00", "Workshop: shipping AI features users actually want"),
        agendaRow("13:00", "Lunch + open conversations"),
        agendaRow("15:30", "Panel: building durable companies"),
        agendaRow("18:00", "Rooftop after-party"),
        spacer(16),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme, Inc · 100 Market St · San Francisco, CA", {
            align: "center",
            paddingTop: 16,
          }),
          muted("Update preferences · Unsubscribe", {
            align: "center",
            paddingTop: 4,
            paddingBottom: 24,
            link: "#",
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
    ],
  }),
};

function eyebrowText(s: string) {
  return text(s, {
    fontFamily: "{fonts.button}",
    color: "{colors.muted}",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 3,
    paddingBottom: 12,
  });
}

function agendaRow(time: string, label: string) {
  return text(`<b>${time}</b>  ·  ${label}`, {
    paddingTop: 6,
    paddingBottom: 6,
  });
}

templateRegistry.register(def);
export default def;
