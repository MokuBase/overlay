import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appResize]'
})
export class ResizeDirective {

  @HostBinding('style.z-index')
  get zIndex() {
    return this.dirty ? 1 : 0;
  }

  @HostBinding('style.width')
  get width() {
    return this.dim ? this.dim.x + 'px' : null;
  };

  @HostBinding('style.height')
  get height() {
    return this.dim ? this.dim.y + 'px' : null;
  };

  minPx = 2;
  zoom = 1;
  dim?: {x: number, y: number};
  oldZoom = 1;
  dragStart?: {x: number, y: number};
  startDim?: {x: number, y: number};
  dragging = false;
  wasDragging = false;
  dirty = false;

  constructor(private el: ElementRef) {}

  @HostListener('mousedown', ['$event'])
  onMousedown(e: MouseEvent) {
    e.preventDefault();
    this.oldZoom = this.zoom;
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
    };
    this.startDim = {
      x: this.el.nativeElement.offsetWidth,
      y: this.el.nativeElement.offsetHeight,
    };
  }

  @HostListener('touchstart', ['$event'])
  onTouchstart(e: TouchEvent) {
    if (e.touches.length != 2) return;
    e.preventDefault();
    this.oldZoom = this.zoom;
    const t1x = e.touches.item(0)!.clientX;
    const t1y = e.touches.item(0)!.clientY;
    const t2x = e.touches.item(1)?.clientX || 2 * t1x;
    const t2y = e.touches.item(1)?.clientY || 2 * t1y;
    this.dragStart = {
      x: Math.abs(t1x - t2x),
      y: Math.abs(t1y - t2y),
    };
    this.startDim = {
      x: this.el.nativeElement.offsetWidth,
      y: this.el.nativeElement.offsetHeight,
    };
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    if (this.wasDragging) {
      e.preventDefault();
    }
    this.wasDragging = false;
  }

  @HostListener('window:mousemove', ['$event'])
  onMousemove(e: MouseEvent) {
    if (!this.dragStart || !this.startDim) return;
    if (!this.dragging) {
      if (Math.abs(e.clientX - this.dragStart.x) < this.minPx &&
          Math.abs(e.clientY - this.dragStart.y) < this.minPx) {
        return;
      }
      this.dragging = true;
      this.wasDragging = true;
    }
    e.preventDefault();
    const dx = (e.clientX - this.dragStart.x) / this.startDim.x;
    const dy = (e.clientY - this.dragStart.y) / this.startDim.y;
    const l = (dx + dy) / 2;
    this.dim ??= { ...this.startDim };
    this.dim.x = this.startDim.x * (1 + l);
    this.dim.y = this.startDim.y * (1 + l);
    this.dirty = true;
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchmove(e: TouchEvent) {
    if (!this.dragStart || !this.startDim) return;
    if (!this.dragging) {
      this.dragging = true;
      this.wasDragging = true;
    }
    e.preventDefault();
    const t1 = e.touches.item(0)!;
    const t2 = e.touches.item(1) || t1;
    const dims = {
      w: Math.abs(t1.clientX - t2.clientX),
      h: Math.abs(t1.clientY - t2.clientY),
    };
    const dx = (dims.w - this.dragStart.x) / this.startDim.x;
    const dy = (dims.h - this.dragStart.y) / this.startDim.y;
    const l = (dx + dy) / 2;
    this.dim ??= { ...this.startDim };
    this.dim.x = this.startDim.x * (1 + l);
    this.dim.y = this.startDim.y * (1 + l);
    this.dirty = true;
  }

  @HostListener('window:contextmenu', ['$event'])
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  @HostListener('window:touchcancel', ['$event'])
  onCancel(e: Event) {
    delete this.dragStart;
    if (this.dragging) {
      this.dragging = false;
      e.preventDefault();
    }
  }

}
