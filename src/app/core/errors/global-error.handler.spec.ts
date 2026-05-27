import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppErrorService } from './app-error.service';
import { GlobalErrorHandler } from './global-error.handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let appErrorService: Pick<AppErrorService, 'handle'>;

  beforeEach(() => {
    appErrorService = {
      handle: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: AppErrorService, useValue: appErrorService },
      ],
    });
    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('delegates errors to AppErrorService', () => {
    const error = new Error('Component error');

    handler.handleError(error);

    expect(appErrorService.handle).toHaveBeenCalledWith(error);
  });
});
