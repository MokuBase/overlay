import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { autorun, IReactionDisposer, toJS } from 'mobx';
import { Store } from '../../store/store';
import { View } from '../../store/view';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @HostBinding('class') css = 'search form-group';

  private disposers: IReactionDisposer[] = [];

  searchValue = '';

  constructor(
    public router: Router,
    public store: Store,
  ) {
    this.disposers.push(autorun(() => {
      this.searchValue = toJS(this.store.view.search);
    }));
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
  }

  search() {
    this.router.navigate([], { queryParams: { search: this.searchValue }, queryParamsHandling: 'merge' });
  }

  viewName(view?: View) {
    switch (view) {
      case 'tag': return this.store.view.ext?.name || this.store.view.tag;
      case 'query': return $localize`query results`;
      case 'home': return this.store.account.signedIn ? $localize`subscriptions` : $localize`home page`;
      case 'all': return $localize`all`;
      case 'local': return $localize`local`;
      case 'inbox': return $localize`inbox`;
      case 'ref/comments': return $localize`comments`;
      case 'ref/responses': return $localize`responses`;
      case 'ref/sources': return $localize`sources`;
      case 'ref/versions': return $localize`versions`;
      case 'ext': return $localize`tag extensions`;
      case 'user': return $localize`users`;
      case 'plugin': return $localize`plugins`;
      case 'template': return $localize`templates`;
    }
    return view || '';
  }
}
