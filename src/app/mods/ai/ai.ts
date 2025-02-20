import { DateTime } from 'luxon';
import { Plugin } from '../../model/plugin';
import { Mod } from '../../model/tag';

export const aiQueryPlugin: Plugin = {
  tag: 'plugin/delta/ai',
  name: $localize`👻️💭️ AI Query`,
  config: {
    mod: $localize`👻️ AI Chat`,
    type: 'tool',
    default: false,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    description: $localize`Send this Ref to the ai for response.`,
    icons: [{ thumbnail: $localize`💭️`, order: -1 }],
    filters: [
      { query: 'plugin/delta/ai', label: $localize`👻️💭️ ai query`, title: $localize`AI prompt`, group: $localize`Notifications ✉️` },
    ],
    timeoutMs: 300_000,
    language: 'javascript',
    // language=JavaScript
    script: `
      const uuid = require('uuid');
      const axios = require('axios');
      const ref = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
      const origin = ref.origin || ''
      const config = ref.plugins?.['plugin/delta/ai'];
      const followup = ref.tags.includes('+plugin/delta/ai');
      const authors = ref.tags.filter(tag => tag === '+user' || tag === '_user' || tag.startsWith('+user/') || tag.startsWith('_user/'));
      const apiKey = (await axios.get(process.env.JASPER_API + '/api/v1/ref/page', {
        headers: {
          'Local-Origin': origin || 'default',
          'User-Role': 'ROLE_ADMIN',
        },
        params: { query: (config?.apiKeyTag || '+plugin/secret/openai') + origin },
      })).data.content[0]?.comment;
      let response = (await axios.get(process.env.JASPER_API + '/api/v1/ref/page', {
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
      const sources = (await axios.get(process.env.JASPER_API + '/api/v1/ref/page', {
        headers: {
          'Local-Origin': origin || 'default',
          'User-Tag': authors[0] || '',
        },
        params: {
          sources: response.url,
          sort: 'published',
          size: config.maxSources,
        },
      })).data.content;
      const messages = [];
      if (response.sources.includes('system:ext-prompt')) {
        const exts = new Map();
        const getExt = async tag => {
          try {
            return (await axios.get(process.env.JASPER_API + '/api/v1/ext', {
              headers: {
                'Local-Origin': origin || 'default',
                'User-Tag': authors[0] || '',
              },
              params: { tag: tag + origin },
            })).data;
          } catch (e) {
            return null;
          }
        };
        const loadTags = async tags => {
          for (const t of tags || []) {
            if (exts.has(t)) continue;
            // TODO: handle missing ext error?
            const ext = await getExt(t);
            if (ext) exts.set(t, ext);
          }
        }
        await loadTags(response.tags);
        await loadTags(response.sources.filter(t => t.startsWith('tag:/')).map(t => t.substring('tag:/'.length)));
        if (exts.length) messages.push({ role: 'system', content: { url: 'system:ext-prompt', origin, title: 'Ext Sources', comment: JSON.stringify(exts) } });
      }
      if (config.systemPrompt) {
        messages.push({ role: 'system', content: { url: 'system:app-prompt-override', origin, title: 'App Prompt Override', comment: config.systemPrompt } });
      }
      for (const c of sources) {
        const role
          = c.tags?.includes('+system/prompt') ? 'system'
          : c.tags?.includes('+plugin/delta/ai/navi') ? 'assistant'
          : 'user';
        messages.push({ role, content: JSON.stringify(c) });
      }
      let completion;
      let usage;
      if (!config?.provider || config.provider === 'openai') {
        const OpenAi = require('openai');
        const openai = new OpenAi({ apiKey });
        const model = config?.model || 'o3-mini';
        const res = await openai.chat.completions.create({
          model,
          max_completion_tokens: config?.maxTokens || 4096,
          response_format: { 'type': 'json_object' },
          messages,
        });
        completion = res.choices[0]?.message?.content;
        usage = res.usage;
      } else if (config.provider === 'x') {
        const OpenAi = require('openai');
        const openai = new OpenAi({ apiKey, baseURL: 'https://api.x.ai/v1' });
        const model = config?.model || 'grok-2-latest';
        const res = await openai.chat.completions.create({
          model,
          max_completion_tokens: config?.maxTokens || 4096,
          response_format: { 'type': 'json_object' },
          messages,
        });
        completion = res.choices[0]?.message?.content;
        usage = res.usage;
      } else if (config.provider === 'ds') {
        const OpenAi = require('openai');
        const openai = new OpenAi({ apiKey, baseURL: 'https://api.deepseek.com' });
        const model = config?.model || 'deepseek-reasoner';
        const res = await openai.chat.completions.create({
          model,
          max_completion_tokens: config?.maxTokens || 4096,
          response_format: { 'type': 'json_object' },
          messages,
        });
        completion = res.choices[0]?.message?.content;
        usage = res.usage;
      } else if (config?.provider === 'anthropic') {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });
        const system = messages.filter(m => m.role === 'system').map(m => m.content).join("\\n\\n");
        messages.push({ role: 'assistant', content: '{"ref":['});
        const res = await anthropic.messages.create({
          model: config?.model || 'claude-3-5-sonnet-latest',
          max_tokens: config?.maxTokens || 4096,
          system,
          messages: messages.filter(m => m.role !== 'system'),
        });
        function fixJsonLinefeeds(json) {
          return json.replace(/"(?:\\\\.|[^"])*"|[^"]+/g, (match) => {
            if (match.startsWith('"')) {
              // This is a string, replace linefeeds
              return match.replace(/\\n/g, '\\\\n');
            }
            // This is not a string, return as-is
            return match;
          });
        }
        completion = fixJsonLinefeeds('{"ref":[' + res.content[0]?.text);
        usage = {
          'prompt_tokens': res.usage.input_tokens,
          'completion_tokens': res.usage.output_tokens,
          'total_tokens': res.usage.input_tokens + res.usage.output_tokens,
        };
      } else if (config?.provider === 'gemini') {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const system = messages.filter(m => m.role === 'system').map(m => m.content).join("\\n\\n");
        const model = genAI.getGenerativeModel({
          model: config?.model || 'gemini-2.0-flash',
        });
        const result = await model.generateContent({
          contents: messages.filter(m => m.role !== 'system').map( c => ({ role: c.role, parts: [{ text: c.content }]})),
          systemInstruction: system,
        });
        completion = result.response.text().trim();
        while (completion && !completion.startsWith('{')) completion = completion.substring(1).trim();
        while (completion && !completion.endsWith('}')) completion = completion.substring(0, completion.length - 1).trim();
        usage = {
          'prompt_tokens': result.response.usageMetadata.promptTokenCount,
          'completion_tokens': result.response.usageMetadata.candidatesTokenCount,
          'total_tokens': result.response.usageMetadata.totalTokenCount,
        };
      }
      let bundle;
      try {
        bundle = JSON.parse(completion);
        if (!bundle.ref) {
          // Model returned a bare Ref?
          bundle = {
            ref: [bundle],
          };
        }
      } catch (e) {
        console.error('Error parsing completion:', e);
        console.error(completion);
        process.exit(1);
      }
      const completionRef = bundle.ref[0];
      bundle.ref[0] = response;
      delete response.metadata;
      response.title = completionRef.title;
      response.comment = completionRef.comment;
      response.plugins ||= {};
      response.plugins['+plugin/delta/ai'] = {
        ...config,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
      };
      const chatTags = ref.tags.filter(t => t === 'chat' || t.startsWith('chat/'));
      if (!chatTags.length){
        const mailboxes = ref.tags.filter(tag => tag.startsWith('plugin/inbox') || tag.startsWith('plugin/outbox'));
        response.tags.push(...mailboxes, ...authors.map(tag => 'plugin/inbox/' + tag.substring(1)));
      }
      const uniq = (v, i, a) => a.indexOf(v) === i;
      response.tags = [...response.tags, ...completionRef.tags || [], '+plugin/delta/ai'].filter(uniq).filter(t => t !== '+plugin/placeholder');
      if (followup && response.tags.find(t => t.startWith('plugin/delta/ai'))) {
        // Only allow one cycle of follow-ups
        response.tags = response.tags.filter(t => !t.startWith('plugin/delta/ai'));
      }
      response.sources = [...response.sources, ...(completionRef.sources || []).filter(uniq).filter(s => !sources.includes(s))];
      // TODO: Allow AI to add some protected tags
      const publicTagRegex = /^[a-z0-9]+(?:[./][a-z0-9]+)*$/;
      for (let i = 0; i < bundle.ref.length; i++) {
        const r = bundle.ref[i];
        if (i) {
          if (r.tags?.includes('dm')) r.tags.push('plugin/thread');
          if (r.tags?.includes('plugin/thread')) r.tags.push('internal');
          if (r.tags?.includes('plugin/comment')) r.tags.push('internal');
          r.tags = (r.tags || [])
            .filter(t => publicTagRegex.test(t) || t === '+plugin/delta/ai')
            .filter(uniq);
        }
        delete r.metadata;
        const oldUrl = i === 0 ? completionRef.url : r.url;
        // TODO: only replace comment: urls
        if (oldUrl && (oldUrl.startsWith('http:') || oldUrl.startsWith('https:'))) continue;
        const newUrl = i === 0 ? r.url : r.url = 'ai:' + uuid.v4();
        if (!oldUrl) continue;
        for (const rewrite of bundle.ref) {
          for (let i = 0; i < rewrite.sources?.length; i++) {
            if (rewrite.sources[i] === oldUrl) rewrite.sources[i] = newUrl;
          }
          if (rewrite.comment) {
            rewrite.comment = rewrite.comment
              .replaceAll('](' + oldUrl + ')', '](' + newUrl + ')')
              .replaceAll('](/ref/' + oldUrl + ')', '](/ref/' + newUrl + ')')
              .replaceAll('url=' + oldUrl, 'url=' + newUrl)
              .replaceAll('sources/' + oldUrl, 'sources/' + newUrl)
              .replaceAll('responses/' + oldUrl, 'responses/' + newUrl)
              .replaceAll('sources%2F' + oldUrl, 'sources%2F' + newUrl)
              .replaceAll('responses%2F' + oldUrl, 'responses%2F' + newUrl);
          }
        }
      }
      console.log(JSON.stringify(bundle));
    `,
    advancedForm: [{
      key: 'provider',
      type: 'select',
      props: {
        label: $localize`Provider:`,
        options: [
          { value: 'openai', label: $localize`OpenAI` },
          { value: 'anthropic', label: $localize`Anthropic` },
          { value: 'x', label: $localize`xAI` },
          { value: 'gemini', label: $localize`Gemini` },
          { value: 'ds', label: $localize`Deep Seek` },
        ],
      },
    }, {
      key: 'apiKeyTag',
      type: 'tag',
      props: {
        label: $localize`🔑️ API Key Tag:`,
        prefix: '+plugin/secret',
      },
    }, {
      key: 'model',
      type: 'string',
      props: {
        label: $localize`Model:`,
      },
    }, {
      key: 'systemPrompt',
      type: 'textarea',
      props: {
        label: $localize`System Prompt:`,
      },
    }],
  },
  defaults: {
    provider: 'gemini',
    apiKeyTag: '+plugin/secret/gemini',
    model: 'gemini-2.0-flash',
    maxTokens: 4096,
    maxContext: 7,
    maxSources: 2000,
  },
  schema: {
    optionalProperties: {
      provider: { type: 'string' },
      apiKeyTag: { type: 'string' },
      model: { type: 'string' },
      maxTokens: { type: 'uint32' },
      maxContext: { type: 'uint32' },
      maxSources: { type: 'uint32' },
      systemPrompt: { type: 'string' },
    }
  }
};

export const aiPlugin: Plugin = {
  tag: '+plugin/delta/ai',
  name: $localize`👻️ AI`,
  config: {
    mod: $localize`👻️ AI Chat`,
    type: 'tool',
    default: false,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    filters: [
      { query: '+plugin/delta/ai', label: $localize`👻️ ai`, title: $localize`AI generated message`, group: $localize`Delta Δ` },
    ],
    // language=Handlebars
    infoUi: `{{#if model}}<span style="user-select:none;cursor:zoom-in" title="{{model}}: {{usage.totalTokens}} ({{usage.promptTokens}} + {{usage.completionTokens}})">ℹ️ ({{provider}})</span>{{/if}}`,
  },
  schema: {
    optionalProperties: {
      provider: { type: 'string' },
      apiKeyTag: { type: 'string' },
      model: { type: 'string' },
      maxTokens: { type: 'uint32' },
      maxContext: { type: 'uint32' },
      maxSources: { type: 'uint32' },
      systemPrompt: { type: 'string' },
      usage: {
        optionalProperties: {
          promptTokens: { type: 'uint32' },
          completionTokens: { type: 'uint32' },
          totalTokens: { type: 'uint32' },
        }
      }
    },
  },
  generateMetadata: true,
};

export const aiMod: Mod = {
  plugin: [
    aiPlugin,
    aiQueryPlugin,
  ],
};
