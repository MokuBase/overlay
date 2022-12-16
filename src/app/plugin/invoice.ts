import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const invoicePlugin: Plugin = {
  tag: 'plugin/invoice',
  name: 'Invoice',
  config: {
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
  },
  generateMetadata: true,
};

export const invoiceRejectionPlugin: Plugin = {
  tag: 'plugin/invoice/rejected',
  name: 'Invoice Rejected',
  config: {
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
  },
  generateMetadata: true,
};

export const invoiceDisputedPlugin: Plugin = {
  tag: 'plugin/invoice/disputed',
  name: 'Invoice Disputed',
  config: {
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
  },
  generateMetadata: true,
};

export const invoicePaidPlugin: Plugin = {
  tag: 'plugin/invoice/paid',
  name: 'Invoice Paid',
  config: {
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
  },
  generateMetadata: true,
};
