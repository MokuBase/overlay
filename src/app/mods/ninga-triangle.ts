import * as moment from 'moment';
import { Plugin } from '../model/plugin';
import { Mod } from '../model/tag';
import { Template } from '../model/template';
import { RootConfig } from './root';

export const ninjaTrianglePlugin: Plugin = {
  tag: 'plugin/ninja.triangle',
  name: $localize`🥷🔺️ Ninja Triangle`,
  config: {
    mod: $localize`🥷🔺️ Ninja Triangle`,
    type: 'plugin',
    editingViewer: true,
    experimental: true,
    submitText: true,
    add: true,
    genId: true,
    export: true,
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
    description: $localize`Create a Japanese Triangle and show the longest Ninja Path.`,
    aiInstructions: ` # plugin/ninja.triangle
Let $n$ be a positive integer. A *Japanese triangle* consists of $1 + 2 + \\ldots + n$ circles arranged in an
equilateral triangular shape such that for each $i = 1, 2, \\ldots, n$, the $i$th row contains exactly $i$ circles,
exactly one of which is coloured red. A *ninja path* in a Japanese triangle is a sequence of $n$ circles obtained by
starting in the top row, then repeatedly going from a circle to one of the two circles immediately below it and
finishing in the bottom row. Here is an example of a Japanese triangle with $n = 6$.

         r
        r o
       o o r
      o o r o
     o o o r o
    r o o o o o

In terms of $n$, find the greatest $k$ such that in each Japanese triangle there is a ninja path containing at
least $k$ red circles.
    `,
    icons: [{ label: $localize`🔺️`, order: 2 }],
    filters: [
      { query: 'plugin/ninja.triangle', label: $localize`🥷🔺️ Ninja Triangle`, group: $localize`Plugins 🧰️` },
    ],
    // language=HTML
    snippet: `
    <script>
      function read(text) {
        return (text || '')
          .split(/\\\s+/)
          .filter(n => !!n);
      }
      function write(t) {
        t = [...t];
        let text = '';
        const n = geometricSumInv(t.length);
        for (let i = 0; i < n; i++) {
          text += ' '.repeat(n - i);
          for (let j = 0; j <= i; j++) {
            text += ' ' + (t.shift() === 'r' ? 'r' : 'o');
          }
          text += '\\n';
        }
        return text;
      }
      function geometricSum(n) {
        return n * (n + 1) / 2;
      }
      function geometricSumInv(s) {
        return (Math.sqrt(8 * s + 1) - 1) / 2;
      }
      function bestNinjaPath(text, targetI, targetJ) {
        const triangle = read(text);
        if (targetI === undefined) targetI = geometricSumInv(triangle.length);
        function traverse(i, j, count) {
          if (i > targetI) return 0;
          const s = geometricSum(i);
          count += triangle[s + j] === 'r';
          if (i === targetI && j === targetJ) return count;
          return Math.max(traverse(i+1, j, count),
                          traverse(i+1, j+1, count))
        }
        return traverse(0, 0, 0)
      }
      Handlebars.registerHelper('ninjaTriangle', (comment, actions, el, d3) => {
        function renderSvg() {
          function removeRow(text, n) {
            const t = read(text)
            for (let i = 0; i < n; i++) t.pop();
            text = write(t);
            comment = text;
            renderSvg();
            actions.comment(text);
          }
          function tagRed(text, i, j) {
            const t = read(text);
            const s = geometricSum(i - 1);
            for (let p = 0; p < i; p++) {
              t[s + p] = p === j ? 'r' : 'o';
            }
            text = write(t);
            comment = text;
            renderSvg();
            actions.comment(text);
          }
          const triangle = read(comment);
          const n = geometricSumInv(triangle.length);
          const radius = 20;
          const spacing = 44;
          const svg = d3.select(el).select('svg.japanese-triangle')
            .style('height', (n + 2) * spacing + 'px')
            .style('width', (n + 2) * spacing + 'px');
          const ts = [...triangle];
          const ds = [];
          for (let i = 0; i <= n; i++) {
            for (let j = 0; j <= i; j++) {
              const cx = 30 + (j + (n - i) / 2) * spacing
              const cy = 30 + i * spacing;
              const red = ts.shift() === 'r';
              const extraRow = i === n;
              ds.push({
                n,
                i, j,
                cx, cy,
                red,
                text: red ? bestNinjaPath(comment, i, j) : '',
                extraRow,
              });
            }
          }

          svg.selectAll('g')
            .data(ds, d => d.n + ':' + d.i + ':' + d.j + ':' + d.red + ':' + d.text)
            .join(enter => {
              const g = enter.append('g');
              g.append('circle')
                .attr('r', radius)
                .attr('stroke', '#111')
                .attr('stroke-width', 2)
                .attr('fill', d => d.red ? '#A33' : d.extraRow ? 'transparent' : '#CCC');
              g.append('text')
                .text(d => d.text)
                .attr('stroke', 'none')
                .attr('fill', '#CCC')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .style('font-size', '16px')
                .style('user-select', 'none')
                .style('pointer-events', 'none');
              return g;
            })
            .attr('transform', d => 'translate(' + d.cx + ',' + d.cy + ')')
            .selectAll('circle')
            .on('click', (event, d) => {
              if (d.red) return;
              if (d.extraRow) {
                // Add new row
                comment += '\\n' + Array(d.n).fill('o').join(' ');
              }
              tagRed(comment, d.i + 1, d.j);
            })
            .on('contextmenu', (event, d) => {
              event.preventDefault();
              removeRow(comment, d.n);
            });
        }
        return renderSvg;
      });
    </script>
    `,
    // language=Handlebars
    ui: `
      <svg class="japanese-triangle">{{defer el (ninjaTriangle ref.comment actions el (d3))}}</svg>
    `,
  },
};

export const ninjaTriangleTemplate: Template = {
  tag: 'plugin/ninja.triangle',
  name: $localize`🥷🔺️ Ninja Triangle`,
  config: {
    mod: $localize`🥷🔺️ Ninja Triangle`,
    type: 'plugin',
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
    view: $localize`🥷🔺️`,
    // language=CSS
    css: `
      app-ref-list.plugin_ninja-triangle {
        .list-container {
          grid-auto-flow: row dense;
          padding: 4px;
          gap: 8px;
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
  defaults: <RootConfig> {
    defaultExpanded: true,
    expandInline: false,
    submitText: true,
    defaultSort: 'title',
    defaultCols: 1
  }
};

export const ninjaTriangleMod: Mod = {
  plugins: {
    ninjaTrianglePlugin,
  },
  templates: {
    ninjaTriangleTemplate,
  },
};
