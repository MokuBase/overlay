import * as moment from 'moment';
import { Plugin } from "../model/plugin";
import { Template } from '../model/template';

export const backgammonPlugin: Plugin = {
  tag: 'plugin/backgammon',
  name: $localize`🎲️ Backgammon`,
  config: {
    mod: $localize`🎲️ Backgammon`,
    type: 'plugin',
    submitText: true,
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    icons: [{ label: $localize`🎲️`, order: 3 }],
    description: $localize`Activates built-in Backgammon game`,
    filters: [
      { query: 'plugin/backgammon', label: $localize`🎲️ backgammon`, group: $localize`Plugins 🧰️` },
    ],
    actions: [
      { event: 'flip', label: $localize`flip` },
    ],
    // language=CSS
    css: `
      body.dark-theme {
        .backgammon-board {
          border: 0.5px solid rgba(255, 255, 255, 0.2);
        }
      }

      body.light-theme {
        .backgammon-board {
          border: 0.5px solid transparent;
        }
      }
    `,
  },
};

export const backgammonTemplate: Template = {
  tag: 'plugin/backgammon',
  name: $localize`🎲️ Backgammon`,
  config: {
    mod: $localize`🎲️ Backgammon`,
    type: 'plugin',
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    view: $localize`🎲️`,
    // language=CSS
    css: `
      app-ref-list.plugin-backgammon {
        .list-container {
          grid-auto-flow: row dense;
          margin: 4px;
          gap: 8px;
          grid-template-columns: minmax(0, 1fr);
          @media (min-width: 1500px) {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          @media (min-width: 2000px) {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
          }
          .list-number {
            display: none;
          }
          .ref {
            min-width: 0;
            break-inside: avoid;
            .backgammon-board {
              max-height: unset;
            }
            .toggle {
              display: none;
            }
            @media (max-width: 740px) {
              .actions, .info {
                height: 28px;
              }
            }
          }
          .embed {
            display: block !important;
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
