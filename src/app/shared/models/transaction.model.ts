export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  householdId: string;
  type: TransactionType;
  amountCents: number;
  date: string;
  category: string;
  description: string;
  notes?: string;
}

export interface TransactionView extends Transaction {
  householdName: string;
}

export type TransactionDraft = Omit<Transaction, 'id'>;
