import { TestBed } from '@angular/core/testing';
import { Subject, Subscription, firstValueFrom, of } from 'rxjs';

import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;
  let latestLoading: boolean;
  let subscription: Subscription;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
    subscription = service.isLoading$.subscribe((isLoading) => {
      latestLoading = isLoading;
    });
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('shows and hides loading state', () => {
    service.show();

    expect(latestLoading).toBe(true);

    service.hide();

    expect(latestLoading).toBe(false);
  });

  it('tracks an observable while it is subscribed', async () => {
    const tracked$ = service.track(of('done'));

    expect(latestLoading).toBe(false);

    await firstValueFrom(tracked$);

    expect(latestLoading).toBe(false);
  });

  it('keeps loading active until all concurrent tracked observables finish', () => {
    const firstRequest$ = new Subject<void>();
    const secondRequest$ = new Subject<void>();

    const firstSubscription = service.track(firstRequest$).subscribe();
    const secondSubscription = service.track(secondRequest$).subscribe();

    expect(latestLoading).toBe(true);

    firstRequest$.complete();

    expect(latestLoading).toBe(true);

    secondRequest$.complete();

    expect(latestLoading).toBe(false);

    firstSubscription.unsubscribe();
    secondSubscription.unsubscribe();
  });
});
