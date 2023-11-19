import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostBinding, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { defer } from 'lodash-es';
import { catchError, ignoreElements, switchMap, throwError } from 'rxjs';
import { Ref } from '../../../model/ref';
import { deleteNotice } from '../../../mods/delete';
import { AdminService } from '../../../service/admin.service';
import { ExtService } from '../../../service/api/ext.service';
import { RefService } from '../../../service/api/ref.service';
import { TaggingService } from '../../../service/api/tagging.service';
import { AuthzService } from '../../../service/authz.service';
import { Store } from '../../../store/store';
import { authors, clickableLink, formatAuthor, TAGS_REGEX, trimCommentForTitle } from '../../../util/format';
import { printError } from '../../../util/http';
import { memo, MemoCache } from '../../../util/memo';
import { hasTag, tagOrigin } from '../../../util/tag';

@Component({
  selector: 'app-chat-entry',
  templateUrl: './chat-entry.component.html',
  styleUrls: ['./chat-entry.component.scss']
})
export class ChatEntryComponent implements OnChanges {
  @HostBinding('class') css = 'chat-entry';
  @HostBinding('attr.tabindex') tabIndex = 0;
  tagRegex = TAGS_REGEX.source;

  @Input()
  ref!: Ref;
  @Input()
  focused = false;
  @Input()
  loading = true;

  @ViewChild('inlineTag')
  inlineTag?: ElementRef;

  noComment: Ref = {} as any;
  repostRef?: Ref;
  tagging = false;
  deleting = false;
  deleted = false;
  writeAccess = false;
  taggingAccess = false;
  serverError: string[] = [];

  private _allowActions = false;

  constructor(
    public admin: AdminService,
    public store: Store,
    private auth: AuthzService,
    private exts: ExtService,
    private ts: TaggingService,
    private refs: RefService,
  ) { }

  init() {
    MemoCache.clear(this);
    this.writeAccess = this.auth.writeAccess(this.ref);
    this.taggingAccess = this.auth.taggingAccess(this.ref);
    if (this.ref && this.bareRepost && !this.repostRef) {
      this.refs.get(this.url, this.ref.origin)
      .subscribe(ref => {
        this.repostRef = ref;
        this.noComment = {
          ...ref,
          comment: ''
        };
      });
    } else {
      this.noComment = {
        ...this.ref,
        comment: ''
      };
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ref || changes.focused) {
      this.init();
    }
  }

  @memo
  get title() {
    const title = (this.ref?.title || '').trim();
    const comment = (this.ref?.comment || '').trim();
    if (title) return title;
    if (this.focused) return '';
    if (!comment) {
      if (this.bareRepost) return $localize`Repost`;
      return this.url;
    }
    return trimCommentForTitle(comment);
  }

  get allowActions(): boolean {
    return this._allowActions || this.focused || this.tagging || this.deleting;
  }

  set allowActions(value: boolean) {
    if (value === this._allowActions) return;
    if (value) {
      defer(() => this._allowActions = value);
    } else {
      this._allowActions = false;
    }
  }

  @memo
  get nonLocalOrigin() {
    if (this.ref.origin === this.store.account.origin) return undefined;
    return this.ref.origin || '';
  }

  @memo
  get authors() {
    return authors(this.ref, this.store.view.ext?.config?.authorTags || []);
  }

  @memo
  get authorExts$() {
    return this.exts.getCachedExts(this.authors, this.ref.origin || '').pipe(this.admin.authorFallback);
  }

  @memo
  get clickableLink() {
    return clickableLink(this.url);
  }

  @memo
  get url() {
    return this.repost ? this.ref.sources![0] : this.ref.url;
  }

  @memo
  get currentRef() {
    return this.repost ? this.repostRef : this.ref;
  }

  @memo
  get bareRef() {
    return this.bareRepost ? this.repostRef : this.ref;
  }

  @memo
  get repost() {
    return this.ref?.sources?.length && hasTag('plugin/repost', this.ref);
  }

  @memo
  get bareRepost() {
    return this.repost && !this.ref.title && !this.ref.comment;
  }

  @memo
  get approved() {
    return hasTag('_moderated', this.currentRef);
  }

  @memo
  get locked() {
    return hasTag('locked', this.currentRef);
  }

  @memo
  get qr() {
    return hasTag('plugin/qr', this.currentRef);
  }

  @memo
  get audio() {
    return hasTag('plugin/audio', this.currentRef) ||
      this.admin.getPluginsForUrl(this.url).find(p => p.tag === 'plugin/audio');
  }

  @memo
  get video() {
    return hasTag('plugin/video', this.currentRef) ||
      this.admin.getPluginsForUrl(this.url).find(p => p.tag === 'plugin/image');
  }

  @memo
  get image() {
    return hasTag('plugin/image', this.currentRef) ||
      this.admin.getPluginsForUrl(this.url).find(p => p.tag === 'plugin/image');
  }

  @memo
  get media() {
    return this.qr || this.audio || this.video || this.image;
  }

  @memo
  get expand() {
    return this.currentRef?.comment || this.media;
  }

  @memo
  get comments() {
    if (!this.admin.getPlugin('plugin/comment')) return 0;
    return this.ref.metadata?.plugins?.['plugin/comment'] || 0;
  }

  @memo
  formatAuthor(user: string) {
    if (this.store.account.origin && tagOrigin(user) === this.store.account.origin) {
      user = user.replace(this.store.account.origin, '');
    }
    return formatAuthor(user);
  }

  addInlineTag() {
    if (!this.inlineTag) return;
    const tag = (this.inlineTag.nativeElement.value as string).toLowerCase().trim();
    this.ts.create(tag, this.ref.url, this.ref.origin!).pipe(
      switchMap(() => this.refs.get(this.ref.url, this.ref.origin!)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.tagging = false;
      this.ref = ref;
      this.init();
    });
  }

  approve() {
    this.refs.patch(this.ref.url, this.ref.origin!, this.ref.modifiedString!, [{
      op: 'add',
      path: '/tags/-',
      value: '_moderated',
    }]).pipe(
      switchMap(() => this.refs.get(this.ref.url, this.ref.origin!)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
      this.init();
    });
  }

  delete() {
    (this.admin.getPlugin('plugin/delete')
        ? this.refs.update(deleteNotice(this.ref)).pipe(ignoreElements())
        : this.refs.delete(this.ref.url, this.ref.origin)
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(() => {
      this.serverError = [];
      this.deleting = false;
      this.deleted = true;
    });
  }

}
