import { TestBed } from '@angular/core/testing';
import { Subscription, firstValueFrom } from 'rxjs';

import { Transaction } from '../../../shared/models/transaction.model';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let latestTransactions: Transaction[];
  let subscription: Subscription;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionsService);
    subscription = service.transactions$.subscribe((transactions) => {
      latestTransactions = transactions;
    });
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('creates a transaction and emits the updated list', async () => {
    const initialLength = latestTransactions.length;

    await firstValueFrom(
      service.createTransaction({
        type: 'expense',
        amountCents: 399,
        date: '2026-05-26',
        category: 'Cafe',
        description: 'Cafe de la manana',
      }),
    );

    expect(latestTransactions.length).toBe(initialLength + 1);
    expect(latestTransactions[0]).toEqual(
      expect.objectContaining({
        type: 'expense',
        amountCents: 399,
        category: 'Cafe',
        description: 'Cafe de la manana',
      }),
    );
  });

  it('updates an existing transaction and emits the changed item', async () => {
    const transactionId = latestTransactions[0].id;

    await firstValueFrom(
      service.updateTransaction(transactionId, {
        type: 'income',
        amountCents: 15000,
        date: '2026-05-26',
        category: 'Extra',
        description: 'Ingreso puntual',
        notes: 'Actualizado desde test',
      }),
    );

    expect(latestTransactions[0]).toEqual({
      id: transactionId,
      type: 'income',
      amountCents: 15000,
      date: '2026-05-26',
      category: 'Extra',
      description: 'Ingreso puntual',
      notes: 'Actualizado desde test',
    });
  });

  it('deletes a transaction and emits the updated list', async () => {
    const transactionId = latestTransactions[0].id;

    await firstValueFrom(service.deleteTransaction(transactionId));

    expect(latestTransactions.some((transaction) => transaction.id === transactionId)).toBe(false);
  });
});
