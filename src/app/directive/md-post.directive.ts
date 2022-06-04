import { AfterViewInit, Directive, Inject, OnDestroy, ViewContainerRef } from '@angular/core';
import { RefComponent } from '../component/ref/ref.component';
import { RefService } from '../service/api/ref.service';
import { EmbedService } from '../service/embed.service';

@Directive({
  selector: '[appMdPost]'
})
export class MdPostDirective implements AfterViewInit, OnDestroy {

  private subscriptions: (() => void)[] = [];

  constructor(
    private embeds: EmbedService,
    private refs: RefService,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
  ) { }

  ngAfterViewInit(): void {
    this.postProcess(<HTMLDivElement>this.viewContainerRef.element.nativeElement);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(fn => fn());
    this.subscriptions.length = 0;
  }

  click(el: Element, fn: any) {
    el.addEventListener('click', fn);
    this.subscriptions.push(() => el.removeEventListener('click', fn));
  }

  postProcess(el: HTMLDivElement) {
    const inlineRefs = el.querySelectorAll<HTMLAnchorElement>('.inline-ref');
    inlineRefs.forEach(t => {
      this.refs.get(this.embeds.getRefUrl(t.href!)).subscribe(ref => {
        const c = this.viewContainerRef.createComponent(RefComponent);
        c.instance.ref = ref;
        c.instance.showToggle = true;
        t.parentNode?.insertBefore(c.location.nativeElement, t);
        t.remove();
      });
    });
    const toggles = el.querySelectorAll<HTMLDivElement>('.toggle');
    toggles.forEach(t => {
      // @ts-ignore
      t.expanded = false;
      // @ts-ignore
      t.querySelector('.toggle-x').style.display = 'none';
      this.click(t, () => {
        // @ts-ignore
        t.querySelector('.toggle-plus').style.display = t.expanded ? 'block' : 'none';
        // @ts-ignore
        t.querySelector('.toggle-x').style.display = !t.expanded ? 'block' : 'none';
        // @ts-ignore
        if (t.expanded) {
          t.nextSibling?.remove();
          // @ts-ignore
          t.expanded = !t.expanded;
        } else {
          // TODO: Don't use title to store url
          this.refs.get(this.embeds.getRefUrl(t.title!)).subscribe(ref => {
            const c = this.viewContainerRef.createComponent(RefComponent);
            c.instance.ref = ref;
            c.instance.showToggle = true;
            t.parentNode?.insertBefore(c.location.nativeElement, t.nextSibling);
            // @ts-ignore
            t.expanded = !t.expanded;
          });
        }
      });
    });
  }
}
