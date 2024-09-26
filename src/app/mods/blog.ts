import * as moment from 'moment';
import { Template } from '../model/template';

export const blogTemplate: Template = {
  tag: 'blog',
  name: $localize`📰️ Blog`,
  config: {
    type: 'lens',
    default: true,
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
    submit: $localize`📰️ blog/`,
    view: $localize`📰️`,
    description: $localize`Activates built-in Blog mode for viewing Refs.`,
    icons: [{ thumbnail: $localize`📰️`, order: 1 }],
    filters: [
      { query: 'blog', label: $localize`📰️ blog`, title: $localize`Blog posts`, group: $localize`Templates 🎨️` },
    ],
    form: [{
      key: 'filterTags',
      type: 'boolean',
      props: {
        label: $localize`Only show selected tags:`
      }
    }, {
      key: 'tags',
      type: 'qtags',
      expressions: {
        hide: '!field.parent.model.filterTags'
      },
    }]
  },
  defaults: {
    noFloatingSidebar: true,
  },
  schema: {
    optionalProperties: {
      filterTags: { type: 'boolean' },
      tags: { elements: { type: 'string' } },
    },
  },
};
