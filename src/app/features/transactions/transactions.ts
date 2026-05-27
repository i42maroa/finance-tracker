import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, shareReplay, switchMap } from 'rxjs';
import { AppErrorService } from '../../core/errors/app-error.service';
import { HouseholdsService } from '../../core/services/household/households.service';
import { ModalService } from '../../core/services/modal/modal.service';
import { SnackbarService } from '../../core/services/snackbar/snackbar.service';
import { TransactionsService } from '../../core/services/transaction/transactions.service';
import { Household } from '../../shared/models/household.model';
import {
  Transaction,
  TransactionFilters,
  TransactionSummary,
  TransactionType,
  TransactionView,
} from '../../shared/models/transaction.model';
import { CircleButton } from '../../shared/ui/buttons/circle-button/circle-button';

type TransactionTypeFilter = TransactionType | '';

const TRANSACTIONS_PAGE_SIZE = 20;

interface MonthDateRange {
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: 'app-transactions',
  imports: [CircleButton, CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  private readonly appErrorService = inject(AppErrorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbarService = inject(SnackbarService);
  private readonly transactionsService = inject(TransactionsService);

  readonly households$ = this.householdsService.households$;
  readonly transactions$ = this.transactionsService.transactions$;
  private readonly loadedPagesSubject = new BehaviorSubject<number>(1);
  readonly loadedPages$ = this.loadedPagesSubject.asObservable();
  readonly selectedMonth$ = this.route.paramMap.pipe(
    map((params) => this.normalizeMonth(params.get('month'))),
  );
  private readonly initialMonthRange = this.getMonthDateRange(
    this.normalizeMonth(this.route.snapshot.paramMap.get('month')),
  );
  readonly filterForm = this.formBuilder.nonNullable.group({
    dateFrom: [this.initialMonthRange.dateFrom],
    dateTo: [this.initialMonthRange.dateTo],
    householdId: [''],
    type: this.formBuilder.nonNullable.control<TransactionTypeFilter>(''),
    category: [''],
    name: [''],
  }, {
    validators: [this.dateRangeValidator],
  });
  private readonly appliedFiltersSubject = new BehaviorSubject<TransactionFilters>(
    this.toTransactionFilters(this.filterForm.getRawValue()),
  );
  readonly appliedFilters$ = this.appliedFiltersSubject.asObservable();
  readonly filters$ = this.appliedFilters$;
  readonly rangeLabel$ = this.filters$.pipe(
    map((filters) => this.formatRangeLabel(filters.dateFrom, filters.dateTo)),
  );
  readonly transactionPage$ = combineLatest([
    this.transactions$,
    this.households$,
    this.filters$,
    this.loadedPages$,
  ]).pipe(
    switchMap(([, households, filters, loadedPages]) =>
      this.transactionsService
        .getTransactionsPage({
          filters,
          page: 1,
          pageSize: loadedPages * TRANSACTIONS_PAGE_SIZE,
        })
        .pipe(
          map((transactionPage) => ({
            ...transactionPage,
            items: transactionPage.items.map((transaction) =>
              this.toTransactionView(transaction, households),
            ),
          })),
        ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  readonly transactionSummary$ = combineLatest([this.transactions$, this.filters$]).pipe(
    switchMap(([, filters]) => this.transactionsService.getTransactionsSummary(filters)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  isSaving = false;
  errorMessage = '';
  areFiltersOpen = false;

  constructor() {
    this.selectedMonth$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selectedMonth) => {
      this.applyRouteMonth(selectedMonth);
    });
  }

  openCreateTransactionModal(): void {
    this.modalService.open({
      type: 'transaction-form',
      data: { mode: 'create' },
    });
  }

  editTransaction(transaction: Transaction): void {
    this.modalService.open({
      type: 'transaction-form',
      data: { mode: 'edit', transaction },
    });
  }

  deleteTransaction(transaction: Transaction): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.transactionsService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.snackbarService.success('Transaccion eliminada correctamente.');
      },
      error: (error) => {
        this.appErrorService.handle(error);
        this.errorMessage = 'No se pudo eliminar la transaccion.';
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  toggleFilters(): void {
    this.areFiltersOpen = !this.areFiltersOpen;
  }

  searchTransactions(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.applyFilters(this.toTransactionFilters(this.filterForm.getRawValue()));
  }

  clearFilters(): void {
    const selectedMonth = this.normalizeMonth(this.route.snapshot.paramMap.get('month'));

    this.filterForm.reset({
      ...this.getMonthDateRange(selectedMonth),
      householdId: '',
      type: '',
      category: '',
      name: '',
    });
    this.searchTransactions();
  }

  loadMoreTransactions(): void {
    this.loadedPagesSubject.next(this.loadedPagesSubject.value + 1);
  }

  canLoadMore(visibleItems: number, total: number): boolean {
    return visibleItems < total;
  }

  transactionTrackBy(_: number, transaction: Transaction): string {
    return transaction.id;
  }

  householdTrackBy(_: number, household: Household): string {
    return household.id;
  }

  balanceStatus(summary: TransactionSummary): 'positive' | 'negative' | 'neutral' {
    if (summary.balanceCents > 0) {
      return 'positive';
    }

    if (summary.balanceCents < 0) {
      return 'negative';
    }

    return 'neutral';
  }

  balancePrefix(summary: TransactionSummary): string {
    return summary.balanceCents > 0 ? '+' : '';
  }

  private resetLoadedTransactions(): void {
    if (this.loadedPagesSubject.value !== 1) {
      this.loadedPagesSubject.next(1);
    }
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const dateFrom = control.get('dateFrom')?.value;
    const dateTo = control.get('dateTo')?.value;

    if (!dateFrom || !dateTo || dateTo >= dateFrom) {
      return null;
    }

    return { invalidDateRange: true };
  }

  private applyRouteMonth(selectedMonth: string): void {
    const selectedMonthRange = this.getMonthDateRange(selectedMonth);
    const currentFilters = this.filterForm.getRawValue();
    const nextFormValue = {
      ...currentFilters,
      ...selectedMonthRange,
    };
    const nextFilters = this.toTransactionFilters(nextFormValue);

    if (
      currentFilters.dateFrom === selectedMonthRange.dateFrom &&
      currentFilters.dateTo === selectedMonthRange.dateTo &&
      this.areTransactionFiltersEqual(this.appliedFiltersSubject.value, nextFilters)
    ) {
      return;
    }

    this.filterForm.patchValue(selectedMonthRange, { emitEvent: false });
    this.applyFilters(nextFilters);
  }

  private applyFilters(filters: TransactionFilters): void {
    this.appliedFiltersSubject.next(filters);
    this.resetLoadedTransactions();
  }

  private areTransactionFiltersEqual(
    firstFilters: TransactionFilters,
    secondFilters: TransactionFilters,
  ): boolean {
    return (
      firstFilters.dateFrom === secondFilters.dateFrom &&
      firstFilters.dateTo === secondFilters.dateTo &&
      firstFilters.householdId === secondFilters.householdId &&
      firstFilters.type === secondFilters.type &&
      firstFilters.category === secondFilters.category &&
      firstFilters.name === secondFilters.name
    );
  }

  private toTransactionFilters(filters: typeof this.filterForm.value): TransactionFilters {
    const currentMonthRange = this.getMonthDateRange(this.today().slice(0, 7));

    return {
      dateFrom: filters.dateFrom || currentMonthRange.dateFrom,
      dateTo: filters.dateTo || currentMonthRange.dateTo,
      householdId: filters.householdId || undefined,
      type: filters.type || undefined,
      category: filters.category?.trim() || undefined,
      name: filters.name?.trim() || undefined,
    };
  }

  private toTransactionView(transaction: Transaction, households: Household[]): TransactionView {
    const household = households.find((item) => item.id === transaction.householdId);

    return {
      ...transaction,
      householdName: household?.name ?? 'Household no disponible',
    };
  }

  private normalizeMonth(month: string | null): string {
    if (month?.match(/^\d{4}-\d{2}$/)) {
      return month;
    }

    return this.today().slice(0, 7);
  }

  private formatRangeLabel(dateFrom: string | undefined, dateTo: string | undefined): string {
    return `${this.formatDateLabel(dateFrom)} - ${this.formatDateLabel(dateTo)}`;
  }

  private formatDateLabel(date: string | undefined): string {
    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getMonthDateRange(month: string): MonthDateRange {
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();

    return {
      dateFrom: `${month}-01`,
      dateTo: `${month}-${String(lastDay).padStart(2, '0')}`,
    };
  }
}
