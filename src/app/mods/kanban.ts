import { $localize } from '@angular/localize/init';
import * as moment from 'moment';
import { Template } from '../model/template';
import { RootConfig } from './root';

export const kanbanTemplate: Template = {
  tag: 'kanban',
  name: $localize`📋️ Kanban`,
  config: {
    type: 'lens',
    default: true,
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
    submit: $localize`📋️ kanban/`,
    view: $localize`📋️`,
    description: $localize`Activates built-in Kanban mode for viewing Refs.`,
    icons: [{ thumbnail: $localize`📋️`, order: 1 }],
    filters: [
      { query: 'kanban', label: $localize`📋️ kanban`, group: $localize`Templates 🎨️` },
    ],
    form: [{
      key: 'columns',
      className: 'columns',
      type: 'tags',
      props: {
        label: $localize`Columns:`,
        addText: $localize`+ Add another column`,
      }
    }, {
      key: 'showColumnBacklog',
      id: 'showColumnBacklog',
      type: 'boolean',
      props: {
        label: $localize`Show Columns Backlog:`
      }
    }, {
      key: 'columnBacklogTitle',
      id: 'columnBacklogTitle',
      type: 'string',
      props: {
        label: $localize`Column Backlog Title:`
      },
      expressions: {
        hide: '!field.parent.model.showColumnBacklog'
      },
    }, {
      key: 'swimLanes',
      className: 'swim-lanes',
      type: 'tags',
      props: {
        label: $localize`Swim Lanes:`,
        addText: $localize`+ Add another swim lane`,
      }
    }, {
      key: 'showSwimLaneBacklog',
      id: 'showSwimLaneBacklog',
      type: 'boolean',
      props: {
        label: $localize`Show Swim Lane Backlog:`
      },
      expressions: {
        hide: '!model.swimLanes || !model.swimLanes[0]'
      },
    }, {
      key: 'swimLaneBacklogTitle',
      id: 'swimLaneBacklogTitle',
      type: 'string',
      props: {
        label: $localize`Swim Lane Backlog Title:`
      },
      expressions: {
        hide: '!model.swimLanes || !model.swimLanes[0] || !model.showSwimLaneBacklog'
      },
    }, {
      key: 'hideSwimLanes',
      id: 'hideSwimLanes',
      type: 'boolean',
      props: {
        label: $localize`Hide Swim Lanes by Default:`
      },
      expressions: {
        hide: '!model.swimLanes || !model.swimLanes[0]'
      },
    }, {
      key: 'badges',
      className: 'badges',
      type: 'tags',
      props: {
        label: $localize`Badges:`,
        addText: $localize`+ Add another badge tag`,
      }
    }]
  },
  defaults: <KanbanConfig> {
    defaultSort: 'modified,desc',
    submitText: true,
    badges: ['p1', 'p2', 'p3', 'p4', 'p5']
  },
  schema: {
    optionalProperties: {
      columns: { elements: { type: 'string' } },
      showColumnBacklog: { type: 'boolean'},
      columnBacklogTitle: { type: 'string'},
      swimLanes: { elements: { type: 'string' } },
      hideSwimLanes: { type: 'boolean'},
      showSwimLaneBacklog: { type: 'boolean'},
      swimLaneBacklogTitle: { type: 'string'},
      badges: { elements: { type: 'string' } },
    },
  },
};

export interface KanbanConfig extends RootConfig {
  columns?: string[];
  showColumnBacklog?: boolean;
  columnBacklogTitle?: string;
  swimLanes?: string[];
  hideSwimLanes?: boolean;
  showSwimLaneBacklog?: boolean;
  swimLaneBacklogTitle?: string;
  badges?: string[];
}
