import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { defer, uniq, without } from 'lodash-es';
import { catchError, map, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Oembed } from '../../model/oembed';
import { Ref } from '../../model/ref';
import { AdminService } from '../../service/admin.service';
import { ScrapeService } from '../../service/api/scrape.service';
import { EditorService } from '../../service/editor.service';
import { OembedStore } from '../../store/oembed';
import { getScheme } from '../../util/http';
import { hasMedia, hasTag } from '../../util/tag';
import { LinksFormComponent } from '../links/links.component';
import { pluginsForm, PluginsFormComponent } from '../plugins/plugins.component';
import { TagsFormComponent } from '../tags/tags.component';

@Component({
  standalone: false,
  selector: 'app-ref-form',
  templateUrl: './ref.component.html',
  styleUrls: ['./ref.component.scss'],
  host: {'class': 'nested-form'}
})
export class RefFormComponent {

  @Input()
  origin? = '';
  @Input()
  group!: UntypedFormGroup;
  @Output()
  toggleTag = new EventEmitter<string>();

  @ViewChild(TagsFormComponent)
  tags!: TagsFormComponent;
  @ViewChild('sources')
  sources!: LinksFormComponent;
  @ViewChild('alts')
  alts!: LinksFormComponent;
  @ViewChild(PluginsFormComponent)
  plugins!: PluginsFormComponent;
  @ViewChild('fill')
  fill?: ElementRef;

  @HostBinding('class.show-drops')
  dropping = false;

  oembed?: Oembed;
  scraped?: Ref;
  ref?: Ref;

  constructor(
    private fb: UntypedFormBuilder,
    public admin: AdminService,
    private editor: EditorService,
    private scrape: ScrapeService,
    private oembeds: OembedStore,
  ) { }

  get web() {
    const scheme = getScheme(this.url.value);
    return scheme === 'http:' || scheme === 'https:';
  }

  get url() {
    return this.group.get('url') as UntypedFormControl;
  }

  get title() {
    return this.group.get('title') as UntypedFormControl;
  }

  get comment() {
    return this.group.get('comment') as UntypedFormControl;
  }

  get published() {
    return this.group.get('published') as UntypedFormControl;
  }

  set editorTags(value: string[]) {
    const addTags = value.filter(t => !t.startsWith('-'));
    const removeTags = value.filter(t => t.startsWith('-')).map(t => t.substring(1));
    const newTags = uniq([...without(this.tags!.tags!.value, ...removeTags), ...addTags]);
    this.tags!.setTags(newTags);
  }

  get editorLabel() {
    if (this.tags?.hasTag('plugin/alt')) return $localize`Alt Text`;
    return $localize`Abstract`;
  }

  get addEditorLabel() {
    return $localize`+ Add ` + this.editorLabel.toLowerCase();
  }

  get addEditorTitle() {
    return $localize`Add ` + this.editorLabel.toLowerCase();
  }

  @HostListener('dragenter')
  onDragEnter() {
    this.dropping = true;
  }

  @HostListener('window:dragend')
  OnDragEnd() {
    this.dropping = false;
  }

  validate(input: HTMLInputElement) {
    if (this.title.touched) {
      if (this.title.errors?.['required']) {
        input.setCustomValidity($localize`Title must not be blank.`);
        input.reportValidity();
      }
    }
  }

  setComment(value: string) {
    this.comment.setValue(value);
    // Ignore tags and sources from new comment
    this.editor.syncEditor(this.fb, this.group, value);
  }

  syncEditor() {
    this.editor.syncEditor(this.fb, this.group);
  }

  get scrape$() {
    if (this.scraped) return of(this.scraped);
    return this.scrape.webScrape(this.tags.hasTag('plugin/repost') ? this.sources.links?.value?.[0] : this.url.value).pipe(
      tap(s => {
        this.scraped = s;
        if (s.modified && this.ref?.modified) {
          this.ref!.modifiedString = s.modifiedString;
          this.ref!.modified = s.modified;
          if (hasTag('_plugin/cache', s)) {
            this.ref!.tags ||= [];
            this.ref!.tags.push('_plugin/cache');
            this.ref!.plugins ||= {}
            this.ref!.plugins['_plugin/cache'] = s.plugins?.['_plugin/cache'];
          }
          this.setRef(this.ref!);
        }
      }),
    );
  }

  scrapeTitle() {
    this.scrape$.pipe(
      catchError(err => of({
        url: this.url.value,
        title: undefined,
      })),
      switchMap(s => this.oembeds.get(s.url).pipe(
        map(oembed => {
          this.oembed = oembed!;
          if (oembed) s.title ||= oembed.title;
          return s;
        }),
        catchError(err => of(s)),
      )),
    ).subscribe((s: Ref) => {
      if (s.title) this.group.patchValue({ title: s.title });
    });
  }

  scrapePublished() {
    this.scrape$.subscribe(ref => {
      this.published.setValue(ref.published?.toFormat("YYYY-MM-DD'T'TT"));
    });
  }

  scrapeAll() {
    if (this.oembed) {
      // TODO: oEmbed
    } else {
      this.scrape$.subscribe(s => {
        if (!hasMedia(s) || hasMedia(this.group.value)) {
          this.scrapeComment();
        }
        this.scrapePlugins();
      });
    }
  }

  scrapePlugins() {
    if (this.oembed) {
      // TODO: oEmbed
    } else {
      this.scrape$.subscribe(s => {
        for (const t of s.tags || []) {
          if (!this.tags.hasTag(t)) this.togglePlugin(t);
        }
        defer(() => {
          this.plugins.setValue({
            ...this.group.value.plugins || {},
            ...s.plugins || {},
          });
        });
      });
    }
  }

  scrapeComment() {
    if (this.oembed) {
      // TODO: oEmbed
    } else {
      this.scrape$.subscribe(s => this.setComment(s.comment || ''));
    }
  }

  togglePlugin(tag: string) {
    this.toggleTag.next(tag);
    if (tag) {
      if (this.tags.hasTag(tag)) {
        this.tags.removeTagAndChildren(tag);
      } else {
        this.tags.addTag(tag);
      }
    }
  }

  setRef(ref: Ref) {
    this.ref = ref;
    this.sources.model = [...ref?.sources || []];
    this.alts.model = [...ref?.alternateUrls || []];
    this.tags.model = [...ref.tags || []];
    this.group.setControl('plugins', pluginsForm(this.fb, this.admin, ref.tags || []));
    this.group.patchValue({
      ...ref,
      published: ref.published ? ref.published.toFormat("yyyy-MM-dd'T'TT") : undefined,
    });
    defer(() => this.plugins.setValue(ref.plugins));
  }
}

export function refForm(fb: UntypedFormBuilder) {
  return fb.group({
    url: { value: '',  disabled: true },
    published: [''],
    title: [''],
    comment: [''],
    sources: fb.array([]),
    alternateUrls: fb.array([]),
    tags: fb.array([]),
    plugins: fb.group({})
  });
}
