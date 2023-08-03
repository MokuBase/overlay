import { $localize } from '@angular/localize/init';
import * as moment from 'moment';
import { Template } from '../model/template';
import { RootConfig } from './root';

export const kanbanTemplate: Template = {
  tag: 'kanban',
  name: $localize`📋️ Kanban Board`,
  config: {
    default: true,
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    submit: $localize`📋️ kanban/`,
    view: $localize`📋️`,
    description: $localize`Activates built-in Kanban mode for viewing Refs.`,
    filters: [
      { query: 'kanban', label: $localize`📋️ kanban`, group: $localize`Templates 🎨️` },
    ],
    form: [{
      key: 'private',
      type: 'boolean',
      props: {
        label: $localize`Private:`
      }
    }, {
      key: 'columns',
      type: 'qtags',
      props: {
        label: $localize`Columns:`,
        addText: $localize`+ Add another column`,
      }
    }, {
      key: 'showNoColumn',
      type: 'boolean',
      props: {
        label: $localize`Extra column for untagged Refs:`
      }
    }, {
      key: 'noColumnTitle',
      type: 'string',
      props: {
        label: $localize`Extra Column Title:`
      },
      expressions: {
        hide: '!field.parent.model.showNoColumn'
      },
    }, {
      key: 'swimLanes',
      type: 'qtags',
      props: {
        label: $localize`Swim Lanes:`,
        addText: $localize`+ Add another swim lane`,
      }
    }, {
      key: 'showNoSwimLane',
      type: 'boolean',
      props: {
        label: $localize`Extra swim lane for untagged Refs:`
      }
    }, {
      key: 'noSwimLaneTitle',
      type: 'string',
      props: {
        label: $localize`Extra Swim Lane Title:`
      },
      expressions: {
        hide: '!field.parent.model.showNoSwimLane'
      },
    }, {
      key: 'badges',
      type: 'tags',
      defaultValue: ['p1', 'p2', 'p3', 'p4', 'p5'],
      props: {
        label: $localize`Badges:`,
        addText: $localize`+ Add another badge tag`,
      }
    }]
  },
  defaults: <KanbanConfig> {
    columns: []
  },
  schema: {
    properties: {
      columns: { elements: { type: 'string' } },
    },
    optionalProperties: {
      private: { type: 'boolean'},
      swimLanes: { elements: { type: 'string' } },
      showNoColumn: { type: 'boolean'},
      noColumnTitle: { type: 'string'},
      showNoSwimLane: { type: 'boolean'},
      noSwimLaneTitle: { type: 'string'},
      badges: { elements: { type: 'string' } },
    },
  },
};

export interface KanbanConfig extends RootConfig {
  private?: boolean;
  columns: string[];
  swimLanes?: string[];
  showNoColumn?: boolean;
  noColumnTitle?: string;
  showNoSwimLane?: boolean;
  noSwimLaneTitle?: string;
  badges?: string[];
}
