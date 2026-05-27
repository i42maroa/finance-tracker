import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly loadingSubject = new BehaviorSubject(false);
  private activeRequests = 0;

  readonly isLoading$ = this.loadingSubject.asObservable();

  show(): void {
    this.activeRequests += 1;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    if (this.activeRequests === 0) {
      this.loadingSubject.next(false);
    }
  }

  track<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.show();

      return source$.pipe(finalize(() => this.hide()));
    });
  }
}
