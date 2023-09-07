import { Directive, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAutoscroll]'
})
export class AutoscrollDirective implements OnInit, OnDestroy {
  private mutationObserver: MutationObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.mutationObserver = new MutationObserver((mutations) => {
      this.scrollToBottom();
    });

    this.mutationObserver.observe(this.el.nativeElement, {
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    this.mutationObserver.disconnect();
  }

  private scrollToBottom() {
    const { scrollHeight, clientHeight } = this.el.nativeElement;
    this.renderer.setProperty(this.el.nativeElement, 'scrollTop', scrollHeight - clientHeight);
  }
}
