import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AccountService } from '../../../service/account.service';
import { FeedService } from '../../../service/api/feed.service';
import { TAG_REGEX } from '../../../util/format';
import { printError } from '../../../util/http';

@Component({
  selector: 'app-submit-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class SubmitFeedPage implements OnInit {

  submitted = false;
  feedForm: FormGroup;
  serverError: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private account: AccountService,
    private feeds: FeedService,
    private fb: FormBuilder,
  ) {
    this.feedForm = fb.group({
      url: [''],
      name: [''],
      tags: fb.array([
        fb.control('public', [Validators.required, Validators.pattern(TAG_REGEX)]),
      ]),
    });
    route.queryParams.subscribe(params => {
      this.url.setValue(params['url']);
      if (params['tag']) {
        this.addTag(params['tag']);
      }
    });
  }

  ngOnInit(): void {
  }

  get url() {
    return this.feedForm.get('url') as FormControl;
  }

  get title() {
    return this.feedForm.get('title') as FormControl;
  }

  get tags() {
    return this.feedForm.get('tags') as FormArray;
  }

  addTag(value = '') {
    this.tags.push(this.fb.control(value, [Validators.required, Validators.pattern(TAG_REGEX)]));
    this.submitted = false;
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  submit() {
    this.serverError = [];
    this.submitted = true;
    this.feedForm.markAllAsTouched();
    if (!this.feedForm.valid) return;
    this.feeds.create(this.feedForm.value).pipe(
      catchError((res: HttpErrorResponse) => {
        this.serverError = printError(res);
        return throwError(() => res);
      }),
    ).subscribe(() => {
      this.router.navigate(['/settings/feed']);
    });
  }
}
