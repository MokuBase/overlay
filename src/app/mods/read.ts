import { DateTime } from 'luxon';
import { Mod } from '../model/tag';

export const readMod: Mod = {
  plugin: [{
    tag: 'plugin/read',
    name: $localize`☑️ Mark as read`,
    config: {
      generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
      description: $localize`Mark Refs as read for the current user across multiple sessions`,
      icons: [{ response: 'plugin/read', label: $localize`☑️`, global: true, order: -1 }],
      filters: [
        { user: 'plugin/read', label: $localize`☑️ read`, title: $localize`You read it`, group: $localize`Filters 🕵️️` },
      ],
      advancedActions: [{ response: 'plugin/read', labelOff: $localize`read`, labelOn: $localize`unread`, global: true }],
      // language=CSS
      css: `
        .ref.response-plugin_read .link {
          a, .fake-link {
            color: var(--visited) !important;
          }
        }
      `
    },
    generateMetadata: true,
    userUrl: true,
  }],
};
