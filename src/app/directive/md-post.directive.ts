import { ComponentRef, Directive, Inject, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { defer, isString } from 'lodash-es';
import { Subject } from 'rxjs';
import { RefListComponent } from '../component/ref/ref-list/ref-list.component';
import { RefComponent } from '../component/ref/ref.component';
import { ViewerComponent } from '../component/viewer/viewer.component';
import { Page } from '../model/page';
import { Ref } from '../model/ref';
import { EmbedService } from '../service/embed.service';
import { Embed } from '../util/embed';
import { NavComponent } from '../component/nav/nav.component';

@Directive({
  selector: '[appMdPost]'
})
export class MdPostDirective implements OnInit, OnDestroy, Embed {

  @Input('appMdPost')
  load?: Subject<void> | string;
  @Input()
  origin? = '';

  private subscriptions: (() => void)[] = [];

  constructor(
    private embeds: EmbedService,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit(): void {
    if (this.load && typeof this.load !== 'string') {
      this.load.subscribe(() => this.postProcess())
    } else {
      this.postProcess();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(fn => fn());
    this.subscriptions.length = 0;
  }

  event(type: string, el: Element, fn: any) {
    el.addEventListener(type, fn);
    this.subscriptions.push(() => el.removeEventListener(type, fn));
  }

  postProcess() {
    defer(() => this.embeds.postProcess(
      <HTMLDivElement>this.viewContainerRef.element.nativeElement,
      this,
      (type, el, fn) => this.event(type, el, fn),
      this.origin));
  }

  createLink(url: string, text: string, title = '', css = ''): ComponentRef<NavComponent> {
    const c = this.viewContainerRef.createComponent(NavComponent);
    c.instance.url = url;
    c.instance.text = text;
    c.instance.title = title;
    c.instance.css = css;
    return c;
  }

  createEmbed(ref: Ref | string, expandPlugins?: string[]): ComponentRef<ViewerComponent> {
    const c = this.viewContainerRef.createComponent(ViewerComponent);
    if (isString(ref)) {
      const url = ref as string;
      ref = { url, origin: this.origin };
    }
    if (expandPlugins?.length) c.instance.tags = expandPlugins;
    c.instance.ref = ref;
    return c;
  }

  createRef(ref: Ref, showToggle?: boolean): ComponentRef<RefComponent> {
    const c = this.viewContainerRef.createComponent(RefComponent);
    c.instance.ref = ref;
    c.instance.showToggle = !!showToggle;
    return c;
  }

  createRefList(page: Page<Ref>, pageControls?: boolean): ComponentRef<RefListComponent> {
    const c = this.viewContainerRef.createComponent(RefListComponent);
    c.instance.page = page;
    c.instance.pageControls = !!pageControls;
    return c;
  }
}
