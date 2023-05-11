import * as moment from 'moment';
import { Template } from '../model/template';

export const folderTemplate: Template = {
  tag: 'folder',
  name: $localize`📂️ Folder`,
  config: {
    experimental: true,
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    submit: $localize`📂️ folder/`,
    view: $localize`📂️`,
    writeAccess: ['+folder'],
    description: $localize`Activates built-in Folder mode for viewing Refs.`,
    filters: [
      { query: 'folder', label: $localize`📂️ folder`, group: $localize`Templates 🎨️` },
    ],
  },
  schema: {
    optionalProperties: {
      flatten: { type: 'boolean' },
      subfolders: { elements: { type: 'string' } },
      defaultFilters: { elements: { type: 'string' } },
    },
  },
};
