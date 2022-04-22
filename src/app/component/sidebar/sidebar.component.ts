import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of, Subject } from 'rxjs';
import { Ext } from '../../model/ext';
import { AccountService } from '../../service/account.service';
import { AdminService } from '../../service/admin.service';
import { localTag, prefix } from '../../util/tag';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @HostBinding('class') css = 'sidebar';
  private destroy$ = new Subject<void>();
  prefix = prefix;

  @Input()
  ext?: Ext | null;
  @Input()
  tag?: string | null;
  @Input()
  showToggle = true;
  @Input()
  @HostBinding('class.expanded')
  private _expanded = false;

  localTag?: string;
  writeAccess$?: Observable<boolean>;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public admin: AdminService,
    public account: AccountService,
  ) {
    if (localStorage.getItem('sidebar-expanded') !== null) {
      this._expanded = localStorage.getItem('sidebar-expanded') === 'true';
    } else {
      this._expanded = !!window.matchMedia('(min-width: 1024px)').matches;
    }
  }

  get expanded(): boolean {
    return this._expanded;
  }

  set expanded(value: boolean) {
    localStorage.setItem('sidebar-expanded', ""+value);
    this._expanded = value;
  }

  ngOnInit(): void {
    this.writeAccess$ = this.account.writeAccessTag(this.tag!);
    if (this.tag) {
      this.localTag = localTag(this.tag);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get inSubs$() {
    if (!this.tag) return of(false);
    return this.account.subscriptions$.pipe(map(subs => subs.includes(this.tag!)));
  }

  get root() {
    return !!this.admin.status.templates.root && !!this.tag;
  }

  get isApprover() {
    return this.ext?.config.approvers.includes(this.account.tag);
  }

  get user() {
    return !!this.admin.status.templates.user && (
      this.tag?.startsWith('+user/') ||
      this.tag?.startsWith('_user/'));
  }

  get queue() {
    return !!this.admin.status.templates.queue && (
      this.tag?.startsWith('queue/') ||
      this.tag?.startsWith('_queue/') ||
      this.tag?.startsWith('+queue/'));
  }

  subscribe() {
    this.account.addSub(this.tag!);
  }

  unsubscribe() {
    this.account.removeSub(this.tag!);
  }
}
