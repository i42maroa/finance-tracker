import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { Transactions } from './transactions';

describe('Transactions', () => {
  let fixture: ComponentFixture<Transactions>;
  let routeParamMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    routeParamMap = new BehaviorSubject(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [Transactions],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: routeParamMap.asObservable(),
            get snapshot() {
              return {
                paramMap: routeParamMap.value,
              };
            },
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('preloads date filters from a landing month route', () => {
    createComponent({ month: '2026-05' });

    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      expect.objectContaining({
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
      }),
    );
  });

  it('emits the selected route month as the initial filters value', async () => {
    createComponent({ month: '2026-01' });

    await expect(firstValueFrom(fixture.componentInstance.filters$)).resolves.toEqual(
      expect.objectContaining({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      }),
    );
  });

  it('does not apply filters when the form changes before searching', () => {
    createComponent({ month: '2026-01' });
    const emittedFilters: unknown[] = [];
    const subscription = fixture.componentInstance.filters$.subscribe((filters) => {
      emittedFilters.push(filters);
    });

    fixture.componentInstance.filterForm.patchValue({
      dateFrom: '2026-01-10',
      name: 'Menu',
    });

    expect(emittedFilters).toEqual([
      expect.objectContaining({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
        name: undefined,
      }),
    ]);

    subscription.unsubscribe();
  });

  it('applies the current form values when searching', async () => {
    createComponent({ month: '2026-01' });

    fixture.componentInstance.filterForm.patchValue({
      dateFrom: '2026-01-10',
      dateTo: '2026-01-20',
      name: 'Menu',
    });
    fixture.componentInstance.searchTransactions();

    await expect(firstValueFrom(fixture.componentInstance.filters$)).resolves.toEqual(
      expect.objectContaining({
        dateFrom: '2026-01-10',
        dateTo: '2026-01-20',
        name: 'Menu',
      }),
    );
  });

  it('marks the form as invalid when dateTo is before dateFrom', () => {
    createComponent({ month: '2026-05' });

    fixture.componentInstance.filterForm.patchValue({
      dateFrom: '2026-05-31',
      dateTo: '2026-05-01',
    });

    expect(fixture.componentInstance.filterForm.hasError('invalidDateRange')).toBe(true);
    expect(fixture.componentInstance.filterForm.invalid).toBe(true);
  });

  it('does not apply filters when searching with an invalid date range', () => {
    createComponent({ month: '2026-05' });
    const emittedFilters: unknown[] = [];
    const subscription = fixture.componentInstance.filters$.subscribe((filters) => {
      emittedFilters.push(filters);
    });

    fixture.componentInstance.filterForm.patchValue({
      dateFrom: '2026-05-31',
      dateTo: '2026-05-01',
      name: 'Menu',
    });
    fixture.componentInstance.searchTransactions();

    expect(emittedFilters).toEqual([
      expect.objectContaining({
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
        name: undefined,
      }),
    ]);

    subscription.unsubscribe();
  });

  it('allows searching when the date range is valid', async () => {
    createComponent({ month: '2026-05' });

    fixture.componentInstance.filterForm.patchValue({
      dateFrom: '2026-05-01',
      dateTo: '2026-05-31',
      name: 'Menu',
    });
    fixture.componentInstance.searchTransactions();

    expect(fixture.componentInstance.filterForm.valid).toBe(true);
    await expect(firstValueFrom(fixture.componentInstance.filters$)).resolves.toEqual(
      expect.objectContaining({
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
        name: 'Menu',
      }),
    );
  });

  it('preloads the real last day of February from a landing month route', () => {
    createComponent({ month: '2026-02' });

    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      expect.objectContaining({
        dateFrom: '2026-02-01',
        dateTo: '2026-02-28',
      }),
    );
  });

  it('uses the current month when the route has no month', () => {
    createComponent({});

    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      expect.objectContaining(getCurrentMonthDateRange()),
    );
  });

  it('clears filters back to the landing month route', () => {
    createComponent({ month: '2026-05' });

    fixture.componentInstance.filterForm.patchValue({
      dateFrom: '2026-04-10',
      dateTo: '2026-04-20',
      householdId: 'hh-main',
      type: 'expense',
      category: 'Comida',
      name: 'Menu',
    });

    fixture.componentInstance.clearFilters();

    expect(fixture.componentInstance.filterForm.valid).toBe(true);
    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual({
      dateFrom: '2026-05-01',
      dateTo: '2026-05-31',
      householdId: '',
      type: '',
      category: '',
      name: '',
    });
  });

  it('applies the new route month when the month parameter changes', async () => {
    createComponent({ month: '2026-01' });

    routeParamMap.next(convertToParamMap({ month: '2026-02' }));

    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      expect.objectContaining({
        dateFrom: '2026-02-01',
        dateTo: '2026-02-28',
      }),
    );
    await expect(firstValueFrom(fixture.componentInstance.filters$)).resolves.toEqual(
      expect.objectContaining({
        dateFrom: '2026-02-01',
        dateTo: '2026-02-28',
      }),
    );
  });

  function createComponent(params: Record<string, string>): void {
    routeParamMap.next(convertToParamMap(params));
    fixture = TestBed.createComponent(Transactions);
  }

  function getCurrentMonthDateRange(): { dateFrom: string; dateTo: string } {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [year, monthNumber] = currentMonth.split('-').map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();

    return {
      dateFrom: `${currentMonth}-01`,
      dateTo: `${currentMonth}-${String(lastDay).padStart(2, '0')}`,
    };
  }
});
