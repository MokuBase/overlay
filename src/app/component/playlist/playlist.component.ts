import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Ref } from '../../model/ref';
import { RefService } from '../../service/api/ref.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnChanges {

  @Input()
  ref?: Ref;

  index = 0;
  page?: Ref;

  constructor(
    private refs: RefService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ref?.currentValue?.sources?.length) {
      this.index = 0;
      this.fetch();
    }
  }

  fetch() {
    this.refs.page({url: this.ref!.sources![this.index], size: 1 }).subscribe(page => this.page = page.content[0]);
  }

  back() {
    this.index = (this.index - 1 + this.ref!.sources!.length) % this.ref!.sources!.length;
    this.fetch();
  }

  next() {
    this.index = (this.index + 1) % this.ref!.sources!.length;
    this.fetch();
  }
}
