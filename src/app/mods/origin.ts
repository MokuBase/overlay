import { DateTime } from 'luxon';
import { Plugin } from '../model/plugin';
import { Ref } from '../model/ref';
import { Mod } from '../model/tag';
import { hasTag } from '../util/tag';

export const originPlugin: Plugin = {
  tag: '+plugin/origin',
  name: $localize`🏛️ Remote Origin`,
  config: {
    mod: $localize`🏛️ Remote Origin`,
    default: true,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    submit: $localize`🏛️ origin`,
    settings: $localize`origin`,
    icons: [{ label: $localize`🏛️`, order: 3 }],
    description: $localize`Replicate a remote Jasper instance. The remote
     origin will be scraped on an interval you specify.
     If the remote is also set up to replicate from this instance, you may
     communicate with remote users.
     You may configure if metadata is generated or plugins are validated. `,
    form: [{
      key: 'local',
      id: 'local',
      type: 'origin',
      props: {
        label: $localize`Local:`
      }
    }, {
      key: 'remote',
      id: 'remote',
      type: 'origin',
      props: {
        label: $localize`Remote:`
      }
    }],
    advancedForm: [{
      key: 'proxy',
      id: 'proxy',
      type: 'url',
      props: {
        label: $localize`Proxy:`
      }
    }],
  },
  schema: {
    optionalProperties: {
      local: { type: 'string' },
      remote: { type: 'string' },
      proxy: { type: 'string' },
    },
  },
};

export const originPullPlugin: Plugin = {
  tag: '+plugin/origin/pull',
  name: $localize`🏛️📥️ Remote Origin Pull`,
  config: {
    mod: $localize`🏛️ Remote Origin`,
    default: true,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    submitChild: $localize`📥️ pull`,
    description: $localize`Replicate a remote Jasper instance. The remote
      origin will be scraped on an interval you specify.
      If the remote is also set up to replicate from this instance, you may
      communicate with remote users.
      You may configure if metadata is generated or plugins are validated. `,
    icons: [
      { label: $localize`📥️` },
      { tag: '-+plugin/cron', label: $localize`🚫️`, title: $localize`Pulling disabled`, order: -1 },
      { tag: '+plugin/cron', condition: 'websocket', label: $localize`📶️`, title: $localize`Pulling on websocket monitor`, order: -1 },
    ],
    actions: [
      { tag: '+plugin/cron', labelOn: $localize`disable`, labelOff: $localize`enable` },
    ],
    advancedActions: [
      { response: '+plugin/run', labelOff: $localize`pull`, title: $localize`Pull a batch of updates from the remote.`, confirm: $localize`Are you sure you want to pull?` },
      { response: '+plugin/run', labelOn: $localize`cancel`, title: $localize`Cancel pulling.` },
    ],
    // language=Handlebars
    infoUi: `
      {{#if (interestingTags addTags)}} tagging refs {{/if}}
      {{#each (interestingTags addTags)}}
        #{{.}}
      {{/each}}`,
    form: [{
      key: 'cache',
      type: 'boolean',
      props: {
        label: $localize`Prefetch Cache during Replicate:`,
      }
    }, {
      key: 'cacheProxy',
      type: 'boolean',
      props: {
        label: $localize`Proxy All Requests Through Cache:`,
      }
    }, {
      key: 'cacheProxyPrefetch',
      type: 'boolean',
      props: {
        label: $localize`Prefetch Proxy Cache during Replicate:`,
      }
    }, {
      key: 'websocket',
      type: 'boolean',
      props: {
        label: $localize`Listen to Websocket Cursor updates to Pull:`,
      }
    }],
    advancedForm: [{
      key: 'query',
      type: 'query'
    }, {
      key: 'removeTags',
      type: 'tags',
      props: {
        label: $localize`Remove Tags:`,
      }
    }, {
      key: 'batchSize',
      type: 'integer',
      defaultValue: 250,
      props: {
        label: $localize`Batch Size:`,
      }
    }, {
      key: 'generateMetadata',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Generate Metadata (slow):`,
        title: $localize`
          Turn this off to replicate a large amount very quickly.
          Turn back on for faster metadata generation`,
      }
    }, {
      key: 'validatePlugins',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Validate Plugins:`,
      }
    }, {
      key: 'stripInvalidPlugins',
      type: 'boolean',
      props: {
        label: $localize`Strip Invalid Plugins:`,
      }
    }, {
      key: 'validateTemplates',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Validate Templates:`,
      }
    }, {
      key: 'stripInvalidTemplates',
      type: 'boolean',
      props: {
        label: $localize`Strip Invalid Templates:`,
      }
    }],
  },
  defaults: {
    cache: true,
    websocket: true,
    generateMetadata: true,
    validatePlugins: true,
    validateTemplates: true,
  },
  schema: {
    optionalProperties: {
      cache: { type: 'boolean' },
      cacheProxy: { type: 'boolean' },
      cacheProxyPrefetch: { type: 'boolean' },
      websocket: { type: 'boolean' },
      query: { type: 'string' },
      batchSize: { type: 'int32' },
      generateMetadata: { type: 'boolean' },
      validatePlugins: { type: 'boolean' },
      stripInvalidPlugins: { type: 'boolean' },
      validateTemplates: { type: 'boolean' },
      stripInvalidTemplates: { type: 'boolean' },
      originFromTag: { type: 'string' },
      addTags: { elements: { type: 'string' } },
      removeTags: { elements: { type: 'string' } },
    },
  },
};

export const originPushPlugin: Plugin = {
  tag: '+plugin/origin/push',
  name: $localize`🏛️📤️ Remote Origin Push`,
  config: {
    mod: $localize`🏛️ Remote Origin`,
    default: true,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    submitChild: $localize`📤️ push`,
    description: $localize`Pushed modifications to a remote origin.
      On the scrape interval set, the server will check if the remote cursor is
      behind the local cursor. If writeOnly is set, this check is skipped and
      the lastModifiedWritten config is used instead.`,
    icons: [
      { label: $localize`📤️` },
      { tag: '-+plugin/cron', label: $localize`🚫️`, title: $localize`Pushing disabled`, order: -1 },
      { tag: '+plugin/cron', condition: 'pushOnChange', label: $localize`📶️`, title: $localize`Pushing on change`, order: -1 },
    ],
    actions: [
      { tag: '+plugin/cron', labelOn: $localize`disable`, labelOff: $localize`enable` },
    ],
    advancedActions: [
      { response: '+plugin/run', labelOff: $localize`push`, title: $localize`Push a batch of updates to the remote.`, confirm: $localize`Are you sure you want to push?` },
      { response: '+plugin/run', labelOn: $localize`cancel`, title: $localize`Cancel pushing` },
    ],
    // language=Handlebars
    infoUi: `
      {{#if (and (hasTag '+plugin/origin/pull' ref) (hasTag '+plugin/origin/push' ref))}}
        <span title="Pushing and Pulling is not recommended">⛔️</span>
      {{/if}}`,
    form: [{
      key: 'pushOnChange',
      type: 'boolean',
      props: {
        label: $localize`Push on change`,
      }
    }, {
      key: 'cache',
      type: 'boolean',
      props: {
        label: $localize`Push cache`,
      }
    }],
    advancedForm: [{
      key: 'query',
      type: 'query'
    }, {
      key: 'batchSize',
      type: 'integer',
      defaultValue: 250,
      props: {
        label: $localize`Batch Size:`,
      }
    }],
  },
  defaults: {
    pushOnChange: true,
    cache: true,
  },
  schema: {
    optionalProperties: {
      pushOnChange: { type: 'boolean' },
      cache: { type: 'boolean' },
      query: { type: 'string' },
      batchSize: { type: 'int32' },
    },
  },
};

export const originTunnelPlugin: Plugin = {
  tag: '+plugin/origin/tunnel',
  name: $localize`🏛️🕳️️️ Origin Tunnel`,
  config: {
    mod: $localize`🏛️ Remote Origin`,
    experimental: true,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    submitChild: $localize`🕳️️️ tunnel`,
    icons: [{ label: $localize`🕳️️️` }],
    description: $localize`Create an SSH tunnel`,
    advancedForm: [{
      key: 'remoteUser',
      type: 'quser',
      props: {
        label: $localize`Remote User:`,
      },
    }, {
      key: 'sshHost',
      type: 'input',
      props: {
        label: $localize`SSH Host:`,
      },
    }, {
      key: 'sshPort',
      type: 'number',
      props: {
        label: $localize`SSH Port:`,
        min: 22,
      },
    }],
  },
  schema: {
    optionalProperties: {
      remoteUser: { type: 'string' },
      sshHost: { type: 'string' },
      sshPort: { type: 'uint32' },
    },
  },
};

export function isReplicating(local: string, remote: Ref, apis: Map<string, string>) {
  if (!hasTag('+plugin/origin/pull', remote)) return false;
  const plugin = remote.plugins?.['+plugin/origin'];
  if (plugin.proxy && apis.has(plugin.proxy)) return apis.get(plugin.proxy) === (plugin.remote || '');
  if (apis.has(remote.url)) return apis.get(remote.url) === (plugin.remote || '');
  return false;
}

export function isPushing(remote: Ref, subOrigin = '') {
  if (!hasTag('+plugin/origin/push', remote)) return false;
  const plugin = remote.plugins?.['+plugin/origin'];
  return (plugin?.local || '') === subOrigin;
}

export const remoteOriginMod: Mod = {
  plugin: [
    originPlugin,
    originPushPlugin,
    originPullPlugin,
    originTunnelPlugin,
  ],
};
