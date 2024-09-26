import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const threadPlugin: Plugin = {
  tag: 'plugin/thread',
  name: $localize`🧵️ Threads`,
  config: {
    type: 'plugin',
    default: true,
    genId: true,
    internal: true,
    responseButton: $localize`🧵️`,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Attempt to merge similar Refs tagged plugin/thread into threads.`,
    icons: [{ thumbnail: $localize`🧵️`, order: -1 }],
    filters: [
      { query: 'plugin/thread', label: $localize`🧵️ threads`, title: $localize`Discussion Threads or DMs`, group: $localize`Plugins 🧰️` },
    ],
    reply: ['internal', 'plugin/thread'],
  },
  generateMetadata: true,
};
