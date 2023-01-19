import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const feedPlugin: Plugin = {
  tag: '+plugin/feed',
  name: 'RSS/Atom Feed',
  config: {
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
    submit: 'rss',
    description: 'Import entries from an RSS / Atom feed. The feed will be scraped on an interval you specify. ' +
      'Entries published prior to the published date of this Ref will be ignored. ',
  },
  defaults: {
    scrapeInterval: 'PT15M',
  },
  schema: {
    properties: {
      scrapeInterval: { type: 'string' },
    },
    optionalProperties: {
      origin: { type: 'string' },
      addTags: { elements: { type: 'string' } },
      lastScrape: { type: 'string' },
      disableEtag: { type: 'boolean' },
      etag: { type: 'string' },
      scrapeDescription: { type: 'boolean' },
      scrapeContents: { type: 'boolean' },
      scrapeAuthors: { type: 'boolean' },
    },
  },
};
