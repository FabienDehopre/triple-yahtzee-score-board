import { TestBed } from '@angular/core/testing';

import { IS_TEST_ENV } from './injection-tokens';

describe('injection-tokens', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  test('injection token IS_TEST_ENV equals true', () => {
    const isTestEnv = TestBed.inject(IS_TEST_ENV);
    expect(isTestEnv).toBeTruthy();
  });
});
