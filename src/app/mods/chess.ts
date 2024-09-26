import { $localize } from '@angular/localize/init';
import * as moment from 'moment';
import { Plugin } from "../model/plugin";
import { Mod } from '../model/tag';
import { Template } from '../model/template';

export const chessPlugin: Plugin = {
  tag: 'plugin/chess',
  name: $localize`♟️ Chess`,
  config: {
    mod: $localize`♟️ Chess`,
    type: 'plugin',
    submitText: true,
    editingViewer: true,
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    description: $localize`Activates built-in Chess game`,
    icons: [{ label: $localize`♟️`, order: 3 }],
    published: $localize`played`,
    aiInstructions: ` # plugin/chess
    When replying to a plugin/chess Ref, include the full previous game before your response in the comment field.
    Chess games are only stored in the comment field. They are Portable Game Notation (PGN) or the first line Forsyth-Edwards Notation (FEN) followed by optional newline delimited PGN-like list of Standard Algebraic Notation (SAN) moves.
    It is also customary to note the last move in the title suffix, such as ' | Rg3'.`,
    filters: [
      { query: 'plugin/chess', label: $localize`♟️ chess`, title: $localize`Chess Games`, group: $localize`Games 🕹️` },
    ],
    actions: [
      { event: 'flip', label: $localize`flip`, title: $localize`Spin the board 180 degrees.` },
      { event: 'reload', label: $localize`reload`, title: $localize`Reload the game.`  },
    ],
    advancedActions: [
      { tag: 'plugin/delta/chess', labelOff: $localize`play ai`, labelOn: $localize`cancel ai`, title: $localize`Play against an AI opponent.` },
    ],
    // language=CSS
    css: `
      body.dark-theme {
        .chess-board {
          border: 0.5px solid rgba(255, 255, 255, 0.2);
        }
        .chess-piece {
          opacity: 0.8;
          &.b {
            filter: drop-shadow(0 0 1px white) drop-shadow(1px 1px 2px black) !important;
          }
        }
      }

      body.light-theme {
        .chess-board {
          border: 0.5px solid transparent;
        }
        .chess-board {
          .tile {
            &.light {
              background: repeating-linear-gradient(-80deg, rgba(200, 140, 50, 0.9), rgba(210, 140, 50, 0.9), rgba(180, 130, 45, 0.9) 50%) !important;
            }

            &.dark {
              background: repeating-linear-gradient(40deg, rgba(120, 70, 30, 0.9), rgba(130, 70, 30, 0.9), rgba(100, 60, 20, 0.9) 20%) !important;
            }
          }
        }

        .chess-piece {
          &.w {
            color: #DC9 !important;
          }

          &.b {
            opacity: 0.90;
            color: #123 !important;
            filter: drop-shadow(0 0 1px white) drop-shadow(1px 1px 2px black) !important;
          }
        }
      }
    `,
  },
};

export const chessAiPlugin: Plugin = {
  tag: 'plugin/delta/chess',
  name: $localize`♟️👻️ AI Chess`,
  config: {
    mod: $localize`♟️ Chess`,
    type: 'plugin',
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Play chess against the AI.`,
    icons: [{ label: $localize`👻️`, order: -3 }],
    timeoutMs: 30_000,
    language: 'javascript',
    // language=JavaScript
    script: `
      const axios = require('axios');
      const OpenAi = require('openai');
      const { Chess } = require('chess.js');
      const ref = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
      const origin = ref.origin || ''
      const chess = new Chess();
      chess.loadPgn(ref.comment || '');
      if (chess.isGameOver()) process.exit(0);
      const config = ref.plugins['plugin/delta/chess'];
      const color = config?.aiColor.toLowerCase();
      const moves = (ref.comment || '').split('\\n').filter(m => !!m.trim());
      if ((color === 'black') !== !!(moves.length % 2)) process.exit(0);
      const validMoves = chess.moves();
      let move = '';
      if (validMoves.length === 1) {
        move = validMoves[0];
      } else {
        const apiKey = (await axios.get(process.env.JASPER_API + '/api/v1/ref/page', {
          headers: {
            'Local-Origin': origin || 'default',
            'User-Role': 'ROLE_ADMIN',
          },
          params: { query: (config?.apiKeyTag || '+plugin/secret/openai') + origin },
        })).data.content[0].comment;
        const prompt =
          'You are playing a game of chess against an opponent.\\n' +
          'You are the ' + color + ' player.\\n\\n' +
          'Read the following board in Portable Game Notation (PGN) and reply with the next move.\\n' +
          'You will also be shown the ascii version of the board to make sure your move is valid.\\n' +
          'If the game has ended or is not valid simply reply pass.\\n' +
          'Do not include any lists, formatting, additional text. Only reply with either a valid PGN move or the word pass in all lowercase.\\n\\n'
          + ref.comment;
        const openai = new OpenAi({ apiKey });
        const messages = [
          { role: 'system', content: prompt },
          { role: 'user', content: ref.comment || 'New game' },
          { role: 'user', content: chess.ascii() },
        ];
        let retry = 0;
        while (true) {
          const completion = await openai.chat.completions.create({
            model: config?.model || 'gpt-4o',
            max_tokens: config?.maxTokens || 4096,
            messages: messages,
          });
          move = completion.choices[0]?.message?.content;
          if (move === 'pass') process.exit(0);
          try {
            chess.move(move);
            break;
          } catch (e) {
            retry++;
            if (retry >= 10) {
              console.error(e.message);
              process.exit(1);
            }
            messages.push({ role: 'assistant', content: move });
            messages.push({ role: 'system', content: e.message });
          }
        }
      }
      delete ref.metadata;
      const title = (ref.title.includes(' | ') ? ref.title.substring(0, ref.title.indexOf(' | ')) : ref.title) + ' | ' + move;
      const newBoard = {
        ...ref,
        title,
        comment: (ref.comment ? ref.comment + '\\n' : '') + move,
      };
      console.log(JSON.stringify({
        ref: [newBoard],
      }));
    `,
    form: [{
      key: 'aiColor',
      type: 'select',
      defaultValue: 'Black',
      props: {
        label: $localize`AI Color:`,
        options: [
          { value: 'Black', label: $localize`Black` },
          { value: 'White', label: $localize`White` },
        ],
      }
    }],
    advancedForm: [{
      key: 'apiKeyTag',
      type: 'tag',
      props: {
        label: $localize`🔑️ API Key Tag:`,
      },
    }, {
      key: 'model',
      type: 'string',
      props: {
        label: $localize`Model:`,
      },
    }, {
      key: 'maxTokens',
      type: 'number',
      props: {
        label: $localize`Max Tokens:`,
      },
    }],
  },
  defaults: {
    aiColor: 'Black',
    apiKeyTag: '+plugin/secret/openai',
    model: 'gpt-4o',
    maxTokens: 4096,
  },
  schema: {
    properties: {
      aiColor: { type: 'string' },
      apiKeyTag: { type: 'string' },
      model: { type: 'string' },
      maxTokens: { type: 'uint32' },
    },
  },
};

export const chessTemplate: Template = {
  tag: 'plugin/chess',
  name: $localize`♟️ Chess`,
  config: {
    mod: $localize`♟️ Chess`,
    type: 'plugin',
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    view: $localize`♟️`,
    // language=CSS
    css: `
      app-ref-list.plugin_chess {
        .list-container {
          grid-auto-flow: row dense;
          padding: 4px;
          gap: 8px;
          grid-template-columns:  minmax(0, 1fr);
          @media (min-width: 1000px) {
            grid-template-columns:  minmax(0, 1fr) minmax(0, 1fr);
          }
          @media (min-width: 1500px) {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
          }
          @media (min-width: 2000px) {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
          }
          .list-number {
            display: none;
          }
          .ref {
            break-inside: avoid;
            .chess-board {
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
        }
      }
    `,
    advancedForm: [{
      key: 'defaultExpanded',
      type: 'boolean',
      defaultValue: true,
      props: {
        label: $localize`Default Expanded:`,
      },
    }],
  },
  defaults: {
    defaultExpanded: true,
    defaultSort: ['modified,DESC'],
    defaultCols: 0, // Leave to CSS screen size detection, but show cols dropdown
  }
};

export const chessMod: Mod = {
  plugins: {
    chessPlugin,
    chessAiPlugin,
  },
  templates: {
    chessTemplate,
  },
};
