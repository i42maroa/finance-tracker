import { Transaction } from './transaction.model';

export interface TransactionFormModalData {
  mode: 'create' | 'edit';
  transaction?: Transaction;
}

export interface HouseholdInviteModalData {
  householdId: string;
}

export type ModalConfig =
  | {
      type: 'transaction-form';
      data: TransactionFormModalData;
    }
  | {
      type: 'household-create';
    }
  | {
      type: 'household-invite';
      data: HouseholdInviteModalData;
    };
