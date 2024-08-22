import * as moment from 'moment';
import { Plugin } from '../model/plugin';
import { Mod } from '../model/tag';

const systemPlugin: Plugin = {
  tag: '_plugin/system',
  name: $localize`📟️ System`,
  config: {
    mod: $localize`📟️ System`,
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
    settings: $localize`system`,
    submit: true,
    internal: true,
    icons: [{ label: $localize`📟️`, order: 3 }],
    filters: [
      { query: '_plugin/system', label: $localize`📟️ system`, group: $localize`Plugins 🧰️` },
    ],
    description: $localize`View system information and statistics.`,
    actions: [{ event: 'scrape', label: $localize`scrape` }],
  },
};

export const systemMod: Mod = {
  plugins: {
    system: systemPlugin,
  },
}
