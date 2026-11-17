import { uid, type ModuleDefinition } from "@one-million-lines/email-builder";
const serialized = [
  {
    "type": "actordo.header.signature",
    "name": "Actor signature",
    "description": "Wordmark and compact website navigation.",
    "tags": [
      "actordo",
      "custom",
      "header"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:22px 24px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;font-size:25px;letter-spacing:4px;font-weight:bold;\"><a href=\"https://actordo.com/\" style=\"color:#111111;text-decoration:none;\">ACTOR</a></td><td align=\"right\" style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;\"><a href=\"https://actordo.com/features/\" style=\"color:#192235;\">Explore Actor</a></td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.hero.everyday",
    "name": "Everyday work hero",
    "description": "Blue headline, generous spacing and a live-text call to action.",
    "tags": [
      "actordo",
      "custom",
      "hero"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FAFAF7\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FAFAF7;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:32px 24px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">YOUR AI AGENT FOR EVERYDAY WORK</p><h1 style=\"margin:0;font-size:34px;line-height:39px;letter-spacing:-1px;\">Less everyday admin.<br><span style=\"color:#3024F4;\">More time for<br>your business.</span></h1><div style=\"height:18px;line-height:18px;\">&nbsp;</div><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Ask Actor to help with your calendar, tasks, or email from the conversation you are already in.</p><div style=\"height:22px;line-height:22px;\">&nbsp;</div><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td bgcolor=\"#3024F4\" style=\"border-radius:6px;mso-padding-alt:14px 22px;\"><a href=\"https://actor.do/web\" style=\"font-family:Arial,Helvetica,sans-serif;display:inline-block;padding:14px 22px;font-size:16px;line-height:20px;font-weight:bold;color:#FFFFFF;text-decoration:none;\">Try Actor free &#8599;</a></td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.content.channels",
    "name": "Where you work",
    "description": "Four compact integration labels arranged in two rows.",
    "tags": [
      "actordo",
      "custom",
      "content"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 24px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">WORKS WHERE YOU WORK</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Microsoft Teams</td><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Slack</td></tr><tr><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Outlook add-in</td><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Web app</td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.demo.calendar",
    "name": "Conversation example",
    "description": "Lavender request, Actor response and lime result strip.",
    "tags": [
      "actordo",
      "custom",
      "demo"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 24px;color:#192235;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:18px;color:#192235;background-color:#F4F3FF;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">YOU</p><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Add a focus block tomorrow at 10.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:18px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">ACTOR</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\"><span style=\"color:#3024F4;\">Focus time added</span></h2><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Tomorrow &middot; 10:00&ndash;11:00<br>Project work</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:12px 18px;color:#192235;background-color:#E8F88A;font-size:16px;line-height:23px;\">Less calendar admin.</td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:14px 18px;color:#192235;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Illustrative example. Available actions depend on your connected accounts and enabled tools.</p></td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.feature.calendar",
    "name": "Make room for focused work.",
    "description": "Numbered calendar use-case card with request and outcome.",
    "tags": [
      "actordo",
      "custom",
      "feature"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 20px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 20px 4px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">01 / CALENDAR</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Make room for focused work.</h2></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;background-color:#F6F7FA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Add a focus block tomorrow at 10.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;font-size:15px;line-height:23px;\"><span style=\"color:#3024F4;font-weight:bold;\">&#10003;</span> A focus event in your connected calendar</td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.feature.tasks",
    "name": "Capture it while it is fresh.",
    "description": "Numbered tasks use-case card with request and outcome.",
    "tags": [
      "actordo",
      "custom",
      "feature"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 20px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 20px 4px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">02 / TASKS</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Capture it while it is fresh.</h2></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;background-color:#F6F7FA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Create a task to send the proposal on Friday.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;font-size:15px;line-height:23px;\"><span style=\"color:#3024F4;font-weight:bold;\">&#10003;</span> A task in your connected task list</td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.feature.email",
    "name": "Get past the blank reply.",
    "description": "Numbered email use-case card with request and outcome.",
    "tags": [
      "actordo",
      "custom",
      "feature"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 20px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 20px 4px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">03 / EMAIL</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Get past the blank reply.</h2></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;background-color:#F6F7FA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Draft a reply to this customer using our returns policy.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;font-size:15px;line-height:23px;\"><span style=\"color:#3024F4;font-weight:bold;\">&#10003;</span> A contextual draft ready for your review</td></tr></table></td></tr></table>"
  },
  {
    "type": "actordo.content.studio",
    "name": "Proactive Studio panel",
    "description": "Pale lime automation panel with highlighted heading.",
    "tags": [
      "actordo",
      "custom",
      "content"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#F5F9D4\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#F5F9D4;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:24px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">STUDIO AUTOMATIONS</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Useful help,<br>at the right time.</h2><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Set up a scheduled briefing, a reminder before a meeting, or an alert for an important email.</p><p style=\"margin:16px 0 0;font-size:15px;line-height:23px;\"><a href=\"https://actordo.com/docs/automations-studio/actordo-studio-ai-automations/\" style=\"color:#3024F4;font-weight:bold;\">Explore Studio automations &#8594;</a></p></td></tr></table>"
  },
  {
    "type": "actordo.footer.compatibility",
    "name": "Compatibility and controls",
    "description": "Quiet closing band for workspace compatibility and controls.",
    "tags": [
      "actordo",
      "custom",
      "footer"
    ],
    "style": {
      "backgroundColor": "#FFFFFF",
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0,
      "mobile": {
        "paddingLeft": 0,
        "paddingRight": 0
      }
    },
    "html": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:22px 24px;color:#192235;border-top:1px solid #DDE1EA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Works with Google Workspace and Microsoft 365.</p><p style=\"margin:10px 0 0;font-size:13px;line-height:20px;color:#606C80;\">Swiss-made. Clear controls for your work and context.</p></td></tr></table>"
  }
];
export const actordoBlocks: ModuleDefinition[] = serialized.map(d => ({ ...d, category: "custom", create: () => ({ id: uid("module"), type: d.type, name: d.name, style: d.style, children: [], htmlOverride: d.html }) }));
