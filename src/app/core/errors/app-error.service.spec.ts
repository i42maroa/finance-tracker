import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SnackbarService } from '../services/snackbar/snackbar.service';
import { AppErrorService } from './app-error.service';

describe('AppErrorService', () => {
  let service: AppErrorService;
  let snackbarService: Pick<SnackbarService, 'error'>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    snackbarService = {
      error: vi.fn(),
    };
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [{ provide: SnackbarService, useValue: snackbarService }],
    });
    service = TestBed.inject(AppErrorService);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('normalizes an Error to a predefined app error', () => {
    const error = new Error('Technical failure');

    const appError = service.handle(error);

    expect(appError).toEqual({
      code: 'UNKNOWN_ERROR',
      message: 'Ha ocurrido un error inesperado.',
      originalError: error,
    });
  });

  it('normalizes an unknown value to a predefined app error', () => {
    const appError = service.handle('unexpected');

    expect(appError).toEqual({
      code: 'UNKNOWN_ERROR',
      message: 'Ha ocurrido un error inesperado.',
      originalError: 'unexpected',
    });
  });

  it('shows an error snackbar with the predefined message', () => {
    service.handle(new Error('Technical failure'));

    expect(snackbarService.error).toHaveBeenCalledWith('Ha ocurrido un error inesperado.');
  });

  it('logs the normalized error to the console', () => {
    const error = new Error('Technical failure');

    service.handle(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[UNKNOWN_ERROR]',
      'Ha ocurrido un error inesperado.',
      error,
    );
  });
});
