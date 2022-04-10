import * as moment from 'moment';
import { Template } from '../model/template';

export const defaultSubs = ['science@*', 'politics@*', 'news@*', 'funny@*', 'history@*', 'politics@*'];

export const userTemplate: Template = {
  tag: 'user',
  name: 'User Extension',
  config: {
    generated: 'Generated by jenkins-ui ' + moment().toISOString(),
  },
  defaults: {
    inbox: {},
    subscriptions: defaultSubs,
  },
  schema: {
    properties: {
      inbox: {
        optionalProperties: {
          lastNotified: { type: 'string' },
        },
      },
      subscriptions: { elements: { type: 'string' } },
    },
  },
};
