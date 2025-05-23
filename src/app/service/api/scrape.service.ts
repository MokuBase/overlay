import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { autorun } from 'mobx';
import { catchError, map, Observable, throwError } from 'rxjs';
import { mapRef, Ref } from '../../model/ref';
import { catchAll } from '../../mods/scrape';
import { Store } from '../../store/store';
import { params } from '../../util/http';
import { ConfigService } from '../config.service';
import { LoginService } from '../login.service';
import { RefService } from './ref.service';

@Injectable({
  providedIn: 'root',
})
export class ScrapeService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private store: Store,
    private refs: RefService,
    private login: LoginService,
  ) {
    autorun(() => {
      if (store.eventBus.event === '+plugin/scrape:defaults' || store.eventBus.event === '*:defaults') {
        this.defaults().subscribe();
      }
    });
  }

  private get base() {
    return this.config.api + '/api/v1/scrape';
  }

  webScrape(url: string): Observable<Ref> {
    return this.http.get<Ref>(`${this.base}/web`, {
      params: params({ url }),
    }).pipe(
      map(ref => {
        if (!ref) {
          throw 'Web scrape failed';
        }
        return ref;
      }),
      map(mapRef),
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  rss(url: string): Observable<string> {
    return this.http.get(`${this.base}/rss`, {
      params: params({ url }),
      responseType: 'text'
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  defaults(): Observable<any> {
    return this.refs.update({ ...catchAll, origin: this.store.account.origin }, true).pipe(
      catchError(err => {
        if (err.status === 404) return this.refs.create({ ...catchAll, origin: this.store.account.origin }, true);
        return throwError(() => err);
      })
    );
  }
}
