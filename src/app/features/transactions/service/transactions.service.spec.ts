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
        householdId: 'hh-main',
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
        householdId: 'hh-main',
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
      householdId: 'hh-main',
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

  it('returns paginated transactions with a total count', async () => {
    await Promise.all(
      Array.from({ length: 21 }, (_, index) =>
        firstValueFrom(
          service.createTransaction({
            householdId: 'hh-main',
            type: 'expense',
            amountCents: 100 + index,
            date: '2026-05-01',
            category: 'Test',
            description: `Movimiento ${index + 1}`,
          }),
        ),
      ),
    );

    const firstPage = await firstValueFrom(
      service.getTransactionsPage({
        filters: { dateFrom: '2026-05-01', dateTo: '2026-05-31' },
        page: 1,
        pageSize: 20,
      }),
    );
    const secondPage = await firstValueFrom(
      service.getTransactionsPage({
        filters: { dateFrom: '2026-05-01', dateTo: '2026-05-31' },
        page: 2,
        pageSize: 20,
      }),
    );

    expect(firstPage.items.length).toBe(20);
    expect(firstPage.total).toBe(23);
    expect(secondPage.items.length).toBe(3);
  });

  it('filters transactions by inclusive date range', async () => {
    const page = await firstValueFrom(
      service.getTransactionsPage({
        filters: { dateFrom: '2026-05-27', dateTo: '2026-05-27' },
        page: 1,
        pageSize: 20,
      }),
    );

    expect(page.total).toBe(2);
    expect(page.items.every((transaction) => transaction.date === '2026-05-27')).toBe(true);
  });

  it('filters transactions by category, household, type and name', async () => {
    const page = await firstValueFrom(
      service.getTransactionsPage({
        filters: {
          category: 'nom',
          householdId: 'hh-personal',
          name: 'mensual',
          type: 'income',
        },
        page: 1,
        pageSize: 20,
      }),
    );

    expect(page.total).toBe(1);
    expect(page.items[0]).toEqual(
      expect.objectContaining({
        category: 'Nomina',
        description: 'Ingreso mensual',
        householdId: 'hh-personal',
        type: 'income',
      }),
    );
  });
});
