import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const feedPlugin: Plugin = {
  tag: 'plugin/feed',
  name: $localize`🗞️ RSS/Atom Feed`,
  config: {
    default: true,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    submit: $localize`🗞️ feed`,
    settings: $localize`feed`,
    icons: [
      { label: $localize`🗞️`, order: 3 },
      { tag: '-+plugin/cron',  label: $localize`🚫️`, order: -1 },
    ],
    description: $localize`Import entries from an RSS / Atom feed. The feed will be scraped on an interval you specify.`,
    actions: [
      { event: 'scrape', label: $localize`pull` },
      { tag: '+plugin/cron', labelOn: $localize`disable`, labelOff: $localize`enable` },
    ],
    form: [{
      key: 'addTags',
      type: 'tags',
    }],
    advancedForm: [{
      key: 'disableEtag',
      type: 'boolean',
      props: {
        label: $localize`Disable Etag Caching:`
      }
    }, {
      key: 'stripQuery',
      type: 'boolean',
      props: {
        label: $localize`Strip Query:`
      }
    }, {
      key: 'scrapeWebpage',
      type: 'boolean',
      props: {
        label: $localize`Scrape Webpage:`
      }
    }, {
      key: 'scrapeDescription',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Description:`
      }
    }, {
      key: 'scrapeContents',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Contents:`,
        title: $localize`Will overwrite description if both scraped and found.`
      }
    }, {
      key: 'scrapeAuthors',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Authors:`
      }
    }, {
      key: 'scrapeThumbnail',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Thumbnail:`
      }
    }, {
      key: 'scrapeAudio',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Audio:`
      }
    }, {
      key: 'scrapeVideo',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Video:`
      }
    }, {
      key: 'scrapeEmbed',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Scrape Embed:`
      }
    }]
  },
  schema: {
    optionalProperties: {
      addTags: { elements: { type: 'string' } },
      disableEtag: { type: 'boolean' },
      etag: { type: 'string' },
      stripQuery: { type: 'boolean' },
      scrapeWebpage: { type: 'boolean' },
      scrapeDescription: { type: 'boolean' },
      scrapeContents: { type: 'boolean' },
      scrapeAuthors: { type: 'boolean' },
      scrapeThumbnail: { type: 'boolean' },
      scrapeAudio: { type: 'boolean' },
      scrapeVideo: { type: 'boolean' },
      scrapeEmbed: { type: 'boolean' },
    },
  },
};
