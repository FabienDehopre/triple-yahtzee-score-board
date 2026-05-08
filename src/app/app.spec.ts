import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { getTranslocoTestingModule } from './testing/transloco-testing';

describe('app', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, getTranslocoTestingModule()],
    }).compileComponents();
  });

  test('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  test('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Triple Yahtzee');
  });
});
