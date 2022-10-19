import { Injectable, isDevMode, Optional } from '@angular/core';
import { OAuthModuleConfig, OAuthStorage } from 'angular-oauth2-oidc';
import { from, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  loading?: Promise<string>;

  constructor(
    private authStorage: OAuthStorage,
    @Optional() private moduleConfig: OAuthModuleConfig,
  ) { }

  get init$() {
    if (location.search.includes('debug=')) {
      const debugRole = location.search.match(/debug=([^&]+)/)![1];
      const debugTag = location.search.match(/tag=([^&]+)/)?.[1] || '+user/debug/' + debugRole.toLowerCase();
      return from(this.getDebugToken(debugTag, 'ROLE_' + debugRole.toUpperCase()).then(jwt => this.token = jwt));
    }
    if (isDevMode() && !location.search.includes('anon=')) {
      return from(this.getDebugToken('+user/chris', 'ROLE_ADMIN').then(jwt => this.token = jwt));
    }
    return of(null)
  }

  private set token(token: string) {
    this.authStorage.setItem('access_token', token);
    this.moduleConfig.resourceServer.sendAccessToken = true;
  }

  private async getDebugToken(tag: string, ...roles: string[]) {
    if (!tag.startsWith('_') && !tag.startsWith('+')) {
      tag = '+user/' + tag;
    }
    if (tag.startsWith('_') && !roles.includes('ROLE_PRIVATE')) {
      roles.push('ROLE_PRIVATE');
    }
    let origin = '';
    if (tag.includes('@')) {
      origin = tag.substring(tag.indexOf('@'));
      tag = tag.substring(0, tag.indexOf('@'));
    }
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    const payload = {
      aud: '',
      sub: tag.match(/[+_]user\/(.*)/)![1],
      auth: {} as any,
    };
    if (origin) {
      payload.auth[origin] = roles.join(',');
    } else {
      payload.auth = roles.join(',');
    }
    const body = btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload));

    const secret = atob('MjY0ZWY2ZTZhYmJhMTkyMmE5MTAxMTg3Zjc2ZDlmZWUwYjk0MDgzODA0MDJiOTgyNTk4MmNjYmQ4Yjg3MmVhYjk0MmE0OGFmNzE2YTQ5ZjliMTEyN2NlMWQ4MjA5OTczYjU2NzAxYTc4YThkMzYxNzdmOTk5MTIxODZhMTkwMDM=');
    const enc = new TextEncoder();
    const algorithm = { name: 'HMAC', hash: 'SHA-256' };

    const key = await crypto.subtle.importKey('raw', enc.encode(secret), algorithm, false, ['sign', 'verify']);
    const signature = await crypto.subtle.sign(algorithm.name, key, enc.encode(body));
    const digest = btoa(String.fromCharCode(...new Uint8Array(signature)));

    console.log('GENERATING DEBUG JWT (DO NOT USE IN PRODUCTION)');
    console.log(header);
    console.log(payload);
    return (body + '.' + digest).replace(/\+/g, '-').replace(/\//g, '_');
  }
}
