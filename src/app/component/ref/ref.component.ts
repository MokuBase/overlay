import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import { catchError, switchMap, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { writePlugins } from '../../form/plugins/plugins.component';
import { refForm, RefFormComponent } from '../../form/ref/ref.component';
import { Ref } from '../../model/ref';
import { AdminService } from '../../service/admin.service';
import { RefService } from '../../service/api/ref.service';
import { ScrapeService } from '../../service/api/scrape.service';
import { TaggingService } from '../../service/api/tagging.service';
import { AuthService } from '../../service/auth.service';
import { EditorService } from '../../service/editor.service';
import { Store } from '../../store/store';
import { scrollToFirstInvalid } from '../../util/form';
import { authors, interestingTags, TAG_REGEX_STRING, urlSummary, webLink } from '../../util/format';
import { printError } from '../../util/http';
import { hasTag } from '../../util/tag';

@Component({
  selector: 'app-ref',
  templateUrl: './ref.component.html',
  styleUrls: ['./ref.component.scss'],
})
export class RefComponent implements OnInit {
  @HostBinding('class') css = 'ref list-item';
  @HostBinding('attr.tabindex') tabIndex = 0;
  tagRegex = TAG_REGEX_STRING;

  @Input()
  expanded = false;
  @Input()
  expandInline = false;
  @Input()
  showToggle = false;

  @ViewChild('inlineTag')
  inlineTag?: ElementRef;

  editForm: UntypedFormGroup;
  submitted = false;
  expandPlugins: string[] = [];
  tagging = false;
  editing = false;
  viewSource = false;
  deleting = false;
  @HostBinding('class.deleted')
  deleted = false;
  actionsExpanded = false;
  writeAccess = false;
  serverError: string[] = [];

  private _ref!: Ref;

  constructor(
    public admin: AdminService,
    public store: Store,
    private auth: AuthService,
    private editor: EditorService,
    private refs: RefService,
    private feeds: ScrapeService,
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
    this.actionsExpanded = false;
    this._ref = value;
    this.writeAccess = this.auth.writeAccess(value);
    if (value.tags) {
      this.expandPlugins = this.admin.getEmbeds(value);
    }
  }

  @ViewChild(RefFormComponent)
  set refForm(value: RefFormComponent) {
    _.defer(() => value?.setRef(this._ref));
  }

  ngOnInit(): void {
  }

  get thumbnail() {
    return this.admin.status.plugins.thumbnail &&
      hasTag('plugin/thumbnail', this._ref);
  }

  get person() {
    return this.admin.status.plugins.person &&
      hasTag('plugin/person', this._ref);
  }

  get canInvoice() {
    if (this._ref.origin) return false;
    if (!this.admin.status.plugins.invoice) return false;
    if (!this.isAuthor) return false;
    if (!this._ref.sources || !this._ref.sources.length) return false;
    return hasTag('plugin/comment', this._ref) ||
      !hasTag('internal', this._ref);
  }

  get invoice() {
    return this.admin.status.plugins.invoice &&
      hasTag('plugin/invoice', this._ref);
  }

  get disputed() {
    return this._ref.metadata?.plugins?.['plugin/invoice/disputed'].length;
  }

  get paid() {
    return this._ref.metadata?.plugins?.['plugin/invoice/paid'].length;
  }

  get rejected() {
    return this._ref.metadata?.plugins?.['plugin/invoice/rejected'].length;
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

  get scrapeable() {
    return this.admin.status.plugins.feed && this.ref.plugins?.['+plugin/feed'] ||
      this.admin.status.plugins.origin && this.ref.plugins?.['+plugin/origin'];
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
    return hasTag(this.store.account.tag, this._ref);
  }

  get isRecipient() {
    return hasTag(this.store.account.inbox, this._ref);
  }

  get authors() {
    return authors(this._ref);
  }

  get tags() {
    return interestingTags(this._ref.tags);
  }

  get host() {
    return urlSummary(this._ref.url);
  }

  get webLink() {
    return webLink(this._ref);
  }

  get approved() {
    return hasTag('_moderated', this._ref);
  }

  get locked() {
    return hasTag('locked', this._ref);
  }

  get comments() {
    if (!this._ref.metadata) return '? comments';
    const commentCount = this._ref.metadata.plugins?.['plugin/comment']?.length;
    if (commentCount === 0) return 'comment';
    if (commentCount === 1) return '1 comment';
    return commentCount + ' comments';
  }

  get responses() {
    if (!this._ref.metadata) return '? citations';
    const responseCount = this._ref.metadata.responses?.length;
    if (responseCount === 0) return 'uncited';
    if (responseCount === 1) return '1 citation';
    return responseCount + ' citations';
  }

  get sources() {
    const sourceCount = this._ref.sources?.length || 0;
    if (sourceCount === 0) return 'unsourced';
    if (sourceCount === 1) return '1 source';
    return sourceCount + ' sources';
  }

  addInlineTag() {
    if (!this.inlineTag) return;
    const tag = (this.inlineTag.nativeElement.value as string).toLowerCase().trim();
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

  approve() {
    this.refs.patch(this._ref.url, this._ref.origin!, [{
      op: 'add',
      path: '/tags/-',
      value: '_moderated',
    }]).pipe(
      switchMap(() => this.refs.get(this._ref.url, this._ref.origin!)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  accept() {
    this.refs.delete(this._ref.metadata!.plugins['plugin/invoice/disputed'][0]).pipe(
      switchMap(() => this.refs.get(this._ref.url)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  dispute() {
    this.refs.create({
      url: 'internal:' + uuid(),
      published: moment(),
      tags: ['internal', this.store.account.tag!, 'plugin/invoice/disputed'],
      sources: [this._ref.url],
    }).pipe(
      switchMap(() => this.refs.get(this._ref.url)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  markPaid() {
    if (this._ref.metadata?.plugins?.['plugin/invoice/rejected']?.length) {
      this.refs.delete(this._ref.metadata!.plugins['plugin/invoice/rejected'][0]).pipe(
        switchMap(() => this.refs.get(this._ref.url)),
        catchError((err: HttpErrorResponse) => {
          this.serverError = printError(err);
          return throwError(() => err);
        }),
      ).subscribe(ref => {
        this.serverError = [];
        this.ref = ref;
      });
    }
    this.refs.create({
      url: 'internal:' + uuid(),
      published: moment(),
      tags: ['internal', this.store.account.tag!, 'plugin/invoice/paid'],
      sources: [this._ref.url],
    }).pipe(
      switchMap(() => this.refs.get(this._ref.url)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  reject() {
    if (this._ref.metadata?.plugins?.['plugin/invoice/paid']?.length) {
      this.refs.delete(this._ref.metadata!.plugins['plugin/invoice/paid'][0]).pipe(
        switchMap(() => this.refs.get(this._ref.url)),
        catchError((err: HttpErrorResponse) => {
          this.serverError = printError(err);
          return throwError(() => err);
        }),
      ).subscribe(ref => {
        this.serverError = [];
        this.ref = ref;
      });
    }
    this.refs.create({
      url: 'internal:' + uuid(),
      published: moment(),
      tags: ['internal', this.store.account.tag!, 'plugin/invoice/rejected'],
      sources: [this._ref.url],
    }).pipe(
      switchMap(() => this.refs.get(this._ref.url)),
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
  }

  scrape() {
    this.feeds.scrape(this.ref.url, this.ref.origin!).pipe(
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
      switchMap(() => this.refs.get(this.ref.url, this.ref.origin)),
    ).subscribe(ref => {
      this.serverError = [];
      this.ref = ref;
    });
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
      plugins: writePlugins(this.editForm.value.plugins),
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
    this.refs.delete(this._ref.url, this._ref.origin!).pipe(
      catchError((err: HttpErrorResponse) => {
        this.serverError = printError(err);
        return throwError(() => err);
      }),
    ).subscribe(() => {
      this.serverError = [];
      this.deleted = true;
    });
  }

  cssUrl(url: string) {
    return `url("${url}")`;
  }
}
