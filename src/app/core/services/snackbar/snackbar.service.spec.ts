import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SnackbarService, SnackbarState } from './snackbar.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let latestSnackbar: SnackbarState;
  let subscription: Subscription;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbarService);
    subscription = service.snackbar$.subscribe((snackbar) => {
      latestSnackbar = snackbar;
    });
  });

  afterEach(() => {
    subscription.unsubscribe();
    vi.useRealTimers();
  });

  it('shows a snackbar with message, type, and duration', () => {
    service.show('Movimiento guardado', 'success', 2500);

    expect(latestSnackbar).toEqual({
      isOpen: true,
      message: 'Movimiento guardado',
      type: 'success',
      durationMs: 2500,
    });
  });

  it('replaces the visible snackbar with the latest one', () => {
    service.show('Primer mensaje', 'info', 3000);
    service.show('Segundo mensaje', 'error', 1500);

    expect(latestSnackbar).toEqual({
      isOpen: true,
      message: 'Segundo mensaje',
      type: 'error',
      durationMs: 1500,
    });
  });

  it('closes the snackbar programmatically', () => {
    service.info('Mensaje informativo');

    service.close();

    expect(latestSnackbar.isOpen).toBe(false);
  });

  it('closes the snackbar automatically after the configured duration', () => {
    service.error('No se pudo guardar', 1000);

    vi.advanceTimersByTime(1000);

    expect(latestSnackbar.isOpen).toBe(false);
  });
});
