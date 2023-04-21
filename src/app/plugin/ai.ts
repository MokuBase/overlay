import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const aiQueryPlugin: Plugin = {
  tag: 'plugin/ai',
  name: '👻️💭️ AI Query Action',
  config: {
    type: 'tool',
    default: false,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    icons: [{ label: $localize`👻️💭️`}],
    submitInternal: '👻️ chat',
    filters: [
      { query: 'plugin/ai', label: $localize`👻️💭️ ai query`, group: $localize`Plugins 🧰️` },
    ],
    actions: [
      { tag: 'plugin/ai', labelOff: $localize`ai`, global: true }
    ],
    description: $localize`Create tabular data.`,
  },
};

export const aiPlugin: Plugin = {
  tag: '+plugin/ai',
  name: '👻️ AI',
  config: {
    type: 'tool',
    default: false,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    icons: [{ label: $localize`👻️`}],
    filters: [
      { query: '+plugin/ai', label: $localize`👻️ ai`, group: $localize`Plugins 🧰️` },
    ],
    description: $localize`AI response to source prompts.`,
    systemPrompt: $localize`You are a helpful assistant in a digital library.`,
    authorPrompt: $localize`You have been sent the following message from {author}: `,
    instructionPrompt: $localize`Write a response excluding salutations and regards. `,
  },
  schema: {},
  generateMetadata: true,
};
