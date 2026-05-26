export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  date: string;
  category: string;
  description: string;
  notes?: string;
}

export type TransactionDraft = Omit<Transaction, 'id'>;
