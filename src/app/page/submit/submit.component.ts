import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import { catchError, forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { scan, tap } from 'rxjs/operators';
import { Ref } from '../../model/ref';
import { RefService } from '../../service/api/ref.service';
import { ScrapeService } from '../../service/api/scrape.service';
import { ThemeService } from '../../service/theme.service';
import { URI_REGEX, wikiUriFormat } from '../../util/format';

type Validation = { test: (url: string) => Observable<any>; name: string; passed: boolean };

@Component({
  selector: 'app-submit-page',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss'],
})
export class SubmitPage implements OnInit {

  submitForm: UntypedFormGroup;

  linkShorteners = [
    '//bit.ly/',
    '//ow.ly/',
    '//tinyurl.com/',
    '//is.gd/',
    '//buff.ly/',
    '//adf.ly/',
    '//bit.do/',
    '//mcaf.ee/',
    '//su.pr/',
  ];

  validations: Validation[] = [
    { name: 'Valid link', passed: false, test: url => of(this.linkType(url)) },
    { name: 'Not submitted yet', passed: true, test: url => this.exists(url).pipe(map(exists => !exists)) },
    { name: 'No link shorteners', passed: true, test: url => of(!this.isShortener(url)) },
  ];

  linkTypeOverride?: string;
  tags: string[] = [];
  existingRef?: Ref;
  scrape = true;

  constructor(
    private theme: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private refs: RefService,
    private feeds: ScrapeService,
    private fb: UntypedFormBuilder,
  ) {
    theme.setTitle('Submit: Link');
    this.submitForm = fb.group({
      url: ['', [Validators.required], [this.validator]],
      scrape: [true],
    });
    route.queryParams.subscribe(params => {
      if (params['tag']) {
        this.tags = _.flatten([params['tag']]);
        if (this.tags.includes('+plugin/feed')) {
          this.scrape = false;
        }
      }
      if (params['linkType']) {
        this.linkTypeOverride = params['linkType'];
      }
      if (params['url']) {
        this.url.setValue(params['url']);
      }
    });
  }

  ngOnInit(): void {
  }

  get feed() {
    return this.tags.includes('+plugin/feed');
  }

  get origin() {
    return this.tags.includes('+plugin/origin');
  }

  get url() {
    return this.submitForm.get('url') as UntypedFormControl;
  }

  get validator(): AsyncValidatorFn {
    return (control: AbstractControl) => this.validLink(control);
  }

  exists(url: string) {
    const linkType = this.linkType(url);
    if (linkType === 'web' || linkType === 'text') {
      if (this.existingRef?.url === url) return of(true);
      if (url.startsWith('wiki:')) url = wikiUriFormat(url);
      return this.refs.get(url).pipe(
        tap(ref => this.existingRef = ref),
        map(ref => !!ref),
        catchError(err => of(false)),
      );
    }
    return of(false);
  }

  isShortener(url: string) {
    url = url.toLowerCase();
    for (const frag of this.linkShorteners) {
      if (url.includes(frag)) return true;
    }
    return false;
  }

  submit() {
    const url = this.submitForm.value.url;
    this.router.navigate(['./submit', this.linkType(url)], {
      queryParams: { url, scrape: this.scrape },
      queryParamsHandling: 'merge',
    });
  }

  validLink(control: AbstractControl): Observable<ValidationErrors | null> {
    const vs: Observable<ValidationErrors | null>[] = [];
    for (const v of this.validations) {
      vs.push(v.test(control.value).pipe(
        tap(result => v.passed = !!result),
        map(res => res ? null : { error: v.name }),
      ));
    }
    return forkJoin(...vs).pipe(
      mergeMap(res => of(...res)),
      scan((acc, value) => value ? { ...acc, ...value } : acc, {}),
    );
  }

  linkType(value: string) {
    if (this.linkTypeOverride) return this.linkTypeOverride;
    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return 'web';
      }
    } catch (e) {}
    if (value.startsWith('wiki:')) return 'text';
    if (URI_REGEX.test(value)) return 'web';
    return null;
  }
}
