import { DateTime } from 'luxon';
import { Plugin } from '../model/plugin';
import { Mod } from '../model/tag';

export const cronPlugin: Plugin = {
  tag: '+plugin/cron',
  name: $localize`⏱️ Scheduler`,
  config: {
    default: true,
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

export const cronMod: Mod = {
  plugin: [
    cronPlugin,
  ]
};
