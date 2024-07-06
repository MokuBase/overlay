import { $localize } from '@angular/localize/init';
import * as moment from 'moment';
import { Plugin } from '../model/plugin';
import { Mod } from '../model/tag';

export const dalleQueryPlugin: Plugin = {
  tag: 'plugin/delta/dalle',
  name: $localize`👨️‍🎨️💭️ Ask DALL·E`,
  config: {
    mod: $localize`👨️‍🎨️ DALL·E Chat`,
    type: 'tool',
    default: false,
    add: true,
    signature: '+plugin/delta/dalle',
    reply: ['plugin/delta/dalle'],
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Send this Ref to DALL-E for response.`,
    aiInstructions: `# plugin/delta/dalle
    The DALL-E AI responds to the tag plugin/delta/dalle.
    If you are requested to draw an image or generate a DALL-E prompt, always assume you are to forward your message to DALL-E by including this tag.
    DALL-E prompt must be length 1000 or less. If you generate too many characters (title if present + ': ') plus length of comment, the image will not generate.
    Messages signed by DALL-E will have the tag +plugin/delta/dalle.
    Tagging a post plugin/delta/dalle will send that post title and comment to the DALL-E API as a prompt.
    DALL-E will return a single image per invocation. To generate multiple images, create multiple Refs.
    For example, in response to:
    {
      "url": "comment:ai-1",
      "comment": "Draw 16 pictures of lakes and mountains and tag them #public #nature. Then create a 4x4 tiled embed.",
      "tags": ["public", "+user/chris", "plugin/delta/ai"]
    }

    You could respond:
    {
      "ref": [{
        "sources": ["comment:ai-1"],
        "comment":"I have forwarded the request to create 16 pictures of lakes and mountains to DALL-E. They will be tagged #public #nature. Additionally, once created, you can view them in a 4x4 tiled embed using the following lens: ![Nature Scenes](/tag/plugin/image:nature?cols=4).",
        "tags": ["public", "plugin/inbox/user/chris", "+plugin/delta/ai"]
      }, {
        "comment": "A winter scene of a frozen mountain lake with a lone wolf traversing the icy landscape in the quiet snowfall",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A vibrant rainbow arching over a mountain lake with cascading waterfalls in the lush green valley",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "An old wooden cabin on the shore of a mountain lake, with trees displaying colorful fall foliage",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A cozy campfire by a remote mountain lake, with the Milky Way stretching across the night sky above",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A mountain biker pausing to overlook a vast lake with towering peaks in the distance at sunset",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A pristine mountain lake with crystal-clear waters revealing the rocky depths below, framed by a lush green forest",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "Fireflies illuminating the evening sky over a calm mountain lake as twilight settles in",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A high-altitude lake offering a panoramic view of the expansive mountain range and a clear blue sky",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A misty morning on a mountain lake with a wooden pier extending into the water, surrounded by autumn foliage",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A lone kayaker on a tranquil mountain lake, paddling gently as the sun rises over the distant peaks",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A secluded mountain lake with wild horses grazing peacefully by the water's edge at dusk",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "Mirror-like mountain lake reflecting the moody, cloudy sky and the dense, forested slopes surrounding it",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "Lush wildflowers lining the shore of a mountain lake with rugged peaks in the background under a clear blue sky",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "Golden-hour light casting a warm glow over a serene lake surrounded by majestic mountains in autumn",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A starry night sky above a snow-capped mountain range with the aurora borealis reflecting on a frozen lake",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }, {
        "comment": "A serene sunrise over a crystal-clear mountain lake with the reflection of the surrounding pine trees",
        "tags": ["public", "nature", "plugin/delta/dalle", "+plugin/delta/ai"]
      }],
      "ext": []
    }

    When asked to draw an image, do not make any reference to DALL-E. Simply create a private message to DALL-E
    with the appropriate prompt, and set the url to 'ai:prompt'. Include in your prior Ref response a link to
    the DALL-E response using a response query:
    ![](/tag/+plugin/delta/dalle?view=plugin/image&filter=responses/ai:prompt&filter=query/plugin/image&pageSize=1&cols=1)
    For example, in response to:
    {
      "url": "comment:ai-1",
      "comment": "Draw a picture of a heroic pie eating contest.",
      "tags": ["public", "plugin/thread", "+user/chris", "plugin/delta/ai"]
    }

    You could respond:
    {
      "ref": [{
        "sources": ["comment:ai-2"],
        "comment":"Behold! The heroic pie eating contest: ![](/tag/+plugin/delta/dalle?view=plugin/image&filter=responses/ai:prompt&filter=query/plugin/image&pageSize=1&cols=1)",
        "tags": ["public", "internal", "plugin/thread", "plugin/inbox/user/chris", "+plugin/delta/ai"]
      }, {
        "url": "ai:prompt",
        "comment": "Heroic pie eating contest",
        "tags": ["public", "internal", "plugin/thread", "plugin/delta/dalle", "+plugin/delta/ai"]
      }],
      "ext": []
    }
    `,
    icons: [{ thumbnail: $localize`💭️`, order: -1 }],
    filters: [
      { query: 'plugin/delta/dalle', label: $localize`👨️‍🎨️💭️ dalle query`, group: $localize`Notifications ✉️` },
    ],
    advancedActions: [
      { tag: 'plugin/delta/dalle', labelOff: $localize`ask dalle`, global: true }
    ],
    timeoutMs: 30_000,
    language: 'javascript',
    // language=JavaScript
    script: `
      const uuid = require('uuid');
      const axios = require('axios');
      const OpenAi = require('openai');
      const { Buffer } = require('node:buffer');
      const ref = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
      const origin = ref.origin || ''
      const config = ref.plugins?.['plugin/delta/dalle'];
      const apiKey = (await axios.get(process.env.JASPER_API + '/api/v1/ref/page', {
        headers: {
          'Local-Origin': origin || 'default',
          'User-Role': 'ROLE_ADMIN',
        },
        params: { query: (config?.apiKeyTag || '+plugin/secret/openai') + origin },
      })).data.content[0].comment;
      const openai = new OpenAi({ apiKey });
      const gen = await openai.images.generate({
        model: config?.model || 'dall-e-3',
        prompt: (ref.title ? ref.title + ': ' : '') + (ref.comment || ''),
        size: config?.size || '1024x1024',
        quality: config?.quality || 'hd',
        style: config?.style || 'vivid',
        response_format: config?.useUrl ? 'url' : 'b64_json',
      });
      let tags = ['+plugin/delta/dalle', 'plugin/image', 'plugin/thumbnail', 'plugin/alt'];
      if (!config?.useUrl) tags.push('_plugin/cache');
      if (ref.tags?.includes('public')) tags.push('public');
      if (ref.tags?.includes('internal')) tags.push('internal');
      if (ref.tags?.includes('dm')) tags.push('dm', 'internal', 'plugin/thread');
      if (ref.tags?.includes('plugin/comment')) tags.push('plugin/comment', 'internal');
      if (ref.tags?.includes('plugin/thread')) tags.push('plugin/thread', 'internal');
      const authors = ref.tags?.filter(tag => tag === '+user' || tag === '_user' || tag.startsWith('+user/') || tag.startsWith('_user/')) || [];
      const mailboxes = ref.tags?.filter(tag => tag.startsWith('plugin/inbox') || tag.startsWith('plugin/outbox')) || [];
      tags.push(...mailboxes, ...authors.map(tag => 'plugin/inbox/' + tag.substring(1)));
      tags = tags.filter((v, i, a) => a.indexOf(v) === i);
      const sources = [ref.url];
      if (ref.tags?.includes('plugin/thread') || ref.tags?.includes('plugin/comment')) {
        if (ref.sources?.length === 1) {
          sources.push(ref.sources[0]);
        } else if (ref.sources?.length > 1) {
          sources.push(ref.sources[1]);
        }
      }
      let image;
      if (config?.useUrl) {
        await axios.get(process.env.JASPER_CACHE_API + '/api/v1/scrape', {
          headers: {
            'Local-Origin': origin || 'default',
            'User-Role': 'ROLE_ADMIN',
          },
          params: { url: gen.data[0].url },
        });
        image = {
          url: 'dalle:' + uuid.v4(),
          plugins: { 'plugin/image': { url: gen.data[0].url } }
        }
      } else {
        image = (await axios.post(process.env.JASPER_CACHE_API + '/pub/api/v1/repl/cache', Buffer.from(gen.data[0].b64_json, 'base64'), {
          headers: {
            'User-Role': 'ROLE_ADMIN',
            'User-Tag': '+plugin/delta/dalle',
            'Content-Type': 'image/png',
          },
          params: { mime: 'image/png' },
        })).data;
        delete image.metadata;
      }
      image.sources = sources;
      image.tags = tags;
      image.comment = gen.data[0].revised_prompt;
      console.log(JSON.stringify({
        ref: [image],
      }));
    `,
    advancedForm: [{
      key: 'provider',
      type: 'select',
      props: {
        label: $localize`Provider:`,
        options: [
          { value: 'openai', label: $localize`OpenAI` },
        ],
      },
    }, {
      key: 'apiKeyTag',
      type: 'tag',
      props: {
        label: $localize`🔑️ API Key Tag:`,
      },
    }, {
      key: 'model',
      type: 'string',
      props: {
        label: $localize`Model:`,
      },
    }, {
      key: 'size',
      type: 'select',
      props: {
        label: $localize`Size:`,
        options: [
          { value: '1024x1024', label: $localize`Square` },
          { value: '1792x1024', label: $localize`Landscape` },
          { value: '1024x1792', label: $localize`Portrait` },
        ],
      },
    }, {
      key: 'quality',
      type: 'select',
      props: {
        label: $localize`Quality:`,
        options: [
          { value: 'hd', label: $localize`HD` },
          { value: 'standard', label: $localize`Standard` },
        ],
      },
    }, {
      key: 'style',
      type: 'select',
      props: {
        label: $localize`Style:`,
        options: [
          { value: 'vivid', label: $localize`Vivid` },
          { value: 'natural', label: $localize`Natural` },
        ],
      },
    }, {
      key: 'useUrl',
      type: 'boolean',
      props: {
        label: $localize`Use URL:`,
      },
    }],
  },
  defaults: {
    provider: 'openai',
    apiKeyTag: '+plugin/secret/openai',
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
    useUrl: true,
    // TODO: multiple images
  },
  schema: {
    optionalProperties: {
      provider: { type: 'string' },
      apiKeyTag: { type: 'string' },
      model: { type: 'string' },
      size: { type: 'string' },
      quality: { type: 'string' },
      style: { type: 'string' },
      useUrl: { type: 'boolean' },
    }
  }
};

export const dallePlugin: Plugin = {
  tag: '+plugin/delta/dalle',
  name: $localize`👨️‍🎨️ DALL·E`,
  config: {
    mod: $localize`👨️‍🎨️ DALL·E Chat`,
    type: 'tool',
    default: false,
    genId: true,
    submit: '👨️‍🎨️💭️',
    submitDm: $localize`Draw something...`,
    signature: '+plugin/delta/dalle',
    reply: ['plugin/delta/dalle'],
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    icons: [{ thumbnail: $localize`👨️‍🎨️`, order: 1 }],
    filters: [
      { query: '+plugin/delta/dalle', label: $localize`👨️‍🎨️ dalle`, group: $localize`Delta Δ` },
    ],
    description: $localize`DALL-E signature tag. Plugin configures DALL-E to respond to 'plugin/delta/dalle' prompts
    and sign this response with this tag`,
  },
  generateMetadata: true,
};

export const dalleMod: Mod = {
  plugins: {
    dalleQueryPlugin,
    dallePlugin,
  },
};
