import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, shareReplay, startWith, switchMap } from 'rxjs';
import { AppErrorService } from '../../core/errors/app-error.service';
import { HouseholdsService } from '../../core/services/household/households.service';
import { ModalService } from '../../core/services/modal/modal.service';
import { SnackbarService } from '../../core/services/snackbar/snackbar.service';
import { TransactionsService } from '../../core/services/transaction/transactions.service';
import { Household } from '../../shared/models/household.model';
import {
  Transaction,
  TransactionFilters,
  TransactionType,
  TransactionView,
} from '../../shared/models/transaction.model';
import { CircleButton } from '../../shared/ui/buttons/circle-button/circle-button';

type TransactionTypeFilter = TransactionType | '';

const TRANSACTIONS_PAGE_SIZE = 20;

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
  readonly selectedMonthLabel$ = this.selectedMonth$.pipe(
    map((selectedMonth) => this.formatMonthLabel(selectedMonth)),
  );
  readonly filterForm = this.formBuilder.nonNullable.group({
    dateFrom: [this.firstDayOfMonth(this.today().slice(0, 7))],
    dateTo: [this.lastDayOfMonth(this.today().slice(0, 7))],
    householdId: [''],
    type: this.formBuilder.nonNullable.control<TransactionTypeFilter>(''),
    category: [''],
    name: [''],
  });
  readonly filters$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.getRawValue()),
    map((filters) => this.toTransactionFilters(filters)),
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
  isSaving = false;
  errorMessage = '';
  areFiltersOpen = false;

  constructor() {
    this.selectedMonth$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selectedMonth) => {
      this.filterForm.patchValue({
        dateFrom: this.firstDayOfMonth(selectedMonth),
        dateTo: this.lastDayOfMonth(selectedMonth),
      });
      this.resetLoadedTransactions();
    });

    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.resetLoadedTransactions();
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

  clearFilters(): void {
    const selectedMonth = this.normalizeMonth(this.route.snapshot.paramMap.get('month'));

    this.filterForm.reset({
      dateFrom: this.firstDayOfMonth(selectedMonth),
      dateTo: this.lastDayOfMonth(selectedMonth),
      householdId: '',
      type: '',
      category: '',
      name: '',
    });
    this.resetLoadedTransactions();
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

  private resetLoadedTransactions(): void {
    if (this.loadedPagesSubject.value !== 1) {
      this.loadedPagesSubject.next(1);
    }
  }

  private toTransactionFilters(filters: typeof this.filterForm.value): TransactionFilters {
    return {
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
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

  private formatMonthLabel(month: string): string {
    const date = new Date(`${month}-01T00:00:00`);
    const label = new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(date);

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private firstDayOfMonth(month: string): string {
    return `${month}-01`;
  }

  private lastDayOfMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);

    return new Date(year, monthNumber, 0).toISOString().slice(0, 10);
  }
}
