import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const rootPlugin: Plugin = {
  tag: 'plugin',
  name: $localize`Root`,
  config: {
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`This plugin stores system wide config.`,
    actions: [
      { tag: '_moderated', labelOff: $localize`approve`, labelOn: $localize`✔️` }
    ],
  },
};

