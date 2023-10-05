import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { autorun } from 'mobx';
import { catchError, map, Observable, of } from 'rxjs';
import { mapPage, Page } from '../../model/page';
import { mapRef, Ref, RefPageArgs, RefQueryArgs, writeRef } from '../../model/ref';
import { Store } from '../../store/store';
import { params } from '../../util/http';
import { ConfigService } from '../config.service';
import { LoginService } from '../login.service';

@Injectable({
  providedIn: 'root',
})
export class RefService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private store: Store,
    private login: LoginService,
  ) {
    autorun(() => {
      if (this.store.eventBus.event === 'reload') {
        this.store.eventBus.catchError(this.get(this.store.eventBus.ref!.url, this.store.eventBus.ref!.origin!))
          .subscribe(ref => this.store.eventBus.refresh(ref));
      }
    });
  }

  private get base() {
    return this.config.api + '/api/v1/ref';
  }

  private get repl() {
    return this.config.api + '/api/v1/repl/ref';
  }

  create(ref: Ref, force = false): Observable<string> {
    return this.http.post<string>(this.base, writeRef(ref), {
      params: !force ? undefined : { force: true },
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  push(ref: Ref, origin = ''): Observable<void> {
    return this.http.post<void>(this.repl, [writeRef(ref)], {
      params: params({ origin }),
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  get(url: string, origin = ''): Observable<Ref> {
    return this.http.get(this.base, {
      params: params({ url, origin }),
    }).pipe(
      map(mapRef),
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  exists(url: string, origin = ''): Observable<boolean> {
    return this.http.head(this.base, {
      params: params({ url, origin }),
    }).pipe(
      map(() => true),
      catchError(err => this.login.handleHttpError(err)),
      catchError(err => of(false)),
    );
  }

  page(args?: RefPageArgs): Observable<Page<Ref>> {
    return this.http.get(`${this.base}/page`, {
      params: params(args),
    }).pipe(
      map(mapPage(mapRef)),
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  count(args?: RefQueryArgs): Observable<number> {
    return this.http.get(`${this.base}/count`, {
      responseType: 'text',
      params: params(args),
    }).pipe(
      map(parseInt),
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  update(ref: Ref, force = false): Observable<string> {
    return this.http.put<string>(this.base, writeRef(ref), {
      params: !force ? undefined : { force: true },
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  patch(url: string, origin: string, cursor: string, patch: any[]): Observable<string> {
    return this.http.patch<string>(this.base, patch, {
      headers: { 'Content-Type': 'application/json-patch+json' },
      params: params({ url, origin, cursor }),
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  merge(url: string, origin: string, cursor: string, patch: Partial<Ref>): Observable<string> {
    return this.http.patch<string>(this.base, patch, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      params: params({ url, origin, cursor }),
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }

  delete(url: string, origin = ''): Observable<void> {
    return this.http.delete<void>(this.base, {
      params: params({ url, origin }),
    }).pipe(
      catchError(err => this.login.handleHttpError(err)),
    );
  }
}
