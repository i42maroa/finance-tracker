import { ErrorHandler, Injectable, inject } from '@angular/core';

import { AppErrorService } from './app-error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly appErrorService = inject(AppErrorService);

  handleError(error: unknown): void {
    this.appErrorService.handle(error);
  }
}
