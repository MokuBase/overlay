import * as moment from 'moment';
import { Plugin } from '../model/plugin';
import { Ref } from '../model/ref';

export const originPlugin: Plugin = {
  tag: '+plugin/origin',
  name: $localize`Remote Origin Replication`,
  config: {
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    submit: $localize`🏷️ origin`,
    description: $localize`Replicate a remote Jasper instance. The remote origin will be scraped on an interval you specify.
      If the remote is also set up to replicate from this instance, you may communicate with remote users.
      You may configure if metadata is generated or plugins are validated. `,
  },
  defaults: {
    scrapeInterval: 'PT15M',
    generateMetadata: true,
  },
  schema: {
    properties: {
      origin: { type: 'string' },
      scrapeInterval: { type: 'string' },
    },
    optionalProperties: {
      remote: { type: 'string' },
      query: { type: 'string' },
      proxy: { type: 'string' },
      generateMetadata: { type: 'boolean' },
      validatePlugins: { type: 'boolean' },
      removeTags: { elements: { type: 'string' } },
      mapTags: { values: { type: 'string' } },
      addTags: { elements: { type: 'string' } },
      mapOrigins: { values: { type: 'string' } },
      lastScrape: { type: 'string' },
    },
  },
};

export function isReplicating(remote: Ref, url: string, origin = '') {
  const plugin = remote.plugins!['+plugin/origin'];
  return remote.url === url && (plugin.remote || '') === origin;
}
