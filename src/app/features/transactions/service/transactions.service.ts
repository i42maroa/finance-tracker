import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer, delay, map, of, tap, throwError } from 'rxjs';

import { mockTransactions } from '../../../shared/mocks/transactions.mock';
import {
  Transaction,
  TransactionDraft,
  TransactionFilters,
  TransactionPage,
  TransactionPageQuery,
} from '../../../shared/models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>(mockTransactions);

  readonly transactions$ = this.transactionsSubject.asObservable();

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$.pipe(delay(150));
  }

  getTransactionsPage(query: TransactionPageQuery): Observable<TransactionPage> {
    return defer(() => {
      const page = Math.max(1, query.page);
      const pageSize = Math.max(1, query.pageSize);
      const filteredTransactions = this.transactionsSubject.value
        .filter((transaction) => this.matchesFilters(transaction, query.filters ?? {}))
        .sort((first, second) => second.date.localeCompare(first.date));
      const startIndex = (page - 1) * pageSize;

      return of({
        items: filteredTransactions.slice(startIndex, startIndex + pageSize),
        total: filteredTransactions.length,
        page,
        pageSize,
      }).pipe(delay(150));
    });
  }

  createTransaction(transaction: TransactionDraft): Observable<Transaction> {
    return of(transaction).pipe(
      delay(150),
      map((draft) => ({ ...draft, id: this.createId() })),
      tap((createdTransaction) => {
        const nextTransactions = [createdTransaction, ...this.transactionsSubject.value];
        this.transactionsSubject.next(nextTransactions);
      }),
    );
  }

  updateTransaction(id: string, changes: TransactionDraft): Observable<Transaction> {
    return defer(() => {
      const currentTransactions = this.transactionsSubject.value;
      const transactionIndex = currentTransactions.findIndex((transaction) => transaction.id === id);

      if (transactionIndex === -1) {
        return throwError(() => new Error('Transaction not found'));
      }

      const updatedTransaction = { ...changes, id };
      const nextTransactions = currentTransactions.map((transaction) =>
        transaction.id === id ? updatedTransaction : transaction,
      );

      return of(updatedTransaction).pipe(
        delay(150),
        tap(() => this.transactionsSubject.next(nextTransactions)),
      );
    });
  }

  deleteTransaction(id: string): Observable<void> {
    return defer(() => {
      const currentTransactions = this.transactionsSubject.value;
      const exists = currentTransactions.some((transaction) => transaction.id === id);

      if (!exists) {
        return throwError(() => new Error('Transaction not found'));
      }

      const nextTransactions = currentTransactions.filter((transaction) => transaction.id !== id);

      return of(undefined).pipe(
        delay(150),
        tap(() => this.transactionsSubject.next(nextTransactions)),
      );
    });
  }

  private createId(): string {
    return crypto.randomUUID();
  }

  private matchesFilters(transaction: Transaction, filters: TransactionFilters): boolean {
    const category = this.normalizeFilter(filters.category);
    const name = this.normalizeFilter(filters.name);

    if (filters.dateFrom && transaction.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && transaction.date > filters.dateTo) {
      return false;
    }

    if (filters.householdId && transaction.householdId !== filters.householdId) {
      return false;
    }

    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    if (category && !this.normalizeFilter(transaction.category).includes(category)) {
      return false;
    }

    if (name && !this.normalizeFilter(transaction.description).includes(name)) {
      return false;
    }

    return true;
  }

  private normalizeFilter(value: string | undefined): string {
    return value?.trim().toLocaleLowerCase('es-ES') ?? '';
  }
}
