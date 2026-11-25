import { uid, templateRegistry, type Theme, type TemplateDefinition, type EmailDocument } from "@one-million-lines/email-builder";
export const actordoTheme: Theme = {
  "id": "actordo",
  "name": "ActorDo",
  "tokens": {
    "colors": {
      "background": "#FAFAF7",
      "surface": "#FFFFFF",
      "primary": "#3024F4",
      "text": "#192235",
      "muted": "#606C80",
      "buttonBackground": "#3024F4",
      "buttonText": "#FFFFFF"
    },
    "fonts": {
      "heading": "Arial, Helvetica, sans-serif",
      "body": "Arial, Helvetica, sans-serif",
      "button": "Arial, Helvetica, sans-serif"
    },
    "spacing": {
      "xs": 4,
      "sm": 8,
      "md": 16,
      "lg": 24,
      "xl": 40
    },
    "radius": {
      "sm": 4,
      "md": 8,
      "lg": 12
    }
  }
};
const document: EmailDocument = {
  "version": "1.0",
  "meta": {
    "name": "ActorDo — Everyday work",
    "previewText": "Less everyday admin. More time for your business."
  },
  "theme": {
    "id": "actordo",
    "name": "ActorDo",
    "tokens": {
      "colors": {
        "background": "#FAFAF7",
        "surface": "#FFFFFF",
        "primary": "#3024F4",
        "text": "#192235",
        "muted": "#606C80",
        "buttonBackground": "#3024F4",
        "buttonText": "#FFFFFF"
      },
      "fonts": {
        "heading": "Arial, Helvetica, sans-serif",
        "body": "Arial, Helvetica, sans-serif",
        "button": "Arial, Helvetica, sans-serif"
      },
      "spacing": {
        "xs": 4,
        "sm": 8,
        "md": 16,
        "lg": 24,
        "xl": 40
      },
      "radius": {
        "sm": 4,
        "md": 8,
        "lg": 12
      }
    }
  },
  "settings": {
    "width": 600,
    "backgroundColor": "{colors.background}",
    "contentBackgroundColor": "{colors.surface}"
  },
  "modules": [
    {
      "id": "actordo_module_0",
      "type": "actordo.header.signature",
      "name": "Actor signature",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:22px 24px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;font-size:25px;letter-spacing:4px;font-weight:bold;\"><a href=\"https://actordo.com/\" style=\"color:#111111;text-decoration:none;\">ACTOR</a></td><td align=\"right\" style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;\"><a href=\"https://actordo.com/features/\" style=\"color:#192235;\">Explore Actor</a></td></tr></table></td></tr></table>"
    },
    {
      "id": "actordo_module_1",
      "type": "actordo.hero.everyday",
      "name": "Everyday work hero",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FAFAF7\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FAFAF7;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:32px 24px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">YOUR AI AGENT FOR EVERYDAY WORK</p><h1 style=\"margin:0;font-size:34px;line-height:39px;letter-spacing:-1px;\">Less everyday admin.<br><span style=\"color:#3024F4;\">More time for<br>your business.</span></h1><div style=\"height:18px;line-height:18px;\">&nbsp;</div><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Ask Actor to help with your calendar, tasks, or email from the conversation you are already in.</p><div style=\"height:22px;line-height:22px;\">&nbsp;</div><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td bgcolor=\"#3024F4\" style=\"border-radius:6px;mso-padding-alt:14px 22px;\"><a href=\"https://actor.do/web\" style=\"font-family:Arial,Helvetica,sans-serif;display:inline-block;padding:14px 22px;font-size:16px;line-height:20px;font-weight:bold;color:#FFFFFF;text-decoration:none;\">Try Actor free &#8599;</a></td></tr></table></td></tr></table>"
    },
    {
      "id": "actordo_module_2",
      "type": "actordo.content.channels",
      "name": "Where you work",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 24px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">WORKS WHERE YOU WORK</p><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Microsoft Teams</td><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Slack</td></tr><tr><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Outlook add-in</td><td width=\"50%\" style=\"font-family:Arial,Helvetica,sans-serif;padding:10px 8px;border:1px solid #DDE1EA;font-size:13px;font-weight:bold;color:#192235;\">Web app</td></tr></table></td></tr></table>"
    },
    {
      "id": "actordo_module_3",
      "type": "actordo.demo.calendar",
      "name": "Conversation example",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 24px;color:#192235;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:18px;color:#192235;background-color:#F4F3FF;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">YOU</p><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Add a focus block tomorrow at 10.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:18px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">ACTOR</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\"><span style=\"color:#3024F4;\">Focus time added</span></h2><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Tomorrow &middot; 10:00&ndash;11:00<br>Project work</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:12px 18px;color:#192235;background-color:#E8F88A;font-size:16px;line-height:23px;\">Less calendar admin.</td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:14px 18px;color:#192235;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Illustrative example. Available actions depend on your connected accounts and enabled tools.</p></td></tr></table></td></tr></table>"
    },
    {
      "id": "actordo_module_4",
      "type": "actordo.feature.calendar",
      "name": "Make room for focused work.",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 20px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 20px 4px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">01 / CALENDAR</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Make room for focused work.</h2></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;background-color:#F6F7FA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Add a focus block tomorrow at 10.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;font-size:15px;line-height:23px;\"><span style=\"color:#3024F4;font-weight:bold;\">&#10003;</span> A focus event in your connected calendar</td></tr></table></td></tr></table>"
    },
    {
      "id": "actordo_module_5",
      "type": "actordo.feature.tasks",
      "name": "Capture it while it is fresh.",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:0 24px 20px;color:#192235;border-bottom:1px solid #DDE1EA;\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:20px 20px 4px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">02 / TASKS</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Capture it while it is fresh.</h2></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;background-color:#F6F7FA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">&ldquo;Create a task to send the proposal on Friday.&rdquo;</p></td></tr><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:16px 20px;color:#192235;font-size:15px;line-height:23px;\"><span style=\"color:#3024F4;font-weight:bold;\">&#10003;</span> A task in your connected task list</td></tr></table></td></tr></table>"
    },
    {
      "id": "actordo_module_7",
      "type": "actordo.content.studio",
      "name": "Proactive Studio panel",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#F5F9D4\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#F5F9D4;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:24px;color:#192235;\"><p style=\"margin:0 0 14px;color:#3024F4;font-size:11px;font-weight:bold;line-height:17px;letter-spacing:1.5px;\">STUDIO AUTOMATIONS</p><h2 style=\"margin:0 0 12px;font-size:26px;line-height:32px;letter-spacing:-0.6px;\">Useful help,<br>at the right time.</h2><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Set up a scheduled briefing, a reminder before a meeting, or an alert for an important email.</p><p style=\"margin:16px 0 0;font-size:15px;line-height:23px;\"><a href=\"https://actordo.com/docs/automations-studio/actordo-studio-ai-automations/\" style=\"color:#3024F4;font-weight:bold;\">Explore Studio automations &#8594;</a></p></td></tr></table>"
    },
    {
      "id": "actordo_module_8",
      "type": "actordo.footer.compatibility",
      "name": "Compatibility and controls",
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
      "children": [],
      "htmlOverride": "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#FFFFFF\" style=\"width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FFFFFF;\"><tr><td style=\"font-family:Arial,Helvetica,sans-serif;padding:22px 24px;color:#192235;border-top:1px solid #DDE1EA;\"><p style=\"margin:0;font-size:16px;line-height:25px;color:#606C80;\">Works with Google Workspace and Microsoft 365.</p><p style=\"margin:10px 0 0;font-size:13px;line-height:20px;color:#606C80;\">Swiss-made. Clear controls for your work and context.</p></td></tr></table>"
    },
    {
      "id": "module_fs4xf781gc",
      "type": "footer.legal",
      "name": "Mailing details",
      "style": {
        "backgroundColor": "{colors.surface}",
        "paddingTop": 16,
        "paddingBottom": 16,
        "mobile": {
          "paddingLeft": 0,
          "paddingRight": 0
        }
      },
      "children": [
        {
          "id": "el_3n5d29v1gc",
          "type": "text",
          "content": "ActorDo · Company mailing address",
          "style": {
            "fontFamily": "{fonts.body}",
            "fontSize": 14,
            "color": "{colors.muted}",
            "align": "center",
            "paddingTop": 8,
            "paddingBottom": 8,
            "paddingLeft": 24,
            "paddingRight": 24,
            "lineHeight": 1.5,
            "mobile": {
              "paddingLeft": 16,
              "paddingRight": 16
            }
          },
          "vtMarker": "vtw-info"
        },
        {
          "id": "el_n52efvz1gc",
          "type": "text",
          "content": "<a class=\"vtpreview\" href=\"{{view_in_browser_url}}\" data-link-type=\"view_in_browser\" style=\"color:inherit;text-decoration:underline\">View in browser</a> · <a class=\"vtunsubscribe\" href=\"{{unsubscribe_url}}\" data-link-type=\"unsubscribe\" style=\"color:inherit;text-decoration:underline\">Unsubscribe</a>",
          "style": {
            "fontFamily": "{fonts.body}",
            "fontSize": 12,
            "color": "{colors.muted}",
            "align": "center",
            "paddingTop": 4,
            "paddingBottom": 24,
            "paddingLeft": 24,
            "paddingRight": 24,
            "lineHeight": 1.5,
            "mobile": {
              "paddingLeft": 16,
              "paddingRight": 16
            }
          }
        }
      ]
    }
  ]
};
const starter: TemplateDefinition = { id: "actordo-everyday", name: "ActorDo — Everyday work", category: "newsletter", description: "ActorDo everyday work starter", tags: ["actordo", "tenant"], build: () => { const doc = JSON.parse(JSON.stringify(document)) as EmailDocument; doc.modules.forEach(m => { m.id = uid("module"); m.children.forEach(el => { el.id = uid("el"); }); }); return doc; } };
templateRegistry.register(starter);
export default starter;
