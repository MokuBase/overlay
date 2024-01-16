import { $localize } from '@angular/localize/init';
import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const seamlessPlugin: Plugin = {
  tag: 'plugin/seamless',
  name: $localize`🪡 Seamless`,
  config: {
    type: 'plugin',
    default: true,
    add: true,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Remove the white border from the comment markdown.`,
    aiInstructions: `# plugin/seamless
    Remove the white border around the embedded markdown comment. This can be particularly
    useful when embedding a Ref in markdown like ![](ai:ref). Otherwise, theme depending
    when markdown viewers are expanded or embedded in other markdown the thin white border will be present.`,
    icons: [{ label: $localize`🪡` }],
    // language=CSS
    css: `
      .plugin-seamless > .expand {
        border: none !important;
      }
    `,
  },
};
