import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import Europa from 'europa';
import { Plugin, PluginApi } from 'europa-core';
import { getPath } from '../util/hosts';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  constructor(
    private config: ConfigService,
  ) {
    const superscriptProvider = (api: PluginApi): Plugin => ({
      converters: {
        SUP: {
          startTag(conversion): boolean {
            conversion.output('^');
            conversion.atNoWhitespace = true;
            return true;
          },
        },
      },
    });
    Europa.registerPlugin(superscriptProvider);
  }

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
    if (ending.startsWith('/e/')){
      ending = ending.substring('/e/'.length);
      if (ending.indexOf('/') < 0) return decodeURIComponent(ending);
      return decodeURIComponent(ending.substring(0, ending.indexOf('/')));
    }
    return ending;
  }

  /**
   * Gets the query for a query URL.
   */
  getQuery(url: string): string {
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
    if (!ending) return url;
    if (ending.indexOf('?') < 0) return ending;
    const query = ending.substring(0, ending.indexOf('?'))
    return decodeURIComponent(query);
  }

  syncEditor(fb: UntypedFormBuilder, group: UntypedFormGroup, previousComment = '') {
  }

  getSources(markdown: string) {
    return [];
  }

  getAlts(markdown: string) {
    return [];
  }

}
