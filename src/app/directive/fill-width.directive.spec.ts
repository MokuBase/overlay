import { FillWidthDirective } from './fill-width.directive';

describe('FillWidthDirective', () => {
  it('should create an instance', () => {
    const directive = new FillWidthDirective({ nativeElement: document.createElement('textarea') });
    expect(directive).toBeTruthy();
  });
});
