import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: SnackbarType;
  durationMs: number;
}

const DEFAULT_SNACKBAR_DURATION_MS = 3000;

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private readonly snackbarSubject = new BehaviorSubject<SnackbarState>({
    isOpen: false,
    message: '',
    type: 'info',
    durationMs: DEFAULT_SNACKBAR_DURATION_MS,
  });
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  readonly snackbar$ = this.snackbarSubject.asObservable();

  show(
    message: string,
    type: SnackbarType = 'info',
    durationMs = DEFAULT_SNACKBAR_DURATION_MS,
  ): void {
    this.clearCloseTimer();
    this.snackbarSubject.next({
      isOpen: true,
      message,
      type,
      durationMs,
    });

    this.closeTimer = setTimeout(() => {
      this.close();
    }, durationMs);
  }

  success(message: string, durationMs?: number): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs?: number): void {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs?: number): void {
    this.show(message, 'info', durationMs);
  }

  close(): void {
    this.clearCloseTimer();
    this.snackbarSubject.next({
      ...this.snackbarSubject.value,
      isOpen: false,
    });
  }

  private clearCloseTimer(): void {
    if (!this.closeTimer) {
      return;
    }

    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }
}
