import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const commentPlugin: Plugin = {
  tag: 'plugin/comment',
  name: $localize`💬️ Comment`,
  config: {
    type: 'viewer',
    default: true,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Activates built-in comment support and allows users to create comments.`,
    filters: [
      { query: 'plugin/comment', label: $localize`💬️ comments`, group: $localize`Plugins 🧰️` },
    ],
    reply: ['internal', 'plugin/comment'],
  },
  defaults: {},
  schema: {
    optionalProperties: {
      deleted: { type: 'boolean' },
    },
  },
  generateMetadata: true,
};
