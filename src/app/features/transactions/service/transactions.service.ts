import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer, delay, map, of, tap, throwError } from 'rxjs';

import { mockTransactions } from '../../../shared/mocks/transactions.mock';
import { Transaction, TransactionDraft } from '../../../shared/models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>(mockTransactions);

  readonly transactions$ = this.transactionsSubject.asObservable();

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$.pipe(delay(150));
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

}
