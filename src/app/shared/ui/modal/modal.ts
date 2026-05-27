import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ModalService } from '../../../core/services/modal/modal.service';
import { HouseholdCreateModal } from './templates/household-create-modal/household-create-modal';
import { HouseholdInviteModal } from './templates/household-invite-modal/household-invite-modal';
import { TransactionFormModal } from './templates/transaction-form-modal/transaction-form-modal';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, HouseholdCreateModal, HouseholdInviteModal, TransactionFormModal],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  readonly modalService = inject(ModalService);

  close(): void {
    this.modalService.close();
  }
}
