import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { catchError, combineLatest, filter, map, Observable, of, shareReplay } from 'rxjs';
import { distinctUntilChanged, mergeMap, scan, take } from 'rxjs/operators';
import { Ext } from '../../model/ext';
import { Page } from '../../model/page';
import { Ref } from '../../model/ref';
import { AccountService } from '../../service/account.service';
import { AdminService } from '../../service/admin.service';
import { ExtService } from '../../service/api/ext.service';
import { RefService } from '../../service/api/ref.service';
import { getArgs } from '../../util/query';
import { localTag } from '../../util/tag';

@Component({
  selector: 'app-tag-page',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagPage implements OnInit {

  title$: Observable<string>;
  localTag$: Observable<string>;
  ext$: Observable<Ext | null>;
  page$: Observable<Page<Ref>>;
  pinned$: Observable<Ref[]>;
  graph = false;

  private defaultPageSize = 20;

  constructor(
    public admin: AdminService,
    public account: AccountService,
    private route: ActivatedRoute,
    private refs: RefService,
    private exts: ExtService,
  ) {
    this.page$ = combineLatest(
      this.tag$, this.sort$, this.filter$, this.search$, this.pageNumber$, this.pageSize$,
    ).pipe(
      map(([tag, sort, filter, search, pageNumber, pageSize]) =>
        getArgs(tag, sort, filter, search, pageNumber, pageSize ?? this.defaultPageSize)),
      distinctUntilChanged(_.isEqual),
      mergeMap(args => this.refs.page(args)),
    );
    this.route.queryParams.pipe(
      map(params => params['graph']),
    ).subscribe(graph => this.graph = graph === 'true');
    this.localTag$ = this.tag$.pipe(
      map(tag => localTag(tag)),
    );
    this.ext$ = this.localTag$.pipe(
      mergeMap(tag => tag ? this.exts.get(tag) : of(null)),
      shareReplay(1),
    );
    this.title$ = this.ext$.pipe(
      mergeMap(ext => ext
        ? of(ext.name || ext.tag)
        : this.tag$.pipe(
          map(tag => tag === '@*' ? 'All' : tag),
        )),
    );
    this.pinned$ = this.ext$.pipe(
      filter(ext => !!ext),
      mergeMap(ext => of(...ext!.config.pinned as string[])),
      mergeMap(pin => this.refs.get(pin)),
      scan((acc, value) => [...acc, value], [] as Ref[]),
      catchError(() => of([])),
      take(1),
    );
  }

  ngOnInit(): void {
  }

  get tag$() {
    return this.route.params.pipe(
      map(params => params['tag']),
      distinctUntilChanged(),
    );
  }

  get sort$() {
    return this.route.params.pipe(
      map(params => params['sort']),
    );
  }

  get filter$() {
    return this.route.queryParams.pipe(
      map(queryParams => queryParams['filter']),
    );
  }

  get search$() {
    return this.route.queryParams.pipe(
      map(queryParams => queryParams['search'])
    );
  }

  get pageNumber$() {
    return this.route.queryParams.pipe(
      map(params => params['pageNumber']),
    );
  }

  get pageSize$() {
    return this.route.queryParams.pipe(
      map(params => params['pageSize']),
    );
  }

}
