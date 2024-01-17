import * as moment from 'moment';
import { Template } from '../model/template';

export const chatTemplate: Template = {
  tag: 'chat',
  name: $localize`🗨️ Chat`,
  config: {
    type: 'lens',
    experimental: true,
    genId: true,
    internal: true,
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
    submit: $localize`🗨️ chat/`,
    view: $localize`🗨️`,
    description: $localize`Activates built-in Chat mode for viewing Refs.`,
    aiInstructions: `# chat
    The chat template creates chat rooms with real-time chat.
    When replying to a chat message, adding a notification to the user is optional, but not required.
    Notifying the user is only necessary if they have stepped away fom the chat room and need a ping.
    When replying to a chat message, be sure to include the same chat tag. For example, chat/general.
    Never include a title in a chat message, only a comment. If you include a title and a comment,
    only the title text will be visible until the user clicks on the chat message, which is poor form.
    Try to keep messages small so they fit on the screen. Respond in multiple messages if necessary.`,
    icons: [{ thumbnail: $localize`🗨️`, order: 1 }],
    filters: [
      { query: 'chat', label: $localize`🗨️ chat`, group: $localize`Templates 🎨️` },
    ],
    form: [{
      key: 'addTags',
      type: 'tags',
      defaultValue: ['public', 'internal'],
      props: {
        label: $localize`Add Tags:`,
      }
    }, {
      key: 'authorTags',
      type: 'qtags',
      defaultValue: ['user', 'plugin/from'],
      props: {
        label: $localize`Author Tags:`,
        addText: $localize`+ Add another prefix`,
      }
    }],
  },
  defaults: {
    authorTags: ['user', 'plugin/from']
  },
  schema: {
    optionalProperties: {
      addTags: { elements: { type: 'string' } },
      authorTags: { elements: { type: 'string' } },
    }
  }
};
