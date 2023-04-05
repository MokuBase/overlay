import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { defer, uniq, without } from 'lodash-es';
import * as moment from 'moment';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { writePlugins } from '../../form/plugins/plugins.component';
import { refForm, RefFormComponent } from '../../form/ref/ref.component';
import { Action, active, Icon, Visibility, visible } from '../../model/plugin';
import { Ref, writeRef } from '../../model/ref';
import { findArchive } from '../../plugin/archive';
import { deleteNotice } from '../../plugin/delete';
import { ActionService } from '../../service/action.service';
import { AdminService } from '../../service/admin.service';
import { OriginService } from '../../service/api/origin.service';
import { RefService } from '../../service/api/ref.service';
import { ScrapeService } from '../../service/api/scrape.service';
import { TaggingService } from '../../service/api/tagging.service';
import { AuthzService } from '../../service/authz.service';
import { EditorService } from '../../service/editor.service';
import { Store } from '../../store/store';
import { downloadRef } from '../../util/download';
import { scrollToFirstInvalid } from '../../util/form';
import {
  authors,
  clickableLink,
  formatAuthor,
  interestingTags,
  TAGS_REGEX,
  templates,
  urlSummary
} from '../../util/format';
import { getScheme } from '../../util/hosts';
import { printError } from '../../util/http';
import { hasTag, hasUserUrlResponse, isOwnerTag, queriesAny, tagOrigin } from '../../util/tag';

@Component({
  selector: 'app-ref',
  templateUrl: './ref.component.html',
  styleUrls: ['./ref.component.scss'],
})
export class RefComponent implements OnInit {
  css = 'ref list-item ';
  @HostBinding('attr.tabindex') tabIndex = 0;
  tagRegex = TAGS_REGEX.source;

  @Input()
  expanded = false;
  @Input()
  expandInline = false;
  @Input()
  showToggle = false;

  editForm: UntypedFormGroup;
  submitted = false;
  expandPlugins: string[] = [];
  editorPlugins: string[] = [];
  icons: Icon[] = [];
  alarm?: string;
  actions: Action[] = [];
  publishedLabel = $localize`published`;
  tagging = false;
  editing = false;
  viewSource = false;
  deleting = false;
  @HostBinding('class.deleted')
  deleted = false;
  actionsExpanded = false;
  writeAccess = false;
  taggingAccess = false;
  serverError: string[] = [];
  publishChanged = false;

  private _ref!: Ref;

  constructor(
    public admin: AdminService,
    public store: Store,
    private router: Router,
    private auth: AuthzService,
    private editor: EditorService,
    private refs: RefService,
    private acts: ActionService,
    private scraper: ScrapeService,
    private origins: OriginService,
    private ts: TaggingService,
    private fb: UntypedFormBuilder,
  ) {
    this.editForm = refForm(fb);
  }

  @HostBinding('class')
  get pluginClasses() {
    return this.css + templates(this.ref.tags, 'plugin')
      .map(t => t.replace(/\//g, '-'))
      .join(' ');
  }

  get ref(): Ref {
    return this._ref;
  }

  get origin() {
    return this.ref.origin || (this.store.account.origin ? '' : undefined);
  }

  @Input()
  set ref(value: Ref) {
    this._ref = value;
    this.submitted = false;
    this.deleted = false;
    this.deleting = false;
    this.editing = false;
    this.viewSource = false;
    this.tagging = false;
    this.actionsExpanded = false;
    this.writeAccess = this.auth.writeAccess(value);
    this.taggingAccess = this.auth.taggingAccess(value);
    this.icons = this.admin.getIcons(value.tags, getScheme(value.url)!);
    this.alarm = queriesAny(this.store.account.alarms, value.tags);
    this.actions = this.admin.getActions(value.tags, value.plugins).filter(a => a.response || this.auth.canAddTag(a.tag));
    this.publishedLabel = this.admin.getPublished(value.tags).join($localize`/`) || this.publishedLabel;
    this.expandPlugins = this.admin.getEmbeds(value.tags);
  }

  @ViewChild(RefFormComponent)
  set refForm(value: RefFormComponent) {
    defer(() => {
      value?.setRef(this.ref);
      this.editor.syncEditor(this.fb, this.editForm, this.ref.comment);
    });
  }

  ngOnInit(): void {
  }

  private runAndLoad(observable: Observable<any>) {
    observable.pipe(
      switchMap(() => this.refs.get(this.ref.url, this.ref.origin!)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  get local() {
    return this.ref.origin === this.store.account.origin;
  }

  get feed() {
    return !!this.admin.status.plugins.feed && hasTag('+plugin/feed', this.ref);
  }

  get comment() {
    return !!this.admin.status.plugins.comment && hasTag('plugin/comment', this.ref);
  }

  get remote() {
    return !!this.admin.status.plugins.origin && hasTag('+plugin/origin', this.ref);
  }

  get originPush() {
    return !!this.admin.status.plugins.originPush && hasTag('+plugin/origin/push', this.ref);
  }

  get originPull() {
    return !!this.admin.status.plugins.originPull && hasTag('+plugin/origin/pull', this.ref);
  }

  get addTags() {
    if (this.feed) {
      return interestingTags(this.ref.plugins!['+plugin/feed'].addTags);
    }
    if (this.originPull) {
      return interestingTags(this.ref.plugins?.['+plugin/origin']?.addTags);
    }
    return undefined;
  }

  get addOrigin() {
    if (this.feed) {
      return this.ref.plugins!['+plugin/feed'].origin;
    }
    if (this.remote) {
      return this.ref.plugins?.['+plugin/origin']?.local;
    }
    return undefined;
  }

  get lastScrape() {
    if (!this.ref.plugins?.['+plugin/feed']?.lastScrape) return null;
    return moment(this.ref.plugins['+plugin/feed'].lastScrape);
  }

  get lastPush() {
    if (!this.ref.plugins?.['+plugin/origin/push']?.lastPush) return null;
    return moment(this.ref.plugins['+plugin/origin/push'].lastPush);
  }

  get lastPull() {
    if (!this.ref.plugins?.['+plugin/origin/pull']?.lastPull) return null;
    return moment(this.ref.plugins['+plugin/origin/pull'].lastPull);
  }

  get thumbnail() {
    return this.admin.status.plugins.thumbnail &&
      hasTag('plugin/thumbnail', this.ref);
  }

  get audio() {
    return this.admin.status.plugins.audio &&
      hasTag('plugin/audio', this.ref);
  }

  get video() {
    return this.admin.status.plugins.video &&
      hasTag('plugin/video', this.ref);
  }

  get image() {
    return this.admin.status.plugins.image &&
      hasTag('plugin/image', this.ref);
  }

  get mediaAttachment() {
    if (this.audio) {
      return this.ref.plugins?.['plugin/audio'].url;
    }
    if (this.video) {
      return this.ref.plugins?.['plugin/video'].url;
    }
    if (this.image) {
      return this.ref.plugins?.['plugin/image'].url;
    }
    return false;
  }

  get canInvoice() {
    if (!this.local) return false;
    if (!this.admin.status.plugins.invoice) return false;
    if (!this.isAuthor) return false;
    if (!this.ref.sources || !this.ref.sources.length) return false;
    return hasTag('plugin/comment', this.ref) ||
      !hasTag('internal', this.ref);
  }

  get pdf() {
    if (!this.admin.status.plugins.pdf) return null;
    return this.ref.plugins?.['plugin/pdf']?.url || this.findPdf;
  }

  get findPdf() {
    if (!this.ref.alternateUrls) return null;
    for (const s of this.ref.alternateUrls) {
      if (new URL(s).pathname.endsWith('.pdf')) {
        return s;
      }
    }
    return null;
  }

  get archive() {
    const plugin = this.admin.getPlugin('plugin/archive');
    if (!plugin) return null;
    return this.ref.plugins?.['plugin/archive']?.url || findArchive(plugin, this.ref);
  }

  get isAuthor() {
    return isOwnerTag(this.store.account.tag, this.ref);
  }

  get isRecipient() {
    return hasTag(this.store.account.mailbox, this.ref);
  }

  get authors() {
    return authors(this.ref);
  }

  get tags() {
    return interestingTags(this.ref.tags);
  }

  get host() {
    return urlSummary(this.ref.url);
  }

  get clickableLink() {
    return clickableLink(this.ref);
  }

  get comments() {
    if (!this.admin.status.plugins.comment) return 0;
    return this.ref.metadata?.plugins?.['plugin/comment'] || 0;
  }

  get responses() {
    return this.ref.metadata?.responses || 0;
  }

  get sources() {
    return this.ref.sources?.length || 0;
  }

  get publishedIsSubmitted() {
    return !this.ref.published || Math.abs(this.ref.published.diff(this.ref.created, 'seconds')) <= 5;
  }

  get modifiedIsSubmitted() {
    return !this.ref.modified || Math.abs(this.ref.modified.diff(this.ref.created, 'seconds')) <= 5;
  }

  get upvote() {
    return hasUserUrlResponse('plugin/vote/up', this.ref);
  }

  get downvote() {
    return hasUserUrlResponse('plugin/vote/down', this.ref);
  }

  formatAuthor(user: string) {
    if (this.store.account.origin && tagOrigin(user) === this.store.account.origin) {
      user = user.replace(this.store.account.origin, '');
    }
    return formatAuthor(user);
  }

  download() {
    downloadRef(writeRef(this.ref));
  }

  downloadMedia() {
    window.open(this.mediaAttachment, "_blank");
  }

  addInlineTag(field: HTMLInputElement) {
    if (field.validity.patternMismatch) {
      this.serverError = [$localize`
        Tags must be lower case letters, numbers, periods and forward slashes.
        Must not start with a forward slash or period.
        Must not or contain two forward slashes or periods in a row.
        Protected tags start with a plus sign.
        Private tags start with an underscore.`];
      return;
    }
    this.runAndLoad(this.ts.create(field.value, this.ref.url, this.ref.origin!));
  }

  visible(v: Visibility) {
    return visible(v, this.isAuthor, this.isRecipient);
  }

  active(a: Action | Icon) {
    return active(this.ref, a);
  }

  showIcon(i: Icon) {
    return this.visible(i) && this.active(i);
  }

  clickIcon(i: Icon) {
    if (i.response) {
      this.router.navigate([], { queryParams: { filter: this.store.view.toggleFilter(i.response) }, queryParamsHandling: 'merge' });
    }
    if (i.tag) {
      this.router.navigate(['/tag', this.store.view.toggleTag(i.tag)], { queryParamsHandling: 'merge' });
    }
    if (i.scheme) {
      this.router.navigate(['/tag', '@*'], { queryParamsHandling: 'merge', queryParams: { search: i.scheme } });
    }
  }

  showAction(a: Action) {
    if (a.tag === 'locked' && !this.writeAccess) return false;
    if (a.tag && !this.taggingAccess) return false;
    if (!this.visible(a)) return false;
    if (this.active(a) && !a.labelOn) return false;
    if (!this.active(a) && !a.labelOff) return false;
    return true;
  }

  voteUp() {
    if (this.upvote) {
      this.runAndLoad(this.ts.deleteResponse('plugin/vote/up', this.ref.url));
    } else if (!this.downvote) {
      this.runAndLoad(this.ts.createResponse('plugin/vote/up', this.ref.url));
    } else {
      this.runAndLoad(this.ts.respond(['plugin/vote/up', '-plugin/vote/down'], this.ref.url));
    }
  }

  voteDown() {
    if (this.downvote) {
      this.runAndLoad(this.ts.deleteResponse('plugin/vote/down', this.ref.url));
    } else if (!this.upvote) {
      this.runAndLoad(this.ts.createResponse('plugin/vote/down', this.ref.url));
    } else {
      this.runAndLoad(this.ts.respond(['-plugin/vote/up', 'plugin/vote/down'], this.ref.url));
    }
  }

  doAction(a: Action) {
    this.runAndLoad(this.acts.apply(this.ref, a));
  }

  scrape() {
    this.runAndLoad(this.scraper.feed(this.ref.url, this.ref.origin!));
  }

  push() {
    this.runAndLoad(this.origins.push(this.ref.url, this.ref.origin!));
  }

  pull() {
    this.runAndLoad(this.origins.pull(this.ref.url, this.ref.origin!));
  }

  save() {
    this.submitted = true;
    this.editForm.markAllAsTouched();
    this.editor.syncEditor(this.fb, this.editForm);
    if (!this.editForm.valid) {
      scrollToFirstInvalid();
      return;
    }
    const tags = uniq([...without(this.editForm.value.tags, ...this.admin.editorTags), ...this.editorPlugins]);
    const published = moment(this.editForm.value.published, moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
    this.refs.update({
      ...this.ref,
      ...this.editForm.value,
      tags,
      published,
      plugins: writePlugins(tags, {
        ...this.ref.plugins,
        ...this.editForm.value.plugins,
      }),
    }).pipe(
      switchMap(() => this.refs.get(this.ref.url, this.ref.origin)),
      tap(ref => this.publishChanged = !published.isSame(ref.published)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  copy() {
    const tags = (this.ref.tags || []).filter(t => this.auth.canAddTag(t));
    this.refs.create({
      ...this.ref,
      origin: this.store.account.origin,
      tags,
    }, true).pipe(
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.router.navigate(['/ref', this.ref.url], { queryParams: { origin: this.store.account.origin }})
    });
  }

  delete() {
    (this.admin.status.plugins.delete
      ? this.refs.update(deleteNotice(this.ref))
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

  cssUrl(url: string) {
    return `url("${url}")`;
  }
}
