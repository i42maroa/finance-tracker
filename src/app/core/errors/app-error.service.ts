import { Injectable, inject } from '@angular/core';

import { SnackbarService } from '../../shared/ui/snackbar/snackbar.service';
import { AppError } from './app-error.model';

const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';
const UNKNOWN_ERROR_MESSAGE = 'Ha ocurrido un error inesperado.';

@Injectable({
  providedIn: 'root',
})
export class AppErrorService {
  private readonly snackbarService = inject(SnackbarService);

  handle(error: unknown): AppError {
    const appError: AppError = {
      code: UNKNOWN_ERROR_CODE,
      message: UNKNOWN_ERROR_MESSAGE,
      originalError: error,
    };

    console.error(`[${appError.code}]`, appError.message, appError.originalError);
    this.snackbarService.error(appError.message);

    return appError;
  }
}
