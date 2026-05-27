import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { AppErrorService } from '../../core/errors/app-error.service';
import { Household } from '../../shared/models/household.model';
import { Transaction, TransactionDraft, TransactionView } from '../../shared/models/transaction.model';
import { Modal } from '../../shared/ui/modal/modal';
import { ModalService } from '../../shared/ui/modal/modal.service';
import { SnackbarService } from '../../shared/ui/snackbar/snackbar.service';
import { HouseholdsService } from '../households/service/households.service';
import { TransactionsService } from './service/transactions.service';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, Modal, ReactiveFormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  private readonly appErrorService = inject(AppErrorService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbarService = inject(SnackbarService);
  private readonly transactionsService = inject(TransactionsService);

  readonly households$ = this.householdsService.households$;
  readonly transactions$ = this.transactionsService.transactions$;
  readonly selectedMonth$ = this.route.paramMap.pipe(
    map((params) => this.normalizeMonth(params.get('month'))),
  );
  readonly selectedMonthLabel$ = this.selectedMonth$.pipe(
    map((selectedMonth) => this.formatMonthLabel(selectedMonth)),
  );
  readonly filteredTransactions$ = combineLatest([
    this.transactions$,
    this.households$,
    this.selectedMonth$,
  ]).pipe(
    map(([transactions, households, selectedMonth]) =>
      transactions
        .filter((transaction) => transaction.date.startsWith(selectedMonth))
        .map((transaction) => this.toTransactionView(transaction, households)),
    ),
  );
  readonly form = this.formBuilder.nonNullable.group({
    householdId: ['', [Validators.required]],
    type: this.formBuilder.nonNullable.control<'expense' | 'income'>('expense', {
      validators: [Validators.required],
    }),
    amount: ['', [Validators.required, Validators.min(0.01)]],
    date: [this.today(), [Validators.required]],
    category: ['', [Validators.required, Validators.maxLength(40)]],
    description: ['', [Validators.required, Validators.maxLength(80)]],
    notes: ['', [Validators.maxLength(160)]],
  });

  editingTransactionId: string | null = null;
  isSaving = false;
  errorMessage = '';

  openCreateTransactionModal(): void {
    this.resetForm();
    this.modalService.open();
  }

  submitTransaction(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const transaction = this.toTransactionDraft();
    const editingTransactionId = this.editingTransactionId;
    const isCreatingTransaction = !editingTransactionId;
    const request$ = isCreatingTransaction
      ? this.transactionsService.createTransaction(transaction)
      : this.transactionsService.updateTransaction(editingTransactionId, transaction);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.modalService.close();

        if (isCreatingTransaction) {
          this.snackbarService.success('Transaccion creada correctamente.');
        }
      },
      error: (error) => {
        this.appErrorService.handle(error);
        this.errorMessage = 'No se pudo guardar la transaccion.';
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  editTransaction(transaction: Transaction): void {
    this.editingTransactionId = transaction.id;
    this.errorMessage = '';
    this.form.setValue({
      householdId: transaction.householdId,
      type: transaction.type,
      amount: this.formatAmountForInput(transaction.amountCents),
      date: transaction.date,
      category: transaction.category,
      description: transaction.description,
      notes: transaction.notes ?? '',
    });
    this.modalService.open();
  }

  deleteTransaction(transaction: Transaction): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.transactionsService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        if (this.editingTransactionId === transaction.id) {
          this.resetForm();
        }
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

  cancelEdit(): void {
    this.resetForm();
    this.modalService.close();
  }

  transactionTrackBy(_: number, transaction: Transaction): string {
    return transaction.id;
  }

  householdTrackBy(_: number, household: Household): string {
    return household.id;
  }

  private toTransactionDraft(): TransactionDraft {
    const rawTransaction = this.form.getRawValue();

    return {
      householdId: rawTransaction.householdId,
      type: rawTransaction.type,
      amountCents: this.eurosToCents(rawTransaction.amount),
      date: rawTransaction.date,
      category: rawTransaction.category.trim(),
      description: rawTransaction.description.trim(),
      notes: rawTransaction.notes.trim() || undefined,
    };
  }

  private resetForm(): void {
    this.editingTransactionId = null;
    this.form.reset({
      householdId: this.defaultHouseholdId(),
      type: 'expense',
      amount: '',
      date: this.today(),
      category: '',
      description: '',
      notes: '',
    });
  }

  private defaultHouseholdId(): string {
    return this.householdsService.getSelectedHousehold()?.id ?? '';
  }

  private toTransactionView(transaction: Transaction, households: Household[]): TransactionView {
    const household = households.find((item) => item.id === transaction.householdId);

    return {
      ...transaction,
      householdName: household?.name ?? 'Household no disponible',
    };
  }

  private eurosToCents(amount: string | number): number {
    const cleanAmount = String(amount).trim().replace(/\s/g, '');
    const decimalSeparatorIndex = Math.max(cleanAmount.lastIndexOf(','), cleanAmount.lastIndexOf('.'));

    if (!cleanAmount) {
      return 0;
    }

    if (decimalSeparatorIndex === -1) {
      return Number(cleanAmount.replace(/\D/g, '')) * 100;
    }

    const euros = cleanAmount.slice(0, decimalSeparatorIndex).replace(/\D/g, '') || '0';
    const cents = cleanAmount
      .slice(decimalSeparatorIndex + 1)
      .replace(/\D/g, '')
      .padEnd(2, '0')
      .slice(0, 2);

    return Number(euros) * 100 + Number(cents);
  }

  private formatAmountForInput(amountCents: number): string {
    return (amountCents / 100).toFixed(2);
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
}
