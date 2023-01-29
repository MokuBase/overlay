import * as moment from 'moment';
import { Plugin } from '../model/plugin';

export const invoicePlugin: Plugin = {
  tag: 'plugin/invoice',
  name: $localize`Invoice`,
  config: {
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
  },
  generateMetadata: true,
};

export const invoiceRejectionPlugin: Plugin = {
  tag: 'plugin/invoice/rejected',
  name: $localize`Invoice Rejected`,
  config: {
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
  },
  generateMetadata: true,
};

export const invoiceDisputedPlugin: Plugin = {
  tag: 'plugin/invoice/disputed',
  name: $localize`Invoice Disputed`,
  config: {
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
  },
  generateMetadata: true,
};

export const invoicePaidPlugin: Plugin = {
  tag: 'plugin/invoice/paid',
  name: $localize`Invoice Paid`,
  config: {
    generated: $localize`Generated by jasper-ui ${moment().toISOString()}`,
  },
  generateMetadata: true,
};
