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

  it('summarizes income, expenses and a positive balance for all filtered transactions', async () => {
    await Promise.all([
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-positive',
          type: 'income',
          amountCents: 20000,
          date: '2026-05-10',
          category: 'Resumen positivo',
          description: 'Ingreso principal resumen',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-positive',
          type: 'income',
          amountCents: 10000,
          date: '2026-05-11',
          category: 'Resumen positivo',
          description: 'Ingreso extra resumen',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-positive',
          type: 'expense',
          amountCents: 12500,
          date: '2026-05-12',
          category: 'Resumen positivo',
          description: 'Gasto resumen',
        }),
      ),
    ]);

    const summary = await firstValueFrom(
      service.getTransactionsSummary({
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
        householdId: 'hh-summary-positive',
      }),
    );

    expect(summary).toEqual({
      incomeCents: 30000,
      expenseCents: 12500,
      balanceCents: 17500,
    });
  });

  it('summarizes a negative balance', async () => {
    await Promise.all([
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-negative',
          type: 'income',
          amountCents: 5000,
          date: '2026-05-10',
          category: 'Resumen negativo',
          description: 'Ingreso menor resumen',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-negative',
          type: 'expense',
          amountCents: 12000,
          date: '2026-05-11',
          category: 'Resumen negativo',
          description: 'Gasto mayor resumen',
        }),
      ),
    ]);

    const summary = await firstValueFrom(
      service.getTransactionsSummary({ householdId: 'hh-summary-negative' }),
    );

    expect(summary).toEqual({
      incomeCents: 5000,
      expenseCents: 12000,
      balanceCents: -7000,
    });
  });

  it('summarizes a zero balance', async () => {
    await Promise.all([
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-zero',
          type: 'income',
          amountCents: 9000,
          date: '2026-05-10',
          category: 'Resumen cero',
          description: 'Ingreso cero resumen',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-zero',
          type: 'expense',
          amountCents: 9000,
          date: '2026-05-11',
          category: 'Resumen cero',
          description: 'Gasto cero resumen',
        }),
      ),
    ]);

    const summary = await firstValueFrom(
      service.getTransactionsSummary({ householdId: 'hh-summary-zero' }),
    );

    expect(summary).toEqual({
      incomeCents: 9000,
      expenseCents: 9000,
      balanceCents: 0,
    });
  });

  it('summarizes transactions using date, category, household, type and name filters', async () => {
    await Promise.all([
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-filters',
          type: 'income',
          amountCents: 7000,
          date: '2026-05-15',
          category: 'Filtro resumen',
          description: 'Bonus filtrado',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-filters',
          type: 'expense',
          amountCents: 4000,
          date: '2026-05-15',
          category: 'Filtro resumen',
          description: 'Bonus filtrado gasto',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-filters-other',
          type: 'income',
          amountCents: 3000,
          date: '2026-05-15',
          category: 'Filtro resumen',
          description: 'Bonus filtrado',
        }),
      ),
      firstValueFrom(
        service.createTransaction({
          householdId: 'hh-summary-filters',
          type: 'income',
          amountCents: 2000,
          date: '2026-06-01',
          category: 'Filtro resumen',
          description: 'Bonus filtrado',
        }),
      ),
    ]);

    const summary = await firstValueFrom(
      service.getTransactionsSummary({
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
        category: 'filtro',
        householdId: 'hh-summary-filters',
        name: 'bonus',
        type: 'income',
      }),
    );

    expect(summary).toEqual({
      incomeCents: 7000,
      expenseCents: 0,
      balanceCents: 7000,
    });
  });
});
