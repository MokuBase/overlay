import { ImageDirective } from './image.directive';

describe('ImageDirective', () => {
  it('should create an instance', () => {
    const directive = new ImageDirective(
      {} as any,
      {} as any,
      { nativeElement: { style: {}}} as any,
      {} as any,
    );
    expect(directive).toBeTruthy();
  });
});
