import * as moment from 'moment';
import { Plugin } from '../model/plugin';
import { Template } from '../model/template';

export const todoPlugin: Plugin = {
  tag: 'plugin/todo',
  name: $localize`📑️ TODO List`,
  config: {
    mod: $localize`📑️ TODO List`,
    type: 'plugin',
    experimental: true,
    submitText: true,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Create a TODO list.`,
    icons: [{ label: $localize`📑️` }],
    filters: [
      { query: 'plugin/todo', label: $localize`📑️ todo`, group: $localize`Plugins 🧰️` },
    ],
  },
};

export const todoTemplate: Template = {
  tag: 'plugin/todo',
  name: $localize`📑️ TODO List`,
  config: {
    mod: $localize`📑️ TODO List`,
    type: 'plugin',
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    view: $localize`🗳️`,
    // language=CSS
    css: `
      app-ref-list.plugin-todo {
        .list-container {
          grid-auto-flow: row dense;
          margin: 4px;
          gap: 8px;
          grid-template-columns:  1fr;
          @media (min-width: 1000px) {
            grid-template-columns:  1fr 1fr;
          }
          @media (min-width: 1500px) {
            grid-template-columns: 1fr 1fr 1fr;
          }
          @media (min-width: 2000px) {
            grid-template-columns: 1fr 1fr 1fr 1fr;
          }
          .list-number {
            display: none;
          }
          .ref {
            break-inside: avoid;
            .toggle {
              display: none;
            }
            @media (max-width: 740px) {
              .actions, .info {
                height: 28px;
              }
            }
          }
        }
      }
    `,
  },
  defaults: {
    defaultExpanded: true,
    defaultSort: 'modified,DESC',
    defaultCols: 0, // Leave to CSS screen size detection, but show cols dropdown
  }
};
