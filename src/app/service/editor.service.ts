import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import * as _ from 'lodash-es';
import { LinksFormComponent } from '../form/links/links.component';
import { TagsFormComponent } from '../form/tags/tags.component';
import { RefSort } from '../model/ref';
import { extractPattern, getNotifications, getTags } from '../util/editor';
import { URI_REGEX } from '../util/format';
import { getPath } from '../util/hosts';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  constructor(
    private config: ConfigService,
  ) { }

  getUrlType(url: string) {
    if (url.startsWith(this.config.base)) {
      url = url.substring(this.config.base.length);
    }
    const basePath = getPath(this.config.base)!;
    if (url.startsWith(basePath)) {
      url = url.substring(basePath.length);
    }
    if (url.startsWith('/')) {
      url = url.substring(1);
    }
    return url.substring(0, url.indexOf('/'));
  }

  getRefUrl(url: string): string {
    if (url.startsWith('unsafe:')) url = url.substring('unsafe:'.length);
    const refPrefix = this.config.base + 'ref/';
    let ending = '';
    if (url.startsWith(refPrefix)) {
      ending = url.substring(refPrefix.length);
    } else {
      const relRefPrefix = getPath(refPrefix)!;
      if (url.startsWith(relRefPrefix)) {
        ending = url.substring(relRefPrefix.length);
      } else if (url.startsWith('/ref/')) {
        ending = url.substring('/ref/'.length);
      }
    }
    if (!ending) return url;
    if (ending.indexOf('/') < 0) return decodeURIComponent(ending);
    return decodeURIComponent(ending.substring(0, ending.indexOf('/')));
  }

  /**
   * Gets the query and sort for a query URL.
   * @param url
   */
  getQueryUrl(url: string): [string, RefSort] {
    if (url.startsWith('unsafe:')) url = url.substring('unsafe:'.length);
    const tagPrefix = this.config.base + 'tag/';
    let ending = '';
    if (url.startsWith(tagPrefix)) {
      ending = url.substring(tagPrefix.length);
    } else {
      const relTagPrefix = getPath(tagPrefix)!;
      if (url.startsWith(relTagPrefix)) {
        ending = url.substring(relTagPrefix.length);
      } else if (url.startsWith('/tag/')) {
        ending = url.substring('/tag/'.length);
      }
    }
    if (!ending) return [url, ''];
    if (ending.indexOf('/') < 0) return [decodeURIComponent(ending), ''];
    const query = ending.substring(0, ending.indexOf('/'))
    ending = ending.substring(query.length)
    let sort = '';
    if (ending.length) {
      ending = ending.substring(1);
      if (ending.indexOf('/') < 0 && ending.indexOf('?') < 0) {
        sort = ending;
      }
      sort = ending.substring(0, Math.max(ending.indexOf('/'), ending.indexOf('?')))
    }
    return [decodeURIComponent(query), sort as RefSort];
  }

  syncEditor(fb: UntypedFormBuilder, group: UntypedFormGroup) {
    group.value.comment = group.value.comment.replace('](' + this.config.base, '](/');
    group.value.comment = group.value.comment.replace(']: ' + this.config.base, ']: /');
    const value = group.value.comment;
    const newSources = _.uniq(_.difference(this.getSources(value), group.value.sources));
    for (const s of newSources) {
      (group.get('sources') as UntypedFormArray).push(fb.control(s, LinksFormComponent.validators));
    }
    const newAlts = _.uniq(_.difference(this.getAlts(value), group.value.alternateUrls));
    for (const a of newAlts) {
      (group.get('alternateUrls') as UntypedFormArray).push(fb.control(a, LinksFormComponent.validators));
    }
    const newTags = _.uniq(_.difference([
      ...getTags(value),
      ...getNotifications(value)], group.value.tags));
    for (const t of newTags) {
      (group.get('tags') as UntypedFormArray).push(fb.control(t, TagsFormComponent.validators));
    }
  }

  getSources(markdown: string) {
    return [
      ...extractPattern(markdown, /\[\[?\d+]?]:.*/g, /\[\[?\d+]?]:\s*(.*)/, URI_REGEX),
      ...extractPattern(markdown, /\[\[?\d+]?]:\s*\/ref\/.*/g, /\[\[?\d+]?]:\s*(\/ref\/.*)/).map(url => this.getRefUrl(url)),
      ...extractPattern(markdown, /\[\[?\d+]?]\(.*\)/g, /\[\[?\d+]?]\((.*)\)/, URI_REGEX),
      ...extractPattern(markdown, /\[\[?\d+]?]\(\/ref\/.*\)/g, /\[\[?\d+]?]\((\/ref\/.*)\)/).map(url => this.getRefUrl(url)),
    ];
  }

  getAlts(markdown: string) {
    return [
      ...extractPattern(markdown, /\[\[?alt\d*]?]:.*/g, /\[\[?alt\d*]?]:\s*(.*)/, URI_REGEX),
      ...extractPattern(markdown, /\[\[?alt\d+]?]:\s*\/ref\/.*/g, /\[\[?alt\d+]?]:\s*(\/ref\/.*)/).map(url => this.getRefUrl(url)),
      ...extractPattern(markdown, /\[\[?alt\d*]?]\(.*\)/g, /\[\[?alt\d*]?]\((.*)\)/, URI_REGEX),
      ...extractPattern(markdown, /\[\[?alt\d+]?]\(\/ref\/.*\)/g, /\[\[?alt\d+]?]\((\/ref\/.*)\)/).map(url => this.getRefUrl(url)),
    ];
  }

}
