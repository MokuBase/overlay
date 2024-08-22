import { Component, HostBinding, OnInit } from '@angular/core';
import { runInAction } from 'mobx';
import { AdminService } from '../../service/admin.service';
import { AuthzService } from '../../service/authz.service';
import { Store } from '../../store/store';

@Component({
  selector: 'app-inbox-page',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxPage implements OnInit {
  @HostBinding('class') css = 'inbox';

  constructor(
    public admin: AdminService,
    public store: Store,
    private auth: AuthzService,
  ) { }

  ngOnInit(): void {
    if (!this.store.view.inboxTabs.length) {
      runInAction(() => {
        this.store.view.inboxTabs = this.admin.inbox.filter(p => this.auth.tagReadAccess(p.tag));
      });
    }
  }

}
