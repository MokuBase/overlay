import { DateTime } from 'luxon';
import { Plugin } from '../model/plugin';
import { Mod } from '../model/tag';

export const runPlugin: Plugin = {
  tag: '+plugin/run',
  name: $localize`⌛️ Run Script`,
  config: {
    default: true,
    mod: $localize`➰️ Scripts`,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    icons: [{ label: $localize`⏳️`, order: -3 },],
    filters: [{ query: '+plugin/run', label: $localize`⏳️ Running`, title: $localize`Running script`, group: $localize`Plugins 🧰️` }],
    description: $localize`Schedule scripts to be run on the server at specific intervals.`,
  },
  generateMetadata: true,
  userUrl: true,
};

export const cronPlugin: Plugin = {
  tag: '+plugin/cron',
  name: $localize`⏱️ Scheduler`,
  config: {
    default: true,
    mod: $localize`➰️ Scripts`,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    icons: [{ label: $localize`⏱️`, order: -3 }],
    filters: [{ query: '+plugin/cron', label: $localize`⏱️ Scheduled`, title: $localize`Scheduled script`, group: $localize`Plugins 🧰️` }],
    description: $localize`Schedule scripts to be run on the server at specific intervals.`,
    // language=Handlebars
    infoUi: `every {{formatInterval interval}}`,
    form: [{
      key: 'interval',
      type: 'duration',
      defaultValue: 'PT15M',
      props: {
        label: $localize`Interval:`,
        datalist: [
          { value: 'PT1M', label: $localize`1 min`},
          { value: 'PT5M', label: $localize`5 mins`},
          { value: 'PT15M', label: $localize`15 mins`},
          { value: 'PT30M', label: $localize`30 mins`},
          { value: 'PT30M', label: $localize`30 mins`},
          { value: 'PT1H', label: $localize`1 hour`},
          { value: 'PT2H', label: $localize`2 hours`},
          { value: 'PT6H', label: $localize`6 hours`},
          { value: 'PT12H', label: $localize`12 hours`},
          { value: 'PT24H', label: $localize`1 day`},
        ],
      }
    }],
  },
  defaults: {
    interval: 'PT15M',
  },
  schema: {
    properties: {
      interval: { type: 'string' },
    },
  },
};

export const deltaPlugin: Plugin = {
  tag: 'plugin/delta',
  name: $localize`⏳️ Delta`,
  config: {
    default: true,
    mod: $localize`➰️ Scripts`,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    description: $localize`Transform Refs by running scripts.`,
    icons: [
      { label: $localize`⏳️`, noResponse: '+plugin/delta', order: -10 },
      { tag: '_plugin/delta', label: $localize`⏳️`, noResponse: '+plugin/delta', order: -10 },
    ],
    filters: [{ query: 'plugin/delta|_plugin/delta', label: $localize`⏳️ Working`, title: $localize`Running a script`, group: $localize`Plugins 🧰️` }],
  },
};

export const deltaSignaturePlugin: Plugin = {
  tag: '+plugin/delta',
  name: $localize`⏳️ Delta Signature`,
  config: {
    default: true,
    mod: $localize`➰️ Scripts`,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    description: $localize`Transform Refs by running scripts.`,
  },
  generateMetadata: true,
};

export const scriptMod: Mod = {
  plugin: [
    runPlugin,
    cronPlugin,
    deltaPlugin,
    deltaSignaturePlugin,
  ]
};
