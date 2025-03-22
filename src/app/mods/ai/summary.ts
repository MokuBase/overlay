import { DateTime } from 'luxon';
import { Plugin } from '../../model/plugin';
import { Ref } from '../../model/ref';
import { Mod } from '../../model/tag';

export const summaryQueryPlugin: Plugin = {
  tag: 'plugin/delta/ai/summary',
  name: '✂️️💭️ Summarize',
  config: {
    mod: $localize`✂️ Summarize`,
    type: 'tool',
    default: false,
    add: true,
    signature: '+plugin/delta/ai/summary',
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    description: $localize`Send this Ref to the ai to create a summary response.`,
    filters: [
      { query: 'plugin/delta/ai/summary', label: $localize`✂️️💭️ summarized`, title: $localize`Has AI generated summary`, group: $localize`Notifications ✉️` },
    ],
    advancedActions: [
      { tag: 'plugin/delta/ai/summary', labelOff: $localize`summarize`, global: true }
    ],
    timeoutMs: 30_000,
    language: 'javascript',
    // language=JavaScript
    script: `
      const bundle = { ref: [] };
      const uuid = require('uuid');
      const axios = require('axios');
      const ref = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
      const origin = ref.origin || '';
      const authors = ref.tags.filter(tag => tag === '+user' || tag === '_user' || tag.startsWith('+user/') || tag.startsWith('_user/'));
      const existingResponse = (await axios.get(process.env.JASPER_API + '/api/v1/ref/page', {
        headers: {
          'Local-Origin': origin || 'default',
          'User-Tag': authors[0] || '',
        },
        params: {
          query: '+plugin/placeholder:!+plugin/delta:' + authors.map(a => a.substring(1)).join(':'),
          responses: ref.url,
          size: 1,
        },
      })).data.content[0];
      if (existingResponse) process.exit(0);
      const response = {
        origin,
        url: 'ai:' + uuid.v4(),
        title: ref.title ? 'Summary of: ' + ref.title : 'Summary',
        comment: '+plugin/delta/ai/summary is working...',
        tags: ['+plugin/placeholder'],
      };
      bundle.ref.push(response);
      response.tags.push(...authors.map(a => a.startsWith('+') || a.startsWith('_') ? a.substring(1) : a));
      if (ref.tags.includes('public')) response.tags.push('public');
      if (ref.tags.includes('internal')) response.tags.push('internal');
      if (ref.tags.includes('dm')) response.tags.push('dm', 'internal', 'plugin/thread');
      if (ref.tags.includes('plugin/comment')) response.tags.push('plugin/comment', 'internal');
      if (ref.tags.includes('plugin/thread')) response.tags.push('plugin/thread', 'internal');
      const chatTags = ref.tags.filter(t => t === 'chat' || t.startsWith('chat/'));
      if (chatTags.length) {
        response.tags.push(chatTags);
      }
      const uniq = (v, i, a) => a.indexOf(v) === i;
      response.tags = response.tags.filter(uniq);
      const sources = [ref.url];
      if (ref.sources && (ref.tags.includes('plugin/thread') || ref.tags.includes('plugin/comment'))) {
        sources.push(ref.sources[1] || ref.sources[0] || ref.url);
      } else {
        sources.push(ref.url);
      }
      response.sources = [...sources, 'system:summary-prompt'].filter(s => !!s);
      console.log(JSON.stringify(bundle));
    `
  }
};

export const summaryPlugin: Plugin = {
  tag: '+plugin/delta/ai/summary',
  name: '✂️️ Summary',
  config: {
    mod: $localize`✂️ Summarize`,
    type: 'tool',
    default: false,
    signature: '+plugin/delta/ai/summary',
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    description: $localize`AI signature tag. Plugin configures OpenAi to respond to 'plugin/summary' prompts
    and sign this response with this tag. Plugin data contains token usage stats.`,
    icons: [{ thumbnail: $localize`✂️️`, order: 1 }],
    filters: [
      { query: '+plugin/delta/ai/summary', label: $localize`✂️️ summary`, title: $localize`Summaries generated by AI`, group: $localize`Delta Δ` },
    ],
    advancedActions: [
      { tag: '+plugin/delta/ai/summary', labelOn: $localize`redo`, title: $localize`Redo summary` },
      { tag: 'plugin/alias/plugin/delta/ai/summary', labelOff: $localize`redo`, title: $localize`Redo summary` },
    ]
  }
};

export const summaryPrompt: Ref = {
  url: 'system:summary-prompt',
  title: $localize`Summarize Prompt`,
  tags: ['public', 'internal', '+system/prompt'],
  comment: $localize`Summarize the following without loosing any important details and do not include any salutations:`,
};

export const summaryMod: Mod = {
  ref: [
    summaryPrompt,
  ],
  plugin: [
    summaryQueryPlugin,
    summaryPlugin,
  ],
};
