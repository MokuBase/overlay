import * as moment from 'moment';
import { Tag } from './tag';

export interface Ext extends Tag {
  type?: 'ext';
  config?: any;
}

export function mapTag(obj: any): Ext {
  obj.type = 'ext';
  obj.origin ||= '';
  obj.modifiedString = obj.modified;
  obj.modified = obj.modified && moment(obj.modified);
  return obj;
}

export function writeExt(ext: Ext): Ext {
  const result = { ...ext };
  result.modified = result.modifiedString as any;
  delete result.type;
  delete result.upload;
  delete result.exists;
  delete result.modifiedString;
  return result;
}
