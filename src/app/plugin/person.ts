import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const personPlugin: Plugin = {
  tag: 'plugin/person',
  name: $localize`Person`,
  config: {
    type: 'semantic',
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    published: $localize`born`,
    icons: [{ label: $localize`👱️‍` }],
    submit: $localize`👱️️ person`,
    filters: [
      { query: 'plugin/person', label: $localize`👱️‍ people`, group: $localize`Plugins 🧰️` },
    ],
    css: `
      .plugin-person .thumbnail {
        border-radius: 32px;
        height: 64px;
        background-size: cover;
      }
    `,
  },
};
