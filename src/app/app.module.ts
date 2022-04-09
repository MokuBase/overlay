import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';
import { mergeMap } from 'rxjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommentEditComponent } from './component/comment-edit/comment-edit.component';
import { CommentListComponent } from './component/comment-list/comment-list.component';
import { CommentReplyComponent } from './component/comment-reply/comment-reply.component';
import { CommentComponent } from './component/comment/comment.component';
import { LoadingComponent } from './component/loading/loading.component';
import { PageControlsComponent } from './component/page-controls/page-controls.component';
import { RefListComponent } from './component/ref-list/ref-list.component';
import { RefComponent } from './component/ref/ref.component';
import { SettingsComponent } from './component/settings/settings.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { SubscriptionBarComponent } from './component/subscription-bar/subscription-bar.component';
import { AutofocusDirective } from './directive/autofocus.directive';
import { DebugInterceptor } from './http/debug.interceptor';
import { AdminPage } from './page/admin/admin.component';
import { AdminOriginPage } from './page/admin/origin/origin.component';
import { AdminPluginPage } from './page/admin/plugin/plugin.component';
import { AdminSetupPage } from './page/admin/setup/setup.component';
import { AdminTemplatePage } from './page/admin/template/template.component';
import { CreateExtPage } from './page/create/ext/ext.component';
import { HomePage } from './page/home/home.component';
import { AllComponent } from './page/inbox/all/all.component';
import { InboxPage } from './page/inbox/inbox.component';
import { UnreadComponent } from './page/inbox/unread/unread.component';
import { ModExtPage } from './page/mod/ext/ext.component';
import { ModFeedPage } from './page/mod/feed/feed.component';
import { ModPage } from './page/mod/mod.component';
import { ModUserPage } from './page/mod/user/user.component';
import { CommentsComponent } from './page/ref/comments/comments.component';
import { GraphComponent } from './page/ref/graph/graph.component';
import { RefPage } from './page/ref/ref.component';
import { ResponsesComponent } from './page/ref/responses/responses.component';
import { SourcesComponent } from './page/ref/sources/sources.component';
import { SubmitPage } from './page/submit/submit.component';
import { SubmitTextPage } from './page/submit/text/text.component';
import { SubmitWebPage } from './page/submit/web/web.component';
import { EditTagPage } from './page/tag/edit/edit.component';
import { TagPage } from './page/tag/tag.component';
import { AccountService } from './service/account.service';
import { AdminService } from './service/admin.service';
import { ConfigService } from './service/config.service';
import { TagListComponent } from './component/tag-list/tag-list.component';
import { TagComponent } from './component/tag/tag.component';
import { OriginListComponent } from './component/origin-list/origin-list.component';
import { OriginComponent } from './component/origin/origin.component';
import { FeedComponent } from './component/feed/feed.component';
import { FeedListComponent } from './component/feed-list/feed-list.component';

const loadFactory = (config: ConfigService, admin: AdminService, account: AccountService) => () =>
  config.load$.pipe(
    mergeMap(() => admin.init$),
    mergeMap(() => account.init$),
  );

@NgModule({
  declarations: [
    AppComponent,
    SubscriptionBarComponent,
    HomePage,
    RefListComponent,
    RefComponent,
    TagPage,
    RefPage,
    CommentsComponent,
    ResponsesComponent,
    SourcesComponent,
    GraphComponent,
    CommentComponent,
    SettingsComponent,
    InboxPage,
    AllComponent,
    UnreadComponent,
    PageControlsComponent,
    CommentListComponent,
    CommentReplyComponent,
    CommentEditComponent,
    SidebarComponent,
    SubmitPage,
    SubmitWebPage,
    SubmitTextPage,
    AutofocusDirective,
    CreateExtPage,
    EditTagPage,
    LoadingComponent,
    AdminPage,
    ModPage,
    ModFeedPage,
    ModUserPage,
    ModExtPage,
    AdminSetupPage,
    AdminOriginPage,
    AdminPluginPage,
    AdminTemplatePage,
    TagListComponent,
    TagComponent,
    OriginListComponent,
    OriginComponent,
    FeedComponent,
    FeedListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownModule.forRoot(),
  ],
  providers: [
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadFactory,
      deps: [ConfigService, AdminService, AccountService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DebugInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
