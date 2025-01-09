import { DateTime } from 'luxon';
import { Plugin } from '../model/plugin';
import { Mod } from '../model/tag';
import { Template } from '../model/template';

export const chatTemplate: Template = {
  tag: 'chat',
  name: $localize`🗨️ Chat`,
  config: {
    type: 'lens',
    mod: $localize`🗨️ Chat`,
    experimental: true,
    genId: true,
    internal: true,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
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
    Always give the shortest possible response. Responses longer than a line will be wrapped, and only
    show past the first line when focused. Respond in multiple messages if necessary.`,
    icons: [{ thumbnail: $localize`🗨️`, order: 1 }],
    filters: [
      { query: 'chat', label: $localize`🗨️ chats`, title: $localize`Chats`, group: $localize`Templates 🎨️` },
    ],
    form: [{
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
    authorTags: ['user', 'plugin/from', '+plugin'],
    noFloatingSidebar: true,
  },
  schema: {
    optionalProperties: {
      authorTags: { elements: { type: 'string' } },
    }
  }
};

export const chatroomPlugin: Plugin = {
  tag: 'plugin/chat',
  name: $localize`🗨️ Chatroom`,
  config: {
    type: 'lens',
    mod: $localize`🗨️ Chat`,
    experimental: true,
    add: true,
    generated: $localize`Generated by jasper-ui ${DateTime.now().toISO()}`,
    description: $localize`Activates built-in chatroom in a Ref.`,
    icons: [{ label: $localize`🗨️`, order: -1 }],
    filters: [
      { query: 'plugin/chat', label: $localize`🗨️ chatroom`, title: $localize`Chatrooms`, group: $localize`Plugins 🧰️` },
    ],
  },
};

export const chatMod: Mod = {
  plugin: [
    chatroomPlugin,
  ],
  template: [
    chatTemplate,
  ]
};
