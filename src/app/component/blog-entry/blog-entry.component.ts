import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import { catchError, mergeMap, Observable, switchMap, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { writePlugins } from '../../form/plugins/plugins.component';
import { refForm, RefFormComponent } from '../../form/ref/ref.component';
import { Ext } from '../../model/ext';
import { Action, active, Icon, Visibility, visible } from '../../model/plugin';
import { Ref } from '../../model/ref';
import { deleteNotice } from '../../plugin/delete';
import { ActionService } from '../../service/action.service';
import { AdminService } from '../../service/admin.service';
import { RefService } from '../../service/api/ref.service';
import { ScrapeService } from '../../service/api/scrape.service';
import { TaggingService } from '../../service/api/tagging.service';
import { AuthzService } from '../../service/authz.service';
import { EditorService } from '../../service/editor.service';
import { Store } from '../../store/store';
import { scrollToFirstInvalid } from '../../util/form';
import { authors, clickableLink, formatAuthor, interestingTags, TAGS_REGEX } from '../../util/format';
import { printError } from '../../util/http';
import { hasTag, isOwnerTag, tagOrigin } from '../../util/tag';

@Component({
  selector: 'app-blog-entry',
  templateUrl: './blog-entry.component.html',
  styleUrls: ['./blog-entry.component.scss']
})
export class BlogEntryComponent implements OnInit {
  @HostBinding('class') css = 'blog-entry';
  @HostBinding('attr.tabindex') tabIndex = 0;
  tagRegex = TAGS_REGEX.source;

  @Input()
  blog?: Ext;

  editForm: UntypedFormGroup;
  submitted = false;
  expandPlugins: string[] = [];
  icons: Icon[] = [];
  actions: Action[] = [];
  tagging = false;
  editing = false;
  viewSource = false;
  deleting = false;
  @HostBinding('class.deleted')
  deleted = false;
  writeAccess = false;
  serverError: string[] = [];

  private _ref!: Ref;

  constructor(
    public admin: AdminService,
    public store: Store,
    private auth: AuthzService,
    private editor: EditorService,
    private refs: RefService,
    private acts: ActionService,
    private scraper: ScrapeService,
    private ts: TaggingService,
    private fb: UntypedFormBuilder,
  ) {
    this.editForm = refForm(fb);
  }

  get ref(): Ref {
    return this._ref;
  }

  get origin() {
    return this._ref.origin || undefined;
  }

  @Input()
  set ref(value: Ref) {
    this.submitted = false;
    this.deleted = false;
    this.deleting = false;
    this.editing = false;
    this.viewSource = false;
    this.tagging = false;
    this._ref = value;
    this.writeAccess = this.auth.writeAccess(value);
    this.icons = this.admin.getIcons(value.tags || []);
    this.actions = this.admin.getActions(value.tags || []).filter(a => a.response || this.auth.tagReadAccess(a.tag));
    this.expandPlugins = this.admin.getEmbeds(value.tags || []);
  }

  @ViewChild(RefFormComponent)
  set refForm(value: RefFormComponent) {
    _.defer(() => {
      value?.setRef(this._ref);
      this.editor.syncEditor(this.fb, this.editForm, this._ref.comment);
    });
  }

  ngOnInit(): void {
  }

  get canInvoice() {
    if (this._ref.origin) return false;
    if (!this.admin.status.plugins.invoice) return false;
    if (!this.isAuthor) return false;
    if (!this._ref.sources || !this._ref.sources.length) return false;
    return hasTag('plugin/comment', this._ref) ||
      !hasTag('internal', this._ref);
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
    if (!this.admin.status.plugins.archive) return null;
    return this.ref.plugins?.['plugin/archive']?.url || this.findArchive;
  }

  get findArchive() {
    if (this.ref.alternateUrls) {
      for (const s of this.ref.alternateUrls) {
        if (new URL(s).host === 'archive.ph') {
          return s;
        }
      }
    }
    return 'https://archive.ph/newest/' + this._ref.url;
  }

  get isAuthor() {
    return isOwnerTag(this.store.account.tag, this._ref);
  }

  get isRecipient() {
    return hasTag(this.store.account.mailbox, this._ref);
  }

  get authors() {
    return authors(this._ref);
  }

  get tags() {
    let result = interestingTags(this._ref.tags);
    if (this.blog?.config.filterTags) {
      result = _.intersection(result, this.blog.config.tags || []);
    }
    return result;
  }

  get webLink() {
    return clickableLink(this._ref);
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

  formatAuthor(user: string) {
    if (this.store.account.origin && tagOrigin(user) === this.store.account.origin) {
      user = user.replace(this.store.account.origin, '');
    }
    return formatAuthor(user);
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
    const tag = field.value;
    this.ts.create(tag, this._ref.url, this._ref.origin!).pipe(
      switchMap(() => this.refs.get(this.ref.url, this.ref.origin!)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.tagging = false;
      this.ref = ref;
    });
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

  showAction(a: Action) {
    if (a.tag && !this.writeAccess) return false;
    if (!this.visible(a)) return false;
    if (this.active(a) && !a.labelOn) return false;
    if (!this.active(a) && !a.labelOff) return false;
    return true;
  }

  doAction(a: Action) {
    this.runAndLoad(this.acts.apply(this.ref, a));
  }

  save() {
    this.submitted = true;
    this.editForm.markAllAsTouched();
    this.editor.syncEditor(this.fb, this.editForm);
    if (!this.editForm.valid) {
      scrollToFirstInvalid();
      return;
    }
    this.refs.update({
      ...this.ref,
      ...this.editForm.value,
      published: moment(this.editForm.value.published, moment.HTML5_FMT.DATETIME_LOCAL_SECONDS),
      plugins: writePlugins(this.editForm.value.tags, {
        ...this.ref.plugins,
        ...this.editForm.value.plugins
      }),
    }).pipe(
      switchMap(() => this.refs.get(this._ref.url, this._ref.origin)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.editing = false;
      this.ref = ref;
    });
  }

  delete() {
    (this.admin.status.plugins.delete
        ? this.refs.update(deleteNotice(this._ref))
        : this.refs.delete(this._ref.url, this._ref.origin)
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
