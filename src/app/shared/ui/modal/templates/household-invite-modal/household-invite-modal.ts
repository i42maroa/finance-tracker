import { Component, Input, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HouseholdsService } from '../../../../../core/services/household/households.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { SnackbarService } from '../../../../../core/services/snackbar/snackbar.service';
import {
  HouseholdInviteModalData,
} from '../../../../models/modal.model';
import { HouseholdInviteDraft } from '../../../../models/household.model';

@Component({
  selector: 'app-household-invite-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './household-invite-modal.html',
  styleUrl: './household-invite-modal.css',
})
export class HouseholdInviteModal {
  private readonly formBuilder = inject(FormBuilder);
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);
  private readonly snackbarService = inject(SnackbarService);

  @Input({ required: true }) data!: HouseholdInviteModalData;

  readonly inviteForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    role: this.formBuilder.nonNullable.control<HouseholdInviteDraft['role']>('member', {
      validators: [Validators.required],
    }),
  });

  isSaving = false;
  errorMessage = '';

  submitInviteMember(): void {
    if (this.inviteForm.invalid || this.isSaving) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.householdsService
      .inviteMember(this.data.householdId, this.toInviteDraft())
      .subscribe({
        next: () => {
          this.modalService.close();
          this.snackbarService.success('Invitacion enviada correctamente.');
        },
        error: () => {
          this.errorMessage = 'No se pudo invitar al usuario.';
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        },
      });
  }

  private toInviteDraft(): HouseholdInviteDraft {
    const rawInvite = this.inviteForm.getRawValue();

    return {
      email: rawInvite.email.trim(),
      role: rawInvite.role,
    };
  }
}
