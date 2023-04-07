import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const modlistPlugin: Plugin = {
  tag: '_plugin/modlist',
  name: $localize`🛡️ Modlist`,
  config: {
    default: true,
    type: 'tool',
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`This plugin marks posts as approved by a moderator.`,
    icons: [
      { label: $localize`✔️`, tag: '_moderated', title: $localize`Moderated`, global: true, order: -1 },
    ],
    actions: [
      { tag: '_moderated', labelOff: $localize`approve`, global: true, order: -1 }
    ],
    filters: [
      { query: '!_moderated@*', label: $localize`🛡️ modlist`, group: $localize`Mod Tools` },
    ],
  },
};

