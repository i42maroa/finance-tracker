import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppErrorService } from '../../../../../core/errors/app-error.service';
import { HouseholdsService } from '../../../../../features/households/service/households.service';
import { TransactionsService } from '../../../../../features/transactions/service/transactions.service';
import { TransactionFormModalData } from '../../../../models/modal.model';
import { TransactionDraft } from '../../../../models/transaction.model';
import { SnackbarService } from '../../../snackbar/snackbar.service';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-transaction-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form-modal.html',
  styleUrl: './transaction-form-modal.css',
})
export class TransactionFormModal implements OnChanges {
  private readonly appErrorService = inject(AppErrorService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly transactionsService = inject(TransactionsService);

  @Input({ required: true }) data!: TransactionFormModalData;

  readonly households$ = this.householdsService.households$;
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

  isSaving = false;
  errorMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.resetForm();
    }
  }

  submitTransaction(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const transaction = this.toTransactionDraft();
    const isCreatingTransaction = this.data.mode === 'create';
    const request$ = isCreatingTransaction
      ? this.transactionsService.createTransaction(transaction)
      : this.transactionsService.updateTransaction(this.data.transaction?.id ?? '', transaction);

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

  cancelEdit(): void {
    this.resetForm();
    this.modalService.close();
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
    const transaction = this.data?.transaction;

    this.errorMessage = '';
    this.form.reset({
      householdId: transaction?.householdId ?? this.defaultHouseholdId(),
      type: transaction?.type ?? 'expense',
      amount: transaction ? this.formatAmountForInput(transaction.amountCents) : '',
      date: transaction?.date ?? this.today(),
      category: transaction?.category ?? '',
      description: transaction?.description ?? '',
      notes: transaction?.notes ?? '',
    });
  }

  private defaultHouseholdId(): string {
    return this.householdsService.getSelectedHousehold()?.id ?? '';
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

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
