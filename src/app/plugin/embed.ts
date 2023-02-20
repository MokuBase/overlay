import * as moment from 'moment';
import { Plugin } from '../model/plugin';
import { bitchuteHosts, twitterHosts, youtubeHosts } from '../util/hosts';

export const embedPlugin: Plugin = {
  tag: 'plugin/embed',
  name: $localize`🔭️ Embed`,
  config: {
    type: 'viewer',
    default: true,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    submit: $localize`🔭️ embed`,
    icons: [{ label: $localize`🔭️` }],
    filters: [
      { query: 'plugin/embed', label: $localize`🔭️ embed`, group: $localize`Plugins 🧰️` },
    ],
    hosts: embedHosts(),
    description: $localize`Embed the webpage in an inline frame.`,
    form: [{
      key: 'url',
      type: 'url',
      props: {
        label: $localize`URL:`,
      },
    }, {
      key: 'width',
      type: 'number',
      props: {
        label: $localize`Width:`,
        min: 200,
      },
      validation: {
        messages: {
          min: 'Width must be at least 200px.'
        }
      }
    }, {
      key: 'height',
      type: 'number',
      props: {
        label: $localize`Height:`,
        min: 200
      },
      validation: {
        messages: {
          min: 'Height must be at least 200px.'
        }
      }
    }],
  },
  defaults: {},
  schema: {
    optionalProperties: {
      url: { type: 'string' },
      width: { type: 'int32', nullable: true },
      height: { type: 'int32', nullable: true },
    },
  },
};

export function embedHosts() {
  return [...youtubeHosts, ...bitchuteHosts, ...twitterHosts];
}
